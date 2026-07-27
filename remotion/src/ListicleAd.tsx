import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
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
	GOLD_GRADIENT,
	MAX_DURATION_SECONDS,
	MIN_DURATION_SECONDS,
	MIN_SCALED_CTA_SECONDS,
	MIN_SCALED_TITLE_SECONDS,
	TITLE_SECONDS,
} from './constants';

// Covers two closely-related formats with one composition: "listicle"
// (5 Reasons You Need This - label is a number) and "types of" videos
// (3 Types of Coffee Lovers - label is a persona name). Same structure
// either way: title card, then one full-screen card per item with a big
// label badge + text, optional photo, then CTA.
export const listicleSchema = z.object({
	title: z.string(),
	items: z.array(
		z.object({
			label: z.string(), // "1", "2"... or "The Rushed Commuter", etc.
			text: z.string(),
			image: z.string().optional(),
		})
	),
	cta: z.string(),
	link: z.string(),
	music: z.string(),
	logoPath: z.string().optional(),
	durationSeconds: z.number().optional(),
	totalFrames: z.number().optional(),
});

export type ListicleProps = z.infer<typeof listicleSchema>;

const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);
const MIN_ITEM_SECONDS = 2.2;

export const calculateListicleMetadata = async ({props}: {props: ListicleProps}) => {
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

const TitleScreen: React.FC<{title: string; count: number}> = ({title, count}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const punch = spring({frame, fps, config: {damping: 12, mass: 0.6, stiffness: 120}});
	const scale = interpolate(punch, [0, 1], [0.75, 1]);
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: GOLD_GRADIENT, justifyContent: 'center', alignItems: 'center', padding: '0 80px'}}>
			<div
				style={{
					opacity,
					transform: `scale(${scale})`,
					color: GOLD,
					fontFamily: FONT_FAMILY,
					fontWeight: 900,
					fontSize: 96,
					marginBottom: 30,
				}}
			>
				{count}
			</div>
			<div
				style={{
					opacity,
					color: 'white',
					fontFamily: FONT_FAMILY,
					fontWeight: 800,
					fontSize: 62,
					lineHeight: 1.2,
					textAlign: 'center',
				}}
			>
				{title}
			</div>
		</AbsoluteFill>
	);
};

const ItemCard: React.FC<{label: string; text: string; image?: string}> = ({label, text, image}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const badgePunch = spring({frame, fps, config: {damping: 10, mass: 0.5, stiffness: 170}});
	const badgeScale = interpolate(badgePunch, [0, 1], [0.3, 1]);
	const textOpacity = interpolate(frame, [12, 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const textY = interpolate(frame, [12, 28], [18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: '#0c0c14'}}>
			{image ? (
				<>
					<Img
						src={image}
						style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}}
					/>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.85) 100%)',
						}}
					/>
				</>
			) : null}
			<AbsoluteFill style={{justifyContent: image ? 'flex-end' : 'center', alignItems: 'center', padding: '0 80px 130px'}}>
				<div
					style={{
						transform: `scale(${badgeScale})`,
						background: GOLD,
						color: '#170F22',
						fontFamily: FONT_FAMILY,
						fontWeight: 900,
						fontSize: 44,
						padding: '14px 34px',
						borderRadius: 999,
						marginBottom: 30,
					}}
				>
					{label}
				</div>
				<div
					style={{
						opacity: textOpacity,
						transform: `translateY(${textY}px)`,
						color: 'white',
						fontFamily: FONT_FAMILY,
						fontWeight: 800,
						fontSize: 46,
						lineHeight: 1.25,
						textAlign: 'center',
						textShadow: image ? '0 4px 14px rgba(0,0,0,0.6)' : 'none',
					}}
				>
					{text}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

type Segment =
	| {kind: 'title'; frames: number; title: string; count: number}
	| {kind: 'item'; frames: number; label: string; text: string; image?: string}
	| {kind: 'cta'; frames: number; cta: string; link: string; logoPath?: string};

export const ListicleAd: React.FC<ListicleProps> = ({title, items, cta, link, music, logoPath, totalFrames}) => {
	const effectiveTotalFrames = totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS);
	const scale = Math.min(1, effectiveTotalFrames / FPS / MIN_DURATION_SECONDS);

	const ctaFrames = secondsToFrames(Math.max(MIN_SCALED_CTA_SECONDS, CTA_SECONDS * scale));
	const titleFrames = title ? secondsToFrames(Math.max(MIN_SCALED_TITLE_SECONDS, TITLE_SECONDS * scale)) : 0;
	const transitionFrames = secondsToFrames(0.35);

	const itemBudget = Math.max(secondsToFrames(MIN_ITEM_SECONDS), effectiveTotalFrames - ctaFrames - titleFrames);
	const itemFramesEach =
		items.length > 0 ? Math.max(secondsToFrames(MIN_ITEM_SECONDS), Math.floor(itemBudget / items.length)) : 0;

	const segments: Segment[] = [];
	if (title) segments.push({kind: 'title', frames: titleFrames, title, count: items.length});
	items.forEach((item) => {
		segments.push({kind: 'item', frames: itemFramesEach, label: item.label, text: item.text, image: item.image});
	});
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
							{segment.kind === 'title' ? <TitleScreen title={segment.title} count={segment.count} /> : null}
							{segment.kind === 'item' ? (
								<ItemCard label={segment.label} text={segment.text} image={segment.image} />
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
