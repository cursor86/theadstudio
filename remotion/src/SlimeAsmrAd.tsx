import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Visual-only "ASMR" style reel: slow, deliberate close-up beats on a single
// hero slime product photo (glossy sheen sweeps, sparkle glints, a slow
// tilt/orbit, label reveal) instead of quick cuts - no real ASMR audio, just
// a soft low-volume music bed under a mellow, satisfying visual pace.
export const slimeAsmrSchema = z.object({
	heroImage: z.string(),
	flavorLabel: z.string(),
	openingLine: z.string(),
	closingLine: z.string(),
	brandName: z.string(),
	contact: z.string(),
	music: z.string().optional(),
});

export type SlimeAsmrProps = z.infer<typeof slimeAsmrSchema>;

const FPS = 30;
const BG_DEEP = '#141B30';
const BG_DEEP_2 = '#0D1120';
const SOFT_BLUE = '#8FD3F4';
const CREAM = '#FDF6EC';
const LAVENDER = '#C9B6E4';
const GLOW_PINK = '#FFD1E3';
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

const REVEAL_SECONDS = 2.5;
const SHEEN_SECONDS = 3.0;
const SPARKLE_SECONDS = 2.6;
const ROTATE_SECONDS = 2.8;
const LABEL_SECONDS = 2.4;
const OUTRO_SECONDS = 3.2;
const TRANSITION_SECONDS = 0.35;

// Soft ambient vignette + grain-free dark frame so the product photo (shot on
// plain white) reads as a cozy, isolated "macro" subject rather than a
// pasted-in cutout.
const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, ${BG_DEEP} 0%, ${BG_DEEP_2} 100%)`}}>
		{children}
		<AbsoluteFill
			style={{
				boxShadow: 'inset 0 0 260px rgba(0,0,0,0.55)',
				pointerEvents: 'none',
			}}
		/>
	</AbsoluteFill>
);

// Frames the hero photo in a soft rounded "macro lens" window, panned/zoomed
// to a specific focal point so a single product photo can stand in for many
// different close-up shots.
const HeroCrop: React.FC<{
	heroImage: string;
	posX: number;
	posY: number;
	zoomFrom: number;
	zoomTo: number;
	durationInFrames: number;
	blurIn?: boolean;
}> = ({heroImage, posX, posY, zoomFrom, zoomTo, durationInFrames, blurIn}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {extrapolateRight: 'clamp'});
	const blur = blurIn ? interpolate(frame, [0, 18], [16, 0], {extrapolateRight: 'clamp'}) : 0;

	return (
		<AbsoluteFill style={{overflow: 'hidden', borderRadius: 36}}>
			<Img
				src={heroImage}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: `${posX}% ${posY}%`,
					transform: `scale(${scale})`,
					filter: `blur(${blur}px)`,
				}}
			/>
			<AbsoluteFill style={{boxShadow: 'inset 0 0 120px rgba(20,27,48,0.35)'}} />
		</AbsoluteFill>
	);
};

const Sheen: React.FC<{durationInFrames: number; delay?: number}> = ({durationInFrames, delay = 0}) => {
	const frame = useCurrentFrame() - delay;
	if (frame < 0) return null;
	const period = 55;
	const local = frame % period;
	const pos = interpolate(local, [0, period], [-60, 160], {extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				top: '-20%',
				left: `${pos}%`,
				width: '35%',
				height: '140%',
				background: 'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.5) 45%, transparent 100%)',
				transform: 'rotate(8deg)',
				mixBlendMode: 'screen',
			}}
		/>
	);
};

const Sparkles: React.FC<{count?: number; seed?: number}> = ({count = 14, seed = 7}) => {
	const frame = useCurrentFrame();
	const rand = mulberry32(seed);
	const dots = Array.from({length: count}).map(() => ({
		x: 15 + rand() * 70,
		y: 10 + rand() * 55,
		size: 3 + rand() * 6,
		phase: rand() * Math.PI * 2,
		speed: 6 + rand() * 5,
	}));
	return (
		<>
			{dots.map((d, i) => {
				const twinkle = (Math.sin(frame / d.speed + d.phase) + 1) / 2;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${d.x}%`,
							top: `${d.y}%`,
							width: d.size,
							height: d.size,
							borderRadius: '50%',
							background: CREAM,
							opacity: 0.25 + twinkle * 0.65,
							boxShadow: `0 0 ${6 + twinkle * 10}px rgba(255,255,255,0.8)`,
						}}
					/>
				);
			})}
		</>
	);
};

