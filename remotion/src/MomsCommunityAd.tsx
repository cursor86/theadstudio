import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Community-engagement "tag a business" style Reel, themed for stay-at-home
// moms building small businesses, closing on the theadzstudio wordmark. Same
// brand system (navy/cream/orange, Georgia serif) as StoryAd/BuildUpAd - this
// is theadzstudio's own audience-building content, not a client template.
export const momsCommunitySchema = z.object({
	bannerText: z.string(),
	headline: z.string(),
	scriptMessage: z.string(),
	ctaLine: z.string(),
	ctaHighlight: z.string(),
	brand: z.string(),
	tagline: z.string(),
	footerLine: z.string(),
	music: z.string().optional(),
	musicVolume: z.number().optional(),
});

export type MomsCommunityProps = z.infer<typeof momsCommunitySchema>;

const FPS = 30;
const NAVY_DEEP = '#0E1526';
const NAVY = '#1B2440';
const CREAM = '#FBF9F4';
const ORANGE = '#F2994A';
const BLUE = '#2F80ED';
const SERIF = 'Georgia, "Times New Roman", serif';

const s2f = (s: number) => Math.round(s * FPS);

const BANNER_SECONDS = 3.0;
const HEADLINE_SECONDS = 5.0;
const SCRIPT_SECONDS = 7.0;
const ICONS_SECONDS = 8.0;
const CTA_SECONDS = 8.0;
const OUTRO_SECONDS = 11.0;
const TRANSITION_SECONDS = 0.4;

const GRAIN_URL =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const Grain: React.FC<{opacity?: number}> = ({opacity = 0.05}) => (
	<AbsoluteFill style={{backgroundImage: GRAIN_URL, opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}} />
);

const Glow: React.FC<{frame: number; color: string; opacity?: number}> = ({frame, color, opacity = 1}) => {
	const drift = Math.sin(frame / 80) * 36;
	return (
		<div
			style={{
				position: 'absolute',
				top: '18%',
				left: `calc(50% + ${drift}px)`,
				width: 640,
				height: 640,
				marginLeft: -320,
				borderRadius: '50%',
				background: `radial-gradient(circle, ${color}2e 0%, transparent 70%)`,
				opacity,
			}}
		/>
	);
};

const stroke = `${CREAM}cc`;

const IconFlower: React.FC = () => (
	<svg width="56" height="56" viewBox="0 0 64 64" fill="none">
		<circle cx="32" cy="32" r="6" stroke={stroke} strokeWidth="2" />
		<circle cx="32" cy="18" r="8" stroke={stroke} strokeWidth="2" />
		<circle cx="32" cy="46" r="8" stroke={stroke} strokeWidth="2" />
		<circle cx="18" cy="32" r="8" stroke={stroke} strokeWidth="2" />
		<circle cx="46" cy="32" r="8" stroke={stroke} strokeWidth="2" />
		<path d="M32 46 L32 60" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const IconYarn: React.FC = () => (
	<svg width="56" height="56" viewBox="0 0 64 64" fill="none">
		<circle cx="28" cy="34" r="16" stroke={stroke} strokeWidth="2" />
		<path d="M14 30c8 4 20 4 28 0M13 38c9 -3 21 -3 30 0M18 24c6 6 12 6 20 0M18 44c6 -6 12 -6 20 0" stroke={stroke} strokeWidth="1.4" />
		<path d="M40 22 L52 10M52 10 L48 10M52 10 L52 14" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const IconHeartHands: React.FC = () => (
	<svg width="56" height="56" viewBox="0 0 64 64" fill="none">
		<path d="M32 26c-3 -6 -12 -6 -14 1c-2 7 6 12 14 18c8 -6 16 -11 14 -18c-2 -7 -11 -7 -14 -1z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
		<path d="M10 48c4 -6 10 -8 14 -6M54 48c-4 -6 -10 -8 -14 -6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const IconPalette: React.FC = () => (
	<svg width="56" height="56" viewBox="0 0 64 64" fill="none">
		<path
			d="M32 10c-13 0-22 9-22 20c0 8 5 12 11 12c3 0 4-2 4-4c0-3-3-3-3-7c0-6 5-10 10-10c8 0 14 5 14 12c0 8-6 13-14 13"
			stroke={stroke}
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<circle cx="24" cy="24" r="2.4" fill={stroke} />
		<circle cx="34" cy="20" r="2.4" fill={stroke} />
		<circle cx="24" cy="34" r="2.4" fill={stroke} />
	</svg>
);

const IconCoffee: React.FC = () => (
	<svg width="56" height="56" viewBox="0 0 64 64" fill="none">
		<path d="M16 26h26v14c0 6-5 11-11 11h-4c-6 0-11-5-11-11V26z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
		<path d="M42 30c5 0 8 3 8 7s-3 7-8 7" stroke={stroke} strokeWidth="2" />
		<path d="M22 20c0-3 3-3 3-6M30 20c0-3 3-3 3-6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const IconLeaf: React.FC = () => (
	<svg width="56" height="56" viewBox="0 0 64 64" fill="none">
		<path d="M14 46C14 24 34 12 50 12c0 18-10 36-30 36c-3-4-6-4-6-2z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
		<path d="M18 44C26 34 34 26 46 16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
	</svg>
);

const IconChip: React.FC<{frame: number; delay: number; children: React.ReactNode}> = ({frame, delay, children}) => {
	const {fps} = useVideoConfig();
	const in_ = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 13, mass: 0.55}});
	return (
		<div
			style={{
				width: 118,
				height: 118,
				borderRadius: '50%',
				border: `1.5px solid ${CREAM}33`,
				background: `${CREAM}0a`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				opacity: in_,
				transform: `scale(${0.7 + in_ * 0.3})`,
			}}
		>
			{children}
		</div>
	);
};

const BannerBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const ribbonIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const textIn = spring({frame: frame - 6, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<Glow frame={frame} color={ORANGE} opacity={0.5} />
			<div
				style={{
					position: 'relative',
					padding: '22px 56px',
					opacity: ribbonIn,
					transform: `scale(${0.9 + ribbonIn * 0.1})`,
					background: `${CREAM}08`,
					border: `1px solid ${ORANGE}55`,
					borderRadius: 999,
					maxWidth: 800,
				}}
			>
				<span
					style={{
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontWeight: 700,
						fontSize: 30,
						color: CREAM,
						textAlign: 'center',
						opacity: textIn,
					}}
				>
					{text}
				</span>
			</div>
		</AbsoluteFill>
	);
};

const HeadlineBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = text.split(' ');

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<Glow frame={frame} color={BLUE} opacity={0.55} />
			<div
				style={{
					position: 'relative',
					padding: '0 90px',
					textAlign: 'center',
					fontFamily: SERIF,
					fontWeight: 700,
					fontSize: 58,
					lineHeight: 1.2,
					color: CREAM,
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					rowGap: 8,
				}}
			>
				{words.map((word, i) => {
					const delay = 4 + i * 4;
					const wIn = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 14, mass: 0.5}});
					const isAccent = word.replace(/[^A-Za-z]/g, '') === 'MOMS' || word.replace(/[^A-Za-z]/g, '') === 'MOTHERS';
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								marginRight: 16,
								opacity: wIn,
								transform: `translateY(${(1 - wIn) * 20}px)`,
								color: isAccent ? ORANGE : CREAM,
							}}
						>
							{word}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

const ScriptBeat: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const lineW = interpolate(frame, [10, 34], [0, 120], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<Glow frame={frame} color={ORANGE} opacity={0.45} />
			<div
				style={{
					position: 'relative',
					padding: '0 100px',
					textAlign: 'center',
					opacity: in_,
					transform: `translateY(${(1 - in_) * 16}px)`,
				}}
			>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 44, lineHeight: 1.4, color: CREAM}}>
					{text}
				</div>
				<div style={{width: lineW, height: 3, background: ORANGE, margin: '30px auto 0', borderRadius: 2}} />
			</div>
		</AbsoluteFill>
	);
};

const IconsBeat: React.FC = () => {
	const frame = useCurrentFrame();
	const icons: {node: React.ReactNode; delay: number}[] = [
		{node: <IconFlower />, delay: 4},
		{node: <IconYarn />, delay: 12},
		{node: <IconHeartHands />, delay: 20},
		{node: <IconPalette />, delay: 28},
		{node: <IconCoffee />, delay: 36},
		{node: <IconLeaf />, delay: 44},
	];
	const captionIn = spring({frame: frame - 56, fps: 30, from: 0, to: 1, config: {damping: 15, mass: 0.6}});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<Glow frame={frame} color={BLUE} opacity={0.5} />
			<div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26}}>
					{icons.map((icon, i) => (
						<IconChip key={i} frame={frame} delay={icon.delay}>
							{icon.node}
						</IconChip>
					))}
				</div>
				<div
					style={{
						fontFamily: SERIF,
						fontWeight: 600,
						fontSize: 24,
						color: `${CREAM}cc`,
						opacity: captionIn,
						transform: `translateY(${(1 - captionIn) * 10}px)`,
					}}
				>
					Every craft. Every talent. Every business.
				</div>
			</div>
		</AbsoluteFill>
	);
};

