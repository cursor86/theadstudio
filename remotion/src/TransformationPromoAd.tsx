import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Self-promo "before -> brand -> after" reel: a dull, cluttered slide showing
// what clients hand us (raw product photos, low engagement, low sales), a
// punchy brand-reveal beat, then a vibrant slide showing what they get
// (polished portfolio stills, stronger engagement, higher sales).
export const transformationPromoSchema = z.object({
	brandName: z.string(),
	tagline: z.string(),
	beforeLabel: z.string(),
	beforeImages: z.array(z.string()),
	beforePainPoints: z.array(z.string()),
	afterLabel: z.string(),
	afterImages: z.array(z.string()),
	afterWins: z.array(z.string()),
	logoPath: z.string(),
	cta: z.string(),
	contact: z.string(),
});

export type TransformationPromoProps = z.infer<typeof transformationPromoSchema>;

const FPS = 30;
const NAVY = '#1B2340';
const NAVY_DEEP = '#12172E';
const BLUE = '#2E9BE0';
const ORANGE = '#F5A623';
const CREAM = '#FAF8F5';
const DULL_GRAY = '#8A8A92';
const DULL_BG = '#2A2A30';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);

function mulberry32(seed: number) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const BEFORE_SECONDS = 4.0;
const BRAND_SECONDS = 1.9;
const AFTER_SECONDS = 4.6;
const OUTRO_SECONDS = 3.2;
const TRANSITION_SECONDS = 0.35;

const BEFORE_SLOTS = [
	{x: 14, y: 30, rotate: -7, size: 300},
	{x: 56, y: 22, rotate: 5, size: 280},
	{x: 32, y: 56, rotate: 3, size: 260},
];

const AFTER_SLOTS = [
	{x: 10, y: 24, rotate: -6, size: 310},
	{x: 54, y: 16, rotate: 4, size: 300},
	{x: 12, y: 58, rotate: 6, size: 280},
	{x: 56, y: 55, rotate: -4, size: 290},
];

const PhotoCard: React.FC<{
	src: string;
	x: number;
	y: number;
	rotate: number;
	size: number;
	delay: number;
	grayscale?: boolean;
	glow?: boolean;
}> = ({src, x, y, rotate, size, delay, grayscale, glow}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 13, mass: 0.6, stiffness: 150}});
	return (
		<div
			style={{
				position: 'absolute',
				left: `${x}%`,
				top: `${y}%`,
				width: size,
				height: size,
				transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${pop})`,
				borderRadius: 18,
				overflow: 'hidden',
				boxShadow: glow ? `0 12px 40px ${BLUE}55` : '0 10px 30px rgba(0,0,0,0.45)',
				border: glow ? `3px solid ${ORANGE}` : '3px solid rgba(255,255,255,0.08)',
			}}
		>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					filter: grayscale ? 'grayscale(0.85) brightness(0.65) contrast(0.9)' : 'none',
				}}
			/>
		</div>
	);
};

const Chip: React.FC<{text: string; delay: number; tone: 'muted' | 'win'}> = ({text, delay, tone}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 14, mass: 0.6}});
	const muted = tone === 'muted';
	return (
		<div
			style={{
				opacity: in_,
				transform: `translateX(${(1 - in_) * -18}px)`,
				display: 'flex',
				alignItems: 'center',
				gap: 10,
				padding: '10px 20px',
				borderRadius: 999,
				background: muted ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)',
				border: muted ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${ORANGE}77`,
				marginBottom: 12,
			}}
		>
			<span style={{fontSize: 18, color: muted ? DULL_GRAY : ORANGE}}>{muted ? '✕' : '✓'}</span>
			<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, color: muted ? '#C7C7CC' : CREAM}}>{text}</span>
		</div>
	);
};

