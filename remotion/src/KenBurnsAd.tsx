import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, useCurrentFrame} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';
import {CtaEnd} from './CtaEnd';
import {getAudioDurationSeconds} from './audio-duration';
import {
	ABSOLUTE_MAX_DURATION_SECONDS,
	ABSOLUTE_MIN_DURATION_SECONDS,
	CTA_SECONDS,
	FONT_FAMILY,
	FPS,
	GOLD,
	MAX_DURATION_SECONDS,
	MIN_DURATION_SECONDS,
	MIN_PHOTO_SECONDS_EACH,
	MIN_SCALED_CTA_SECONDS,
	TRANSITION_SECONDS,
} from './constants';

// A different visual language from MontageAd: instead of full-screen text
// cards between photos, this stays on one continuous photo per beat with a
// slow cinematic zoom (Ken Burns effect) and a persistent lower-third
// caption bar, closer to how native social/documentary-style content reads.
export const kenBurnsSchema = z.object({
	hook: z.string(), // short headline shown over the first photo only
	captions: z.array(z.string()), // one per image, shown in the caption bar
	cta: z.string(),
	link: z.string(),
	images: z.array(z.string()),
	music: z.string(),
	logoPath: z.string().optional(),
	durationSeconds: z.number().optional(),
	totalFrames: z.number().optional(),
});

export type KenBurnsProps = z.infer<typeof kenBurnsSchema>;

const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);

export const calculateKenBurnsMetadata = async ({props}: {props: KenBurnsProps}) => {
	let totalSeconds: number;
	if (props.durationSeconds) {
		totalSeconds = Math.max(
			ABSOLUTE_MIN_DURATION_SECONDS,
			Math.min(props.durationSeconds, ABSOLUTE_MAX_DURATION_SECONDS)
		);
	} else {
		const audioDuration = props.music ? await getAudioDurationSeconds(props.music) : MIN_DURATION_SECONDS;
		totalSeconds = Math.max(MIN_DURATION_SECONDS, Math.min(audioDuration, MAX_DURATION_SECONDS));
	}
	return {durationInFrames: secondsToFrames(totalSeconds), props: {...props, totalFrames: secondsToFrames(totalSeconds)}};
};

const KenBurnsPhoto: React.FC<{src: string; hook?: string; caption?: string}> = ({src, hook, caption}) => {
	const frame = useCurrentFrame();
	// Slow continuous zoom for the whole time this photo is on screen -
	// the classic "Ken Burns" pan/zoom instead of a static full-bleed frame.
	const scale = interpolate(frame, [0, 240], [1, 1.18], {extrapolateRight: 'clamp'});
	const panX = interpolate(frame, [0, 240], [0, -18], {extrapolateRight: 'clamp'});

	const hookOpacity = interpolate(frame, [10, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const captionOpacity = interpolate(frame, [6, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const captionY = interpolate(frame, [6, 24], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<Img
				src={src}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${scale}) translateX(${panX}px)`,
				}}
			/>
			{/* Darken the top and bottom so overlaid text stays legible on any photo */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)',
				}}
			/>
			{hook ? (
				<div
					style={{
						position: 'absolute',
						top: 90,
						left: 60,
						right: 60,
						opacity: hookOpacity,
						color: 'white',
						fontFamily: FONT_FAMILY,
						fontWeight: 800,
						fontSize: 66,
						lineHeight: 1.15,
						textShadow: '0 4px 16px rgba(0,0,0,0.6)',
					}}
				>
					{hook}
				</div>
			) : null}
			{caption ? (
				<div
					style={{
						position: 'absolute',
						bottom: 70,
						left: 50,
						right: 50,
						opacity: captionOpacity,
						transform: `translateY(${captionY}px)`,
					}}
				>
					<div
						style={{
							display: 'inline-block',
							background: 'rgba(0,0,0,0.55)',
							borderLeft: `6px solid ${GOLD}`,
							padding: '20px 30px',
							borderRadius: 6,
						}}
					>
						<span
							style={{
								color: 'white',
								fontFamily: FONT_FAMILY,
								fontWeight: 700,
								fontSize: 40,
							}}
						>
							{caption}
						</span>
					</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

type Segment =
	| {kind: 'photo'; frames: number; src: string; hook?: string; caption?: string}
	| {kind: 'cta'; frames: number; cta: string; link: string; logoPath?: string};

export const KenBurnsAd: React.FC<KenBurnsProps> = ({
	hook,
	captions,
	cta,
	link,
	images,
	music,
	logoPath,
	totalFrames,
}) => {
	const ctaFrames = secondsToFrames(
		Math.max(MIN_SCALED_CTA_SECONDS, CTA_SECONDS * Math.min(1, (totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS)) / FPS / MIN_DURATION_SECONDS))
	);
	const transitionFrames = secondsToFrames(TRANSITION_SECONDS);
	const minPhotoFrames = secondsToFrames(MIN_PHOTO_SECONDS_EACH);

	const effectiveTotalFrames = totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS);
	const photoBudgetFrames = Math.max(minPhotoFrames, effectiveTotalFrames - ctaFrames);
	const slotCount = images.length;
	const photoFramesEach = slotCount > 0 ? Math.max(minPhotoFrames, Math.floor(photoBudgetFrames / slotCount)) : 0;

	const segments: Segment[] = [];
	for (let i = 0; i < slotCount; i++) {
		segments.push({
			kind: 'photo',
			frames: photoFramesEach,
			src: images[i],
			hook: i === 0 ? hook : undefined,
			caption: captions[i],
		});
	}
	segments.push({kind: 'cta', frames: ctaFrames, cta, link, logoPath});

	const transitionsCount = Math.max(0, segments.length - 1);
	const rawTotal = segments.reduce((sum, s) => sum + s.frames, 0);
	const deficit = effectiveTotalFrames - (rawTotal - transitionsCount * transitionFrames);
	if (deficit > 0) segments[segments.length - 1].frames += deficit;

	return (
		<>
			{music ? <Audio src={music} /> : null}
			<TransitionSeries>
				{segments.map((segment, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={segment.frames}>
							{segment.kind === 'photo' ? (
								<KenBurnsPhoto src={segment.src} hook={segment.hook} caption={segment.caption} />
							) : null}
							{segment.kind === 'cta' ? (
								<CtaEnd cta={segment.cta} link={segment.link} logoPath={segment.logoPath} />
							) : null}
						</TransitionSeries.Sequence>
						{i < segments.length - 1 ? (
							<TransitionSeries.Transition
								presentation={fade()}
								timing={linearTiming({durationInFrames: transitionFrames})}
							/>
						) : null}
					</React.Fragment>
				))}
			</TransitionSeries>
		</>
	);
};
