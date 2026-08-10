import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Case-study wrapper for theadzstudio's YouTube channel: a punchy, animated
// "how this client grew" intro (kinetic word-slam hook, before/after flash,
// then real animated growth charts/counters instead of text just claiming
// numbers) bracketing a trimmed clip of the original delivered ad, closing
// on a confidential outro. The trim points cut out the client's own
// branded intro card and branded CTA/watermark card entirely (rather than
// painting over baked-in text), so no client branding survives anywhere.
export const slimeCaseStudySchema = z.object({
	hookWords: z.array(z.string()),
	problemLine: z.string(),
	brandLine: z.string(),
	performanceLabel: z.string(),
	viewsTarget: z.number(),
	viewsLabel: z.string(),
	multiplierTarget: z.number(),
	multiplierLabel: z.string(),
	revealLine: z.string(),
	portfolioImages: z.array(z.object({src: z.string(), label: z.string()})),
	portfolioTitle: z.string(),
	outroLine1: z.string(),
	outroLine2: z.string(),
	contact: z.string(),
	logoPath: z.string().optional(),
	music: z.string().optional(),
});

export type SlimeCaseStudyProps = z.infer<typeof slimeCaseStudySchema>;

const FPS = 30;
const INK = '#1B0B2E';
const HOT_PINK = '#FF3E9D';
const PURPLE = '#7B2FF7';
const YELLOW = '#FFD93D';
const SKY = '#3EC6FF';
const GREEN = '#2ECC71';
const RED = '#FF3B3B';
const FUNKY_FONT = '"Arial Rounded MT Bold", "Arial Black", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);
const popIn = (frame: number, fps: number, delay = 0, config = {damping: 12, mass: 0.6, stiffness: 160}) =>
	spring({frame: frame - delay, fps, from: 0, to: 1, config});

