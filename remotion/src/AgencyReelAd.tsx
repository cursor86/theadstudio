import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// 30-second self-promo for theadzagency, built from the client's own
// production blueprint: a literal demonstration of the agency's editing
// styles (montage, Ken Burns, listicle frames) rather than a testimonial or
// UGC-style reel - positioned explicitly against "cheap UGC". No product
// photos were available (image-gen CDN was network-blocked), so products
// are drawn as stylized icon mockups inside neon-framed cards - reads as a
// software/process demo, which fits the "sleek dark UI" brief anyway.
export const agencyReelSchema = z.object({
	brand: z.string(),
	products: z.array(z.object({emoji: z.string(), label: z.string()})),
	reasons: z.array(z.string()),
	cta: z.string(),
	contact: z.string(),
	music: z.string(),
});

export type AgencyReelProps = z.infer<typeof agencyReelSchema>;

const FPS = 30;
const BLACK = '#07070D';
const INK = '#0F0F1A';
const CYAN = '#2FE6FF';
const MAGENTA = '#FF3CAC';
const RED = '#FF3B3B';
const CREAM = '#F4F4FA';
const DIM = '#8A8AA3';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);
const popIn = (frame: number, fps: number, delay = 0, config = {damping: 14, mass: 0.6, stiffness: 150}) =>
	spring({frame: frame - delay, fps, from: 0, to: 1, config});

const GRAIN_URL =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const NeonBackdrop: React.FC<{children?: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const drift = Math.sin(frame / 100) * 8;

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 20%, ${INK} 0%, ${BLACK} 60%, #030305 100%)`, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: `${22 + drift}%`,
					top: '8%',
					width: 620,
					height: 620,
					marginLeft: -310,
					marginTop: -310,
					borderRadius: '50%',
					background: CYAN,
					opacity: 0.16,
					filter: 'blur(140px)',
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
					background: MAGENTA,
					opacity: 0.16,
					filter: 'blur(130px)',
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage:
						'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
					backgroundSize: '64px 64px',
				}}
			/>
			<AbsoluteFill style={{backgroundImage: GRAIN_URL, opacity: 0.05, mixBlendMode: 'overlay'}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

const NeonLabel: React.FC<{children: React.ReactNode; top?: number; color?: string}> = ({children, top = 130, color = CYAN}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				top,
				opacity,
				fontFamily: SANS,
				fontWeight: 800,
				fontSize: 40,
				letterSpacing: 1,
				color: CREAM,
				textAlign: 'center',
				padding: '0 80px',
				lineHeight: 1.3,
				textShadow: `0 0 24px ${color}88`,
			}}
		>
			{children}
		</div>
	);
};

// A flat, deliberately dull "static photo" card - grayscale, no glow -
// this is the "before" state the hook beat stamps an X over.
const StaticPhotoCard: React.FC<{emoji: string}> = ({emoji}) => (
	<div
		style={{
			width: 380,
			height: 380,
			background: '#D8D8DC',
			borderRadius: 8,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
		}}
	>
		<span style={{fontSize: 150, filter: 'grayscale(1) brightness(0.75)'}}>{emoji}</span>
	</div>
);

// The "alive" neon-framed version of the same product.
const NeonProductCard: React.FC<{emoji: string; glow?: number; size?: number}> = ({emoji, glow = 1, size = 380}) => (
	<div
		style={{
			width: size,
			height: size,
			background: `linear-gradient(160deg, #16162A 0%, ${INK} 100%)`,
			borderRadius: 24,
			border: `2px solid rgba(47,230,255,${0.35 * glow})`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: `0 0 ${50 * glow}px rgba(47,230,255,${0.35 * glow}), 0 20px 50px rgba(0,0,0,0.5)`,
		}}
	>
		<span style={{fontSize: size * 0.42, filter: `drop-shadow(0 0 ${18 * glow}px rgba(47,230,255,0.8))`}}>{emoji}</span>
	</div>
);

