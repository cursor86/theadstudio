import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Promo for a finance/trading education hub (SSTraders): sells the
// beginner-to-advanced curriculum (basics -> sentiment -> technical analysis
// -> strategy) alongside live mentor-led sessions. Visual hook is generated
// finance UI - candlestick chart, sentiment gauge, live-class mockup -
// instead of stock photos, since the product is knowledge/mentorship, not a
// physical item.
export const tradingHubSchema = z.object({
	logoPath: z.string(),
	tagline: z.string(),
	painPoints: z.array(z.string()),
	curriculum: z.array(z.string()),
	liveCaption: z.string(),
	cta: z.string(),
	link: z.string(),
	music: z.string(),
});

export type TradingHubProps = z.infer<typeof tradingHubSchema>;

const FPS = 30;
const NAVY_DEEP = '#0A1E3A';
const NAVY = '#132B4E';
const NAVY_LIGHT = '#1F3F6E';
const BLUE = '#3E7DBF';
const BLUE_LIGHT = '#6FC3E8';
const GOLD = '#E4A83C';
const GOLD_LIGHT = '#F0C978';
const CREAM = '#F7F5F0';
const CREAM_DIM = '#EDE8DB';
const GREEN = '#2ECC71';
const RED = '#E5534B';
const INK = '#1B2A44';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);
const popIn = (frame: number, fps: number, delay = 0) =>
	spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 14, mass: 0.6, stiffness: 140}});

const GRAIN_URL =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const Backdrop: React.FC<{tone: 'navy' | 'cream'; children?: React.ReactNode}> = ({tone, children}) => {
	const frame = useCurrentFrame();
	const bg =
		tone === 'navy'
			? `linear-gradient(160deg, ${NAVY_LIGHT} 0%, ${NAVY} 55%, ${NAVY_DEEP} 100%)`
			: `radial-gradient(ellipse at 50% 25%, ${CREAM} 0%, #F1ECE0 55%, ${CREAM_DIM} 100%)`;
	const [orbA, orbB] = tone === 'navy' ? [BLUE, GOLD] : [BLUE_LIGHT, GOLD_LIGHT];
	const drift = Math.sin(frame / 90) * 6;

	return (
		<AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: `${20 + drift}%`,
					top: '10%',
					width: 620,
					height: 620,
					marginLeft: -310,
					marginTop: -310,
					borderRadius: '50%',
					background: orbA,
					opacity: tone === 'navy' ? 0.25 : 0.16,
					filter: 'blur(130px)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: '80%',
					top: '85%',
					width: 480,
					height: 480,
					marginLeft: -240,
					marginTop: -240,
					borderRadius: '50%',
					background: orbB,
					opacity: tone === 'navy' ? 0.2 : 0.16,
					filter: 'blur(110px)',
				}}
			/>
			<AbsoluteFill style={{backgroundImage: GRAIN_URL, opacity: 0.05, mixBlendMode: 'overlay'}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Label: React.FC<{children: React.ReactNode; dark?: boolean; top?: number}> = ({children, dark, top = 130}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				top,
				opacity,
				fontFamily: SANS,
				fontWeight: 800,
				fontSize: 42,
				letterSpacing: 0.3,
				color: dark ? INK : CREAM,
				textAlign: 'center',
				padding: '0 80px',
				lineHeight: 1.25,
			}}
		>
			{children}
		</div>
	);
};

