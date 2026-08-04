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
	<AbsoluteFill style={{background: CREAM, alignItems: 'center', justifyContent: 'center'}}>
		<Wordmark brand={brand} tagline={tagline} />
	</AbsoluteFill>
);

const LineCard: React.FC<{text: string; tone: 'problem' | 'solution' | 'punch'}> = ({text, tone}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const y = interpolate(frame, [0, 14], [22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const bg = tone === 'problem' ? NAVY : tone === 'solution' ? `linear-gradient(160deg, ${BLUE} 0%, ${NAVY} 100%)` : ORANGE;
	const color = tone === 'punch' ? NAVY : CREAM;
	const accent = tone === 'punch' ? NAVY : tone === 'problem' ? '#8B93B8' : '#FFD9AE';

	return (
		<AbsoluteFill style={{background: bg, alignItems: 'center', justifyContent: 'center', padding: '0 90px'}}>
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
					transform: `translateY(${y}px)`,
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

const OutroCard: React.FC<{brand: string; cta: string; link: string}> = ({brand, cta, link}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const buttonScale = spring({frame, fps, from: 0.85, to: 1, config: {damping: 14, mass: 0.6, stiffness: 110}});
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: CREAM, alignItems: 'center', justifyContent: 'center'}}>
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
					}}
				>
					{cta}
				</div>
			</div>
			<div style={{opacity, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: NAVY, marginBottom: 6}}>{brand}</div>
			<div style={{opacity, fontFamily: '"Arial", sans-serif', fontSize: 22, color: '#6B7291'}}>{link}</div>
		</AbsoluteFill>
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
