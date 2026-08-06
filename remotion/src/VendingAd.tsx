import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';
import {SampleLockWatermark} from './SampleLockWatermark';

// Outreach-sample promo for a vending-machine sales & service business
// (EasyVend). No client product photos were available, so the visual hook
// is a generated vending-machine UI mockup (snack grid, tap-to-pay) instead
// - same approach as TradingHubAd's generated finance UI. Meant to be sent
// locked as a cold-outreach sample, not a finished deliverable.
export const vendingSchema = z.object({
	brand: z.string(),
	tagline: z.string(),
	painPoints: z.array(z.string()),
	locations: z.array(z.string()),
	process: z.array(z.string()),
	cta: z.string(),
	contact: z.string(),
	music: z.string(),
	locked: z.boolean().optional(),
});

export type VendingProps = z.infer<typeof vendingSchema>;

const FPS = 30;
const GREEN = '#1E9E5A';
const GREEN_DARK = '#0E5C34';
const NAVY = '#16324F';
const NAVY_LIGHT = '#234872';
const CREAM = '#F7F5F0';
const CREAM_DIM = '#ECE7DA';
const AMBER = '#F2A93B';
const AMBER_LIGHT = '#F7C877';
const INK = '#152233';
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
			? `linear-gradient(160deg, ${NAVY_LIGHT} 0%, ${NAVY} 55%, #0C1F33 100%)`
			: `radial-gradient(ellipse at 50% 25%, ${CREAM} 0%, #F1ECE0 55%, ${CREAM_DIM} 100%)`;
	const [orbA, orbB] = tone === 'navy' ? [GREEN, AMBER] : [GREEN, AMBER_LIGHT];
	const drift = Math.sin(frame / 90) * 6;

	return (
		<AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: `${20 + drift}%`,
					top: '10%',
					width: 600,
					height: 600,
					marginLeft: -300,
					marginTop: -300,
					borderRadius: '50%',
					background: orbA,
					opacity: tone === 'navy' ? 0.22 : 0.14,
					filter: 'blur(130px)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: '80%',
					top: '85%',
					width: 460,
					height: 460,
					marginLeft: -230,
					marginTop: -230,
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

const Label: React.FC<{children: React.ReactNode; dark?: boolean; top?: number}> = ({children, dark, top = 120}) => {
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

const Wordmark: React.FC<{brand: string; size?: number}> = ({brand, size = 64}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
		<div
			style={{
				width: size * 1.1,
				height: size * 1.1,
				borderRadius: size * 0.28,
				background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: '0 10px 26px rgba(14,92,52,0.35)',
			}}
		>
			<span style={{fontSize: size * 0.62}}>🥤</span>
		</div>
		<div style={{fontFamily: SANS, fontWeight: 800, fontSize: size}}>
			<span style={{color: GREEN}}>Easy</span>
			<span style={{color: NAVY}}>Vend</span>
		</div>
	</div>
);

// --- Intro ---
const IntroCard: React.FC<{brand: string; tagline: string}> = ({tagline}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const taglineOpacity = interpolate(frame, [20, 38], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Backdrop tone="cream">
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.85 + pop * 0.15})`}}>
				<Wordmark brand="EasyVend" size={70} />
				<div
					style={{
						opacity: taglineOpacity,
						fontFamily: SANS,
						fontWeight: 600,
						fontSize: 28,
						color: '#5B6A7A',
						marginTop: 26,
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
			<Label top={110}>Every Empty Break Room Is Lost Revenue</Label>
			<div style={{display: 'flex', flexDirection: 'column', gap: 30, marginTop: 40}}>
				{painPoints.map((p, i) => {
					const delay = i * 16;
					const pop = popIn(frame, fps, delay);
					return (
						<div
							key={p}
							style={{
								opacity: pop,
								transform: `translateX(${(1 - pop) * -40}px)`,
								display: 'flex',
								alignItems: 'center',
								gap: 20,
								background: 'rgba(255,255,255,0.06)',
								border: `1px solid rgba(242,169,59,0.4)`,
								borderRadius: 14,
								padding: '20px 28px',
								width: 780,
							}}
						>
							<span style={{fontSize: 30, color: AMBER}}>⚠</span>
							<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: CREAM}}>{p}</span>
						</div>
					);
				})}
			</div>
		</Backdrop>
	);
};

// --- Beat 2: vending machine mockup ---
const SNACKS = ['🥤', '🍫', '🍪', '🥨', '🧃', '🍬', '🥜', '🍿', '🧋'];

const MachineBeat: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const machine = popIn(frame, fps);
	const tap = popIn(frame, fps, 70);
	const tapPulse = 0.85 + Math.abs(Math.sin(frame / 10)) * 0.15;

	return (
		<Backdrop tone="cream">
			<Label dark top={100}>
				Fully Stocked. Cashless. Always On.
			</Label>
			<div
				style={{
					transform: `scale(${0.9 + machine * 0.1})`,
					opacity: machine,
					width: 560,
					background: NAVY,
					borderRadius: 24,
					padding: 22,
					boxShadow: '0 30px 70px rgba(22,50,79,0.35)',
					position: 'relative',
				}}
			>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 12,
						background: 'rgba(255,255,255,0.06)',
						borderRadius: 16,
						padding: 16,
					}}
				>
					{SNACKS.map((s, i) => {
						const cellPop = popIn(frame, fps, i * 5);
						return (
							<div
								key={i}
								style={{
									transform: `scale(${0.85 + cellPop * 0.15})`,
									opacity: cellPop,
									height: 110,
									borderRadius: 10,
									background: `linear-gradient(160deg, ${NAVY_LIGHT} 0%, ${NAVY} 100%)`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 44,
									border: '1px solid rgba(255,255,255,0.08)',
								}}
							>
								{s}
							</div>
						);
					})}
				</div>
				<div style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
					<div
						style={{
							transform: `scale(${tap * tapPulse + (1 - tap)})`,
							opacity: tap,
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							background: GREEN,
							borderRadius: 999,
							padding: '14px 28px',
						}}
					>
						<span style={{fontSize: 26}}>📱</span>
						<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 20, color: 'white'}}>Tap to Pay</span>
					</div>
				</div>
			</div>
		</Backdrop>
	);
};

// --- Beat 3: locations grid ---
const LOCATION_ICONS: Record<string, string> = {
	Offices: '🏢',
	Gyms: '🏋️',
	Apartments: '🏬',
	Schools: '🎓',
	Warehouses: '📦',
	Hospitals: '🏥',
};

const LocationsBeat: React.FC<{locations: string[]}> = ({locations}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Backdrop tone="navy">
			<Label top={110}>Perfect For</Label>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 40}}>
				{locations.map((loc, i) => {
					const pop = popIn(frame, fps, i * 14);
					return (
						<div
							key={loc}
							style={{
								transform: `scale(${0.88 + pop * 0.12})`,
								opacity: pop,
								width: 320,
								background: 'rgba(255,255,255,0.07)',
								border: '1px solid rgba(255,255,255,0.12)',
								borderRadius: 18,
								padding: '32px 20px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: 14,
							}}
						>
							<span style={{fontSize: 52}}>{LOCATION_ICONS[loc] ?? '📍'}</span>
							<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: CREAM}}>{loc}</span>
						</div>
					);
				})}
			</div>
		</Backdrop>
	);
};

// --- Beat 4: process pipeline ---
const ProcessBeat: React.FC<{process: string[]}> = ({process}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const badge = popIn(frame, fps, process.length * 18 + 20);

	return (
		<Backdrop tone="cream">
			<Label dark top={90}>
				Zero Cost. Zero Hassle.
			</Label>
			<div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 30}}>
				{process.map((step, i) => {
					const delay = i * 18;
					const pop = popIn(frame, fps, delay);
					const lineGrow = popIn(frame, fps, delay + 10);
					return (
						<div key={step} style={{display: 'flex', alignItems: 'stretch'}}>
							<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90}}>
								<div
									style={{
										transform: `scale(${pop})`,
										width: 64,
										height: 64,
										borderRadius: '50%',
										background: i === process.length - 1 ? `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_LIGHT} 100%)` : GREEN,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: i === process.length - 1 ? INK : 'white',
										fontFamily: SANS,
										fontWeight: 800,
										fontSize: 26,
										boxShadow: '0 10px 20px rgba(22,50,79,0.2)',
									}}
								>
									{i + 1}
								</div>
								{i < process.length - 1 ? (
									<div
										style={{
											transform: `scaleY(${lineGrow})`,
											transformOrigin: 'top',
											width: 4,
											flexGrow: 1,
											minHeight: 30,
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
									fontSize: 27,
									color: INK,
									paddingTop: 12,
									paddingLeft: 10,
								}}
							>
								{step}
							</div>
						</div>
					);
				})}
			</div>
			<div
				style={{
					opacity: badge,
					transform: `scale(${badge})`,
					marginTop: 34,
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					background: NAVY,
					borderRadius: 999,
					padding: '12px 26px',
				}}
			>
				<span style={{fontSize: 22}}>✅</span>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, color: 'white'}}>KVK Registered Business</span>
			</div>
		</Backdrop>
	);
};

// --- Outro ---
const OutroCard: React.FC<{cta: string; contact: string}> = ({cta, contact}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const buttonScale = popIn(frame, fps, 14);
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Backdrop tone="navy">
			<div style={{opacity, marginBottom: 34}}>
				<Wordmark brand="EasyVend" size={60} />
			</div>
			<div style={{opacity, transform: `scale(${buttonScale})`, marginBottom: 30}}>
				<div
					style={{
						padding: '22px 44px',
						borderRadius: 12,
						background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_LIGHT} 100%)`,
						color: INK,
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 32,
						boxShadow: '0 16px 34px rgba(242,169,59,0.35)',
						textAlign: 'center',
					}}
				>
					{cta}
				</div>
			</div>
			<div style={{opacity, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: '#9FB3C8'}}>{contact}</div>
		</Backdrop>
	);
};

const SEGMENTS_SECONDS = {
	intro: 2.8,
	pain: 3.6,
	machine: 4.2,
	locations: 3.8,
	process: 4.6,
	outro: 3.2,
};
const TRANSITION_SECONDS = 0.4;

export const calculateVendingMetadata = () => {
	const total = Object.values(SEGMENTS_SECONDS).reduce((a, b) => a + b, 0) - 5 * TRANSITION_SECONDS;
	return {durationInFrames: s2f(total)};
};

export const VendingAd: React.FC<VendingProps> = ({brand, tagline, painPoints, locations, process, cta, contact, music, locked}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});

	return (
		<>
			{music ? <Audio src={music} volume={0.5} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.intro)}>
					<IntroCard brand={brand} tagline={tagline} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.pain)}>
					<PainPointBeat painPoints={painPoints} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.machine)}>
					<MachineBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.locations)}>
					<LocationsBeat locations={locations} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.process)}>
					<ProcessBeat process={process} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.outro)}>
					<OutroCard cta={cta} contact={contact} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{locked ? <SampleLockWatermark /> : null}
		</>
	);
};
