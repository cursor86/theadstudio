import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {z} from 'zod';

// Premium fintech motion-graphics ad for a bookkeeping / Virtual CFO
// service: dark navy + gold, animated KPI dashboard, problem-to-relief
// wipe, two text-overlay beats, and a wordmark logo reveal. No stock
// photos of people were available, so the "confident professional" and
// "relieved business owner" beats from the brief are told through data
// visuals and typography instead of fabricated human depictions.
export const newFineraSchema = z.object({
	brand: z.string(),
	tagline: z.string(),
	kpis: z.array(z.object({label: z.string(), value: z.string()})),
	painLine: z.string(),
	reliefLine: z.string(),
	valueLine: z.string(),
	cta: z.string(),
	contact: z.string().optional(),
	music: z.string().optional(),
});

export type NewFineraProps = z.infer<typeof newFineraSchema>;

const FPS = 30;
const NAVY_DEEP = '#0B0E16';
const NAVY = '#141A28';
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F1D888';
const CREAM = '#F3F0E8';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);

const PAIN_SECONDS = 3.2;
const DASHBOARD_SECONDS = 5.5;
const RELIEF_SECONDS = 3.2;
const VALUE_SECONDS = 3.2;
const LOGO_SECONDS = 4.9;
const TRANSITION_SECONDS = 0.4;

const GoldGlow: React.FC<{opacity?: number}> = ({opacity = 1}) => (
	<div
		style={{
			position: 'absolute',
			top: '18%',
			left: '50%',
			width: 620,
			height: 620,
			marginLeft: -310,
			borderRadius: '50%',
			background: `radial-gradient(circle, ${GOLD}22 0%, transparent 70%)`,
			opacity,
		}}
	/>
);

const PainBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 16, mass: 0.9}});
	const scan = interpolate(frame, [0, PAIN_SECONDS * FPS], [0, 100], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `linear-gradient(${NAVY_DEEP}00 0%, ${NAVY_DEEP}00 100%), repeating-linear-gradient(0deg, ${CREAM}0a 0px, ${CREAM}0a 1px, transparent 1px, transparent 34px)`,
					opacity: 0.5,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: `${scan}%`,
					left: 0,
					right: 0,
					height: 2,
					background: `${GOLD}55`,
				}}
			/>
			<div
				style={{
					textAlign: 'center',
					padding: '0 90px',
					opacity: in_,
					transform: `translateY(${(1 - in_) * 16}px)`,
				}}
			>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: 4, color: GOLD, marginBottom: 22}}>
					SOUND FAMILIAR?
				</div>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, lineHeight: 1.35, color: CREAM}}>{text}</div>
			</div>
		</AbsoluteFill>
	);
};

