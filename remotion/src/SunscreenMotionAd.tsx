import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Fast 10s motion-graphics ad for an Amazon-affiliate skincare product. No
// product photo was available (JS-lazy-loaded on the listing), so this
// leans entirely on original kinetic typography + hand-drawn line icons
// (sun, droplet, UV shield) instead of any brand photography.
export const sunscreenMotionSchema = z.object({
	hookLine: z.string(),
	benefitLine: z.string(),
	brandLine: z.string(),
	subLine: z.string(),
	cta: z.string(),
	link: z.string(),
	music: z.string().optional(),
});

export type SunscreenMotionProps = z.infer<typeof sunscreenMotionSchema>;

const FPS = 30;
const CREAM = '#FBF7F0';
const INK = '#1F1B16';
const ORANGE = '#F2701C';
const ORANGE_LIGHT = '#FFA35C';

const s2f = (s: number) => Math.round(s * FPS);

const HOOK_SECONDS = 5.2;
const CTA_SECONDS = 5.2;
const TRANSITION_SECONDS = 0.4;

const SunIcon: React.FC<{frame: number; size?: number}> = ({frame, size = 120}) => {
	const spin = frame * 0.6;
	const pulse = 1 + Math.sin(frame / 10) * 0.05;
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${spin}deg) scale(${pulse})`}}>
			<circle cx="50" cy="50" r="20" fill={ORANGE} />
			{Array.from({length: 8}).map((_, i) => {
				const angle = (i * 360) / 8;
				return (
					<line
						key={i}
						x1="50"
						y1="18"
						x2="50"
						y2="6"
						stroke={ORANGE}
						strokeWidth="5"
						strokeLinecap="round"
						transform={`rotate(${angle} 50 50)`}
					/>
				);
			})}
		</svg>
	);
};

const DropletIcon: React.FC<{size?: number}> = ({size = 90}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path
			d="M50 8C50 8 22 42 22 63C22 79.5 34.5 92 50 92C65.5 92 78 79.5 78 63C78 42 50 8 50 8Z"
			stroke={ORANGE}
			strokeWidth="5"
			strokeLinejoin="round"
		/>
		<path d="M36 66C36 74 42 79 49 79" stroke={ORANGE_LIGHT} strokeWidth="4" strokeLinecap="round" />
	</svg>
);

const ShieldIcon: React.FC<{size?: number}> = ({size = 90}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path
			d="M50 6L86 20V48C86 70 70 86 50 96C30 86 14 70 14 48V20L50 6Z"
			stroke={ORANGE}
			strokeWidth="5"
			strokeLinejoin="round"
		/>
		<path d="M34 50L45 62L68 38" stroke={ORANGE_LIGHT} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const Grain: React.FC = () => (
	<AbsoluteFill
		style={{
			backgroundImage:
				"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
			opacity: 0.035,
			mixBlendMode: 'multiply',
			pointerEvents: 'none',
		}}
	/>
);

const HookBeat: React.FC<{hookLine: string; benefitLine: string}> = ({hookLine, benefitLine}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = hookLine.split(' ');
	const benefitIn = spring({frame: frame - 34, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const iconIn = spring({frame, fps, from: 0, to: 1, config: {damping: 12, mass: 0.6}});

	return (
		<AbsoluteFill style={{backgroundColor: CREAM, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<div style={{position: 'absolute', top: 130, opacity: iconIn, transform: `scale(${iconIn})`}}>
				<SunIcon frame={frame} size={110} />
			</div>
			<div style={{width: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
				<div
					style={{
						fontFamily: 'Arial, sans-serif',
						fontWeight: 800,
						fontSize: 62,
						lineHeight: 1.15,
						color: INK,
						textAlign: 'center',
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						rowGap: 4,
					}}
				>
					{words.map((word, i) => {
						const delay = 2 + i * 3;
						const wIn = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 14, mass: 0.5}});
						return (
							<span
								key={i}
								style={{
									display: 'inline-block',
									marginRight: 16,
									opacity: wIn,
									transform: `translateY(${(1 - wIn) * 24}px)`,
								}}
							>
								{word}
							</span>
						);
					})}
				</div>
				<div
					style={{
						width: 70,
						height: 4,
						background: ORANGE,
						borderRadius: 2,
						opacity: benefitIn,
					}}
				/>
				<div
					style={{
						fontFamily: 'Arial, sans-serif',
						fontWeight: 600,
						fontSize: 34,
						lineHeight: 1.4,
						color: `${INK}cc`,
						textAlign: 'center',
						padding: '0 60px',
						opacity: benefitIn,
						transform: `translateY(${(1 - benefitIn) * 14}px)`,
					}}
				>
					{benefitLine}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const CtaBeat: React.FC<{brandLine: string; subLine: string; cta: string; link: string}> = ({
	brandLine,
	subLine,
	cta,
	link,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brandIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const subIn = spring({frame: frame - 8, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const ctaIn = spring({frame: frame - 24, fps, from: 0.85, to: 1, config: {damping: 12, mass: 0.7}});
	const ctaOpacity = interpolate(frame, [24, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pulse = 1 + Math.sin(frame / 9) * 0.025;
	const linkIn = spring({frame: frame - 40, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});

	return (
		<AbsoluteFill style={{backgroundColor: INK, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					gap: 34,
					marginBottom: 40,
					opacity: brandIn,
					transform: `translateY(${(1 - brandIn) * 12}px)`,
				}}
			>
				<DropletIcon size={70} />
				<ShieldIcon size={70} />
			</div>
			<div
				style={{
					fontFamily: 'Arial, sans-serif',
					fontWeight: 800,
					fontSize: 46,
					color: CREAM,
					textAlign: 'center',
					padding: '0 90px',
					opacity: brandIn,
					transform: `translateY(${(1 - brandIn) * 12}px)`,
				}}
			>
				{brandLine}
			</div>
			<div
				style={{
					marginTop: 18,
					fontFamily: 'Arial, sans-serif',
					fontWeight: 600,
					fontSize: 26,
					letterSpacing: 1,
					color: ORANGE_LIGHT,
					textAlign: 'center',
					opacity: subIn,
					transform: `translateY(${(1 - subIn) * 10}px)`,
				}}
			>
				{subLine}
			</div>
			<div
				style={{
					marginTop: 50,
					padding: '24px 56px',
					borderRadius: 999,
					background: ORANGE,
					opacity: ctaOpacity,
					transform: `scale(${ctaIn * pulse})`,
					boxShadow: `0 0 40px ${ORANGE}55`,
				}}
			>
				<span style={{fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 34, color: INK}}>{cta}</span>
			</div>
			<div
				style={{
					marginTop: 26,
					fontFamily: 'Arial, sans-serif',
					fontWeight: 600,
					fontSize: 24,
					color: `${CREAM}99`,
					opacity: linkIn,
				}}
			>
				{link}
			</div>
		</AbsoluteFill>
	);
};

export const SunscreenMotionAd: React.FC<SunscreenMotionProps> = ({
	hookLine,
	benefitLine,
	brandLine,
	subLine,
	cta,
	link,
	music,
}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});

	return (
		<AbsoluteFill style={{backgroundColor: INK}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(HOOK_SECONDS)}>
					<HookBeat hookLine={hookLine} benefitLine={benefitLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />
				<TransitionSeries.Sequence durationInFrames={s2f(CTA_SECONDS)}>
					<CtaBeat brandLine={brandLine} subLine={subLine} cta={cta} link={link} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.55} /> : null}
		</AbsoluteFill>
	);
};

export const calculateSunscreenMotionMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const total = s2f(HOOK_SECONDS) + s2f(CTA_SECONDS) - transitionFrames;
	return {durationInFrames: total};
};
