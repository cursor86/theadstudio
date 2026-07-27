#!/usr/bin/env python3
"""
Samples a video at several timestamps and flags a near-white band at the
very bottom edge of frame - the specific defect the pipeline hit once
(traced back to headless-Chromium screenshot capture leaving unfilled
viewport space exposed, not to Remotion/ffmpeg compositing). Every
composition keeps its own content clear of the extreme edges, so any
sustained white strip there is a rendering defect, not real content.

Usage: check-white-edge.py <video.mp4> [--samples 15] [--strip-height 40]
Exits 0 and prints "ALL CLEAN" if nothing found, exits 1 and lists the
offending timestamps otherwise.
"""
import argparse
import subprocess
import sys


def probe_duration(video_path: str) -> float:
	out = subprocess.run(
		['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
		 '-of', 'default=noprint_wrappers=1:nokey=1', video_path],
		capture_output=True, text=True, check=True,
	)
	return float(out.stdout.strip())


def probe_size(video_path: str) -> tuple[int, int]:
	out = subprocess.run(
		['ffprobe', '-v', 'error', '-select_streams', 'v:0',
		 '-show_entries', 'stream=width,height',
		 '-of', 'csv=s=x:p=0', video_path],
		capture_output=True, text=True, check=True,
	)
	w, h = out.stdout.strip().split('x')[:2]
	return int(w), int(h)


def sample_strip(video_path: str, timestamp: float, width: int, height: int, strip_height: int) -> bytes:
	y = height - strip_height
	result = subprocess.run(
		['ffmpeg', '-ss', str(timestamp), '-i', video_path,
		 '-vf', f'crop={width}:{strip_height}:0:{y}',
		 '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', '-'],
		capture_output=True, check=True,
	)
	return result.stdout


def fraction_near_white(raw_rgb: bytes, threshold: int = 250) -> float:
	if not raw_rgb:
		return 0.0
	white_pixels = 0
	total_pixels = len(raw_rgb) // 3
	for i in range(0, len(raw_rgb) - 2, 3):
		r, g, b = raw_rgb[i], raw_rgb[i + 1], raw_rgb[i + 2]
		if r > threshold and g > threshold and b > threshold:
			white_pixels += 1
	return white_pixels / total_pixels if total_pixels else 0.0


def main() -> int:
	parser = argparse.ArgumentParser()
	parser.add_argument('video')
	parser.add_argument('--samples', type=int, default=15)
	parser.add_argument('--strip-height', type=int, default=40)
	parser.add_argument('--white-fraction-threshold', type=float, default=0.5)
	args = parser.parse_args()

	duration = probe_duration(args.video)
	width, height = probe_size(args.video)

	offenders = []
	for i in range(args.samples):
		t = duration * (i + 0.5) / args.samples
		raw = sample_strip(args.video, t, width, height, args.strip_height)
		frac = fraction_near_white(raw)
		if frac > args.white_fraction_threshold:
			offenders.append((round(t, 2), round(frac, 2)))

	if offenders:
		print(f'WHITE EDGE DEFECT: {args.video}')
		for t, frac in offenders:
			print(f'  t={t}s  {frac * 100:.0f}% of bottom {args.strip_height}px strip is near-white')
		return 1

	print(f'ALL CLEAN: {args.video}')
	return 0


if __name__ == '__main__':
	sys.exit(main())
