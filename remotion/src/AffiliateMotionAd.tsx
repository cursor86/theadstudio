import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Generic 10s motion-graphics ad for Amazon-affiliate promos across any
// category. Built for products with no scrapeable listing photo: pure
// kinetic typography + a small original line-icon set (one icon per
// category, swappable via iconKey) instead of any brand photography.
// Same two-beat shape and visual system as SunscreenMotionAd, generalized
// with an icon library so one component covers electronics and beauty.
export const ICON_KEYS = [
	'sun',
	'droplet',
	'shield',
	'star',
	'bolt',
	'bulb',
	'bell',
	'camera',
	'vacuum',
	'speaker',
	'screen',
	'leaf',
	'sparkle',
	'wand',
	'blade',
	'patch',
] as const;

export const affiliateMotionSchema = z.object({
	hookLine: z.string(),
	benefitLine: z.string(),
	brandLine: z.string(),
	subLine: z.string(),
	cta: z.string(),
	link: z.string(),
	iconKey: z.enum(ICON_KEYS).optional(),
	music: z.string().optional(),
});

export type AffiliateMotionProps = z.infer<typeof affiliateMotionSchema>;
type IconKey = (typeof ICON_KEYS)[number];

const FPS = 30;
const CREAM = '#FBF7F0';
const INK = '#1F1B16';
const ORANGE = '#F2701C';
const ORANGE_LIGHT = '#FFA35C';

const s2f = (s: number) => Math.round(s * FPS);

const HOOK_SECONDS = 5.2;
const CTA_SECONDS = 5.2;
const TRANSITION_SECONDS = 0.4;

type IconProps = {size?: number; stroke?: string; fill?: string};

