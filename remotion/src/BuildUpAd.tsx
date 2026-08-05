import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Brand promo for theadzstudio's repositioning as a full social-media-manager
// service (websites, product pages, daily reels) - the visual hook is
// literal layout blocks assembling on screen instead of talking-head text
// cards, to sell "we build your layouts" rather than just say it.
export const buildUpSchema = z.object({
	brand: z.string(),
	tagline: z.string(),
	cta: z.string(),
	link: z.string(),
	music: z.string(),
});

export type BuildUpProps = z.infer<typeof buildUpSchema>;

const FPS = 30;
const NAVY = '#1B2440';
const CREAM = '#FBF9F4';
const ORANGE = '#F2994A';
const BLUE = '#2F80ED';
const FONT = '"Georgia", "Times New Roman", serif';
const SANS = '"Arial", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);
const popIn = (frame: number, fps: number, delay = 0) =>
	spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 14, mass: 0.6, stiffness: 140}});

const GRAIN_URL =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const Backdrop: React.FC<{tone: 'navy' | 'cream'; children?: React.ReactNode}> = ({tone, children}) => {
	const frame = useCurrentFrame();
	const bg =
		tone === 'navy'
			? `linear-gradient(160deg, #232D52 0%, ${NAVY} 55%, #10162C 100%)`
			: `radial-gradient(ellipse at 50% 30%, ${CREAM} 0%, #F1ECE0 55%, #E7DFCC 100%)`;
	const [orbA, orbB] = tone === 'navy' ? [BLUE, '#4A5CA8'] : [BLUE, ORANGE];
	const drift = Math.sin(frame / 90) * 6;

	return (
		<AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: `${20 + drift}%`,
					top: '12%',
					width: 560,
					height: 560,
					marginLeft: -280,
					marginTop: -280,
					borderRadius: '50%',
					background: orbA,
					opacity: 0.28,
					filter: 'blur(120px)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: '78%',
					top: '82%',
					width: 460,
					height: 460,
					marginLeft: -230,
					marginTop: -230,
					borderRadius: '50%',
					background: orbB,
					opacity: 0.22,
					filter: 'blur(110px)',
				}}
			/>
			<AbsoluteFill style={{backgroundImage: GRAIN_URL, opacity: 0.05, mixBlendMode: 'overlay'}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Label: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				top: 130,
				opacity,
				fontFamily: SANS,
				fontWeight: 700,
				fontSize: 40,
				letterSpacing: 0.5,
				color: dark ? NAVY : CREAM,
				textAlign: 'center',
				padding: '0 90px',
			}}
		>
			{children}
		</div>
	);
};

