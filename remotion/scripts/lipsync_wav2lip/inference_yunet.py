"""Wav2Lip inference using OpenCV's YuNet DNN face detector (cv2.FaceDetectorYN)
instead of the bundled S3FD detector, whose weights are hosted on
adrianbulat.com - unreachable from some networks/CI sandboxes, unlike YuNet's
weights (mirrored in the opencv_zoo GitHub repo). Everything else matches the
original inference.py from https://github.com/Rudrabha/Wav2Lip - see
setup.sh in this directory for how to obtain that repo + the model weights."""
from os import listdir, path
import numpy as np
import scipy, cv2, os, sys, argparse, audio
import json, subprocess, random, string
from tqdm import tqdm
from glob import glob
import torch
from models import Wav2Lip
import platform

parser = argparse.ArgumentParser(description='Inference code to lip-sync videos in the wild using Wav2Lip models')

parser.add_argument('--checkpoint_path', type=str, required=True)
parser.add_argument('--face', type=str, required=True)
parser.add_argument('--audio', type=str, required=True)
parser.add_argument('--outfile', type=str, default='results/result_voice.mp4')
parser.add_argument('--static', type=bool, default=False)
parser.add_argument('--fps', type=float, default=25., required=False)
parser.add_argument('--pads', nargs='+', type=int, default=[0, 20, 0, 0])
parser.add_argument('--wav2lip_batch_size', type=int, default=128)
parser.add_argument('--resize_factor', default=1, type=int)
parser.add_argument('--crop', nargs='+', type=int, default=[0, -1, 0, -1])
parser.add_argument('--box', nargs='+', type=int, default=[-1, -1, -1, -1])
parser.add_argument('--rotate', default=False, action='store_true')
parser.add_argument('--nosmooth', default=False, action='store_true')
parser.add_argument('--yunet_model', type=str, default='face_detection_yunet.onnx')

args = parser.parse_args()
args.img_size = 96

if os.path.isfile(args.face) and args.face.split('.')[1] in ['jpg', 'png', 'jpeg']:
	args.static = True


def face_detect(images):
	pady1, pady2, padx1, padx2 = args.pads
	results = []
	for image in images:
		h, w = image.shape[:2]
		detector = cv2.FaceDetectorYN_create(args.yunet_model, "", (w, h), score_threshold=0.6, nms_threshold=0.3, top_k=5000)
		_, faces = detector.detect(image)
		if faces is None or len(faces) == 0:
			cv2.imwrite('temp/faulty_frame.jpg', image)
			raise ValueError('Face not detected by YuNet! See temp/faulty_frame.jpg')
		# Highest-confidence face wins (last column is the detection score).
		best = max(faces, key=lambda f: f[-1])
		fx, fy, fw, fh = best[0], best[1], best[2], best[3]
		x1, y1, x2, y2 = fx, fy, fx + fw, fy + fh
		y1 = max(0, int(y1 - pady1))
		y2 = min(image.shape[0], int(y2 + pady2))
		x1 = max(0, int(x1 - padx1))
		x2 = min(image.shape[1], int(x2 + padx2))
		results.append([x1, y1, x2, y2])

	boxes = np.array(results)
	results = [[image[y1:y2, x1:x2], (y1, y2, x1, x2)] for image, (x1, y1, x2, y2) in zip(images, boxes)]
	return results