const Dots: React.FC<{parallax?: number}> = ({parallax = 1}) => {
	const frame = useCurrentFrame();
	const dots = [
		{x: 8, y: 15, c: YELLOW},
		{x: 90, y: 10, c: HOT_PINK},
		{x: 6, y: 78, c: PURPLE},
		{x: 92, y: 72, c: SKY},
		{x: 50, y: 6, c: YELLOW},
		{x: 15, y: 92, c: HOT_PINK},
	];
	return (
		<>
			{dots.map((d, i) => {
				const bob = Math.sin(frame / 16 + i * 1.6) * 8 * parallax;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${d.x}%`,
							top: `${d.y}%`,
							width: 18,
							height: 18,
							borderRadius: '50%',
							background: d.c,
							transform: `translateY(${bob}px)`,
						}}
					/>
				);
			})}
		</>
	);
};

// --- Beat 1: kinetic word-slam hook - each word slams in and punches out
// instead of a whole sentence fading in together, for a much faster read.
const HookSlam: React.FC<{words: string[]; durationInFrames: number}> = ({words, durationInFrames}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const perWord = Math.floor(durationInFrames / words.length);
	const activeIndex = Math.min(words.length - 1, Math.floor(frame / perWord));
	const localFrame = frame - activeIndex * perWord;
	const slam = spring({frame: localFrame, fps, config: {damping: 8, mass: 0.5, stiffness: 260}});
	const scale = interpolate(slam, [0, 1], [1.6, 1]);
	const shake = interpolate(localFrame, [0, 3, 6], [0, -6, 0], {extrapolateRight: 'clamp'});
	const barWidth = interpolate(localFrame, [0, 8], [0, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					backgroundImage: `repeating-linear-gradient(115deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 60px)`,
				}}
			/>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div
					style={{
						transform: `scale(${scale}) translateX(${shake}px)`,
						opacity: interpolate(slam, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}),
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 108,
						letterSpacing: 2,
						textAlign: 'center',
					}}
				>
					{words[activeIndex]}
				</div>
				<div style={{width: barWidth, height: 10, background: HOT_PINK, borderRadius: 6, marginTop: 20}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- Beat 2: dull static "before" photo gets stamped and flashes into brand color - visual before/after instead of a text claim.
const ProblemFlash: React.FC<{line: string; durationInFrames: number}> = ({line, durationInFrames}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cardIn = popIn(frame, fps);
	const xStamp = popIn(frame, fps, 18, {damping: 9, mass: 0.7, stiffness: 230});
	const flash = interpolate(frame, [durationInFrames - 16, durationInFrames - 10, durationInFrames], [0, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const lineOpacity = interpolate(frame, [4, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<Dots parallax={0.6} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{position: 'relative', transform: `scale(${0.9 + cardIn * 0.1})`, opacity: cardIn}}>
					<div
						style={{
							width: 300,
							height: 300,
							background: '#C7C7CE',
							borderRadius: 16,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<span style={{fontSize: 120, filter: 'grayscale(1) brightness(0.7)'}}>🧴</span>
					</div>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transform: `scale(${xStamp}) rotate(-10deg)`,
							opacity: xStamp,
						}}
					>
						<span style={{fontSize: 190, color: RED, fontWeight: 900, textShadow: '0 0 24px rgba(255,59,59,0.7)'}}>✕</span>
					</div>
				</div>
				<div
					style={{
						opacity: lineOpacity,
						marginTop: 34,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 800,
						fontSize: 40,
						textAlign: 'center',
						padding: '0 90px',
					}}
				>
					{line}
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'white', opacity: flash}} />
		</AbsoluteFill>
	);
};

// --- Beat 3: brand burst out of the flash.
const BrandBurst: React.FC<{brand: string}> = ({brand}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps, 0, {damping: 10, mass: 0.6, stiffness: 200});
	const scale = interpolate(pop, [0, 1], [0.4, 1]);
	const glow = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill
			style={{background: `linear-gradient(150deg, ${PURPLE} 0%, ${HOT_PINK} 100%)`, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}}
		>
			<Dots />
			<div
				style={{
					transform: `scale(${scale})`,
					color: 'white',
					fontFamily: FUNKY_FONT,
					fontWeight: 900,
					fontSize: 76,
					textAlign: 'center',
					textShadow: `0 0 ${30 * glow}px rgba(255,255,255,0.8)`,
				}}
			>
				{brand}
			</div>
		</AbsoluteFill>
	);
};

// --- Beat 4: real animated growth chart + ticking view counter, instead of
// text just asserting a number.
const GROWTH_BARS = [30, 42, 38, 58, 70, 65, 88, 100];

const PerformanceBeat: React.FC<{label: string; viewsTarget: number; viewsLabel: string; durationInFrames: number}> = ({
	label,
	viewsTarget,
	viewsLabel,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const labelOpacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	const chartIn = popIn(frame, fps);

	const countProgress = interpolate(frame, [16, durationInFrames - 20], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: (t) => 1 - (1 - t) * (1 - t),
	});
	const count = Math.round(viewsTarget * countProgress);

	const chartWidth = 640;
	const chartHeight = 260;
	const gap = 14;
	const barW = (chartWidth - gap * (GROWTH_BARS.length - 1)) / GROWTH_BARS.length;
	const maxBar = Math.max(...GROWTH_BARS);

	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<Dots parallax={0.5} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div
					style={{
						opacity: labelOpacity,
						color: YELLOW,
						fontFamily: FUNKY_FONT,
						fontWeight: 800,
						fontSize: 34,
						textAlign: 'center',
						marginBottom: 26,
						padding: '0 80px',
					}}
				>
					{label}
				</div>

				<div
					style={{
						opacity: chartIn,
						width: chartWidth,
						height: chartHeight,
						display: 'flex',
						alignItems: 'flex-end',
						gap,
						background: 'rgba(255,255,255,0.06)',
						borderRadius: 16,
						padding: '18px 18px 0',
						border: '1px solid rgba(255,255,255,0.1)',
					}}
				>
					{GROWTH_BARS.map((v, i) => {
						const delay = i * 4;
						const grow = popIn(frame, fps, delay, {damping: 14, mass: 0.5, stiffness: 180});
						const h = (v / maxBar) * (chartHeight - 30);
						return (
							<div
								key={i}
								style={{
									width: barW,
									height: h * grow,
									background: `linear-gradient(180deg, ${GREEN} 0%, #1B8F4C 100%)`,
									borderRadius: 4,
								}}
							/>
						);
					})}
				</div>

				<div
					style={{
						marginTop: 34,
						display: 'flex',
						alignItems: 'baseline',
						gap: 14,
					}}
				>
					<span style={{color: 'white', fontFamily: FUNKY_FONT, fontWeight: 900, fontSize: 74, fontVariantNumeric: 'tabular-nums'}}>
						{count.toLocaleString()}+
					</span>
					<span style={{color: SKY, fontFamily: FUNKY_FONT, fontWeight: 800, fontSize: 30}}>{viewsLabel}</span>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- Beat 5: ticking sales multiplier.
