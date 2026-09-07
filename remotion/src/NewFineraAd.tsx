import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {z} from 'zod';

// Premium fintech ad for a bookkeeping / Virtual CFO service: real
// finance photography (Ken-Burns'd) under a gold-on-navy motion-graphics
// dashboard, a before/after wipe, kinetic text, and a wordmark reveal
// with a shine sweep. No photorealistic actors were available, so the
// brief's "confident professional" and "relieved business owner" beats
// are carried by real money/device photography plus data visuals
// instead of fabricated human depictions.
export const newFineraSchema = z.object({
	brand: z.string(),
	tagline: z.string(),
	kpis: z.array(z.object({label: z.string(), value: z.string()})),
	painLine: z.string(),
	reliefLine: z.string(),
	valueLine: z.string(),
	services: z.array(z.object({title: z.string(), price: z.string(), items: z.array(z.string())})).optional(),
	freeToolsLine: z.string().optional(),
	cta: z.string(),
	contact: z.string().optional(),
	walletImage: z.string().optional(),
	deviceImage: z.string().optional(),
	music: z.string().optional(),
});

export type NewFineraProps = z.infer<typeof newFineraSchema>;

const FPS = 30;
const NAVY_DEEP = '#090C13';
const NAVY = '#141A28';
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F1D888';
const CREAM = '#F3F0E8';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);

const PAIN_SECONDS = 4.0;
const DASHBOARD_SECONDS = 8.0;
const RELIEF_SECONDS = 5.2;
const VALUE_SECONDS = 3.4;
const SERVICE_SECONDS = 7.0;
const FREE_TOOLS_SECONDS = 6.0;
const LOGO_SECONDS = 6.2;
const TRANSITION_SECONDS = 0.45;

const GoldGlow: React.FC<{opacity?: number; frame: number}> = ({opacity = 1, frame}) => {
	const drift = Math.sin(frame / 70) * 40;
	return (
		<div
			style={{
				position: 'absolute',
				top: '16%',
				left: `calc(50% + ${drift}px)`,
				width: 680,
				height: 680,
				marginLeft: -340,
				borderRadius: '50%',
				background: `radial-gradient(circle, ${GOLD}26 0%, transparent 70%)`,
				opacity,
			}}
		/>
	);
};

// A slow diagonal light sweep + fine grid, layered under every beat so the
// ad never sits on a dead flat color the way the first pass did.
const AmbientTexture: React.FC<{frame: number}> = ({frame}) => {
	const sweep = interpolate(frame % 150, [0, 150], [-30, 130]);
	return (
		<>
			<AbsoluteFill
				style={{
					backgroundImage: `linear-gradient(90deg, ${CREAM}07 1px, transparent 1px), linear-gradient(0deg, ${CREAM}07 1px, transparent 1px)`,
					backgroundSize: '54px 54px',
					opacity: 0.5,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: `${sweep}%`,
					width: '22%',
					background: `linear-gradient(100deg, transparent 0%, ${GOLD}10 50%, transparent 100%)`,
					transform: 'skewX(-14deg)',
				}}
			/>
		</>
	);
};

const KenBurns: React.FC<{src: string; frame: number; durationInFrames: number; darken?: number; pan?: 'left' | 'right'}> = ({
	src,
	frame,
	durationInFrames,
	darken = 0.55,
	pan = 'left',
}) => {
	const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.22], {extrapolateRight: 'clamp'});
	const dir = pan === 'left' ? -1 : 1;
	const x = interpolate(frame, [0, durationInFrames], [0, 26 * dir], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateX(${x}px)`}} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, ${NAVY_DEEP}${Math.round(darken * 255).toString(16)} 0%, ${NAVY_DEEP}f2 100%)`}} />
			<AbsoluteFill style={{background: `${NAVY_DEEP}55`}} />
		</AbsoluteFill>
	);
};

