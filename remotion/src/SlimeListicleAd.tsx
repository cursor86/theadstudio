import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';
import {getAudioDurationSeconds} from './audio-duration';
import {
	ABSOLUTE_MAX_DURATION_SECONDS,
	ABSOLUTE_MIN_DURATION_SECONDS,
	FPS,
	MAX_DURATION_SECONDS,
	MIN_DURATION_SECONDS,
} from './constants';

// Funky kids-brand listicle: combines ListicleAd's numbered-badge item
// structure with KenBurnsAd's continuous slow zoom/pan on each photo,
// dressed in a bright candy-color "funky kids" palette (not the gold/
// premium palette the other listicle-style templates use) with bouncy
// spring pops and a slight wiggle on badges/text instead of straight fades.
export const slimeListicleSchema = z.object({
	title: z.string(),
	items: z.array(
		z.object({
			label: z.string(),
			text: z.string(),
			image: z.string(),
		})
	),
	cta: z.string(),
	link: z.string(),
	music: z.string(),
	durationSeconds: z.number().optional(),
	totalFrames: z.number().optional(),
});

export type SlimeListicleProps = z.infer<typeof slimeListicleSchema>;

const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);
const MIN_ITEM_SECONDS = 3.2;
const TITLE_SECONDS = 2.6;
const CTA_SECONDS = 3.4;