const ConversionsBeat: React.FC<{multiplierTarget: number; multiplierLabel: string; durationInFrames: number}> = ({
	multiplierTarget,
	multiplierLabel,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const iconPop = popIn(frame, fps);
	const iconBounce = 1 + Math.abs(Math.sin(frame / 7)) * 0.12 * interpolate(frame, [20, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const countProgress = interpolate(frame, [10, durationInFrames - 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: (t) => 1 - (1 - t) * (1 - t),
	});
	const value = (multiplierTarget * countProgress).toFixed(1);
	const labelOpacity = interpolate(frame, [durationInFrames - 24, durationInFrames - 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{background: `linear-gradient(150deg, ${SKY} 0%, ${PURPLE} 100%)`, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}}
		>
			<Dots />
			<div style={{transform: `scale(${popIn(frame, fps)})`, textAlign: 'center'}}>
				<div style={{transform: `scale(${iconBounce})`, fontSize: 70, marginBottom: 10}}>🛒</div>
				<div style={{color: 'white', fontFamily: FUNKY_FONT, fontWeight: 900, fontSize: 108, fontVariantNumeric: 'tabular-nums'}}>{value}x</div>
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: '30%',
					opacity: labelOpacity,
					color: YELLOW,
					fontFamily: FUNKY_FONT,
					fontWeight: 800,
					fontSize: 32,
					textAlign: 'center',
					padding: '0 80px',
				}}
			>
				{multiplierLabel}
			</div>
		</AbsoluteFill>
	);
};

const RevealCard: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const scale = interpolate(pop, [0, 1], [0.7, 1]);
	const arrowBob = Math.sin(frame / 6) * 10;
	const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: `linear-gradient(150deg, ${PURPLE} 0%, ${HOT_PINK} 100%)`, overflow: 'hidden'}}>
			<Dots />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 80px'}}>
				<div
					style={{
						opacity,
						transform: `scale(${scale})`,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 58,
						lineHeight: 1.3,
						textAlign: 'center',
						textShadow: '0 4px 0 rgba(0,0,0,0.2)',
						marginBottom: 30,
					}}
				>
					{text}
				</div>
				<div style={{opacity, transform: `translateY(${arrowBob}px)`, fontSize: 56}}>👇</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- Portfolio beat: one still from each ad, scattered like a photo pile
// instead of a rigid grid - reads as "a body of real work" rather than a
// template slot filled in.
const PORTFOLIO_LAYOUT = [
	{x: 130, y: 260, rotate: -7, size: 300, delay: 0},
	{x: 610, y: 230, rotate: 5, size: 290, delay: 6},
	{x: 355, y: 430, rotate: -2, size: 340, delay: 12},
	{x: 120, y: 660, rotate: 4, size: 300, delay: 18},
	{x: 610, y: 660, rotate: -5, size: 300, delay: 24},
];

