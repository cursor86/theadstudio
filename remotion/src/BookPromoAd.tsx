import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Nonfiction/business-guide book promo, built to genre convention: hook ->
// cover reveal -> quick "what's inside" page flip-through -> bonus callout
// -> audience callout -> CTA. Palette pulled from the real cover (dark
// charcoal-navy, coral-red eyebrow accent, teal highlight).
export const bookPromoSchema = z.object({
	hookLine: z.string(),
	coverImage: z.string(),
	insideImages: z.array(z.string()),
	insideCaptions: z.array(z.string()),
	bonusImage: z.string(),
	bonusLine: z.string(),
	audienceLine: z.string(),
	ctaLine: z.string(),
	shopLine: z.string(),
	music: z.string().optional(),
});

export type BookPromoProps = z.infer<typeof bookPromoSchema>;

const FPS = 30;
const NAVY_DEEP = '#12161E';
const NAVY = '#1B2530';
const CORAL = '#D9534F';
const TEAL = '#3FBFAE';
const CREAM = '#F5F1E8';
const SANS = '"Arial", "Helvetica Neue", sans-serif';
const SERIF = '"Georgia", "Times New Roman", serif';

const s2f = (s: number) => Math.round(s * FPS);

const HOOK_SECONDS = 2.5;
const COVER_SECONDS = 3.6;
const INSIDE_SECONDS = 1.5;
const BONUS_SECONDS = 2.4;
const AUDIENCE_SECONDS = 2.4;
const CTA_SECONDS = 3.4;
const TRANSITION_SECONDS = 0.35;

const HookBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.7, to: 1, config: {damping: 12, mass: 0.6, stiffness: 220}});
	const rule = interpolate(frame, [10, 28], [0, 120], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{textAlign: 'center', padding: '0 80px', transform: `scale(${pop})`}}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: CREAM, lineHeight: 1.25}}>{text}</div>
				<div style={{width: rule, height: 3, background: CORAL, margin: '26px auto 0'}} />
			</div>
		</AbsoluteFill>
	);
};

const CoverBeat: React.FC<{src: string; durationInFrames: number}> = ({src, durationInFrames}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.85, to: 1, config: {damping: 14, mass: 0.8}});
	const tilt = Math.sin(frame / 55) * 3;
	const sweep = interpolate(frame, [0, durationInFrames], [-40, 140], {extrapolateRight: 'clamp'});
	const ribbonIn = spring({frame: frame - 14, fps, from: 0, to: 1, config: {damping: 14, mass: 0.7}});

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					position: 'relative',
					width: 560,
					height: 792,
					transform: `scale(${pop}) rotateY(${tilt}deg)`,
					borderRadius: 8,
					overflow: 'hidden',
					boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
				}}
			>
				<Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: `${sweep}%`,
						width: '30%',
						height: '100%',
						background: 'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
						transform: 'rotate(8deg)',
					}}
				/>
			</div>
			<div
				style={{
					position: 'absolute',
					top: 130,
					right: 60,
					padding: '10px 22px',
					borderRadius: 999,
					background: CORAL,
					opacity: ribbonIn,
					transform: `translateY(${(1 - ribbonIn) * -12}px) rotate(4deg)`,
					boxShadow: '0 10px 24px rgba(217,83,79,0.4)',
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 18, color: CREAM, letterSpacing: 1}}>NEW RELEASE</span>
			</div>
		</AbsoluteFill>
	);
};

const InsideBeat: React.FC<{src: string; caption: string}> = ({src, caption}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.92, to: 1, config: {damping: 16, mass: 0.6}});
	const capIn = spring({frame: frame - 6, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					width: 780,
					height: 1120,
					transform: `scale(${pop})`,
					borderRadius: 6,
					overflow: 'hidden',
					boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
					border: '1px solid rgba(255,255,255,0.08)',
				}}
			>
				<Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 100,
					left: 0,
					right: 0,
					textAlign: 'center',
					opacity: capIn,
					transform: `translateY(${(1 - capIn) * 14}px)`,
				}}
			>
				<span
					style={{
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 28,
						color: CREAM,
						background: `${NAVY_DEEP}cc`,
						padding: '10px 24px',
						borderRadius: 12,
					}}
				>
					{caption}
				</span>
			</div>
		</AbsoluteFill>
	);
};