// --- Intro: wordmark ---
const IntroCard: React.FC<{brand: string; tagline: string}> = ({brand, tagline}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const taglineOpacity = interpolate(frame, [20, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Backdrop tone="cream">
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.85 + pop * 0.15})`}}>
				<div
					style={{
						width: 96,
						height: 96,
						borderRadius: 20,
						background: `linear-gradient(135deg, ${BLUE} 0%, ${ORANGE} 100%)`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 22,
						boxShadow: '0 14px 30px rgba(27,36,64,0.25)',
					}}
				>
					<span style={{fontFamily: FONT, fontWeight: 700, fontSize: 56, color: 'white'}}>A</span>
				</div>
				<div style={{fontFamily: FONT, fontWeight: 700, fontSize: 60, color: NAVY}}>{brand}</div>
				<div style={{opacity: taglineOpacity, fontFamily: SANS, fontSize: 26, color: '#6B7291', marginTop: 14, textAlign: 'center', padding: '0 100px'}}>
					{tagline}
				</div>
			</div>
		</Backdrop>
	);
};

// --- Beat 1: website layout assembling inside a browser frame ---
const WebsiteBuildBeat: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const frameScale = popIn(frame, fps);
	const nav = popIn(frame, fps, 14);
	const hero = popIn(frame, fps, 24);
	const line1 = popIn(frame, fps, 36);
	const line2 = popIn(frame, fps, 44);
	const button = popIn(frame, fps, 54);

	return (
		<Backdrop tone="navy">
			<Label>We Build Your Website</Label>
			<div
				style={{
					transform: `scale(${0.9 + frameScale * 0.1})`,
					opacity: frameScale,
					width: 760,
					height: 900,
					background: '#F4F1EA',
					borderRadius: 18,
					overflow: 'hidden',
					boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
				}}
			>
				<div style={{height: 46, background: '#E3DECF', display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px'}}>
					<div style={{width: 12, height: 12, borderRadius: 6, background: '#E06B5F'}} />
					<div style={{width: 12, height: 12, borderRadius: 6, background: '#E8B93F'}} />
					<div style={{width: 12, height: 12, borderRadius: 6, background: '#5FAF6E'}} />
				</div>
				<div
					style={{
						transform: `scaleX(${nav})`,
						transformOrigin: 'left',
						height: 54,
						margin: '20px 24px 0',
						borderRadius: 8,
						background: `linear-gradient(90deg, ${NAVY} 0%, #2A375E 100%)`,
					}}
				/>
				<div
					style={{
						transform: `scale(${0.9 + hero * 0.1})`,
						opacity: hero,
						height: 320,
						margin: '18px 24px 0',
						borderRadius: 10,
						background: `linear-gradient(135deg, ${BLUE} 0%, ${ORANGE} 100%)`,
					}}
				/>
				<div style={{margin: '22px 24px 0', display: 'flex', flexDirection: 'column', gap: 12}}>
					<div style={{transform: `scaleX(${line1})`, transformOrigin: 'left', height: 22, width: '85%', borderRadius: 4, background: '#D8D2C2'}} />
					<div style={{transform: `scaleX(${line2})`, transformOrigin: 'left', height: 22, width: '65%', borderRadius: 4, background: '#D8D2C2'}} />
				</div>
				<div
					style={{
						transform: `scale(${button})`,
						width: 200,
						height: 56,
						margin: '30px 24px 0',
						borderRadius: 8,
						background: ORANGE,
					}}
				/>
			</div>
		</Backdrop>
	);
};

// --- Beat 2: product page card assembling ---
const ProductPageBeat: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const card = popIn(frame, fps);
	const img = popIn(frame, fps, 12);
	const price = popIn(frame, fps, 26);
	const stars = popIn(frame, fps, 36);
	const cartBtn = popIn(frame, fps, 48);

	return (
		<Backdrop tone="cream">
			<Label dark>Product Pages That Convert</Label>
			<div
				style={{
					transform: `scale(${0.9 + card * 0.1})`,
					opacity: card,
					width: 620,
					background: 'white',
					borderRadius: 18,
					padding: 26,
					boxShadow: '0 24px 60px rgba(46,29,18,0.2)',
				}}
			>
				<div
					style={{
						transform: `scale(${0.92 + img * 0.08})`,
						opacity: img,
						height: 360,
						borderRadius: 12,
						background: `linear-gradient(135deg, ${ORANGE} 0%, ${BLUE} 100%)`,
						marginBottom: 20,
					}}
				/>
				<div style={{opacity: stars, display: 'flex', gap: 6, marginBottom: 12}}>
					{[0, 1, 2, 3, 4].map((i) => (
						<span key={i} style={{color: ORANGE, fontSize: 26}}>
							★
						</span>
					))}
				</div>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<div style={{transform: `scale(${price})`, fontFamily: FONT, fontWeight: 700, fontSize: 44, color: NAVY}}>$48</div>
					<div
						style={{
							transform: `scale(${cartBtn})`,
							padding: '16px 32px',
							borderRadius: 10,
							background: NAVY,
							color: 'white',
							fontFamily: SANS,
							fontWeight: 700,
							fontSize: 22,
						}}
					>
						Add to Cart
					</div>
				</div>
			</div>
		</Backdrop>
	);
};