const PainBeat: React.FC<{text: string; image: string}> = ({text, image}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 16, mass: 0.9}});
	const words = text.split(' ');

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<KenBurns src={image} frame={frame} durationInFrames={s2f(PAIN_SECONDS)} darken={0.72} pan="right" />
			<AmbientTexture frame={frame} />
			<div style={{textAlign: 'center', padding: '0 90px', position: 'relative'}}>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 15,
						letterSpacing: 5,
						color: GOLD,
						marginBottom: 24,
						opacity: in_,
					}}
				>
					SOUND FAMILIAR?
				</div>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, lineHeight: 1.3, color: CREAM, flexWrap: 'wrap', display: 'flex', justifyContent: 'center', rowGap: 4}}>
					{words.map((word, i) => {
						const delay = 6 + i * 3.5;
						const wIn = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 14, mass: 0.5}});
						return (
							<span
								key={i}
								style={{
									display: 'inline-block',
									marginRight: 14,
									opacity: wIn,
									transform: `translateY(${(1 - wIn) * 22}px)`,
								}}
							>
								{word}
							</span>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const BarChart: React.FC<{frame: number}> = ({frame}) => {
	const bars = [0.4, 0.65, 0.5, 0.82, 0.7, 1.0];
	return (
		<div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 12, height: 130}}>
			{bars.map((h, i) => {
				const delay = 8 + i * 5;
				const grow = interpolate(frame - delay, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<div
						key={i}
						style={{
							width: 22,
							height: 130 * h * grow,
							borderRadius: 4,
							background: `linear-gradient(180deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
							boxShadow: `0 0 16px ${GOLD}55`,
						}}
					/>
				);
			})}
		</div>
	);
};

// Animated SVG line drawing itself in via stroke-dashoffset, next to the
// bars, so the dashboard reads as a real multi-chart panel rather than one
// lone bar graph.
const LineChart: React.FC<{frame: number}> = ({frame}) => {
	const path = 'M0,58 L20,46 L40,50 L60,30 L80,34 L100,12 L120,18 L140,4';
	const length = 200;
	const draw = interpolate(frame - 14, [0, 34], [length, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<svg width="140" height="64" viewBox="0 0 140 64" style={{overflow: 'visible'}}>
			<path d={path} fill="none" stroke={GOLD_LIGHT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={length} strokeDashoffset={draw} />
		</svg>
	);
};

const DonutChart: React.FC<{frame: number}> = ({frame}) => {
	const pct = interpolate(frame - 18, [0, 30], [0, 68], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const r = 30;
	const c = 2 * Math.PI * r;
	return (
		<svg width="76" height="76" viewBox="0 0 76 76">
			<circle cx="38" cy="38" r={r} fill="none" stroke={`${CREAM}1a`} strokeWidth="9" />
			<circle
				cx="38"
				cy="38"
				r={r}
				fill="none"
				stroke={GOLD}
				strokeWidth="9"
				strokeLinecap="round"
				strokeDasharray={c}
				strokeDashoffset={c - (c * pct) / 100}
				transform="rotate(-90 38 38)"
			/>
		</svg>
	);
};

const DashboardBeat: React.FC<{brand: string; kpis: {label: string; value: string}[]; image: string}> = ({brand, kpis, image}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cardIn = spring({frame, fps, from: 0, to: 1, config: {damping: 16, mass: 0.9}});
	const tilt = interpolate(frame, [0, 30], [4, 0], {extrapolateRight: 'clamp'});
	const rows = [
		{label: 'Revenue', delay: 26},
		{label: 'Expenses', delay: 38},
		{label: 'Net Cash Flow', delay: 50},
	];

	const rest = brand.startsWith('New') ? brand.slice(3) : brand;

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<KenBurns src={image} frame={frame} durationInFrames={s2f(DASHBOARD_SECONDS)} darken={0.6} pan="left" />
			<AmbientTexture frame={frame} />
			<GoldGlow opacity={0.55} frame={frame} />

			<div
				style={{
					position: 'absolute',
					top: 90,
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 22,
					letterSpacing: 1,
				}}
			>
				<span style={{color: CREAM}}>New</span>
				<span style={{color: GOLD}}>{rest}</span>
			</div>

			<div
				style={{
					width: 780,
					borderRadius: 22,
					background: `${NAVY}e6`,
					backdropFilter: 'blur(6px)',
					border: `1px solid ${GOLD}44`,
					padding: '38px 42px',
					opacity: cardIn,
					transform: `perspective(900px) rotateX(${tilt}deg) translateY(${(1 - cardIn) * 24}px) scale(${0.95 + cardIn * 0.05})`,
					boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 60px ${GOLD}18`,
				}}
			>
				<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26}}>
					<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 15, letterSpacing: 3, color: GOLD}}>LIVE FINANCIAL SNAPSHOT</span>
					<span style={{width: 8, height: 8, borderRadius: 4, background: '#5FE39A', boxShadow: '0 0 10px #5FE39A'}} />
				</div>

				<div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'}}>
					<BarChart frame={frame} />
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
						<LineChart frame={frame} />
						<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: 2, color: `${CREAM}77`}}>12-MO TREND</span>
					</div>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
						<DonutChart frame={frame} />
						<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: 2, color: `${CREAM}77`}}>MARGIN</span>
					</div>
				</div>

				<div style={{marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12}}>
					{rows.map((row, i) => {
						const kpi = kpis[i];
						const rowIn = spring({frame: frame - row.delay, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
						return (
							<div
								key={row.label}
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
									alignItems: 'center',
									padding: '13px 20px',
									borderRadius: 12,
									background: `${CREAM}0a`,
									border: `1px solid ${CREAM}0f`,
									opacity: rowIn,
									transform: `translateX(${(1 - rowIn) * -20}px)`,
								}}
							>
								<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, color: `${CREAM}cc`}}>{row.label}</span>
								<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: GOLD_LIGHT}}>{kpi?.value ?? ''}</span>
							</div>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const MessyBookBeat: React.FC = () => {
	const frame = useCurrentFrame();
	const rows = 7;
	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<AmbientTexture frame={frame} />
			<div style={{position: 'relative', zIndex: 1, width: 640, display: 'flex', flexDirection: 'column', gap: 10}}>
				{Array.from({length: rows}).map((_, i) => {
					const jitter = Math.sin((frame + i * 11) / 9) * 6;
					const widthPct = 40 + ((i * 37) % 55);
					return (
						<div
							key={i}
							style={{
								height: 20,
								width: `${widthPct}%`,
								marginLeft: i % 2 === 0 ? jitter : -jitter,
								borderRadius: 4,
								background: `${CREAM}22`,
							}}
						/>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 130, fontFamily: SANS, fontWeight: 700, fontSize: 16, letterSpacing: 4, color: `${CREAM}66`}}>
				BEFORE
			</div>
		</AbsoluteFill>
	);
};

const ReliefBeat: React.FC<{text: string; image: string}> = ({text, image}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const rows = [
		{label: 'Bookkeeping'},
		{label: 'Reporting'},
		{label: 'CFO Insight'},
	];
	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<KenBurns src={image} frame={frame} durationInFrames={s2f(RELIEF_SECONDS)} darken={0.68} pan="right" />
			<AmbientTexture frame={frame} />
			<GoldGlow opacity={0.4} frame={frame} />
			<div style={{position: 'absolute', top: 130, fontFamily: SANS, fontWeight: 700, fontSize: 16, letterSpacing: 4, color: GOLD}}>AFTER</div>
			<div style={{position: 'relative', zIndex: 1, width: 680, display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 60}}>
				{rows.map((row, i) => {
					const rowIn = spring({frame: frame - i * 6, fps, from: 0, to: 1, config: {damping: 18, mass: 0.45}});
					const checkIn = spring({frame: frame - i * 6 - 6, fps, from: 0, to: 1, config: {damping: 13, mass: 0.4}});
					return (
						<div key={row.label} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 18}}>
							<div
								style={{
									width: 32,
									height: 32,
									borderRadius: '50%',
									background: GOLD,
									flexShrink: 0,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transform: `scale(${checkIn})`,
									boxShadow: `0 0 14px ${GOLD}88`,
								}}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
									<path d="M4 12.5L9.5 18L20 6" stroke={NAVY_DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 9}}>
								<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: CREAM}}>{row.label}</span>
								<div style={{height: 10, borderRadius: 5, background: `${CREAM}1a`, overflow: 'hidden'}}>
									<div
										style={{
											height: '100%',
											width: `${100 * rowIn}%`,
											borderRadius: 5,
											background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
										}}
									/>
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<div
				style={{
					position: 'relative',
					zIndex: 1,
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 48,
					color: CREAM,
					textAlign: 'center',
					opacity: in_,
					transform: `translateY(${(1 - in_) * 14}px)`,
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

const ValueBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 14, mass: 0.6, stiffness: 190}});
	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<AmbientTexture frame={frame} />
			<GoldGlow opacity={0.6} frame={frame} />
			<div style={{textAlign: 'center', padding: '0 90px', opacity: in_, transform: `scale(${0.88 + in_ * 0.12})`}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, lineHeight: 1.32, color: CREAM}}>{text}</div>
				<div style={{width: 90, height: 3, background: GOLD, margin: '30px auto 0', borderRadius: 2, boxShadow: `0 0 14px ${GOLD}`}} />
			</div>
		</AbsoluteFill>
	);
};

