import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// A bespoke "brand story" ad for theadzstudio itself (not a client product
// template like the other layouts) - punchy problem/solution text cards
// instead of photos, closing on the wordmark + CTA.
export const storySchema = z.object({
	brand: z.string(),
	tagline: z.string(),
	lines: z.array(z.object({text: z.string(), tone: z.enum(['problem', 'solution', 'punch'])})),
	cta: z.string(),
	link: z.string(),
	music: z.string(),
	totalFrames: z.number().optional(),
});

export type StoryProps = z.infer<typeof storySchema>;

const FPS = 30;
const NAVY = '#1B2440';
const CREAM = '#FBF9F4';
const ORANGE = '#F2994A';
const BLUE = '#2F80ED';
const FONT = '"Georgia", "Times New Roman", serif';

const secondsToFrames = (s: number) => Math.round(s * FPS);

// Grain texture as a static SVG filter (fixed seed, not resampled per frame)
// - adds tooth to otherwise flat gradients without any flicker.
const GRAIN_URL =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

type Tone = 'problem' | 'solution' | 'punch' | 'brand';

const TONE_BG: Record<Tone, string> = {
	brand: `radial-gradient(ellipse at 50% 30%, ${CREAM} 0%, #F1ECE0 55%, #E7DFCC 100%)`,
	problem: `linear-gradient(160deg, #232D52 0%, ${NAVY} 55%, #10162C 100%)`,
	solution: `linear-gradient(160deg, ${BLUE} 0%, #23407A 45%, ${NAVY} 100%)`,
	punch: `linear-gradient(160deg, #FFB169 0%, ${ORANGE} 55%, #D9762A 100%)`,
};

const TONE_ORBS: Record<Tone, [string, string]> = {
	brand: [BLUE, ORANGE],
	problem: [BLUE, '#4A5CA8'],
	solution: [ORANGE, '#7FB2FF'],
	punch: [NAVY, '#FFE3C2'],
};