def datagen(frames, mels):
	img_batch, mel_batch, frame_batch, coords_batch = [], [], [], []

	if args.box[0] == -1:
		if not args.static:
			face_det_results = face_detect(frames)
		else:
			face_det_results = face_detect([frames[0]])
	else:
		print('Using the specified bounding box instead of face detection...')
		y1, y2, x1, x2 = args.box
		face_det_results = [[f[y1:y2, x1:x2], (y1, y2, x1, x2)] for f in frames]

	for i, m in enumerate(mels):
		idx = 0 if args.static else i % len(frames)
		frame_to_save = frames[idx].copy()
		face, coords = face_det_results[idx].copy()

		face = cv2.resize(face, (args.img_size, args.img_size))

		img_batch.append(face)
		mel_batch.append(m)
		frame_batch.append(frame_to_save)
		coords_batch.append(coords)

		if len(img_batch) >= args.wav2lip_batch_size:
			img_batch, mel_batch = np.asarray(img_batch), np.asarray(mel_batch)

			img_masked = img_batch.copy()
			img_masked[:, args.img_size // 2:] = 0

			img_batch = np.concatenate((img_masked, img_batch), axis=3) / 255.
			mel_batch = np.reshape(mel_batch, [len(mel_batch), mel_batch.shape[1], mel_batch.shape[2], 1])

			yield img_batch, mel_batch, frame_batch, coords_batch
			img_batch, mel_batch, frame_batch, coords_batch = [], [], [], []

	if len(img_batch) > 0:
		img_batch, mel_batch = np.asarray(img_batch), np.asarray(mel_batch)

		img_masked = img_batch.copy()
		img_masked[:, args.img_size // 2:] = 0

		img_batch = np.concatenate((img_masked, img_batch), axis=3) / 255.
		mel_batch = np.reshape(mel_batch, [len(mel_batch), mel_batch.shape[1], mel_batch.shape[2], 1])

		yield img_batch, mel_batch, frame_batch, coords_batch


mel_step_size = 16
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print('Using {} for inference.'.format(device))


def _load(checkpoint_path):
	if device == 'cuda':
		checkpoint = torch.load(checkpoint_path)
	else:
		checkpoint = torch.load(checkpoint_path, map_location=lambda storage, loc: storage)
	return checkpoint


def load_model(path):
	model = Wav2Lip()
	print("Load checkpoint from: {}".format(path))
	checkpoint = _load(path)
	s = checkpoint["state_dict"]
	new_s = {}
	for k, v in s.items():
		new_s[k.replace('module.', '')] = v
	model.load_state_dict(new_s)

	model = model.to(device)
	return model.eval()


def main():
	if not os.path.isfile(args.face):
		raise ValueError('--face argument must be a valid path to video/image file')
	elif args.face.split('.')[1] in ['jpg', 'png', 'jpeg']:
		full_frames = [cv2.imread(args.face)]
		fps = args.fps
	else:
		video_stream = cv2.VideoCapture(args.face)
		fps = video_stream.get(cv2.CAP_PROP_FPS)
		print('Reading video frames...')
		full_frames = []
		while 1:
			still_reading, frame = video_stream.read()
			if not still_reading:
				video_stream.release()
				break
			if args.resize_factor > 1:
				frame = cv2.resize(frame, (frame.shape[1] // args.resize_factor, frame.shape[0] // args.resize_factor))
			if args.rotate:
				frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
			y1, y2, x1, x2 = args.crop
			if x2 == -1: x2 = frame.shape[1]
			if y2 == -1: y2 = frame.shape[0]
			frame = frame[y1:y2, x1:x2]
			full_frames.append(frame)

	print("Number of frames available for inference: " + str(len(full_frames)))

	if not args.audio.endswith('.wav'):
		print('Extracting raw audio...')
		command = 'ffmpeg -y -i {} -strict -2 {}'.format(args.audio, 'temp/temp.wav')
		subprocess.call(command, shell=True)
		args.audio = 'temp/temp.wav'

	wav = audio.load_wav(args.audio, 16000)
	mel = audio.melspectrogram(wav)
	print(mel.shape)

	if np.isnan(mel.reshape(-1)).sum() > 0:
		raise ValueError('Mel contains nan! Using a TTS voice? Add a small epsilon noise to the wav file and try again')

	mel_chunks = []
	mel_idx_multiplier = 80. / fps
	i = 0
	while 1:
		start_idx = int(i * mel_idx_multiplier)
		if start_idx + mel_step_size > len(mel[0]):
			mel_chunks.append(mel[:, len(mel[0]) - mel_step_size:])
			break
		mel_chunks.append(mel[:, start_idx: start_idx + mel_step_size])
		i += 1

	print("Length of mel chunks: {}".format(len(mel_chunks)))

	full_frames = full_frames[:len(mel_chunks)]

	batch_size = args.wav2lip_batch_size
	gen = datagen(full_frames.copy(), mel_chunks)

	for i, (img_batch, mel_batch, frames, coords) in enumerate(tqdm(gen, total=int(np.ceil(float(len(mel_chunks)) / batch_size)))):
		if i == 0:
			model = load_model(args.checkpoint_path)
			print("Model loaded")
			frame_h, frame_w = full_frames[0].shape[:-1]
			out = cv2.VideoWriter('temp/result.avi', cv2.VideoWriter_fourcc(*'DIVX'), fps, (frame_w, frame_h))

		img_batch = torch.FloatTensor(np.transpose(img_batch, (0, 3, 1, 2))).to(device)
		mel_batch = torch.FloatTensor(np.transpose(mel_batch, (0, 3, 1, 2))).to(device)

		with torch.no_grad():
			pred = model(mel_batch, img_batch)

		pred = pred.cpu().numpy().transpose(0, 2, 3, 1) * 255.

		for p, f, c in zip(pred, frames, coords):
			y1, y2, x1, x2 = c
			p = cv2.resize(p.astype(np.uint8), (x2 - x1, y2 - y1))
			f[y1:y2, x1:x2] = p
			out.write(f)

	out.release()

	command = 'ffmpeg -y -i {} -i {} -strict -2 -q:v 1 {}'.format(args.audio, 'temp/result.avi', args.outfile)
	subprocess.call(command, shell=platform.system() != 'Windows')


if __name__ == '__main__':
	main()
