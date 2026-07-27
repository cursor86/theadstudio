import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
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
	HEIGHT,
	MAX_DURATION_SECONDS,
	MIN_DURATION_SECONDS,
	MIN_SCALED_CTA_SECONDS,
	TRANSITION_SECONDS,
	WIDTH,
} from './constants';

// A third distinct look from MontageAd/KenBurnsAd: all photos visible at once
// in a 2x2 grid, with one tile "popping" forward at a time instead of
// cutting between full-screen slides - denser, more "multi-product
// showcase" feeling.
export const gridSchema = z.object({
	title: z.string(),
	captions: z.array(z.string()), // one per image, shown while that tile is emphasized
	cta: z.string(),
	link: z.string(),
	images: z.array(z.string()), // up to 4 used
	music: z.string(),
	logoPath: z.string().optional(),
	durationSeconds: z.number().optional(),
	totalFrames: z.number().optional(),
});

export type GridProps = z.infer<typeof gridSchema>;

const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);

export const calculateGridMetadata = async ({props}: {props: GridProps}) => {
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

// Exact pixel placement (not percentages) for the 2x2 grid - avoids a
// rendering bug where percentage width/height on absolutely positioned
// tiles nested inside a transformed, overflow:hidden wrapper left the
// bottom edge of each tile unpainted.
const GRID_GAP = 8;
const CELL_W = WIDTH / 2;
const CELL_H = HEIGHT / 2;

const QUADRANTS = [
	{row: 0, col: 0, fromX: -1, fromY: -1},
	{row: 0, col: 1, fromX: 1, fromY: -1},
	{row: 1, col: 0, fromX: -1, fromY: 1},
	{row: 1, col: 1, fromX: 1, fromY: 1},
] as const;

const INTRO_FRAMES = 24;
const EASE_FRAMES = 15;

const GridSegment: React.FC<{title: string; captions: string[]; images: string[]}> = ({
	title,
	captions,
	images,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const tileCount = Math.min(4, images.length);
	const cycleTotal = Math.max(1, durationInFrames - INTRO_FRAMES);
	const perTileFrames = Math.max(1, Math.floor(cycleTotal / Math.max(1, tileCount)));
	const cycleFrame = Math.max(0, frame - INTRO_FRAMES);

	const titleOpacity = interpolate(frame, [8, 20, INTRO_FRAMES + 30, INTRO_FRAMES + 45], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const activeIndex = Math.min(tileCount - 1, Math.floor(cycleFrame / perTileFrames));
	const currentCaption = captions[activeIndex] ?? '';
	const captionOpacity = interpolate(frame, [INTRO_FRAMES + 10, INTRO_FRAMES + 25], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{background: '#0c0c14'}}>
			<AbsoluteFill>
				{images.slice(0, 4).map((src, i) => {
					const q = QUADRANTS[i];

					// Fly-in entrance from off-screen toward the grid quadrant.
					const entrance = interpolate(frame, [0, INTRO_FRAMES], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					const flyX = (1 - entrance) * q.fromX * 60;
					const flyY = (1 - entrance) * q.fromY * 60;

					// Plateau emphasis: this tile is "popped forward" for its window
					// in the cycle, eased in/out at the edges.
					const winStart = i * perTileFrames;
					const winEnd = winStart + perTileFrames;
					const bump = interpolate(
						cycleFrame,
						[winStart, winStart + EASE_FRAMES, winEnd - EASE_FRAMES, winEnd],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
					);
					const scale = 1 + bump * 0.08 - (1 - entrance) * 0.15;
					const brightness = 0.55 + bump * 0.45 + entrance * 0 + (entrance < 1 ? 0.45 : 0);

					const cellLeft = q.col * CELL_W + GRID_GAP / 2;
					const cellTop = q.row * CELL_H + GRID_GAP / 2;
					const cellWidth = CELL_W - GRID_GAP;
					const cellHeight = CELL_H - GRID_GAP;

					return (
						<Img
							key={i}
							src={src}
							style={{
								position: 'absolute',
								top: cellTop,
								left: cellLeft,
								width: cellWidth,
								height: cellHeight,
								objectFit: 'cover',
							}}
						/>
					);
				})}
			</AbsoluteFill>

			{title ? (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						display: 'flex',
						justifyContent: 'center',
						paddingTop: 90,
						opacity: titleOpacity,
					}}
				>
					<div
						style={{
							background: 'rgba(0,0,0,0.6)',
							padding: '18px 40px',
							borderRadius: 999,
							color: 'white',
							fontFamily: FONT_FAMILY,
							fontWeight: 800,
							fontSize: 48,
							textAlign: 'center',
						}}
					>
						{title}
					</div>
				</div>
			) : null}

			{currentCaption ? (
				<div
					style={{
						position: 'absolute',
						bottom: 60,
						left: 0,
						right: 0,
						display: 'flex',
						justifyContent: 'center',
						opacity: captionOpacity,
					}}
				>
					<div
						style={{
							background: GOLD,
							color: '#170F22',
							padding: '18px 46px',
							borderRadius: 999,
							fontFamily: FONT_FAMILY,
							fontWeight: 800,
							fontSize: 40,
							textAlign: 'center',
						}}
					>
						{currentCaption}
					</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

export const GridAd: React.FC<GridProps> = ({title, captions, cta, link, images, music, logoPath, totalFrames}) => {
	const ctaFrames = secondsToFrames(
		Math.max(MIN_SCALED_CTA_SECONDS, CTA_SECONDS * Math.min(1, (totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS)) / FPS / MIN_DURATION_SECONDS))
	);
	const transitionFrames = secondsToFrames(TRANSITION_SECONDS);
	const effectiveTotalFrames = totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS);
	const gridFrames = Math.max(1, effectiveTotalFrames - ctaFrames + transitionFrames);

	return (
		<>
			{music ? <Audio src={music} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={gridFrames}>
					<GridSegment title={title} captions={captions} images={images} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={fade()}
					timing={linearTiming({durationInFrames: transitionFrames})}
				/>
				<TransitionSeries.Sequence durationInFrames={ctaFrames}>
					<CtaEnd cta={cta} link={link} logoPath={logoPath} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
