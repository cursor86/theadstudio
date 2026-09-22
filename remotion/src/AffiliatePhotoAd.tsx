import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Photo-driven variant of AffiliateMotionAd: same two-beat 10s shape and
// visual system, but the hook beat shows the real Amazon listing photo
// (Ken Burns pan/zoom) instead of a line icon, and the CTA beat shows a
// small rounded crop of that same photo for brand recall.
export const affiliatePhotoSchema = z.object({
	hookLine: z.string(),
	benefitLine: z.string(),
	brandLine: z.string(),
	subLine: z.string(),
	cta: z.string(),
	link: z.string(),
	productImage: z.string(),
	music: z.string().optional(),
});

export type AffiliatePhotoProps = z.infer<typeof affiliatePhotoSchema>;

const FPS = 30;
const CREAM = '#FBF7F0';
const INK = '#1F1B16';
const ORANGE = '#F2701C';
const ORANGE_LIGHT = '#FFA35C';

const s2f = (s: number) => Math.round(s * FPS);

const HOOK_SECONDS = 5.2;
const CTA_SECONDS = 5.2;
const TRANSITION_SECONDS = 0.4;

const StarIcon: React.FC<{size?: number; stroke?: string}> = ({size = 70, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path
			d="M50 8L61 37L92 39L67 58L76 89L50 71L24 89L33 58L8 39L39 37Z"
			stroke={stroke}
			strokeWidth="5"
			strokeLinejoin="round"
		/>
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

const HookBeat: React.FC<{hookLine: string; benefitLine: string; productImage: string}> = ({
	hookLine,
	benefitLine,
	productImage,
}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const words = hookLine.split(' ');
	const benefitIn = spring({frame: frame - 34, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const zoom = interpolate(frame, [0, durationInFrames], [1.02, 1.14], {extrapolateRight: 'clamp'});
	const panY = interpolate(frame, [0, durationInFrames], [0, -14], {extrapolateRight: 'clamp'});
	const bgZoom = interpolate(frame, [0, durationInFrames], [1.15, 1.3], {extrapolateRight: 'clamp'});

	const PHOTO_HEIGHT = '66%';

	return (
		<AbsoluteFill style={{backgroundColor: CREAM}}>
			<AbsoluteFill style={{top: 0, height: PHOTO_HEIGHT, overflow: 'hidden'}}>
				<AbsoluteFill style={{background: `linear-gradient(135deg, ${ORANGE_LIGHT} 0%, ${ORANGE} 55%, #C24E0E 100%)`}} />
				<AbsoluteFill>
					<Img
						src={productImage}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							filter: 'blur(36px) saturate(1.5)',
							opacity: 0.55,
							mixBlendMode: 'soft-light',
							transform: `scale(${bgZoom})`,
						}}
					/>
				</AbsoluteFill>
				<AbsoluteFill
					style={{
						background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 62%)',
					}}
				/>
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
					<div
						style={{
							width: '78%',
							height: '78%',
							borderRadius: 32,
							backgroundColor: CREAM,
							boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
						}}
					/>
				</AbsoluteFill>
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
					<Img
						src={productImage}
						style={{
							width: '70%',
							height: '70%',
							objectFit: 'contain',
							filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.16))',
							transform: `scale(${zoom}) translateY(${panY}px)`,
						}}
					/>
				</AbsoluteFill>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						height: '16%',
						background: `linear-gradient(to bottom, transparent, ${CREAM})`,
					}}
				/>
			</AbsoluteFill>
			<Grain />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90}}>
				<div style={{width: 940, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
					<div
						style={{
							fontFamily: 'Arial, sans-serif',
							fontWeight: 800,
							fontSize: 56,
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
					<div style={{width: 70, height: 4, background: ORANGE, borderRadius: 2, opacity: benefitIn}} />
					<div
						style={{
							fontFamily: 'Arial, sans-serif',
							fontWeight: 600,
							fontSize: 30,
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
		</AbsoluteFill>
	);
};

const CtaBeat: React.FC<{brandLine: string; subLine: string; cta: string; link: string; productImage: string}> = ({
	brandLine,
	subLine,
	cta,
	link,
	productImage,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brandIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const subIn = spring({frame: frame - 8, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const ctaIn = spring({frame: frame - 24, fps, from: 0.85, to: 1, config: {damping: 12, mass: 0.7}});
	const ctaOpacity = interpolate(frame, [24, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pulse = 1 + Math.sin(frame / 9) * 0.025;
	const linkIn = spring({frame: frame - 40, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const photoIn = spring({frame, fps, from: 0, to: 1, config: {damping: 13, mass: 0.6}});

	return (
		<AbsoluteFill style={{backgroundColor: INK, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<div
				style={{
					width: 170,
					height: 170,
					borderRadius: 28,
					background: CREAM,
					overflow: 'hidden',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: 30,
					opacity: photoIn,
					transform: `scale(${photoIn})`,
					boxShadow: `0 0 0 3px ${ORANGE}`,
				}}
			>
				<Img src={productImage} style={{width: '100%', height: '100%', objectFit: 'contain', padding: 12}} />
			</div>
			<div
				style={{
					fontFamily: 'Arial, sans-serif',
					fontWeight: 800,
					fontSize: 44,
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
					marginTop: 16,
					fontFamily: 'Arial, sans-serif',
					fontWeight: 600,
					fontSize: 25,
					letterSpacing: 1,
					color: ORANGE_LIGHT,
					textAlign: 'center',
					padding: '0 70px',
					opacity: subIn,
					transform: `translateY(${(1 - subIn) * 10}px)`,
				}}
			>
				{subLine}
			</div>
			<div
				style={{
					marginTop: 44,
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
					marginTop: 24,
					fontFamily: 'Arial, sans-serif',
					fontWeight: 600,
					fontSize: 24,
					color: `${CREAM}99`,
					opacity: linkIn,
					display: 'flex',
					alignItems: 'center',
					gap: 10,
				}}
			>
				<StarIcon size={20} stroke={`${CREAM}99`} />
				{link}
			</div>
		</AbsoluteFill>
	);
};

export const AffiliatePhotoAd: React.FC<AffiliatePhotoProps> = ({
	hookLine,
	benefitLine,
	brandLine,
	subLine,
	cta,
	link,
	productImage,
	music,
}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});

	return (
		<AbsoluteFill style={{backgroundColor: INK}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(HOOK_SECONDS)}>
					<HookBeat hookLine={hookLine} benefitLine={benefitLine} productImage={productImage} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />
				<TransitionSeries.Sequence durationInFrames={s2f(CTA_SECONDS)}>
					<CtaBeat brandLine={brandLine} subLine={subLine} cta={cta} link={link} productImage={productImage} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.55} /> : null}
		</AbsoluteFill>
	);
};

export const calculateAffiliatePhotoMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const total = s2f(HOOK_SECONDS) + s2f(CTA_SECONDS) - transitionFrames;
	return {durationInFrames: total};
};