const SunIcon: React.FC<IconProps & {frame?: number}> = ({size = 100, stroke = ORANGE, frame = 0}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${frame * 0.6}deg)`}}>
		<circle cx="50" cy="50" r="20" fill={stroke} />
		{Array.from({length: 8}).map((_, i) => (
			<line
				key={i}
				x1="50"
				y1="18"
				x2="50"
				y2="6"
				stroke={stroke}
				strokeWidth="5"
				strokeLinecap="round"
				transform={`rotate(${(i * 360) / 8} 50 50)`}
			/>
		))}
	</svg>
);

const DropletIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path d="M50 8C50 8 22 42 22 63C22 79.5 34.5 92 50 92C65.5 92 78 79.5 78 63C78 42 50 8 50 8Z" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
		<path d="M36 66C36 74 42 79 49 79" stroke={ORANGE_LIGHT} strokeWidth="4" strokeLinecap="round" />
	</svg>
);

const ShieldIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path d="M50 6L86 20V48C86 70 70 86 50 96C30 86 14 70 14 48V20L50 6Z" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
		<path d="M34 50L45 62L68 38" stroke={ORANGE_LIGHT} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const StarIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path
			d="M50 8L61 37L92 39L67 58L76 89L50 71L24 89L33 58L8 39L39 37Z"
			stroke={stroke}
			strokeWidth="5"
			strokeLinejoin="round"
		/>
	</svg>
);

const BoltIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path d="M56 6L20 56H46L42 94L82 42H56L56 6Z" stroke={stroke} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
	</svg>
);

const BulbIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path d="M50 8C33 8 22 20 22 36C22 48 28 55 34 62C38 66 40 70 40 76H60C60 70 62 66 66 62C72 55 78 48 78 36C78 20 67 8 50 8Z" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
		<line x1="40" y1="86" x2="60" y2="86" stroke={ORANGE_LIGHT} strokeWidth="5" strokeLinecap="round" />
		<line x1="43" y1="94" x2="57" y2="94" stroke={ORANGE_LIGHT} strokeWidth="5" strokeLinecap="round" />
	</svg>
);

const BellIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path d="M50 10C36 10 28 22 28 38V56L18 72H82L72 56V38C72 22 64 10 50 10Z" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
		<path d="M42 82C42 88 46 92 50 92C54 92 58 88 58 82" stroke={ORANGE_LIGHT} strokeWidth="5" strokeLinecap="round" />
	</svg>
);

const CameraIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<rect x="10" y="30" width="80" height="54" rx="10" stroke={stroke} strokeWidth="5" />
		<path d="M35 30L42 18H58L65 30" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
		<circle cx="50" cy="57" r="16" stroke={ORANGE_LIGHT} strokeWidth="5" />
	</svg>
);

const VacuumIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<circle cx="50" cy="50" r="38" stroke={stroke} strokeWidth="5" />
		<circle cx="50" cy="50" r="10" fill={stroke} />
		<path d="M50 12V22M88 50H78M50 88V78M12 50H22" stroke={ORANGE_LIGHT} strokeWidth="5" strokeLinecap="round" />
	</svg>
);

const SpeakerIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<circle cx="50" cy="50" r="42" stroke={stroke} strokeWidth="5" />
		<circle cx="50" cy="50" r="20" stroke={ORANGE_LIGHT} strokeWidth="5" />
		<circle cx="50" cy="50" r="5" fill={stroke} />
	</svg>
);

const ScreenIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<rect x="8" y="18" width="84" height="54" rx="6" stroke={stroke} strokeWidth="5" />
		<path d="M36 88H64" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
		<path d="M42 36L64 45L42 54Z" fill={ORANGE_LIGHT} stroke={ORANGE_LIGHT} strokeWidth="3" strokeLinejoin="round" />
	</svg>
);

const LeafIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path d="M18 82C18 40 46 16 84 12C84 50 62 78 22 84Z" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
		<path d="M24 78C36 62 48 48 72 24" stroke={ORANGE_LIGHT} strokeWidth="4" strokeLinecap="round" />
	</svg>
);

const SparkleIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path d="M50 6C50 30 56 42 78 48C56 54 50 66 50 90C50 66 44 54 22 48C44 42 50 30 50 6Z" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
		<circle cx="78" cy="18" r="4" fill={ORANGE_LIGHT} />
		<circle cx="20" cy="76" r="4" fill={ORANGE_LIGHT} />
	</svg>
);

const WandIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<path d="M22 88L68 42" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
		<path d="M70 12L74 22L84 26L74 30L70 40L66 30L56 26L66 22Z" fill={ORANGE_LIGHT} stroke={ORANGE_LIGHT} strokeLinejoin="round" />
	</svg>
);

const BladeIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<rect x="16" y="44" width="56" height="12" rx="6" stroke={stroke} strokeWidth="5" />
		<path d="M72 50L90 50" stroke={ORANGE_LIGHT} strokeWidth="5" strokeLinecap="round" />
		<path d="M16 44L16 56" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
	</svg>
);

const PatchIcon: React.FC<IconProps> = ({size = 90, stroke = ORANGE}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
		<circle cx="50" cy="50" r="34" stroke={stroke} strokeWidth="5" />
		<circle cx="50" cy="50" r="14" stroke={ORANGE_LIGHT} strokeWidth="4" strokeDasharray="4 4" />
	</svg>
);

const ICONS: Record<IconKey, React.FC<IconProps & {frame?: number}>> = {
	sun: SunIcon,
	droplet: DropletIcon,
	shield: ShieldIcon,
	star: StarIcon,
	bolt: BoltIcon,
	bulb: BulbIcon,
	bell: BellIcon,
	camera: CameraIcon,
	vacuum: VacuumIcon,
	speaker: SpeakerIcon,
	screen: ScreenIcon,
	leaf: LeafIcon,
	sparkle: SparkleIcon,
	wand: WandIcon,
	blade: BladeIcon,
	patch: PatchIcon,
};

const Grain: React.FC = () => (
	<AbsoluteFill
		style={{
			backgroundImage:
				"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
			opacity: 0.035,
			mixBlendMode: 'multiply',
			pointerEvents: 'none',
		}}
	/>
);

const HookBeat: React.FC<{hookLine: string; benefitLine: string; iconKey: IconKey}> = ({hookLine, benefitLine, iconKey}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = hookLine.split(' ');
	const benefitIn = spring({frame: frame - 34, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const iconIn = spring({frame, fps, from: 0, to: 1, config: {damping: 12, mass: 0.6}});
	const Icon = ICONS[iconKey];

	return (
		<AbsoluteFill style={{backgroundColor: CREAM, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<div style={{position: 'absolute', top: 130, opacity: iconIn, transform: `scale(${iconIn})`}}>
				<Icon frame={frame} size={110} />
			</div>
			<div style={{width: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
				<div
					style={{
						fontFamily: 'Arial, sans-serif',
						fontWeight: 800,
						fontSize: 62,
						lineHeight: 1.15,
						color: INK,
						textAlign: 'center',
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						rowGap: 4,
					}}
				>
					{words.map((word, i) => {
						const delay = 2 + i * 3;
						const wIn = spring({frame: frame - delay, fps, from: 0, to: 1, config: {damping: 14, mass: 0.5}});
						return (
							<span
								key={i}
								style={{
									display: 'inline-block',
									marginRight: 16,
									opacity: wIn,
									transform: `translateY(${(1 - wIn) * 24}px)`,
								}}
							>
								{word}
							</span>
						);
					})}
				</div>
				<div style={{width: 70, height: 4, background: ORANGE, borderRadius: 2, opacity: benefitIn}} />
				<div
					style={{
						fontFamily: 'Arial, sans-serif',
						fontWeight: 600,
						fontSize: 34,
						lineHeight: 1.4,
						color: `${INK}cc`,
						textAlign: 'center',
						padding: '0 60px',
						opacity: benefitIn,
						transform: `translateY(${(1 - benefitIn) * 14}px)`,
					}}
				>
					{benefitLine}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const CtaBeat: React.FC<{brandLine: string; subLine: string; cta: string; link: string; iconKey: IconKey}> = ({
	brandLine,
	subLine,
	cta,
	link,
	iconKey,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brandIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const subIn = spring({frame: frame - 8, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const ctaIn = spring({frame: frame - 24, fps, from: 0.85, to: 1, config: {damping: 12, mass: 0.7}});
	const ctaOpacity = interpolate(frame, [24, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pulse = 1 + Math.sin(frame / 9) * 0.025;
	const linkIn = spring({frame: frame - 40, fps, from: 0, to: 1, config: {damping: 15, mass: 0.6}});
	const Icon = ICONS[iconKey];

	return (
		<AbsoluteFill style={{backgroundColor: INK, alignItems: 'center', justifyContent: 'center'}}>
			<Grain />
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					gap: 34,
					marginBottom: 40,
					opacity: brandIn,
					transform: `translateY(${(1 - brandIn) * 12}px)`,
				}}
			>
				<Icon size={70} />
				<StarIcon size={70} />
			</div>
			<div
				style={{
					fontFamily: 'Arial, sans-serif',
					fontWeight: 800,
					fontSize: 46,
					color: CREAM,
					textAlign: 'center',
					padding: '0 90px',
					opacity: brandIn,
					transform: `translateY(${(1 - brandIn) * 12}px)`,
				}}
			>
				{brandLine}
			</div>
			<div
				style={{
					marginTop: 18,
					fontFamily: 'Arial, sans-serif',
					fontWeight: 600,
					fontSize: 26,
					letterSpacing: 1,
					color: ORANGE_LIGHT,
					textAlign: 'center',
					padding: '0 70px',
					opacity: subIn,
					transform: `translateY(${(1 - subIn) * 10}px)`,
				}}
			>
				{subLine}
			</div>
			<div
				style={{
					marginTop: 50,
					padding: '24px 56px',
					borderRadius: 999,
					background: ORANGE,
					opacity: ctaOpacity,
					transform: `scale(${ctaIn * pulse})`,
					boxShadow: `0 0 40px ${ORANGE}55`,
				}}
			>
				<span style={{fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 34, color: INK}}>{cta}</span>
			</div>
			<div
				style={{
					marginTop: 26,
					fontFamily: 'Arial, sans-serif',
					fontWeight: 600,
					fontSize: 24,
					color: `${CREAM}99`,
					opacity: linkIn,
				}}
			>
				{link}
			</div>
		</AbsoluteFill>
	);
};

export const AffiliateMotionAd: React.FC<AffiliateMotionProps> = ({
	hookLine,
	benefitLine,
	brandLine,
	subLine,
	cta,
	link,
	iconKey,
	music,
}) => {
	const timing = linearTiming({durationInFrames: s2f(TRANSITION_SECONDS)});
	const key: IconKey = iconKey ?? 'star';

	return (
		<AbsoluteFill style={{backgroundColor: INK}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(HOOK_SECONDS)}>
					<HookBeat hookLine={hookLine} benefitLine={benefitLine} iconKey={key} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />
				<TransitionSeries.Sequence durationInFrames={s2f(CTA_SECONDS)}>
					<CtaBeat brandLine={brandLine} subLine={subLine} cta={cta} link={link} iconKey={key} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.55} /> : null}
		</AbsoluteFill>
	);
};

export const calculateAffiliateMotionMetadata = () => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const total = s2f(HOOK_SECONDS) + s2f(CTA_SECONDS) - transitionFrames;
	return {durationInFrames: total};
};