const BarChart: React.FC<{frame: number}> = ({frame}) => {
	const bars = [0.4, 0.65, 0.5, 0.82, 1.0];
	return (
		<div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 14, height: 140}}>
			{bars.map((h, i) => {
				const delay = 10 + i * 6;
				const grow = interpolate(frame - delay, [0, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<div
						key={i}
						style={{
							width: 26,
							height: 140 * h * grow,
							borderRadius: 4,
							background: `linear-gradient(180deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
						}}
					/>
				);
			})}
		</div>
	);
};

const DashboardBeat: React.FC<{brand: string; kpis: {label: string; value: string}[]}> = ({brand, kpis}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cardIn = spring({frame, fps, from: 0, to: 1, config: {damping: 16, mass: 0.9}});
	const rows = [
		{label: 'Revenue', delay: 20},
		{label: 'Expenses', delay: 32},
		{label: 'Net Cash Flow', delay: 44},
	];

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<GoldGlow opacity={0.7} />
			<div
				style={{
					position: 'absolute',
					bottom: 60,
					right: 60,
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 20,
					letterSpacing: 1,
					color: `${CREAM}88`,
				}}
			>
				<span style={{color: CREAM}}>New</span>
				<span style={{color: GOLD}}>{brand.replace('New', '')}</span>
			</div>

			<div
				style={{
					width: 760,
					borderRadius: 20,
					background: NAVY,
					border: `1px solid ${GOLD}33`,
					padding: '36px 40px',
					opacity: cardIn,
					transform: `translateY(${(1 - cardIn) * 20}px) scale(${0.96 + cardIn * 0.04})`,
					boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
				}}
			>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 15, letterSpacing: 3, color: GOLD, marginBottom: 24}}>
					LIVE FINANCIAL SNAPSHOT
				</div>

				<BarChart frame={frame} />

				<div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14}}>
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
									padding: '14px 20px',
									borderRadius: 12,
									background: `${CREAM}08`,
									opacity: rowIn,
									transform: `translateX(${(1 - rowIn) * -20}px)`,
								}}
							>
								<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, color: `${CREAM}cc`}}>{row.label}</span>
								<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: GOLD_LIGHT}}>{kpi?.value ?? ''}</span>
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
			<div style={{width: 640, display: 'flex', flexDirection: 'column', gap: 10}}>
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
			<div style={{position: 'absolute', top: 140, fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: 4, color: `${CREAM}66`}}>
				BEFORE
			</div>
		</AbsoluteFill>
	);
};

const ReliefBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const rows = [
		{label: 'Bookkeeping', pct: 100},
		{label: 'Reporting', pct: 100},
		{label: 'CFO Insight', pct: 100},
	];
	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<GoldGlow opacity={0.5} />
			<div style={{position: 'absolute', top: 140, fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: 4, color: GOLD}}>AFTER</div>
			<div style={{width: 640, display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 60}}>
				{rows.map((row, i) => {
					const rowIn = spring({frame: frame - i * 8, fps, from: 0, to: 1, config: {damping: 16, mass: 0.7}});
					return (
						<div key={row.label} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
							<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 18, color: `${CREAM}cc`}}>{row.label}</span>
							<div style={{height: 10, borderRadius: 5, background: `${CREAM}14`, overflow: 'hidden'}}>
								<div
									style={{
										height: '100%',
										width: `${row.pct * rowIn}%`,
										borderRadius: 5,
										background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 40,
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
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<GoldGlow opacity={0.5} />
			<div style={{textAlign: 'center', padding: '0 90px', opacity: in_, transform: `scale(${0.94 + in_ * 0.06})`}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, lineHeight: 1.35, color: CREAM}}>{text}</div>
				<div style={{width: 90, height: 3, background: GOLD, margin: '28px auto 0', borderRadius: 2}} />
			</div>
		</AbsoluteFill>
	);
};

const LogoBeat: React.FC<{brand: string; tagline: string; cta: string; contact?: string}> = ({brand, tagline, cta, contact}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const logoIn = spring({frame, fps, from: 0.85, to: 1, config: {damping: 14, mass: 0.8}});
	const logoOpacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	const underline = interpolate(frame, [10, 28], [0, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const taglineIn = spring({frame: frame - 24, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const ctaIn = spring({frame: frame - 38, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});

	const rest = brand.startsWith('New') ? brand.slice(3) : brand;

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<GoldGlow />
			<div style={{opacity: logoOpacity, transform: `scale(${logoIn})`, textAlign: 'center'}}>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 66, color: CREAM, letterSpacing: 0.5}}>New</span>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 66, color: GOLD, letterSpacing: 0.5}}>{rest}</span>
			</div>
			<div style={{width: underline, height: 3, background: GOLD, margin: '18px auto 0', borderRadius: 2}} />
			<div
				style={{
					marginTop: 24,
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 20,
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
					marginTop: 40,
					padding: '16px 38px',
					borderRadius: 999,
					background: GOLD,
					opacity: ctaIn,
					transform: `translateY(${(1 - ctaIn) * 12}px)`,
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 21, color: NAVY_DEEP}}>{cta}</span>
			</div>
			{contact ? (
				<div style={{marginTop: 18, fontFamily: SANS, fontWeight: 600, fontSize: 16, color: `${CREAM}88`, opacity: ctaIn}}>{contact}</div>
			) : null}
		</AbsoluteFill>
	);
};

export const NewFineraAd: React.FC<NewFineraProps> = ({brand, tagline, kpis, painLine, reliefLine, valueLine, cta, contact, music}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(PAIN_SECONDS)}>
					<PainBeat text={painLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(DASHBOARD_SECONDS)}>
					<DashboardBeat brand={brand} kpis={kpis} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(1.6)}>
					<MessyBookBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(RELIEF_SECONDS)}>
					<ReliefBeat text={reliefLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(VALUE_SECONDS)}>
					<ValueBeat text={valueLine} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(LOGO_SECONDS)}>
					<LogoBeat brand={brand} tagline={tagline} cta={cta} contact={contact} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.45} /> : null}
		</AbsoluteFill>
	);
};

export const calculateNewFineraMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const segments = 6;
	const total =
		s2f(PAIN_SECONDS) + s2f(DASHBOARD_SECONDS) + s2f(1.6) + s2f(RELIEF_SECONDS) + s2f(VALUE_SECONDS) + s2f(LOGO_SECONDS) - transitionFrames * (segments - 1);
	return {durationInFrames: total};
};