const ServiceBeat: React.FC<{title: string; price: string; items: string[]}> = ({title, price, items}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const headIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const priceIn = spring({frame: frame - 10, fps, from: 0, to: 1, config: {damping: 13, mass: 0.6}});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<AmbientTexture frame={frame} />
			<GoldGlow opacity={0.5} frame={frame} />

			<div
				style={{
					width: 760,
					textAlign: 'center',
					opacity: headIn,
					transform: `translateY(${(1 - headIn) * 16}px)`,
					marginBottom: 30,
				}}
			>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 17, letterSpacing: 3, color: GOLD, marginBottom: 14}}>{title}</div>
				<div
					style={{
						display: 'inline-block',
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 44,
						color: CREAM,
						opacity: priceIn,
						transform: `scale(${0.9 + priceIn * 0.1})`,
					}}
				>
					{price}
				</div>
			</div>

			<div style={{width: 680, display: 'flex', flexDirection: 'column', gap: 14}}>
				{items.map((item, i) => {
					const delay = 20 + i * 9;
					const rowIn = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
					return (
						<div
							key={item}
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								gap: 16,
								padding: '15px 24px',
								borderRadius: 12,
								background: `${CREAM}0a`,
								border: `1px solid ${GOLD}33`,
								opacity: rowIn,
								transform: `translateX(${(1 - rowIn) * -22}px)`,
							}}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink: 0}}>
								<path d="M4 12.5L9.5 18L20 6" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, color: CREAM}}>{item}</span>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

const FreeToolsBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const tools = ['Tax Calculators', 'Salary Guides', 'Financial Articles'];

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<AmbientTexture frame={frame} />
			<GoldGlow opacity={0.5} frame={frame} />

			<div style={{position: 'relative', zIndex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 16, letterSpacing: 4, color: GOLD, marginBottom: 26}}>
				NOT READY TO TALK YET?
			</div>

			<div style={{position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', gap: 22, marginBottom: 34}}>
				{tools.map((tool, i) => {
					const toolIn = spring({frame: frame - 8 - i * 8, fps, from: 0, to: 1, config: {damping: 14, mass: 0.6}});
					return (
						<div
							key={tool}
							style={{
								padding: '20px 22px',
								width: 190,
								borderRadius: 14,
								background: `${CREAM}0a`,
								border: `1px solid ${GOLD}33`,
								textAlign: 'center',
								opacity: toolIn,
								transform: `translateY(${(1 - toolIn) * 20}px)`,
							}}
						>
							<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, color: CREAM}}>{tool}</span>
						</div>
					);
				})}
			</div>

			<div
				style={{
					textAlign: 'center',
					padding: '0 100px',
					opacity: in_,
					transform: `translateY(${(1 - in_) * 14}px)`,
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: CREAM}}>{text}</span>
			</div>
		</AbsoluteFill>
	);
};

