import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Series, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// 12s punchy "quick cut" teaser reel for Bright Bloom Suffolk (quilted
// block-print tote bags), built exactly to a 4-beat creative brief with real
// product photos. Hard cuts (not crossfades) to match the fast, trending-audio
// TikTok/Reels pacing the brief calls for.
export const brightBloomTeaserSchema = z.object({
	marketImage: z.string(),
	toteCloseupImage: z.string(),
	collectionImage: z.string(),
	lifestyleImage: z.string(),
	hookText: z.string(),
	toteText: z.string(),
	collectionText: z.string(),
	ctaText: z.string(),
	music: z.string().optional(),
});

export type BrightBloomTeaserProps = z.infer<typeof brightBloomTeaserSchema>;

const FPS = 30;
const NAVY = '#1F3A5F';
const CORAL = '#E8735A';
const CREAM = '#FBF3E7';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);

const HOOK_SECONDS = 2;
const TOTE_SECONDS = 3;
const COLLECTION_SECONDS = 3;
const CTA_SECONDS = 4;

const Caption: React.FC<{text: string; position: 'top' | 'center' | 'bottom'; delay?: number}> = ({text, position, delay = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 11, mass: 0.5, stiffness: 220}});
	const posStyle: React.CSSProperties =
		position === 'top' ? {top: 130} : position === 'center' ? {top: '50%', transform: 'translateY(-50%)'} : {bottom: 130};

	return (
		<div
			style={{
				position: 'absolute',
				left: 48,
				right: 48,
				...posStyle,
				textAlign: 'center',
				opacity: pop,
				transform: `${position === 'center' ? 'translateY(-50%) ' : ''}scale(${0.85 + pop * 0.15})`,
			}}
		>
			<span
				style={{
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 40,
					lineHeight: 1.25,
					color: CREAM,
					textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 24px rgba(0,0,0,0.35)',
					background: `${NAVY}cc`,
					padding: '10px 22px',
					borderRadius: 18,
					boxDecorationBreak: 'clone',
					WebkitBoxDecorationBreak: 'clone',
				}}
			>
				{text}
			</span>
		</div>
	);
};

const PanBeat: React.FC<{src: string; durationInFrames: number; children?: React.ReactNode; fastPan?: boolean}> = ({
	src,
	durationInFrames,
	children,
	fastPan,
}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, durationInFrames], fastPan ? [1.25, 1.35] : [1.0, 1.12], {extrapolateRight: 'clamp'});
	const panX = interpolate(frame, [0, durationInFrames], fastPan ? [70, 30] : [50, 50], {extrapolateRight: 'clamp'});
	const panY = fastPan ? 45 : 50;

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<Img
					src={src}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: `${panX}% ${panY}%`,
						transform: `scale(${scale})`,
					}}
				/>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.35) 100%)'}} />
			{children}
		</AbsoluteFill>
	);
};

export const BrightBloomTeaserAd: React.FC<BrightBloomTeaserProps> = ({
	marketImage,
	toteCloseupImage,
	collectionImage,
	lifestyleImage,
	hookText,
	toteText,
	collectionText,
	ctaText,
	music,
}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<Series>
				<Series.Sequence durationInFrames={s2f(HOOK_SECONDS)}>
					<PanBeat src={marketImage} durationInFrames={s2f(HOOK_SECONDS)} fastPan>
						<Caption text={hookText} position="center" delay={2} />
					</PanBeat>
				</Series.Sequence>

				<Series.Sequence durationInFrames={s2f(TOTE_SECONDS)}>
					<PanBeat src={toteCloseupImage} durationInFrames={s2f(TOTE_SECONDS)}>
						<Caption text={toteText} position="bottom" delay={3} />
					</PanBeat>
				</Series.Sequence>

				<Series.Sequence durationInFrames={s2f(COLLECTION_SECONDS)}>
					<PanBeat src={collectionImage} durationInFrames={s2f(COLLECTION_SECONDS)}>
						<Caption text={collectionText} position="bottom" delay={3} />
					</PanBeat>
				</Series.Sequence>

				<Series.Sequence durationInFrames={s2f(CTA_SECONDS)}>
					<PanBeat src={lifestyleImage} durationInFrames={s2f(CTA_SECONDS)}>
						<Caption text={ctaText} position="bottom" delay={4} />
					</PanBeat>
				</Series.Sequence>
			</Series>
			{music ? <Audio src={music} volume={0.5} /> : null}
		</AbsoluteFill>
	);
};

export const calculateBrightBloomTeaserMetadata = () => {
	const total = s2f(HOOK_SECONDS) + s2f(TOTE_SECONDS) + s2f(COLLECTION_SECONDS) + s2f(CTA_SECONDS);
	return {durationInFrames: total};
};