const PortfolioGrid: React.FC<{title: string; images: {src: string; label: string}[]}> = ({title, images}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const titleOpacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<Dots parallax={0.4} />
			<div
				style={{
					position: 'absolute',
					top: 60,
					left: 0,
					right: 0,
					textAlign: 'center',
					opacity: titleOpacity,
					color: 'white',
					fontFamily: FUNKY_FONT,
					fontWeight: 900,
					fontSize: 42,
					padding: '0 70px',
				}}
			>
				{title}
			</div>
			{images.slice(0, 5).map((img, i) => {
				const layout = PORTFOLIO_LAYOUT[i];
				const pop = popIn(frame, fps, layout.delay, {damping: 13, mass: 0.6, stiffness: 150});
				const scale = interpolate(pop, [0, 1], [0.5, 1]);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: layout.x,
							top: layout.y,
							width: layout.size,
							height: layout.size,
							transform: `scale(${scale}) rotate(${layout.rotate}deg)`,
							opacity: pop,
							background: 'white',
							padding: 10,
							borderRadius: 16,
							boxShadow: '0 16px 0 rgba(0,0,0,0.25)',
						}}
					>
						<div style={{width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden', position: 'relative'}}>
							<Img src={img.src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
							{img.label ? (
								<div
									style={{
										position: 'absolute',
										bottom: 0,
										left: 0,
										right: 0,
										background: 'rgba(0,0,0,0.55)',
										color: 'white',
										fontFamily: FUNKY_FONT,
										fontWeight: 700,
										fontSize: 15,
										textAlign: 'center',
										padding: '6px 4px',
									}}
								>
									{img.label}
								</div>
							) : null}
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

const OutroCard: React.FC<{line1: string; line2: string; contact: string; logoPath?: string}> = ({line1, line2, contact, logoPath}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const badgeScale = interpolate(pop, [0, 1], [0.6, 1]);
	const line2Opacity = interpolate(frame, [16, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ctaOpacity = interpolate(frame, [34, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ctaScale = spring({frame: frame - 34, fps, config: {damping: 11, mass: 0.6, stiffness: 170}});

	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<Dots />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 80px'}}>
				{logoPath ? (
					<div style={{opacity: pop, transform: `scale(${badgeScale})`, marginBottom: 26}}>
						<Img src={logoPath} style={{width: 200, objectFit: 'contain'}} />
					</div>
				) : null}
				<div
					style={{
						opacity: pop,
						transform: `scale(${badgeScale})`,
						background: YELLOW,
						color: INK,
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 30,
						padding: '12px 28px',
						borderRadius: 999,
						marginBottom: 24,
					}}
				>
					{line1}
				</div>
				<div
					style={{
						opacity: line2Opacity,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 800,
						fontSize: 42,
						lineHeight: 1.3,
						textAlign: 'center',
						marginBottom: 34,
					}}
				>
					{line2}
				</div>
				<div
					style={{
						opacity: ctaOpacity,
						transform: `scale(${ctaScale})`,
						background: `linear-gradient(135deg, ${SKY} 0%, ${PURPLE} 100%)`,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 800,
						fontSize: 28,
						padding: '18px 34px',
						borderRadius: 999,
					}}
				>
					{contact}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const HOOK_SECONDS = 2.4;
const PROBLEM_SECONDS = 2.4;
const BRAND_SECONDS = 1.3;
const PERFORMANCE_SECONDS = 4.2;
const CONVERSIONS_SECONDS = 2.6;
const REVEAL_SECONDS = 2.3;
const PORTFOLIO_SECONDS = 4.6;
const OUTRO_SECONDS = 4.5;
const TRANSITION_SECONDS = 0.3;

export const calculateSlimeCaseStudyMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const introTotalSeconds =
		HOOK_SECONDS + PROBLEM_SECONDS + BRAND_SECONDS + PERFORMANCE_SECONDS + CONVERSIONS_SECONDS + REVEAL_SECONDS + PORTFOLIO_SECONDS + OUTRO_SECONDS;
	const totalSegments = 8; // hook, problem, brand, performance, conversions, reveal, portfolio, outro
	const total = s2f(introTotalSeconds) - (totalSegments - 1) * transitionFrames;
	return {durationInFrames: total};
};

export const SlimeCaseStudyAd: React.FC<SlimeCaseStudyProps> = ({
	hookWords,
	problemLine,
	brandLine,
	performanceLabel,
	viewsTarget,
	viewsLabel,
	multiplierTarget,
	multiplierLabel,
	revealLine,
	portfolioImages,
	portfolioTitle,
	outroLine1,
	outroLine2,
	contact,
	logoPath,
	music,
}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const timing = linearTiming({durationInFrames: transitionFrames});
	const performanceFrames = s2f(PERFORMANCE_SECONDS);
	const conversionsFrames = s2f(CONVERSIONS_SECONDS);
	const hookFrames = s2f(HOOK_SECONDS);
	const problemFrames = s2f(PROBLEM_SECONDS);

	return (
		<>
			{music ? <Audio src={music} volume={0.55} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={hookFrames}>
					<HookSlam words={hookWords} durationInFrames={hookFrames} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={problemFrames}>
					<ProblemFlash line={problemLine} durationInFrames={problemFrames} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(BRAND_SECONDS)}>
					<BrandBurst brand={brandLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={performanceFrames}>
					<PerformanceBeat label={performanceLabel} viewsTarget={viewsTarget} viewsLabel={viewsLabel} durationInFrames={performanceFrames} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={conversionsFrames}>
					<ConversionsBeat multiplierTarget={multiplierTarget} multiplierLabel={multiplierLabel} durationInFrames={conversionsFrames} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(REVEAL_SECONDS)}>
					<RevealCard text={revealLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(PORTFOLIO_SECONDS)}>
					<PortfolioGrid title={portfolioTitle} images={portfolioImages} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(OUTRO_SECONDS)}>
					<OutroCard line1={outroLine1} line2={outroLine2} contact={contact} logoPath={logoPath} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