const BeforeBeat: React.FC<{label: string; images: string[]; painPoints: string[]}> = ({label, images, painPoints}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const labelIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 20%, ${DULL_BG} 0%, ${NAVY_DEEP} 100%)`}}>
			<div
				style={{
					position: 'absolute',
					top: 70,
					left: 0,
					right: 0,
					textAlign: 'center',
					opacity: labelIn,
					transform: `translateY(${(1 - labelIn) * -14}px)`,
				}}
			>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 2, color: '#D9D9DE'}}>{label.toUpperCase()}</div>
			</div>
			{images.slice(0, 3).map((src, i) => (
				<PhotoCard key={i} src={src} {...BEFORE_SLOTS[i]} delay={16 + i * 8} grayscale />
			))}
			<div style={{position: 'absolute', bottom: 130, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				{painPoints.map((p, i) => (
					<Chip key={i} text={p} delay={70 + i * 10} tone="muted" />
				))}
			</div>
		</AbsoluteFill>
	);
};

const BrandBeat: React.FC<{brandName: string; tagline: string; logoPath: string}> = ({brandName, tagline, logoPath}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.6, to: 1, config: {damping: 10, mass: 0.7, stiffness: 200}});
	const flash = interpolate(frame, [0, 5, 16], [0, 1, 0], {extrapolateRight: 'clamp'});
	const sweep = interpolate(frame, [0, 26], [-30, 130], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: CREAM, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					top: '-10%',
					left: `${sweep}%`,
					width: '25%',
					height: '120%',
					background: `linear-gradient(115deg, transparent 0%, ${BLUE}22 45%, transparent 100%)`,
					transform: 'rotate(10deg)',
				}}
			/>
			<div style={{transform: `scale(${pop})`, textAlign: 'center'}}>
				{logoPath ? (
					<div
						style={{
							display: 'inline-block',
							padding: 18,
							borderRadius: 24,
							background: 'white',
							boxShadow: '0 18px 44px rgba(27,35,64,0.16)',
						}}
					>
						<Img src={logoPath} style={{width: 440, objectFit: 'contain', display: 'block'}} />
					</div>
				) : null}
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: NAVY, marginTop: 18}}>{brandName}</div>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: BLUE, marginTop: 4}}>{tagline.toUpperCase()}</div>
			</div>
			<AbsoluteFill style={{background: 'white', opacity: flash}} />
		</AbsoluteFill>
	);
};

const AfterBeat: React.FC<{label: string; images: string[]; wins: string[]}> = ({label, images, wins}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const labelIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 20%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`}}>
			<div
				style={{
					position: 'absolute',
					top: 70,
					left: 0,
					right: 0,
					textAlign: 'center',
					opacity: labelIn,
					transform: `translateY(${(1 - labelIn) * -14}px)`,
				}}
			>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 42, letterSpacing: 2, color: ORANGE, textShadow: `0 0 26px ${ORANGE}66`}}>
					{label.toUpperCase()}
				</div>
			</div>
			{images.slice(0, 4).map((src, i) => (
				<PhotoCard key={i} src={src} {...AFTER_SLOTS[i]} delay={16 + i * 7} glow />
			))}
			<div style={{position: 'absolute', bottom: 100, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				{wins.map((w, i) => (
					<Chip key={i} text={w} delay={80 + i * 10} tone="win" />
				))}
			</div>
		</AbsoluteFill>
	);
};

const OutroBeat: React.FC<{cta: string; contact: string; logoPath: string}> = ({cta, contact, logoPath}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const ctaIn = spring({frame, fps, from: 0, to: 1, config: {damping: 14, mass: 0.7}});
	const pillIn = spring({frame: frame - 14, fps, from: 0, to: 1, config: {damping: 14, mass: 0.7}});
	const breathe = 1 + Math.sin(frame / 28) * 0.02;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					position: 'absolute',
					width: 460,
					height: 460,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${BLUE}33 0%, transparent 70%)`,
					transform: `scale(${breathe})`,
				}}
			/>
			{logoPath ? (
				<div
					style={{
						padding: 12,
						borderRadius: 16,
						background: 'white',
						boxShadow: '0 14px 34px rgba(0,0,0,0.35)',
						opacity: ctaIn,
						marginBottom: 22,
					}}
				>
					<Img src={logoPath} style={{width: 200, objectFit: 'contain', display: 'block'}} />
				</div>
			) : null}
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 38,
					color: CREAM,
					textAlign: 'center',
					padding: '0 100px',
					opacity: ctaIn,
					transform: `translateY(${(1 - ctaIn) * 18}px)`,
				}}
			>
				{cta}
			</div>
			<div
				style={{
					marginTop: 36,
					padding: '16px 34px',
					borderRadius: 999,
					background: 'rgba(255,255,255,0.08)',
					border: `1px solid ${ORANGE}66`,
					opacity: pillIn,
					transform: `translateY(${(1 - pillIn) * 16}px)`,
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, color: CREAM}}>{contact}</span>
			</div>
		</AbsoluteFill>
	);
};

export const TransformationPromoAd: React.FC<TransformationPromoProps> = ({
	brandName,
	tagline,
	beforeLabel,
	beforeImages,
	beforePainPoints,
	afterLabel,
	afterImages,
	afterWins,
	logoPath,
	cta,
	contact,
}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const timing = linearTiming({durationInFrames: transitionFrames});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(BEFORE_SECONDS)}>
					<BeforeBeat label={beforeLabel} images={beforeImages} painPoints={beforePainPoints} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(BRAND_SECONDS)}>
					<BrandBeat brandName={brandName} tagline={tagline} logoPath={logoPath} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(AFTER_SECONDS)}>
					<AfterBeat label={afterLabel} images={afterImages} wins={afterWins} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(OUTRO_SECONDS)}>
					<OutroBeat cta={cta} contact={contact} logoPath={logoPath} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};

export const calculateTransformationPromoMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const beats = [BEFORE_SECONDS, BRAND_SECONDS, AFTER_SECONDS, OUTRO_SECONDS];
	const total = beats.reduce((sum, b) => sum + s2f(b), 0) - transitionFrames * (beats.length - 1);
	return {durationInFrames: total};
};
