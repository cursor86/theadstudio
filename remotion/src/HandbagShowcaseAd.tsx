import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Bespoke beat-by-beat sequence, built exactly to a client-dictated shot
// list: a slow, calm "what you provide us" collage of raw candid photos,
// then a fast zoom-out reveal into "our ad" (the polished Bright Bloom
// marketing graphics), alternating text beats and product shots, closing
// on a shop shot + tagline and a theadzstudio CTA card.
export const handbagShowcaseSchema = z.object({
	provideImages: z.array(z.string()),
	provideHeadline: z.string(),
	adImage: z.string(),
	adRevealText: z.string(),
	exclusiveText: z.string(),
	exclusiveImage: z.string(),
	fabricsText: z.string(),
	fabricsImage: z.string(),
	finalImage: z.string(),
	finalTagline: z.string(),
	brandName: z.string(),
	ctaLine: z.string(),
	contact: z.string(),
	logoPath: z.string(),
	music: z.string().optional(),
});

export type HandbagShowcaseProps = z.infer<typeof handbagShowcaseSchema>;

const FPS = 30;
const NAVY = '#1F3A5F';
const NAVY_DEEP = '#132538';
const CORAL = '#E8735A';
const CREAM = '#FBF3E7';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);

const PROVIDE_SECONDS = 4.2;
const AD_REVEAL_SECONDS = 4.2;
const EXCLUSIVE_TEXT_SECONDS = 2.2;
const EXCLUSIVE_IMAGE_SECONDS = 2.6;
const FABRICS_TEXT_SECONDS = 2.2;
const FABRICS_IMAGE_SECONDS = 3.0;
const FINAL_SECONDS = 3.6;
const CTA_SECONDS = 3.8;
const TRANSITION_SECONDS = 0.4;

// Slow, calm collage: four raw candid photos over a soft blurred backdrop,
// unhurried pop-ins to match the requested "slow pace, light tone."
const ProvideBeat: React.FC<{images: string[]; headline: string}> = ({images, headline}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const headlineIn = spring({frame: frame - 6, fps, from: 0, to: 1, config: {damping: 18, mass: 1}});
	const slots = [
		{x: 27, y: 40, rotate: -4},
		{x: 73, y: 38, rotate: 3},
		{x: 27, y: 66, rotate: 3},
		{x: 73, y: 66, rotate: -3},
	];

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP}}>
			<AbsoluteFill style={{overflow: 'hidden', opacity: 0.35}}>
				<Img src={images[0]} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(28px) brightness(0.55)', transform: 'scale(1.2)'}} />
			</AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					top: 90,
					left: 0,
					right: 0,
					textAlign: 'center',
					opacity: headlineIn,
					transform: `translateY(${(1 - headlineIn) * 16}px)`,
				}}
			>
				<span
					style={{
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 40,
						letterSpacing: 1,
						color: CREAM,
						textShadow: '0 2px 10px rgba(0,0,0,0.5)',
						padding: '0 60px',
						display: 'inline-block',
					}}
				>
					{headline}
				</span>
			</div>
			{images.slice(0, 4).map((src, i) => {
				const delay = 22 + i * 14;
				const pop = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 16, mass: 0.9}});
				const s = slots[i];
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${s.x}%`,
							top: `${s.y}%`,
							width: 300,
							height: 220,
							transform: `translate(-50%, -50%) rotate(${s.rotate}deg) scale(${pop})`,
							opacity: pop,
							borderRadius: 16,
							overflow: 'hidden',
							boxShadow: '0 14px 32px rgba(0,0,0,0.45)',
							border: '3px solid rgba(255,255,255,0.12)',
						}}
					>
						<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

// Fast zoom-out: starts tight, pulls back to reveal the full graphic - the
// "zoom out narration" moment introducing "our ad."
const AdRevealBeat: React.FC<{src: string; text: string; durationInFrames: number}> = ({src, text, durationInFrames}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const scale = interpolate(frame, [0, 26], [1.55, 1.0], {extrapolateRight: 'clamp'});
	const textIn = spring({frame, fps, from: 0, to: 1, config: {damping: 10, mass: 0.4, stiffness: 260}});
	const textOut = interpolate(frame, [26, 36], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const flash = interpolate(frame, [0, 4, 14], [0.9, 0, 0], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: '#FBEFE9'}}>
			<Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${scale})`}} />
			<AbsoluteFill style={{background: 'white', opacity: flash}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: Math.min(textIn, textOut)}}>
				<span
					style={{
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 56,
						color: NAVY,
						background: 'rgba(255,255,255,0.85)',
						padding: '14px 32px',
						borderRadius: 20,
						transform: `scale(${0.85 + textIn * 0.15})`,
					}}
				>
					{text}
				</span>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const TextBeat: React.FC<{text: string; bg: string}> = ({text, bg}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.7, to: 1, config: {damping: 11, mass: 0.5, stiffness: 240}});
	return (
		<AbsoluteFill style={{background: bg, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 50,
					color: CREAM,
					textAlign: 'center',
					padding: '0 80px',
					transform: `scale(${pop})`,
					lineHeight: 1.3,
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

const ProductBeat: React.FC<{
	src: string;
	durationInFrames: number;
	posX?: number;
	posY?: number;
	zoomFrom?: number;
	zoomTo?: number;
}> = ({src, durationInFrames, posX = 50, posY = 45, zoomFrom = 1.12, zoomTo = 1.28}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: `${posX}% ${posY}%`,
					transform: `scale(${scale})`,
				}}
			/>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 25%, transparent 80%, rgba(0,0,0,0.3) 100%)'}} />
		</AbsoluteFill>
	);
};