const CtaBeat: React.FC<{text: string; highlight: string}> = ({text, highlight}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const parts = text.split(highlight);
	const in_ = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const pulse = 1 + Math.sin(frame / 9) * 0.03;
	const arrowY = interpolate(frame % 40, [0, 20, 40], [0, 10, 0]);

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<Glow frame={frame} color={ORANGE} opacity={0.55} />
			<div
				style={{
					position: 'relative',
					padding: '0 90px',
					textAlign: 'center',
					opacity: in_,
					transform: `translateY(${(1 - in_) * 16}px)`,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 34,
				}}
			>
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 42, lineHeight: 1.35, color: CREAM}}>
					{parts[0]}
					<span style={{color: ORANGE, display: 'inline-block', transform: `scale(${pulse})`}}>{highlight}</span>
					{parts[1]}
				</div>
				<svg width="30" height="42" viewBox="0 0 30 42" fill="none" style={{transform: `translateY(${arrowY}px)`}}>
					<path d="M15 2v34M15 36l-9-9M15 36l9-9" stroke={ORANGE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
		</AbsoluteFill>
	);
};

const OutroBeat: React.FC<{brand: string; tagline: string; footerLine: string}> = ({brand, tagline, footerLine}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const logoIn = spring({frame, fps, from: 0.85, to: 1, config: {damping: 13, mass: 0.8}});
	const logoOpacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	const underline = interpolate(frame, [10, 28], [0, 150], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const taglineIn = spring({frame: frame - 22, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const footerIn = spring({frame: frame - 40, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const rest = brand.startsWith('the') ? brand.slice(3) : brand;

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<Glow frame={frame} color={BLUE} />
			<div style={{position: 'relative', opacity: logoOpacity, transform: `scale(${logoIn})`, textAlign: 'center'}}>
				<span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 72, color: CREAM, letterSpacing: 0.5}}>the</span>
				<span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 72, color: ORANGE, letterSpacing: 0.5}}>{rest}</span>
			</div>
			<div style={{width: underline, height: 3, background: ORANGE, margin: '18px auto 0', borderRadius: 2}} />
			<div
				style={{
					marginTop: 24,
					fontFamily: SERIF,
					fontWeight: 600,
					fontSize: 24,
					color: `${CREAM}cc`,
					textAlign: 'center',
					opacity: taglineIn,
					transform: `translateY(${(1 - taglineIn) * 10}px)`,
				}}
			>
				{tagline}
			</div>
			<div
				style={{
					marginTop: 40,
					padding: '0 100px',
					fontFamily: SERIF,
					fontStyle: 'italic',
					fontSize: 24,
					color: `${CREAM}99`,
					textAlign: 'center',
					opacity: footerIn,
					transform: `translateY(${(1 - footerIn) * 10}px)`,
				}}
			>
				{footerLine}
			</div>
		</AbsoluteFill>
	);
};

export const MomsCommunityAd: React.FC<MomsCommunityProps> = ({
	bannerText,
	headline,
	scriptMessage,
	ctaLine,
	ctaHighlight,
	brand,
	tagline,
	footerLine,
	music,
	musicVolume,
}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});

	return (
		<AbsoluteFill style={{backgroundColor: NAVY_DEEP}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(BANNER_SECONDS)}>
					<BannerBeat text={bannerText} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(HEADLINE_SECONDS)}>
					<HeadlineBeat text={headline} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(SCRIPT_SECONDS)}>
					<ScriptBeat text={scriptMessage} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(ICONS_SECONDS)}>
					<IconsBeat />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(CTA_SECONDS)}>
					<CtaBeat text={ctaLine} highlight={ctaHighlight} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(OUTRO_SECONDS)}>
					<OutroBeat brand={brand} tagline={tagline} footerLine={footerLine} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={musicVolume ?? 0.5} /> : null}
		</AbsoluteFill>
	);
};

export const calculateMomsCommunityMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const segments = 6;
	const total =
		s2f(BANNER_SECONDS) +
		s2f(HEADLINE_SECONDS) +
		s2f(SCRIPT_SECONDS) +
		s2f(ICONS_SECONDS) +
		s2f(CTA_SECONDS) +
		s2f(OUTRO_SECONDS) -
		transitionFrames * (segments - 1);
	return {durationInFrames: total};
};