// --- Intro: logo reveal ---
const IntroCard: React.FC<{logoPath: string; tagline: string}> = ({logoPath, tagline}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const taglineOpacity = interpolate(frame, [20, 38], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Backdrop tone="navy">
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.85 + pop * 0.15})`}}>
				{logoPath ? (
					<div
						style={{
							background: CREAM,
							borderRadius: 28,
							padding: '46px 56px',
							boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
						}}
					>
						<Img src={logoPath} style={{width: 560, objectFit: 'contain'}} />
					</div>
				) : (
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 74, color: CREAM}}>SSTraders</div>
				)}
				<div
					style={{
						opacity: taglineOpacity,
						fontFamily: SANS,
						fontWeight: 600,
						fontSize: 30,
						color: BLUE_LIGHT,
						marginTop: 30,
						textAlign: 'center',
						padding: '0 110px',
					}}
				>
					{tagline}
				</div>
			</div>
		</Backdrop>
	);
};

// --- Beat 1: pain points ---
const PainPointBeat: React.FC<{painPoints: string[]}> = ({painPoints}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Backdrop tone="navy">
			<Label top={110}>Trading Doesn&apos;t Have to Be Guesswork</Label>
			<div style={{display: 'flex', flexDirection: 'column', gap: 30, marginTop: 40}}>
				{painPoints.map((p, i) => {
					const delay = i * 16;
					const pop = popIn(frame, fps, delay);
					const shake = interpolate(frame - delay, [0, 6, 12], [0, -4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					return (
						<div
							key={p}
							style={{
								opacity: pop,
								transform: `translateX(${(1 - pop) * -40 + shake}px)`,
								display: 'flex',
								alignItems: 'center',
								gap: 20,
								background: 'rgba(255,255,255,0.06)',
								border: `1px solid rgba(229,83,75,0.4)`,
								borderRadius: 14,
								padding: '20px 28px',
								width: 780,
							}}
						>
							<span style={{fontSize: 30, color: RED}}>✕</span>
							<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 27, color: CREAM}}>{p}</span>
						</div>
					);
				})}
			</div>
		</Backdrop>
	);
};

// --- Beat 2: curriculum roadmap ---
const CurriculumBeat: React.FC<{curriculum: string[]}> = ({curriculum}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Backdrop tone="cream">
			<Label dark top={110}>
				Beginner to Advanced Curriculum
			</Label>
			<div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 40}}>
				{curriculum.map((step, i) => {
					const delay = i * 18;
					const pop = popIn(frame, fps, delay);
					const lineGrow = popIn(frame, fps, delay + 10);
					return (
						<div key={step} style={{display: 'flex', alignItems: 'stretch'}}>
							<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90}}>
								<div
									style={{
										transform: `scale(${pop})`,
										width: 68,
										height: 68,
										borderRadius: '50%',
										background: i === curriculum.length - 1 ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)` : NAVY,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: i === curriculum.length - 1 ? NAVY_DEEP : 'white',
										fontFamily: SANS,
										fontWeight: 800,
										fontSize: 28,
										boxShadow: '0 10px 20px rgba(19,43,78,0.25)',
									}}
								>
									{i + 1}
								</div>
								{i < curriculum.length - 1 ? (
									<div
										style={{
											transform: `scaleY(${lineGrow})`,
											transformOrigin: 'top',
											width: 4,
											flexGrow: 1,
											minHeight: 34,
											background: '#C9BE9E',
										}}
									/>
								) : null}
							</div>
							<div
								style={{
									opacity: pop,
									fontFamily: SANS,
									fontWeight: 700,
									fontSize: 30,
									color: INK,
									paddingTop: 14,
									paddingLeft: 10,
								}}
							>
								{step}
							</div>
						</div>
					);
				})}
			</div>
		</Backdrop>
	);
};

// --- Beat 3: candlestick chart + sentiment gauge ---
const CANDLES = [
	{h: 60, up: true},
	{h: 100, up: true},
	{h: 70, up: false},
	{h: 130, up: true},
	{h: 90, up: false},
	{h: 150, up: true},
	{h: 120, up: true},
	{h: 170, up: true},
	{h: 100, up: false},
	{h: 190, up: true},
];