const BonusBeat: React.FC<{src: string; text: string}> = ({src, text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.9, to: 1, config: {damping: 15, mass: 0.7}});
	const tagIn = spring({frame: frame - 8, fps, from: 0, to: 1, config: {damping: 12, mass: 0.5, stiffness: 240}});
	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					width: 780,
					height: 1120,
					transform: `scale(${pop})`,
					borderRadius: 6,
					overflow: 'hidden',
					boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
					border: `2px solid ${TEAL}55`,
				}}
			>
				<Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
			</div>
			<div
				style={{
					position: 'absolute',
					top: 130,
					left: 0,
					right: 0,
					textAlign: 'center',
					opacity: tagIn,
					transform: `scale(${0.85 + tagIn * 0.15})`,
				}}
			>
				<span
					style={{
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 34,
						color: NAVY_DEEP,
						background: TEAL,
						padding: '12px 30px',
						borderRadius: 999,
						boxShadow: `0 14px 30px ${TEAL}55`,
					}}
				>
					{text}
				</span>
			</div>
		</AbsoluteFill>
	);
};

const AudienceBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.75, to: 1, config: {damping: 12, mass: 0.6, stiffness: 220}});
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{textAlign: 'center', padding: '0 80px', transform: `scale(${pop})`}}>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 15, color: TEAL, letterSpacing: 3, marginBottom: 18}}>WHO IT&apos;S FOR</div>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: CREAM, lineHeight: 1.35}}>{text}</div>
			</div>
		</AbsoluteFill>
	);
};

const CtaBeat: React.FC<{coverImage: string; ctaLine: string; shopLine: string}> = ({coverImage, ctaLine, shopLine}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const coverIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.8}});
	const lineIn = spring({frame: frame - 12, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const pillIn = spring({frame: frame - 24, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const breathe = 1 + Math.sin(frame / 28) * 0.02;

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
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
			<div
				style={{
					width: 240,
					height: 340,
					borderRadius: 6,
					overflow: 'hidden',
					opacity: coverIn,
					transform: `translateY(${(1 - coverIn) * 20}px)`,
					boxShadow: '0 24px 50px rgba(0,0,0,0.55)',
					marginBottom: 26,
				}}
			>
				<Img src={coverImage} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
			</div>
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 30,
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
					marginTop: 28,
					padding: '15px 32px',
					borderRadius: 999,
					background: CORAL,
					opacity: pillIn,
					transform: `translateY(${(1 - pillIn) * 16}px)`,
					boxShadow: '0 14px 30px rgba(217,83,79,0.4)',
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 21, color: CREAM}}>{shopLine}</span>
			</div>
		</AbsoluteFill>
	);
};

export const BookPromoAd: React.FC<BookPromoProps> = ({
	hookLine,
	coverImage,
	insideImages,
	insideCaptions,
	bonusImage,
	bonusLine,
	audienceLine,
	ctaLine,
	shopLine,
	music,
}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const timing = linearTiming({durationInFrames: transitionFrames});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(HOOK_SECONDS)}>
					<HookBeat text={hookLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(COVER_SECONDS)}>
					<CoverBeat src={coverImage} durationInFrames={s2f(COVER_SECONDS)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				{insideImages.map((src, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={s2f(INSIDE_SECONDS)}>
							<InsideBeat src={src} caption={insideCaptions[i] ?? ''} />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition presentation={fade()} timing={timing} />
					</React.Fragment>
				))}

				<TransitionSeries.Sequence durationInFrames={s2f(BONUS_SECONDS)}>
					<BonusBeat src={bonusImage} text={bonusLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(AUDIENCE_SECONDS)}>
					<AudienceBeat text={audienceLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(CTA_SECONDS)}>
					<CtaBeat coverImage={coverImage} ctaLine={ctaLine} shopLine={shopLine} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.5} /> : null}
		</AbsoluteFill>
	);
};

export const calculateBookPromoMetadata = ({props}: {props: BookPromoProps}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const insideCount = props.insideImages?.length ?? 3;
	const segments = 4 + insideCount; // hook + cover + inside* + bonus + audience + cta
	const total =
		s2f(HOOK_SECONDS) + s2f(COVER_SECONDS) + insideCount * s2f(INSIDE_SECONDS) + s2f(BONUS_SECONDS) + s2f(AUDIENCE_SECONDS) + s2f(CTA_SECONDS) -
		transitionFrames * (segments - 1);
	return {durationInFrames: total};
};