const FinalMessageBeat: React.FC<{src: string; text: string}> = ({src, text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const textIn = spring({frame: frame - 8, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill>
				<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.72) 0%, transparent 42%)'}} />
			<div
				style={{
					position: 'absolute',
					left: 48,
					right: 48,
					bottom: 130,
					textAlign: 'center',
					opacity: textIn,
					transform: `translateY(${(1 - textIn) * 16}px)`,
				}}
			>
				<span
					style={{
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 40,
						color: CREAM,
						textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 24px rgba(0,0,0,0.35)',
					}}
				>
					{text}
				</span>
			</div>
		</AbsoluteFill>
	);
};

const CtaLogoBeat: React.FC<{brandName: string; ctaLine: string; contact: string; logoPath: string}> = ({brandName, ctaLine, contact, logoPath}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const logoIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.8}});
	const lineIn = spring({frame: frame - 12, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const pillIn = spring({frame: frame - 26, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const breathe = 1 + Math.sin(frame / 28) * 0.02;

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					position: 'absolute',
					width: 460,
					height: 460,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${CORAL}22 0%, transparent 70%)`,
					transform: `scale(${breathe})`,
				}}
			/>
			{logoPath ? (
				<div
					style={{
						padding: 16,
						borderRadius: 18,
						background: 'white',
						boxShadow: '0 16px 38px rgba(0,0,0,0.35)',
						opacity: logoIn,
						transform: `translateY(${(1 - logoIn) * 18}px)`,
						marginBottom: 20,
					}}
				>
					<Img src={logoPath} style={{width: 240, objectFit: 'contain', display: 'block'}} />
				</div>
			) : (
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 46, color: CREAM, opacity: logoIn}}>{brandName}</div>
			)}
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 26,
					color: CREAM,
					textAlign: 'center',
					padding: '0 90px',
					opacity: lineIn,
					transform: `translateY(${(1 - lineIn) * 16}px)`,
				}}
			>
				{ctaLine}
			</div>
			<div
				style={{
					marginTop: 30,
					padding: '15px 32px',
					borderRadius: 999,
					background: 'rgba(255,255,255,0.08)',
					border: `1px solid ${CORAL}66`,
					opacity: pillIn,
					transform: `translateY(${(1 - pillIn) * 16}px)`,
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, color: CREAM}}>{contact}</span>
			</div>
		</AbsoluteFill>
	);
};

export const HandbagShowcaseAd: React.FC<HandbagShowcaseProps> = ({
	provideImages,
	provideHeadline,
	adImage,
	adRevealText,
	exclusiveText,
	exclusiveImage,
	fabricsText,
	fabricsImage,
	finalImage,
	finalTagline,
	brandName,
	ctaLine,
	contact,
	logoPath,
	music,
}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const timing = linearTiming({durationInFrames: transitionFrames});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(PROVIDE_SECONDS)}>
					<ProvideBeat images={provideImages} headline={provideHeadline} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(AD_REVEAL_SECONDS)}>
					<AdRevealBeat src={adImage} text={adRevealText} durationInFrames={s2f(AD_REVEAL_SECONDS)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(EXCLUSIVE_TEXT_SECONDS)}>
					<TextBeat text={exclusiveText} bg={NAVY} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(EXCLUSIVE_IMAGE_SECONDS)}>
					<ProductBeat
						src={exclusiveImage}
						durationInFrames={s2f(EXCLUSIVE_IMAGE_SECONDS)}
						posX={35}
						posY={50}
						zoomFrom={1.65}
						zoomTo={1.8}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(FABRICS_TEXT_SECONDS)}>
					<TextBeat text={fabricsText} bg={CORAL} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(FABRICS_IMAGE_SECONDS)}>
					<ProductBeat src={fabricsImage} durationInFrames={s2f(FABRICS_IMAGE_SECONDS)} posX={50} posY={40} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(FINAL_SECONDS)}>
					<FinalMessageBeat src={finalImage} text={finalTagline} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(CTA_SECONDS)}>
					<CtaLogoBeat brandName={brandName} ctaLine={ctaLine} contact={contact} logoPath={logoPath} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.5} /> : null}
		</AbsoluteFill>
	);
};

export const calculateHandbagShowcaseMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const beats = [
		PROVIDE_SECONDS,
		AD_REVEAL_SECONDS,
		EXCLUSIVE_TEXT_SECONDS,
		EXCLUSIVE_IMAGE_SECONDS,
		FABRICS_TEXT_SECONDS,
		FABRICS_IMAGE_SECONDS,
		FINAL_SECONDS,
		CTA_SECONDS,
	];
	const total = beats.reduce((sum, b) => sum + s2f(b), 0) - transitionFrames * (beats.length - 1);
	return {durationInFrames: total};
};