const ChartBeat: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const chartIn = popIn(frame, fps);
	const needleProgress = interpolate(frame, [40, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const needleAngle = -90 + needleProgress * 145; // sweep toward bullish (green) side

	const chartWidth = 820;
	const chartHeight = 340;
	const gap = 14;
	const candleW = (chartWidth - gap * (CANDLES.length - 1)) / CANDLES.length;
	const maxH = Math.max(...CANDLES.map((c) => c.h));

	return (
		<Backdrop tone="navy">
			<Label top={100}>Real Sentiment &amp; Technical Analysis</Label>

			<div
				style={{
					opacity: chartIn,
					width: chartWidth,
					height: chartHeight,
					display: 'flex',
					alignItems: 'flex-end',
					gap,
					background: 'rgba(255,255,255,0.05)',
					borderRadius: 16,
					padding: '20px 20px 0',
					border: '1px solid rgba(255,255,255,0.1)',
				}}
			>
				{CANDLES.map((c, i) => {
					const delay = i * 5;
					const grow = popIn(frame, fps, delay);
					const h = (c.h / maxH) * (chartHeight - 40);
					return (
						<div
							key={i}
							style={{
								width: candleW,
								height: h * grow,
								background: c.up ? GREEN : RED,
								borderRadius: 3,
								transformOrigin: 'bottom',
							}}
						/>
					);
				})}
			</div>

			<div style={{marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<svg width="320" height="180" viewBox="0 0 320 180">
					<path d="M 30 160 A 130 130 0 0 1 290 160" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={22} strokeLinecap="round" />
					<path
						d="M 30 160 A 130 130 0 0 1 290 160"
						fill="none"
						stroke={`url(#sentimentGrad)`}
						strokeWidth={22}
						strokeLinecap="round"
						strokeDasharray={409}
						strokeDashoffset={409 - 409 * needleProgress}
					/>
					<defs>
						<linearGradient id="sentimentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor={RED} />
							<stop offset="55%" stopColor={GOLD} />
							<stop offset="100%" stopColor={GREEN} />
						</linearGradient>
					</defs>
					<line
						x1={160}
						y1={160}
						x2={160}
						y2={50}
						stroke="white"
						strokeWidth={5}
						strokeLinecap="round"
						transform={`rotate(${needleAngle} 160 160)`}
					/>
					<circle cx={160} cy={160} r={10} fill="white" />
				</svg>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: GREEN, marginTop: -10}}>Market Sentiment: Bullish</div>
			</div>
		</Backdrop>
	);
};

// --- Beat 4: live session mockup ---
const LiveBeat: React.FC<{liveCaption: string}> = ({liveCaption}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const panel = popIn(frame, fps);
	const pulse = 0.6 + Math.abs(Math.sin(frame / 8)) * 0.4;
	const chat = ['Great explanation! 🔥', 'This makes so much sense', 'Finally understand RSI', 'Live Q&A is amazing'];

	return (
		<Backdrop tone="cream">
			<Label dark top={100}>
				Live Sessions. Real Mentors.
			</Label>

			<div
				style={{
					transform: `scale(${0.92 + panel * 0.08})`,
					opacity: panel,
					width: 820,
					background: NAVY_DEEP,
					borderRadius: 20,
					padding: 20,
					boxShadow: '0 30px 70px rgba(19,43,78,0.35)',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
						<div style={{width: 12, height: 12, borderRadius: 6, background: RED, opacity: pulse}} />
						<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: 'white'}}>LIVE</span>
					</div>
					<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, color: BLUE_LIGHT}}>Beginner → Advanced</span>
				</div>

				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
					{[0, 1, 2, 3].map((i) => {
						const tilePop = popIn(frame, fps, i * 8);
						return (
							<div
								key={i}
								style={{
									transform: `scale(${0.9 + tilePop * 0.1})`,
									opacity: tilePop,
									height: 170,
									borderRadius: 12,
									background: i === 0 ? `linear-gradient(135deg, ${BLUE} 0%, ${NAVY_LIGHT} 100%)` : `linear-gradient(135deg, ${NAVY_LIGHT} 0%, ${NAVY} 100%)`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 46,
								}}
							>
								{i === 0 ? '🎓' : '🙂'}
							</div>
						);
					})}
				</div>

				<div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
					{chat.map((c, i) => {
						const msgOpacity = interpolate(frame, [30 + i * 12, 42 + i * 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
						return (
							<div
								key={c}
								style={{
									opacity: msgOpacity,
									alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
									background: i % 2 === 0 ? 'rgba(255,255,255,0.1)' : GOLD,
									color: i % 2 === 0 ? 'white' : NAVY_DEEP,
									fontFamily: SANS,
									fontWeight: 600,
									fontSize: 18,
									padding: '10px 16px',
									borderRadius: 16,
								}}
							>
								{c}
							</div>
						);
					})}
				</div>
			</div>

			<div style={{marginTop: 30, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: INK, textAlign: 'center', padding: '0 100px'}}>
				{liveCaption}
			</div>
		</Backdrop>
	);
};

// --- Outro: CTA ---
const OutroCard: React.FC<{logoPath: string; cta: string; link: string}> = ({logoPath, cta, link}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const buttonScale = popIn(frame, fps, 14);
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Backdrop tone="navy">
			<div style={{opacity, marginBottom: 30}}>
				{logoPath ? (
					<div
						style={{
							background: CREAM,
							borderRadius: 24,
							padding: '34px 42px',
							boxShadow: '0 14px 32px rgba(0,0,0,0.35)',
						}}
					>
						<Img src={logoPath} style={{width: 420, objectFit: 'contain'}} />
					</div>
				) : (
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 54, color: CREAM, textAlign: 'center'}}>SSTraders</div>
				)}
			</div>
			<div style={{opacity, transform: `scale(${buttonScale})`, marginBottom: 30}}>
				<div
					style={{
						padding: '22px 50px',
						borderRadius: 12,
						background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
						color: NAVY_DEEP,
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 36,
						boxShadow: '0 16px 34px rgba(228,168,60,0.35)',
					}}
				>
					{cta}
				</div>
			</div>
			<div style={{opacity, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: BLUE_LIGHT}}>{link}</div>
		</Backdrop>
	);
};

const SEGMENTS_SECONDS = {
	intro: 3.0,
	pain: 3.6,
	curriculum: 4.4,
	chart: 4.6,
	live: 4.6,
	outro: 3.4,
};
const TRANSITION_SECONDS = 0.4;

export const calculateTradingHubMetadata = () => {
	const total = Object.values(SEGMENTS_SECONDS).reduce((a, b) => a + b, 0) - 5 * TRANSITION_SECONDS;
	return {durationInFrames: s2f(total)};
};

export const TradingHubAd: React.FC<TradingHubProps> = ({logoPath, tagline, painPoints, curriculum, liveCaption, cta, link, music}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});

	return (
		<>
			{music ? <Audio src={music} volume={0.5} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.intro)}>
					<IntroCard logoPath={logoPath} tagline={tagline} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.pain)}>
					<PainPointBeat painPoints={painPoints} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.curriculum)}>
					<CurriculumBeat curriculum={curriculum} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.chart)}>
					<ChartBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.live)}>
					<LiveBeat liveCaption={liveCaption} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.outro)}>
					<OutroCard logoPath={logoPath} cta={cta} link={link} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
