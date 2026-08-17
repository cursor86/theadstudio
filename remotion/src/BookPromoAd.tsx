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
	summarySlides: z.array(z.object({title: z.string(), items: z.array(z.string())})),
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

const HOOK_SECONDS = 3.8;
const COVER_SECONDS = 4.2;
const INSIDE_SECONDS = 3.2;
const SUMMARY_SECONDS = 3.4;
const AUDIENCE_SECONDS = 2.8;
const CTA_SECONDS = 3.8;
const TRANSITION_SECONDS = 0.4;

// Literary, book-page style opener rather than a blunt question - a large
// decorative quote mark, a small eyebrow label, and the book's own real
// opening line set in serif italic, easing in like a page settling into view.
const HookBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const markIn = spring({frame, fps, from: 0, to: 1, config: {damping: 18, mass: 1}});
	const eyebrowIn = spring({frame: frame - 8, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const textIn = spring({frame: frame - 16, fps, from: 0, to: 1, config: {damping: 16, mass: 0.9}});
	const rule = interpolate(frame, [26, 44], [0, 90], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					position: 'absolute',
					top: 210,
					fontFamily: SERIF,
					fontSize: 160,
					color: TEAL,
					opacity: markIn * 0.22,
					transform: `translateY(${(1 - markIn) * -16}px)`,
					lineHeight: 1,
				}}
			>
				&ldquo;
			</div>
			<div style={{textAlign: 'center', padding: '0 100px'}}>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 14,
						letterSpacing: 4,
						color: CORAL,
						marginBottom: 22,
						opacity: eyebrowIn,
						transform: `translateY(${(1 - eyebrowIn) * -10}px)`,
					}}
				>
					A NOTE BEFORE YOU START
				</div>
				<div
					style={{
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontWeight: 500,
						fontSize: 40,
						color: CREAM,
						lineHeight: 1.45,
						opacity: textIn,
						transform: `translateY(${(1 - textIn) * 14}px)`,
					}}
				>
					{text}
				</div>
				<div style={{width: rule, height: 1, background: `${CREAM}55`, margin: '30px auto 0'}} />
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
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP}}>
			{/* Blurred, dimmed copy of the same image fills the frame so the
			readable version can be shown "zoomed out" (smaller, fully framed)
			without empty bars or any cropping. */}
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(34px) brightness(0.4)', transform: 'scale(1.25)'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						width: 620,
						height: 890,
						transform: `scale(${pop})`,
						borderRadius: 6,
						overflow: 'hidden',
						boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
						border: '1px solid rgba(255,255,255,0.1)',
					}}
				>
					<Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain', backgroundColor: NAVY_DEEP}} />
				</div>
			</AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					bottom: 110,
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

// Dense list pages (e.g. "150+ product ideas") are never legible as a
// screenshot at video scale - extracted into clean pill-bullet summary
// slides instead, generously paced so each line is actually readable.
const SummaryBeat: React.FC<{title: string; items: string[]}> = ({title, items}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const titleIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{width: '100%', padding: '0 70px'}}>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 34,
						color: TEAL,
						textAlign: 'center',
						marginBottom: 40,
						opacity: titleIn,
						transform: `translateY(${(1 - titleIn) * -12}px)`,
					}}
				>
					{title}
				</div>
				{items.map((item, i) => {
					const delay = 14 + i * 11;
					const pop = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
					return (
						<div
							key={i}
							style={{
								opacity: pop,
								transform: `translateX(${(1 - pop) * -24}px)`,
								background: 'rgba(255,255,255,0.06)',
								border: `1px solid ${CORAL}44`,
								borderRadius: 999,
								padding: '16px 30px',
								marginBottom: 16,
								textAlign: 'center',
							}}
						>
							<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: CREAM}}>{item}</span>
						</div>
					);
				})}
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
	summarySlides,
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

				{summarySlides.map((slide, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={s2f(SUMMARY_SECONDS)}>
							<SummaryBeat title={slide.title} items={slide.items} />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition presentation={fade()} timing={timing} />
					</React.Fragment>
				))}

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
	const summaryCount = props.summarySlides?.length ?? 2;
	const segments = 3 + insideCount + summaryCount; // hook + cover + inside* + summary* + audience + cta
	const total =
		s2f(HOOK_SECONDS) +
		s2f(COVER_SECONDS) +
		insideCount * s2f(INSIDE_SECONDS) +
		summaryCount * s2f(SUMMARY_SECONDS) +
		s2f(AUDIENCE_SECONDS) +
		s2f(CTA_SECONDS) -
		transitionFrames * (segments - 1);
	return {durationInFrames: total};
};