// --- Beat 1: Hook - static photo stamped, then flashes into motion ---
const HookBeat: React.FC<{emoji: string}> = ({emoji}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cardIn = popIn(frame, fps);
	const xStamp = popIn(frame, fps, 30, {damping: 9, mass: 0.7, stiffness: 220});
	const flash = interpolate(frame, [58, 64, 78], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const revealed = frame > 62;
	const neonIn = popIn(frame, fps, 64);

	return (
		<NeonBackdrop>
			<NeonLabel top={110} color={RED}>
				{revealed ? (
					<>
						NOT UGC.
						<br />
						REAL EDITORIAL MOTION.
					</>
				) : (
					<>
						STOP USING
						<br />
						STATIC PHOTOS.
					</>
				)}
			</NeonLabel>

			<div style={{position: 'relative', transform: `scale(${0.9 + cardIn * 0.1})`, opacity: cardIn}}>
				{revealed ? (
					<div style={{transform: `scale(${0.85 + neonIn * 0.15})`, opacity: neonIn}}>
						<NeonProductCard emoji={emoji} />
					</div>
				) : (
					<StaticPhotoCard emoji={emoji} />
				)}
				{!revealed ? (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transform: `scale(${xStamp}) rotate(-12deg)`,
							opacity: xStamp,
						}}
					>
						<span style={{fontSize: 260, color: RED, fontWeight: 900, textShadow: '0 0 30px rgba(255,59,59,0.7)'}}>✕</span>
					</div>
				) : null}
			</div>

			<AbsoluteFill style={{background: 'white', opacity: flash}} />
		</NeonBackdrop>
	);
};

// --- Beat 2: fast montage cutting on a simulated beat ---
const MontageBeat: React.FC<{products: {emoji: string; label: string}[]}> = ({products}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const beatFrames = 14;
	const cutIndex = Math.floor(frame / beatFrames) % products.length;
	const cutFrame = frame % beatFrames;
	const pop = popIn(cutFrame, fps, 0, {damping: 10, mass: 0.5, stiffness: 260});
	const flash = interpolate(cutFrame, [0, 3], [0.5, 0], {extrapolateRight: 'clamp'});
	const product = products[cutIndex];

	return (
		<NeonBackdrop>
			<NeonLabel top={110} color={MAGENTA}>
				THEADZAGENCY
				<br />
				INSTANT AD REELS
			</NeonLabel>
			<div style={{transform: `scale(${0.92 + pop * 0.08})`}}>
				<NeonProductCard emoji={product.emoji} size={420} />
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 420,
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 26,
					color: DIM,
					letterSpacing: 2,
				}}
			>
				{product.label.toUpperCase()}
			</div>
			<AbsoluteFill style={{background: 'white', opacity: flash}} />
		</NeonBackdrop>
	);
};

// --- Beat 3: Ken Burns showcase - slow zoom + pan with parallax bg ---
const KenBurnsBeat: React.FC<{emoji: string; durationInFrames: number}> = ({emoji, durationInFrames}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
	const scale = 1 + progress * 0.22;
	const panX = -18 + progress * 36;
	const bgPanX = -8 + progress * 16;
	const labelOpacity = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<NeonBackdrop>
			<AbsoluteFill
				style={{
					transform: `translateX(${bgPanX}px)`,
					backgroundImage: 'radial-gradient(rgba(47,230,255,0.14) 2px, transparent 2px)',
					backgroundSize: '48px 48px',
					opacity: 0.6,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 110,
					opacity: labelOpacity,
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 40,
					letterSpacing: 1,
					color: CREAM,
					textAlign: 'center',
					padding: '0 80px',
					textShadow: `0 0 24px ${CYAN}88`,
				}}
			>
				CINEMATIC
				<br />
				KEN BURNS EFFECT
			</div>
			<div style={{transform: `translateX(${panX}px) scale(${scale})`}}>
				<NeonProductCard emoji={emoji} size={460} />
			</div>
		</NeonBackdrop>
	);
};