// --- Beat 3: phone reel assembling ---
const ReelsBeat: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const phone = popIn(frame, fps);
	const play = popIn(frame, fps, 16);
	const heart = popIn(frame, fps, 30);
	const comment = popIn(frame, fps, 38);
	const share = popIn(frame, fps, 46);
	const caption = interpolate(frame, [56, 74], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Backdrop tone="navy">
			<Label>Daily Reels. Zero Effort.</Label>
			<div
				style={{
					transform: `scale(${0.9 + phone * 0.1})`,
					opacity: phone,
					width: 380,
					height: 780,
					borderRadius: 40,
					border: '10px solid #0A0E1C',
					background: `linear-gradient(160deg, ${BLUE} 0%, ${NAVY} 100%)`,
					position: 'relative',
					overflow: 'hidden',
					boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: `translate(-50%,-50%) scale(${play})`,
						width: 90,
						height: 90,
						borderRadius: '50%',
						background: 'rgba(255,255,255,0.18)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div
						style={{
							width: 0,
							height: 0,
							borderTop: '20px solid transparent',
							borderBottom: '20px solid transparent',
							borderLeft: '30px solid white',
							marginLeft: 8,
						}}
					/>
				</div>
				<div style={{position: 'absolute', right: 18, bottom: 160, display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'center'}}>
					<div style={{transform: `scale(${heart})`, fontSize: 34}}>❤️</div>
					<div style={{transform: `scale(${comment})`, fontSize: 34}}>💬</div>
					<div style={{transform: `scale(${share})`, fontSize: 34}}>↗️</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 22,
						bottom: 40,
						right: 90,
						opacity: caption,
						color: 'white',
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 20,
					}}
				>
					New drop is live ✨ shop the link in bio
				</div>
			</div>
		</Backdrop>
	);
};

// --- Beat 4: idea -> layout -> content -> conversions pipeline ---
const PipelineBeat: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const nodes = [
		{label: 'Idea', delay: 0},
		{label: 'Layout', delay: 16},
		{label: 'Content', delay: 32},
		{label: 'Conversions', delay: 48},
	];

	return (
		<Backdrop tone="cream">
			<Label dark>From Idea to Conversion</Label>
			<div style={{display: 'flex', alignItems: 'center', gap: 4}}>
				{nodes.map((n, i) => {
					const pop = popIn(frame, fps, n.delay);
					return (
						<React.Fragment key={n.label}>
							<div
								style={{
									transform: `scale(${pop})`,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: 12,
								}}
							>
								<div
									style={{
										width: 96,
										height: 96,
										borderRadius: '50%',
										background: i === nodes.length - 1 ? ORANGE : NAVY,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: 'white',
										fontFamily: FONT,
										fontWeight: 700,
										fontSize: 34,
									}}
								>
									{i + 1}
								</div>
								<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, color: NAVY}}>{n.label}</div>
							</div>
							{i < nodes.length - 1 ? (
								<div
									style={{
										opacity: popIn(frame, fps, n.delay + 8),
										width: 40,
										height: 4,
										background: '#C9BE9E',
										marginBottom: 34,
									}}
								/>
							) : null}
						</React.Fragment>
					);
				})}
			</div>
		</Backdrop>
	);
};

// --- Outro: CTA ---
const OutroCard: React.FC<{brand: string; cta: string; link: string}> = ({brand, cta, link}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const buttonScale = popIn(frame, fps);
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Backdrop tone="cream">
			<div style={{opacity, transform: `scale(${buttonScale})`, marginBottom: 34}}>
				<div
					style={{
						padding: '20px 46px',
						borderRadius: 12,
						background: `linear-gradient(135deg, ${BLUE} 0%, ${ORANGE} 100%)`,
						color: 'white',
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 34,
						boxShadow: '0 16px 34px rgba(47,128,237,0.35)',
					}}
				>
					{cta}
				</div>
			</div>
			<div style={{opacity, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: NAVY, marginBottom: 6}}>{brand}</div>
			<div style={{opacity, fontFamily: SANS, fontSize: 22, color: '#6B7291'}}>{link}</div>
		</Backdrop>
	);
};

const SEGMENTS_SECONDS = {
	intro: 2.8,
	website: 4.2,
	product: 3.8,
	reels: 4.2,
	pipeline: 3.8,
	outro: 3.6,
};
const TRANSITION_SECONDS = 0.4;

export const calculateBuildUpMetadata = () => {
	const total =
		Object.values(SEGMENTS_SECONDS).reduce((a, b) => a + b, 0) - 5 * TRANSITION_SECONDS;
	return {durationInFrames: s2f(total)};
};

export const BuildUpAd: React.FC<BuildUpProps> = ({brand, tagline, cta, link, music}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});

	return (
		<>
			{music ? <Audio src={music} volume={0.5} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.intro)}>
					<IntroCard brand={brand} tagline={tagline} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.website)}>
					<WebsiteBuildBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.product)}>
					<ProductPageBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.reels)}>
					<ReelsBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.pipeline)}>
					<PipelineBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SEGMENTS_SECONDS.outro)}>
					<OutroCard brand={brand} cta={cta} link={link} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