const LogoBeat: React.FC<{brand: string; tagline: string; cta: string; contact?: string}> = ({brand, tagline, cta, contact}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const logoIn = spring({frame, fps, from: 0.8, to: 1, config: {damping: 13, mass: 0.8}});
	const logoOpacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	const underline = interpolate(frame, [10, 28], [0, 150], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const taglineIn = spring({frame: frame - 24, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const ctaIn = spring({frame: frame - 38, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const shineX = interpolate(frame, [16, 42], [-140, 340], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ctaPulse = 1 + Math.sin(frame / 10) * 0.02;

	const rest = brand.startsWith('New') ? brand.slice(3) : brand;

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<AmbientTexture frame={frame} />
			<GoldGlow frame={frame} />
			<div style={{opacity: logoOpacity, transform: `scale(${logoIn})`, textAlign: 'center', position: 'relative', overflow: 'hidden'}}>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 68, color: CREAM, letterSpacing: 0.5}}>New</span>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 68, color: GOLD, letterSpacing: 0.5}}>{rest}</span>
				<div
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: shineX,
						width: 60,
						background: `linear-gradient(100deg, transparent 0%, ${CREAM}55 50%, transparent 100%)`,
						transform: 'skewX(-18deg)',
					}}
				/>
			</div>
			<div style={{width: underline, height: 3, background: GOLD, margin: '18px auto 0', borderRadius: 2, boxShadow: `0 0 12px ${GOLD}`}} />
			<div
				style={{
					marginTop: 26,
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 24,
					color: `${CREAM}cc`,
					textAlign: 'center',
					padding: '0 100px',
					opacity: taglineIn,
					transform: `translateY(${(1 - taglineIn) * 10}px)`,
				}}
			>
				{tagline}
			</div>
			<div
				style={{
					marginTop: 42,
					padding: '17px 40px',
					borderRadius: 999,
					background: GOLD,
					opacity: ctaIn,
					transform: `translateY(${(1 - ctaIn) * 12}px) scale(${ctaPulse})`,
					boxShadow: `0 0 30px ${GOLD}66`,
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 25, color: NAVY_DEEP}}>{cta}</span>
			</div>
			{contact ? (
				<div style={{marginTop: 18, fontFamily: SANS, fontWeight: 600, fontSize: 16, color: `${CREAM}88`, opacity: ctaIn}}>{contact}</div>
			) : null}
		</AbsoluteFill>
	);
};

export const NewFineraAd: React.FC<NewFineraProps> = ({
	brand,
	tagline,
	kpis,
	painLine,
	reliefLine,
	valueLine,
	services,
	freeToolsLine,
	cta,
	contact,
	walletImage,
	deviceImage,
	music,
}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});
	const svcs = services ?? [];

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(PAIN_SECONDS)}>
					<PainBeat text={painLine} image={walletImage ?? deviceImage ?? ''} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(DASHBOARD_SECONDS)}>
					<DashboardBeat brand={brand} kpis={kpis} image={deviceImage ?? walletImage ?? ''} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(1.8)}>
					<MessyBookBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(RELIEF_SECONDS)}>
					<ReliefBeat text={reliefLine} image={walletImage ?? deviceImage ?? ''} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(VALUE_SECONDS)}>
					<ValueBeat text={valueLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				{svcs.map((service, i) => (
					<React.Fragment key={service.title}>
						<TransitionSeries.Sequence durationInFrames={s2f(SERVICE_SECONDS)}>
							<ServiceBeat title={service.title} price={service.price} items={service.items} />
						</TransitionSeries.Sequence>
						{i < svcs.length - 1 ? <TransitionSeries.Transition presentation={fade()} timing={timing} /> : null}
					</React.Fragment>
				))}
				{svcs.length > 0 ? <TransitionSeries.Transition presentation={fade()} timing={timing} /> : null}

				{freeToolsLine ? (
					<>
						<TransitionSeries.Sequence durationInFrames={s2f(FREE_TOOLS_SECONDS)}>
							<FreeToolsBeat text={freeToolsLine} />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition presentation={fade()} timing={timing} />
					</>
				) : null}

				<TransitionSeries.Sequence durationInFrames={s2f(LOGO_SECONDS)}>
					<LogoBeat brand={brand} tagline={tagline} cta={cta} contact={contact} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.45} /> : null}
		</AbsoluteFill>
	);
};

export const calculateNewFineraMetadata = ({props}: {props: NewFineraProps}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const serviceCount = props.services?.length ?? 0;
	const hasFreeTools = Boolean(props.freeToolsLine);
	const segments = 6 + serviceCount + (hasFreeTools ? 1 : 0);
	const total =
		s2f(PAIN_SECONDS) +
		s2f(DASHBOARD_SECONDS) +
		s2f(1.8) +
		s2f(RELIEF_SECONDS) +
		s2f(VALUE_SECONDS) +
		serviceCount * s2f(SERVICE_SECONDS) +
		(hasFreeTools ? s2f(FREE_TOOLS_SECONDS) : 0) +
		s2f(LOGO_SECONDS) -
		transitionFrames * (segments - 1);
	return {durationInFrames: total};
};
