import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Case-study wrapper for theadzstudio's YouTube channel: new anonymized
// "how this client grew" intro cards + a new confidential outro, bracketing
// a trimmed clip of the original delivered ad. The trim points cut out the
// client's own branded intro card and branded CTA/watermark card entirely
// (rather than trying to paint over baked-in text), so no client branding
// survives anywhere in the final render.
export const slimeCaseStudySchema = z.object({
	storyLines: z.array(z.string()),
	videoSrc: z.string(),
	videoStartSeconds: z.number(),
	videoEndSeconds: z.number(),
	outroLine1: z.string(),
	outroLine2: z.string(),
	contact: z.string(),
	logoPath: z.string().optional(),
	music: z.string().optional(),
});

export type SlimeCaseStudyProps = z.infer<typeof slimeCaseStudySchema>;

const FPS = 30;
const INK = '#1B0B2E';
const HOT_PINK = '#FF3E9D';
const PURPLE = '#7B2FF7';
const YELLOW = '#FFD93D';
const SKY = '#3EC6FF';
const FUNKY_FONT = '"Arial Rounded MT Bold", "Arial Black", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);
const popIn = (frame: number, fps: number, delay = 0, config = {damping: 12, mass: 0.6, stiffness: 160}) =>
	spring({frame: frame - delay, fps, from: 0, to: 1, config});

const Dots: React.FC = () => {
	const frame = useCurrentFrame();
	const dots = [
		{x: 8, y: 15, c: YELLOW},
		{x: 90, y: 10, c: HOT_PINK},
		{x: 6, y: 78, c: PURPLE},
		{x: 92, y: 72, c: SKY},
		{x: 50, y: 6, c: YELLOW},
		{x: 15, y: 92, c: HOT_PINK},
	];
	return (
		<>
			{dots.map((d, i) => {
				const bob = Math.sin(frame / 16 + i * 1.6) * 8;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${d.x}%`,
							top: `${d.y}%`,
							width: 18,
							height: 18,
							borderRadius: '50%',
							background: d.c,
							transform: `translateY(${bob}px)`,
						}}
					/>
				);
			})}
		</>
	);
};

const StoryCard: React.FC<{text: string; badge?: string}> = ({text, badge}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const scale = interpolate(pop, [0, 1], [0.85, 1]);
	const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: 'white', overflow: 'hidden'}}>
			<Dots />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 90px'}}>
				{badge ? (
					<div
						style={{
							opacity,
							transform: `scale(${scale})`,
							background: INK,
							color: 'white',
							fontFamily: FUNKY_FONT,
							fontWeight: 800,
							fontSize: 26,
							padding: '10px 24px',
							borderRadius: 999,
							marginBottom: 26,
						}}
					>
						{badge}
					</div>
				) : null}
				<div
					style={{
						opacity,
						transform: `scale(${scale})`,
						color: INK,
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 54,
						lineHeight: 1.3,
						textAlign: 'center',
					}}
				>
					{text}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const RevealCard: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const scale = interpolate(pop, [0, 1], [0.7, 1]);
	const arrowBob = Math.sin(frame / 6) * 10;
	const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: `linear-gradient(150deg, ${PURPLE} 0%, ${HOT_PINK} 100%)`, overflow: 'hidden'}}>
			<Dots />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 80px'}}>
				<div
					style={{
						opacity,
						transform: `scale(${scale})`,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 58,
						lineHeight: 1.3,
						textAlign: 'center',
						textShadow: '0 4px 0 rgba(0,0,0,0.2)',
						marginBottom: 30,
					}}
				>
					{text}
				</div>
				<div style={{opacity, transform: `translateY(${arrowBob}px)`, fontSize: 56}}>👇</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const OutroCard: React.FC<{line1: string; line2: string; contact: string; logoPath?: string}> = ({line1, line2, contact, logoPath}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = popIn(frame, fps);
	const badgeScale = interpolate(pop, [0, 1], [0.6, 1]);
	const line2Opacity = interpolate(frame, [16, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ctaOpacity = interpolate(frame, [34, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ctaScale = spring({frame: frame - 34, fps, config: {damping: 11, mass: 0.6, stiffness: 170}});

	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<Dots />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 80px'}}>
				{logoPath ? (
					<div style={{opacity: pop, transform: `scale(${badgeScale})`, marginBottom: 26}}>
						<Img src={logoPath} style={{width: 200, objectFit: 'contain'}} />
					</div>
				) : null}
				<div
					style={{
						opacity: pop,
						transform: `scale(${badgeScale})`,
						background: YELLOW,
						color: INK,
						fontFamily: FUNKY_FONT,
						fontWeight: 900,
						fontSize: 30,
						padding: '12px 28px',
						borderRadius: 999,
						marginBottom: 24,
					}}
				>
					{line1}
				</div>
				<div
					style={{
						opacity: line2Opacity,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 800,
						fontSize: 42,
						lineHeight: 1.3,
						textAlign: 'center',
						marginBottom: 34,
					}}
				>
					{line2}
				</div>
				<div
					style={{
						opacity: ctaOpacity,
						transform: `scale(${ctaScale})`,
						background: `linear-gradient(135deg, ${SKY} 0%, ${PURPLE} 100%)`,
						color: 'white',
						fontFamily: FUNKY_FONT,
						fontWeight: 800,
						fontSize: 28,
						padding: '18px 34px',
						borderRadius: 999,
					}}
				>
					{contact}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const CARD_SECONDS = 2.1;
const OUTRO_SECONDS = 4.5;
const TRANSITION_SECONDS = 0.3;

export const calculateSlimeCaseStudyMetadata = ({props}: {props: SlimeCaseStudyProps}) => {
	const introFrames = props.storyLines.length * s2f(CARD_SECONDS);
	const revealFrames = s2f(CARD_SECONDS + 0.4);
	const clipFrames = s2f(props.videoEndSeconds - props.videoStartSeconds);
	const outroFrames = s2f(OUTRO_SECONDS);
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const totalSegments = props.storyLines.length + 1 /* reveal */ + 1 /* clip */ + 1 /* outro */;
	const total = introFrames + revealFrames + clipFrames + outroFrames - (totalSegments - 1) * transitionFrames;
	return {durationInFrames: total};
};

export const SlimeCaseStudyAd: React.FC<SlimeCaseStudyProps> = ({
	storyLines,
	videoSrc,
	videoStartSeconds,
	videoEndSeconds,
	outroLine1,
	outroLine2,
	contact,
	logoPath,
	music,
}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const timing = linearTiming({durationInFrames: transitionFrames});

	return (
		<>
			{music ? <Audio src={music} volume={0.55} /> : null}
			<TransitionSeries>
				{storyLines.map((line, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={s2f(CARD_SECONDS)}>
							<StoryCard text={line} badge={i === 0 ? 'CASE STUDY' : undefined} />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition presentation={fade()} timing={timing} />
					</React.Fragment>
				))}

				<TransitionSeries.Sequence durationInFrames={s2f(CARD_SECONDS + 0.4)}>
					<RevealCard text="Here's The Actual Ad We Built Them" />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(videoEndSeconds - videoStartSeconds)}>
					<AbsoluteFill style={{background: 'white'}}>
						<OffthreadVideo
							src={videoSrc}
							startFrom={s2f(videoStartSeconds)}
							endAt={s2f(videoEndSeconds)}
							muted
							style={{width: '100%', height: '100%', objectFit: 'cover'}}
						/>
					</AbsoluteFill>
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={s2f(OUTRO_SECONDS)}>
					<OutroCard line1={outroLine1} line2={outroLine2} contact={contact} logoPath={logoPath} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