const RevealBeat: React.FC<{heroImage: string; line: string; durationInFrames: number}> = ({heroImage, line, durationInFrames}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const textIn = spring({frame: frame - 14, fps, from: 0, to: 1, config: {damping: 16, mass: 0.7}});
	return (
		<Stage>
			<AbsoluteFill style={{padding: 60}}>
				<HeroCrop heroImage={heroImage} posX={50} posY={30} zoomFrom={1.18} zoomTo={1.04} durationInFrames={durationInFrames} blurIn />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 140}}>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 300,
						fontSize: 44,
						letterSpacing: 3,
						color: CREAM,
						opacity: textIn,
						transform: `translateY(${(1 - textIn) * 20}px)`,
						textAlign: 'center',
						textShadow: '0 0 30px rgba(0,0,0,0.6)',
					}}
				>
					{line}
				</div>
			</AbsoluteFill>
		</Stage>
	);
};

const SheenBeat: React.FC<{heroImage: string; durationInFrames: number}> = ({heroImage, durationInFrames}) => {
	return (
		<Stage>
			<AbsoluteFill style={{padding: 60}}>
				<HeroCrop heroImage={heroImage} posX={50} posY={18} zoomFrom={1.3} zoomTo={1.5} durationInFrames={durationInFrames} />
				<AbsoluteFill style={{overflow: 'hidden', borderRadius: 36}}>
					<Sheen durationInFrames={durationInFrames} />
					<Sheen durationInFrames={durationInFrames} delay={28} />
				</AbsoluteFill>
			</AbsoluteFill>
		</Stage>
	);
};

const SparkleBeat: React.FC<{heroImage: string; durationInFrames: number}> = ({heroImage, durationInFrames}) => {
	return (
		<Stage>
			<AbsoluteFill style={{padding: 60}}>
				<HeroCrop heroImage={heroImage} posX={45} posY={22} zoomFrom={1.55} zoomTo={1.7} durationInFrames={durationInFrames} />
				<AbsoluteFill style={{borderRadius: 36, overflow: 'hidden'}}>
					<Sparkles seed={11} count={16} />
				</AbsoluteFill>
			</AbsoluteFill>
		</Stage>
	);
};

const RotateBeat: React.FC<{heroImage: string; durationInFrames: number}> = ({heroImage, durationInFrames}) => {
	const frame = useCurrentFrame();
	const tilt = Math.sin(frame / 45) * 4;
	const drift = Math.sin(frame / 60) * 10;
	return (
		<Stage>
			<AbsoluteFill style={{padding: 70, perspective: 1400}}>
				<AbsoluteFill
					style={{
						transform: `rotateY(${tilt}deg) rotateX(${-tilt * 0.4}deg) translateX(${drift}px)`,
						transformStyle: 'preserve-3d',
					}}
				>
					<HeroCrop heroImage={heroImage} posX={50} posY={35} zoomFrom={1.06} zoomTo={1.16} durationInFrames={durationInFrames} />
				</AbsoluteFill>
			</AbsoluteFill>
			<AbsoluteFill style={{borderRadius: 36, overflow: 'hidden', padding: 70}}>
				<Sparkles seed={23} count={8} />
			</AbsoluteFill>
		</Stage>
	);
};

