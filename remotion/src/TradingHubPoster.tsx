import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// Standalone square (1:1) portfolio poster for the SSTraders chart/gauge
// piece - purpose-built for square placement (Etsy, Instagram grid) rather
// than a crop of the 9:16 video frame, so title, chart, gauge, and extra
// polish (glow accents, stat chips, watermark) all fit without cutting
// anything off.
export const tradingHubPosterSchema = z.object({
	title: z.string(),
	sentimentLabel: z.string(),
	statLeft: z.string(),
	statRight: z.string(),
	watermark: z.string(),
});

export type TradingHubPosterProps = z.infer<typeof tradingHubPosterSchema>;

const NAVY_DEEP = '#0A1E3A';
const NAVY = '#132B4E';
const NAVY_LIGHT = '#1F3F6E';
const BLUE_LIGHT = '#6FC3E8';
const GOLD = '#E4A83C';
const CREAM = '#F7F5F0';
const GREEN = '#2ECC71';
const RED = '#E5534B';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

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

export const TradingHubPoster: React.FC<TradingHubPosterProps> = ({title, sentimentLabel, statLeft, statRight, watermark}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const drift = Math.sin(frame / 100) * 8;

	const chartWidth = 860;
	const chartHeight = 320;
	const gap = 16;
	const barW = (chartWidth - gap * (CANDLES.length - 1)) / CANDLES.length;
	const maxH = Math.max(...CANDLES.map((c) => c.h));

	const needleAngle = -90 + 145; // resting at the bullish end

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 15%, ${NAVY_LIGHT} 0%, ${NAVY} 55%, ${NAVY_DEEP} 100%)`, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: `${28 + drift}%`,
					top: '6%',
					width: 640,
					height: 640,
					marginLeft: -320,
					marginTop: -320,
					borderRadius: '50%',
					background: GREEN,
					opacity: 0.14,
					filter: 'blur(150px)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: '78%',
					top: '88%',
					width: 520,
					height: 520,
					marginLeft: -260,
					marginTop: -260,
					borderRadius: '50%',
					background: GOLD,
					opacity: 0.14,
					filter: 'blur(130px)',
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage:
						'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
					backgroundSize: '54px 54px',
				}}
			/>

			<div
				style={{
					position: 'absolute',
					top: 64,
					left: 0,
					right: 0,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 46,
					color: CREAM,
					padding: '0 70px',
					textShadow: `0 0 30px ${BLUE_LIGHT}55`,
				}}
			>
				{title}
			</div>

			<div
				style={{
					position: 'absolute',
					top: 190,
					left: (width - chartWidth) / 2,
					width: chartWidth,
					height: chartHeight,
					display: 'flex',
					alignItems: 'flex-end',
					gap,
					background: 'rgba(255,255,255,0.05)',
					borderRadius: 20,
					padding: '22px 22px 0',
					border: '1px solid rgba(255,255,255,0.1)',
					boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
				}}
			>
				{CANDLES.map((c, i) => {
					const h = (c.h / maxH) * (chartHeight - 44);
					return (
						<div
							key={i}
							style={{
								width: barW,
								height: h,
								background: c.up ? GREEN : RED,
								borderRadius: 4,
								boxShadow: c.up ? `0 0 14px ${GREEN}77` : `0 0 14px ${RED}77`,
							}}
						/>
					);
				})}
			</div>

			<div style={{position: 'absolute', top: 590, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<svg width="340" height="192" viewBox="0 0 320 180">
					<path d="M 30 160 A 130 130 0 0 1 290 160" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={22} strokeLinecap="round" />
					<path
						d="M 30 160 A 130 130 0 0 1 290 160"
						fill="none"
						stroke="url(#sentimentGradPoster)"
						strokeWidth={22}
						strokeLinecap="round"
					/>
					<defs>
						<linearGradient id="sentimentGradPoster" x1="0%" y1="0%" x2="100%" y2="0%">
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
						strokeWidth={6}
						strokeLinecap="round"
						transform={`rotate(${needleAngle} 160 160)`}
						style={{filter: `drop-shadow(0 0 8px ${GREEN}aa)`}}
					/>
					<circle cx={160} cy={160} r={11} fill="white" />
				</svg>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 32,
						color: GREEN,
						marginTop: -6,
						textShadow: `0 0 18px ${GREEN}88`,
					}}
				>
					{sentimentLabel}
				</div>
			</div>

			<div style={{position: 'absolute', top: 850, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22}}>
				{[statLeft, statRight].map((s, i) => (
					<div
						key={i}
						style={{
							background: 'rgba(255,255,255,0.06)',
							border: '1px solid rgba(255,255,255,0.14)',
							borderRadius: 999,
							padding: '14px 26px',
							fontFamily: SANS,
							fontWeight: 700,
							fontSize: 22,
							color: CREAM,
						}}
					>
						{s}
					</div>
				))}
			</div>

			<div
				style={{
					position: 'absolute',
					bottom: 40,
					right: 46,
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 20,
					letterSpacing: 1.5,
					color: 'rgba(247,245,240,0.4)',
				}}
			>
				{watermark}
			</div>
		</AbsoluteFill>
	);
};

export const calculateTradingHubPosterMetadata = () => ({durationInFrames: 1});