// Soft blurred color orbs drifting slowly behind the text, plus a vignette
// and fine grain - turns a flat tone card into something with depth.
const StoryBackground: React.FC<{tone: Tone; children?: React.ReactNode}> = ({tone, children}) => {
	const frame = useCurrentFrame();
	const [orbA, orbB] = TONE_ORBS[tone];

	const drift1X = 18 + Math.sin(frame / 90) * 6;
	const drift1Y = 14 + Math.cos(frame / 110) * 5;
	const drift2X = 78 + Math.sin(frame / 130 + 2) * 5;
	const drift2Y = 82 + Math.cos(frame / 100 + 1) * 6;
	const pulse = 1 + Math.sin(frame / 70) * 0.06;

	return (
		<AbsoluteFill style={{background: TONE_BG[tone], overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: `${drift1X}%`,
					top: `${drift1Y}%`,
					width: 560,
					height: 560,
					marginLeft: -280,
					marginTop: -280,
					borderRadius: '50%',
					background: orbA,
					opacity: 0.32,
					filter: 'blur(110px)',
					transform: `scale(${pulse})`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: `${drift2X}%`,
					top: `${drift2Y}%`,
					width: 460,
					height: 460,
					marginLeft: -230,
					marginTop: -230,
					borderRadius: '50%',
					background: orbB,
					opacity: 0.26,
					filter: 'blur(100px)',
				}}
			/>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at 50% 45%, transparent 42%, rgba(10,12,24,0.35) 100%)',
				}}
			/>
			<AbsoluteFill style={{backgroundImage: GRAIN_URL, opacity: 0.05, mixBlendMode: 'overlay'}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const calculateStoryMetadata = async ({props}: {props: StoryProps}) => {
	const introFrames = secondsToFrames(2.6);
	const outroFrames = secondsToFrames(3.6);
	const lineFrames = props.lines.map(() => secondsToFrames(3.4));
	const transitionFrames = secondsToFrames(0.4);
	const segments = 2 + props.lines.length;
	const total = introFrames + lineFrames.reduce((a, b) => a + b, 0) + outroFrames - (segments - 1) * transitionFrames;
	return {durationInFrames: total, props: {...props, totalFrames: total}};
};

const Wordmark: React.FC<{brand: string; tagline: string; scale?: number}> = ({brand, tagline, scale = 1}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.85, to: 1, config: {damping: 14, mass: 0.6, stiffness: 110}});
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${pop * scale})`}}>
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
			<div style={{fontFamily: FONT, fontWeight: 700, fontSize: 64, color: NAVY, letterSpacing: 0.5}}>{brand}</div>
			<div
				style={{
					fontFamily: '"Arial", sans-serif',
					fontWeight: 700,
					fontSize: 20,
					letterSpacing: 4,
					color: ORANGE,
					marginTop: 10,
				}}
			>
				{tagline.toUpperCase()}
			</div>
		</div>
	);
};

const IntroCard: React.FC<{brand: string; tagline: string}> = ({brand, tagline}) => (
	<StoryBackground tone="brand">
		<Wordmark brand={brand} tagline={tagline} />
	</StoryBackground>
);

const LineCard: React.FC<{text: string; tone: 'problem' | 'solution' | 'punch'}> = ({text, tone}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const y = interpolate(frame, [0, 14], [22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const color = tone === 'punch' ? NAVY : CREAM;
	const accent = tone === 'punch' ? NAVY : tone === 'problem' ? '#9AA3D6' : '#FFE3C2';

	return (
		<StoryBackground tone={tone}>
			<div style={{padding: '0 90px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div
					style={{
						position: 'absolute',
						top: 64,
						fontFamily: '"Arial", sans-serif',
						fontWeight: 700,
						fontSize: 18,
						letterSpacing: 3,
						color: accent,
						opacity,
					}}
				>
					{tone === 'problem' ? 'THE PROBLEM' : tone === 'solution' ? 'THE FIX' : 'WHY IT WORKS'}
				</div>
				<div
					style={{
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 56,
						lineHeight: 1.25,
						textAlign: 'center',
						color,
						opacity,
						textShadow: tone === 'punch' ? 'none' : '0 4px 24px rgba(0,0,0,0.35)',
						transform: `translateY(${y}px)`,
					}}
				>
					{text}
				</div>
			</div>
		</StoryBackground>
	);
};

const OutroCard: React.FC<{brand: string; cta: string; link: string}> = ({brand, cta, link}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const buttonScale = spring({frame, fps, from: 0.85, to: 1, config: {damping: 14, mass: 0.6, stiffness: 110}});
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<StoryBackground tone="brand">
			<div style={{opacity, transform: `scale(${buttonScale})`, marginBottom: 34}}>
				<div
					style={{
						padding: '20px 46px',
						borderRadius: 12,
						background: `linear-gradient(135deg, ${BLUE} 0%, ${ORANGE} 100%)`,
						color: 'white',
						fontFamily: '"Arial", sans-serif',
						fontWeight: 800,
						fontSize: 34,
						boxShadow: '0 16px 34px rgba(47,128,237,0.35)',
					}}
				>
					{cta}
				</div>
			</div>
			<div style={{opacity, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: NAVY, marginBottom: 6}}>{brand}</div>
			<div style={{opacity, fontFamily: '"Arial", sans-serif', fontSize: 22, color: '#6B7291'}}>{link}</div>
		</StoryBackground>
	);
};

export const StoryAd: React.FC<StoryProps> = ({brand, tagline, lines, cta, link, music}) => {
	const introFrames = secondsToFrames(2.6);
	const outroFrames = secondsToFrames(3.6);
	const transitionFrames = secondsToFrames(0.4);
	const timing = linearTiming({durationInFrames: transitionFrames});

	return (
		<>
			{music ? <Audio src={music} volume={0.5} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={introFrames}>
					<IntroCard brand={brand} tagline={tagline} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				{lines.map((line, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={secondsToFrames(3.4)}>
							<LineCard text={line.text} tone={line.tone} />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition presentation={fade()} timing={timing} />
					</React.Fragment>
				))}

				<TransitionSeries.Sequence durationInFrames={outroFrames}>
					<OutroCard brand={brand} cta={cta} link={link} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