// --- Beat 4: listicle frame showcase ---
const ListicleBeat: React.FC<{emoji: string; reasons: string[]}> = ({emoji, reasons}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cardIn = popIn(frame, fps);

	return (
		<NeonBackdrop>
			<NeonLabel top={110} color={CYAN}>
				3 REASONS
				<br />
				THIS CHANGES EVERYTHING
			</NeonLabel>
			<div style={{transform: `scale(${0.92 + cardIn * 0.08})`, opacity: cardIn, marginBottom: 30}}>
				<NeonProductCard emoji={emoji} size={280} glow={0.7} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
				{reasons.map((reason, i) => {
					const pop = popIn(frame, fps, 20 + i * 16);
					return (
						<div
							key={reason}
							style={{
								opacity: pop,
								transform: `translateX(${(1 - pop) * -30}px)`,
								display: 'flex',
								alignItems: 'center',
								gap: 18,
								width: 760,
								background: 'rgba(255,255,255,0.05)',
								border: `1px solid rgba(47,230,255,0.3)`,
								borderRadius: 14,
								padding: '18px 26px',
							}}
						>
							<div
								style={{
									width: 40,
									height: 40,
									borderRadius: '50%',
									background: `linear-gradient(135deg, ${CYAN} 0%, ${MAGENTA} 100%)`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontFamily: SANS,
									fontWeight: 800,
									fontSize: 20,
									color: BLACK,
									flexShrink: 0,
								}}
							>
								{i + 1}
							</div>
							<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: CREAM}}>{reason}</span>
						</div>
					);
				})}
			</div>
		</NeonBackdrop>
	);
};

// --- Beat 5: CTA ---
const OutroCard: React.FC<{brand: string; cta: string; contact: string}> = ({brand, cta, contact}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const wordmark = popIn(frame, fps);
	const buttonScale = popIn(frame, fps, 16);
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<NeonBackdrop>
			<div style={{opacity, transform: `scale(${0.9 + wordmark * 0.1})`, marginBottom: 40}}>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 58,
						color: CREAM,
						textAlign: 'center',
						textShadow: `0 0 30px ${CYAN}, 0 0 60px ${MAGENTA}55`,
					}}
				>
					{brand}
				</div>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 22,
						letterSpacing: 4,
						color: DIM,
						textAlign: 'center',
						marginTop: 10,
					}}
				>
					STATIC TO MOTION
				</div>
			</div>
			<div style={{opacity, transform: `scale(${buttonScale})`, marginBottom: 30}}>
				<div
					style={{
						padding: '22px 46px',
						borderRadius: 12,
						background: `linear-gradient(135deg, ${CYAN} 0%, ${MAGENTA} 100%)`,
						color: BLACK,
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 32,
						textAlign: 'center',
						boxShadow: `0 0 40px rgba(47,230,255,0.4)`,
					}}
				>
					{cta}
				</div>
			</div>
			<div style={{opacity, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: DIM}}>{contact}</div>
		</NeonBackdrop>
	);
};

const SEGMENTS_SECONDS = {
	hook: 5,
	montage: 7,
	kenBurns: 6,
	listicle: 7,
	outro: 5,
};
const TRANSITION_SECONDS = 0.35;

export const calculateAgencyReelMetadata = () => {
	const total = Object.values(SEGMENTS_SECONDS).reduce((a, b) => a + b, 0) - 4 * TRANSITION_SECONDS;
	return {durationInFrames: s2f(total)};
};

export const AgencyReelAd: React.FC<AgencyReelProps> = ({brand, products, reasons, cta, contact, music}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});
	const [productA, productB] = products;

	return (
		<>
			{music ? <Audio src={music} volume={0.5} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.hook)}>
					<HookBeat emoji={productA.emoji} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.montage)}>
					<MontageBeat products={products} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.kenBurns)}>
					<KenBurnsBeat emoji={productA.emoji} durationInFrames={s2f(SEGMENTS_SECONDS.kenBurns)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.listicle)}>
					<ListicleBeat emoji={productB.emoji} reasons={reasons} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.outro)}>
					<OutroCard brand={brand} cta={cta} contact={contact} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
