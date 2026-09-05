import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// Built from the client's own raw shirt-mockup footage: the same clip plays
// straight through (chest logo -> white-shirt back print -> black-shirt
// front -> black-shirt back) while bold lower-third captions carry the
// story beat by beat, then a short CTA card after the clip ends.
export const projekt46Schema = z.object({
	videoSrc: z.string(),
	brand: z.string(),
	tagline: z.string(),
	ctaLine: z.string(),
	music: z.string().optional(),
});

export type Projekt46Props = z.infer<typeof projekt46Schema>;

const FPS = 30;
const BLACK = '#0A0A0A';
const GOLD = '#F0A428';
const CREAM = '#F5F1E8';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);

const VIDEO_FRAMES = s2f(14.05);
const CTA_FRAMES = s2f(3.2);

const CAPTION_BEATS = [
	{from: 0, to: s2f(3.5), text: 'MEET PROJEKT 46 BIKES'},
	{from: s2f(3.5), to: s2f(6.3), text: 'Retro drop. Street-ready.'},
	{from: s2f(6.3), to: s2f(9.4), text: 'Two colorways. One message.'},
	{from: s2f(9.4), to: VIDEO_FRAMES, text: 'BUILT. TESTED. RIDDEN.'},
];

const CaptionBar: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end'}}>
			<div
				style={{
					width: '100%',
					padding: '140px 70px 160px',
					background: 'linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 100%)',
					opacity: in_,
					transform: `translateY(${(1 - in_) * 22}px)`,
				}}
			>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 52,
						color: CREAM,
						textAlign: 'center',
						letterSpacing: 1,
						textShadow: '0 4px 18px rgba(0,0,0,0.6)',
					}}
				>
					{text}
				</div>
				<div style={{width: 70, height: 5, borderRadius: 3, background: GOLD, margin: '20px auto 0'}} />
			</div>
		</AbsoluteFill>
	);
};

const CtaCard: React.FC<{brand: string; tagline: string; ctaLine: string}> = ({brand, tagline, ctaLine}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brandIn = spring({frame, fps, from: 0.9, to: 1, config: {damping: 14, mass: 0.7}});
	const brandOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
	const taglineIn = spring({frame: frame - 10, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const pillIn = spring({frame: frame - 20, fps, from: 0, to: 1, config: {damping: 14, mass: 0.6}});

	return (
		<AbsoluteFill style={{backgroundColor: BLACK, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					position: 'absolute',
					width: 620,
					height: 620,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${GOLD}22 0%, transparent 70%)`,
				}}
			/>
			<div style={{opacity: brandOpacity, transform: `scale(${brandIn})`, textAlign: 'center'}}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontStyle: 'italic', fontSize: 58, color: CREAM, letterSpacing: 0.5}}>
					{brand.split(' ').map((word, i) => (
						<span key={i} style={{color: /^\d+$/.test(word) ? GOLD : CREAM}}>
							{word}{i < brand.split(' ').length - 1 ? ' ' : ''}
						</span>
					))}
				</div>
			</div>
			<div
				style={{
					marginTop: 22,
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 20,
					letterSpacing: 3,
					color: GOLD,
					opacity: taglineIn,
					transform: `translateY(${(1 - taglineIn) * 12}px)`,
				}}
			>
				{tagline}
			</div>
			<div
				style={{
					marginTop: 46,
					padding: '16px 40px',
					borderRadius: 999,
					border: `2px solid ${GOLD}`,
					opacity: pillIn,
					transform: `translateY(${(1 - pillIn) * 14}px)`,
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: CREAM, letterSpacing: 1}}>{ctaLine}</span>
			</div>
		</AbsoluteFill>
	);
};

export const Projekt46BikesAd: React.FC<Projekt46Props> = ({videoSrc, brand, tagline, ctaLine}) => {
	return (
		<AbsoluteFill style={{backgroundColor: BLACK}}>
			<Sequence durationInFrames={VIDEO_FRAMES}>
				<AbsoluteFill>
					<OffthreadVideo src={videoSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					{CAPTION_BEATS.map((beat, i) => (
						<Sequence key={i} from={beat.from} durationInFrames={beat.to - beat.from}>
							<CaptionBar text={beat.text} />
						</Sequence>
					))}
				</AbsoluteFill>
			</Sequence>
			<Sequence from={VIDEO_FRAMES} durationInFrames={CTA_FRAMES}>
				<CtaCard brand={brand} tagline={tagline} ctaLine={ctaLine} />
			</Sequence>
		</AbsoluteFill>
	);
};

export const calculateProjekt46Metadata = () => {
	return {durationInFrames: VIDEO_FRAMES + CTA_FRAMES};
};