const LabelBeat: React.FC<{heroImage: string; flavorLabel: string; durationInFrames: number}> = ({heroImage, flavorLabel, durationInFrames}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const glow = spring({frame, fps, from: 0, to: 1, config: {damping: 14, mass: 0.7}});
	return (
		<Stage>
			<AbsoluteFill style={{padding: 60}}>
				<HeroCrop heroImage={heroImage} posX={50} posY={78} zoomFrom={1.35} zoomTo={1.45} durationInFrames={durationInFrames} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 120}}>
				<div
					style={{
						padding: '14px 34px',
						borderRadius: 999,
						background: 'rgba(20,27,48,0.55)',
						border: `1px solid ${SOFT_BLUE}55`,
						boxShadow: `0 0 ${20 + glow * 30}px ${SOFT_BLUE}66`,
						opacity: glow,
						transform: `translateY(${(1 - glow) * 16}px)`,
					}}
				>
					<span
						style={{
							fontFamily: SANS,
							fontWeight: 700,
							fontSize: 30,
							letterSpacing: 2,
							color: CREAM,
						}}
					>
						{flavorLabel.toUpperCase()}
					</span>
				</div>
			</AbsoluteFill>
		</Stage>
	);
};

const OutroBeat: React.FC<{brandName: string; closingLine: string; contact: string; durationInFrames: number}> = ({
	brandName,
	closingLine,
	contact,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brandIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const lineIn = spring({frame: frame - 10, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const pillIn = spring({frame: frame - 20, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const breathe = 1 + Math.sin(frame / 30) * 0.02;

	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse at 50% 45%, ${BG_DEEP} 0%, ${BG_DEEP_2} 100%)`,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					width: 420,
					height: 420,
					position: 'absolute',
					borderRadius: '50%',
					background: `radial-gradient(circle, ${LAVENDER}33 0%, transparent 70%)`,
					transform: `scale(${breathe})`,
				}}
			/>
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 58,
					color: CREAM,
					opacity: brandIn,
					transform: `translateY(${(1 - brandIn) * 20}px) scale(${0.95 + brandIn * 0.05})`,
					letterSpacing: 1,
				}}
			>
				{brandName}
			</div>
			<div
				style={{
					marginTop: 18,
					fontFamily: SANS,
					fontWeight: 300,
					fontSize: 30,
					color: SOFT_BLUE,
					opacity: lineIn,
					transform: `translateY(${(1 - lineIn) * 16}px)`,
					letterSpacing: 1,
					textAlign: 'center',
					padding: '0 90px',
				}}
			>
				{closingLine}
			</div>
			<div
				style={{
					marginTop: 46,
					padding: '16px 34px',
					borderRadius: 999,
					background: 'rgba(253,246,236,0.08)',
					border: `1px solid ${GLOW_PINK}55`,
					opacity: pillIn,
					transform: `translateY(${(1 - pillIn) * 16}px)`,
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, color: CREAM}}>{contact}</span>
			</div>
		</AbsoluteFill>
	);
};

export const SlimeAsmrAd: React.FC<SlimeAsmrProps> = ({heroImage, flavorLabel, openingLine, closingLine, brandName, contact, music}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const timing = linearTiming({durationInFrames: transitionFrames});

	return (
		<AbsoluteFill style={{backgroundColor: BG_DEEP_2}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(REVEAL_SECONDS)}>
					<RevealBeat heroImage={heroImage} line={openingLine} durationInFrames={s2f(REVEAL_SECONDS)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SHEEN_SECONDS)}>
					<SheenBeat heroImage={heroImage} durationInFrames={s2f(SHEEN_SECONDS)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SPARKLE_SECONDS)}>
					<SparkleBeat heroImage={heroImage} durationInFrames={s2f(SPARKLE_SECONDS)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(ROTATE_SECONDS)}>
					<RotateBeat heroImage={heroImage} durationInFrames={s2f(ROTATE_SECONDS)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(LABEL_SECONDS)}>
					<LabelBeat heroImage={heroImage} flavorLabel={flavorLabel} durationInFrames={s2f(LABEL_SECONDS)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(OUTRO_SECONDS)}>
					<OutroBeat brandName={brandName} closingLine={closingLine} contact={contact} durationInFrames={s2f(OUTRO_SECONDS)} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.3} /> : null}
		</AbsoluteFill>
	);
};

export const calculateSlimeAsmrMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const beats = [REVEAL_SECONDS, SHEEN_SECONDS, SPARKLE_SECONDS, ROTATE_SECONDS, LABEL_SECONDS, OUTRO_SECONDS];
	const total = beats.reduce((sum, b) => sum + s2f(b), 0) - transitionFrames * (beats.length - 1);
	return {durationInFrames: total};
};