export const calculateSlimeListicleMetadata = async ({props}: {props: SlimeListicleProps}) => {
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

// Candy palette - deliberately loud, not the premium-gold look used elsewhere.
const HOT_PINK = '#FF3E9D';
const PURPLE = '#7B2FF7';
const LIME = '#B4FF39';
const YELLOW = '#FFD93D';
const SKY = '#3EC6FF';
const INK = '#1B0B2E';
const FUNKY_FONT = '"Arial Rounded MT Bold", "Arial Black", "Helvetica Neue", sans-serif';

const ITEM_THEMES = [
	{bg: `linear-gradient(150deg, ${HOT_PINK} 0%, ${PURPLE} 100%)`, badge: YELLOW},
	{bg: `linear-gradient(150deg, ${SKY} 0%, ${PURPLE} 100%)`, badge: LIME},
	{bg: `linear-gradient(150deg, ${YELLOW} 0%, ${HOT_PINK} 100%)`, badge: SKY},
	{bg: `linear-gradient(150deg, ${LIME} 0%, ${SKY} 100%)`, badge: HOT_PINK},
];

const popIn = (frame: number, fps: number, delay = 0, config = {damping: 9, mass: 0.6, stiffness: 200}) =>
	spring({frame: frame - delay, fps, from: 0, to: 1, config});

// Small floating sparkle/star decorations - gives the "funky" energy without
// needing any external assets.
const Sparkles: React.FC<{seed: number}> = ({seed}) => {
	const frame = useCurrentFrame();
	const stars = ['✨', '⭐', '💫', '🌟'];
	const positions = [
		{x: 8, y: 14},
		{x: 88, y: 10},
		{x: 12, y: 82},
		{x: 90, y: 78},
		{x: 50, y: 6},
	];
	return (
		<>
			{positions.map((p, i) => {
				const bob = Math.sin(frame / 14 + i * 1.7 + seed) * 10;
				const spin = (frame * 1.4 + i * 40) % 360;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${p.x}%`,
							top: `${p.y}%`,
							fontSize: 34 + (i % 2) * 10,
							transform: `translateY(${bob}px) rotate(${spin}deg)`,
							opacity: 0.85,
						}}
					>
						{stars[(i + seed) % stars.length]}
					</div>
				);
			})}
		</>
	);
};

const TitleScreen: React.FC<{title: string; count: number}> = ({title, count}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const scale = interpolate(pop, [0, 1], [0.4, 1]);
	const wiggle = Math.sin(frame / 6) * 3;
	const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: `linear-gradient(160deg, ${PURPLE} 0%, ${HOT_PINK} 100%)`, overflow: 'hidden'}}>
			<Sparkles seed={0} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 90px'}}>
				<div
					style={{
						opacity,
						transform: `scale(${scale}) rotate(${wiggle}deg)`,
						background: YELLOW,
						color: INK,
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 110,
						width: 170,
						height: 170,
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 34,
						border: `8px solid white`,
						boxShadow: '0 16px 0 rgba(0,0,0,0.2)',
					}}
				>
					{count}
				</div>
				<div
					style={{
						opacity,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 68,
						lineHeight: 1.15,
						textAlign: 'center',
						textShadow: '0 6px 0 rgba(0,0,0,0.25)',
						WebkitTextStroke: '2px rgba(0,0,0,0.15)',
					}}
				>
					{title}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const ItemCard: React.FC<{label: string; text: string; image: string; theme: {bg: string; badge: string}; durationInFrames: number}> = ({
	label,
	text,
	image,
	theme,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Slow continuous Ken Burns zoom/pan for the whole time this item is on
	// screen - same technique as KenBurnsAd, alternating pan direction per
	// item index (via the sign baked into `theme`) so consecutive items don't
	// all drift the same way.
	const scale = interpolate(frame, [0, durationInFrames], [1, 1.16], {extrapolateRight: 'clamp'});
	const panX = interpolate(frame, [0, durationInFrames], [0, -14], {extrapolateRight: 'clamp'});

	const badgePop = popIn(frame, fps);
	const badgeWiggle = Math.sin(frame / 8) * 6;
	const textOpacity = interpolate(frame, [10, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const textY = interpolate(frame, [10, 26], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const photoPop = popIn(frame, fps, 0, {damping: 12, mass: 0.7, stiffness: 140});

	return (
		<AbsoluteFill style={{background: theme.bg, overflow: 'hidden'}}>
			<Sparkles seed={label.length} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '160px 60px 220px'}}>
				<div
					style={{
						transform: `scale(${0.9 + photoPop * 0.1})`,
						opacity: photoPop,
						width: '100%',
						maxWidth: 760,
						aspectRatio: '1 / 1',
						borderRadius: 40,
						overflow: 'hidden',
						border: '10px solid white',
						boxShadow: '0 20px 0 rgba(0,0,0,0.2)',
						position: 'relative',
					}}
				>
					<Img
						src={image}
						style={{
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							transform: `scale(${scale}) translateX(${panX}px)`,
						}}
					/>
				</div>
			</AbsoluteFill>

			<div
				style={{
					position: 'absolute',
					top: 70,
					left: 50,
					transform: `scale(${badgePop}) rotate(${badgeWiggle}deg)`,
					background: theme.badge,
					color: INK,
					fontFamily: FUNKY_FONT,
					fontWeight: 900,
					fontSize: 54,
					width: 110,
					height: 110,
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					border: '6px solid white',
					boxShadow: '0 10px 0 rgba(0,0,0,0.2)',
				}}
			>
				{label}
			</div>

			<div
				style={{
					position: 'absolute',
					bottom: 90,
					left: 0,
					right: 0,
					display: 'flex',
					justifyContent: 'center',
					padding: '0 50px',
					opacity: textOpacity,
					transform: `translateY(${textY}px)`,
				}}
			>
				<div
					style={{
						background: 'white',
						color: INK,
						fontFamily: FUNKY_FONT,
						fontWeight: 800,
						fontSize: 38,
						textAlign: 'center',
						padding: '20px 34px',
						borderRadius: 24,
						boxShadow: '0 10px 0 rgba(0,0,0,0.2)',
						lineHeight: 1.25,
					}}
				>
					{text}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const OutroCard: React.FC<{cta: string; link: string}> = ({cta, link}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const scale = interpolate(pop, [0, 1], [0.5, 1]);
	const wiggle = Math.sin(frame / 7) * 4;
	const opacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	const linkOpacity = interpolate(frame, [18, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: `linear-gradient(160deg, ${SKY} 0%, ${PURPLE} 100%)`, overflow: 'hidden'}}>
			<Sparkles seed={2} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div
					style={{
						opacity,
						transform: `scale(${scale}) rotate(${wiggle}deg)`,
						background: YELLOW,
						color: INK,
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 52,
						padding: '30px 56px',
						borderRadius: 999,
						border: '8px solid white',
						boxShadow: '0 14px 0 rgba(0,0,0,0.2)',
						textAlign: 'center',
					}}
				>
					{cta}
				</div>
				<div
					style={{
						opacity: linkOpacity,
						marginTop: 34,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 800,
						fontSize: 30,
						textShadow: '0 3px 0 rgba(0,0,0,0.2)',
					}}
				>
					{link}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

type Segment =
	| {kind: 'title'; frames: number; title: string; count: number}
	| {kind: 'item'; frames: number; label: string; text: string; image: string; theme: {bg: string; badge: string}}
	| {kind: 'cta'; frames: number; cta: string; link: string};

export const SlimeListicleAd: React.FC<SlimeListicleProps> = ({title, items, cta, link, music, totalFrames}) => {
	const effectiveTotalFrames = totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS);
	const transitionFrames = secondsToFrames(0.35);

	const ctaFrames = secondsToFrames(CTA_SECONDS);
	const titleFrames = title ? secondsToFrames(TITLE_SECONDS) : 0;
	const itemBudget = Math.max(secondsToFrames(MIN_ITEM_SECONDS), effectiveTotalFrames - ctaFrames - titleFrames);
	const itemFramesEach =
		items.length > 0 ? Math.max(secondsToFrames(MIN_ITEM_SECONDS), Math.floor(itemBudget / items.length)) : 0;

	const segments: Segment[] = [];
	if (title) segments.push({kind: 'title', frames: titleFrames, title, count: items.length});
	items.forEach((item, i) => {
		segments.push({
			kind: 'item',
			frames: itemFramesEach,
			label: item.label,
			text: item.text,
			image: item.image,
			theme: ITEM_THEMES[i % ITEM_THEMES.length],
		});
	});
	segments.push({kind: 'cta', frames: ctaFrames, cta, link});

	const transitionsCount = Math.max(0, segments.length - 1);
	const rawTotal = segments.reduce((sum, s) => sum + s.frames, 0);
	const deficit = effectiveTotalFrames - (rawTotal - transitionsCount * transitionFrames);
	if (deficit > 0) segments[segments.length - 1].frames += deficit;

	return (
		<>
			{music ? <Audio src={music} volume={0.6} /> : null}
			<TransitionSeries>
				{segments.map((segment, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={segment.frames}>
							{segment.kind === 'title' ? <TitleScreen title={segment.title} count={segment.count} /> : null}
							{segment.kind === 'item' ? (
								<ItemCard
									label={segment.label}
									text={segment.text}
									image={segment.image}
									theme={segment.theme}
									durationInFrames={segment.frames}
								/>
							) : null}
							{segment.kind === 'cta' ? <OutroCard cta={segment.cta} link={segment.link} /> : null}
						</TransitionSeries.Sequence>
						{i < segments.length - 1 ? (
							<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
						) : null}
					</React.Fragment>
				))}
			</TransitionSeries>
		</>
	);
};
