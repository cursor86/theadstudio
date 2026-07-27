import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';
import {CtaEnd} from './CtaEnd';
import {getAudioDurationSeconds} from './audio-duration';
import {
	ABSOLUTE_MAX_DURATION_SECONDS,
	ABSOLUTE_MIN_DURATION_SECONDS,
	CTA_SECONDS,
	FONT_FAMILY,
	FPS,
	GOLD,
	MAX_DURATION_SECONDS,
	MIN_DURATION_SECONDS,
	MIN_SCALED_CTA_SECONDS,
} from './constants';

// "Demo-tainment": fast, punchy problem -> product -> quick demo beats,
// styled more like a meme/hook-driven TikTok than the calmer MontageAd or
// KenBurnsAd - short, snappy cuts with bouncy caption pop-ins instead of
// slow fades.
export const demoTainmentSchema = z.object({
	problem: z.string(), // opening hook/pain point, e.g. "Tired of tangled cables?"
	images: z.array(z.string()),
	captions: z.array(z.string()), // one per image, punchy/short
	cta: z.string(),
	link: z.string(),
	music: z.string(),
	logoPath: z.string().optional(),
	durationSeconds: z.number().optional(),
	totalFrames: z.number().optional(),
});

export type DemoTainmentProps = z.infer<typeof demoTainmentSchema>;

const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);
const PROBLEM_SECONDS = 2.4;
const MIN_BEAT_SECONDS = 1.6;

export const calculateDemoTainmentMetadata = async ({props}: {props: DemoTainmentProps}) => {
	let totalSeconds: number;
	if (props.durationSeconds) {
		totalSeconds = Math.max(
			ABSOLUTE_MIN_DURATION_SECONDS,
			Math.min(props.durationSeconds, ABSOLUTE_MAX_DURATION_SECONDS)
		);
	} else {
		const audioDuration = props.music ? await getAudioDurationSeconds(props.music) : MIN_DURATION_SECONDS;
		totalSeconds = Math.max(MIN_DURATION_SECONDS, Math.min(audioDuration, MAX_DURATION_SECONDS));
	}
	return {durationInFrames: secondsToFrames(totalSeconds), props: {...props, totalFrames: secondsToFrames(totalSeconds)}};
};

const ProblemScreen: React.FC<{problem: string}> = ({problem}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const punch = spring({frame, fps, config: {damping: 9, mass: 0.5, stiffness: 160}});
	const scale = interpolate(punch, [0, 1], [0.7, 1]);
	const shake = Math.sin(frame * 2.2) * (frame < 10 ? 4 : 0);

	return (
		<AbsoluteFill
			style={{
				background: 'radial-gradient(circle at 50% 45%, #7a1a1a 0%, #240808 75%)',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '0 80px',
			}}
		>
			<div
				style={{
					transform: `scale(${scale}) rotate(${shake}deg)`,
					color: 'white',
					fontFamily: FONT_FAMILY,
					fontWeight: 900,
					fontSize: 74,
					lineHeight: 1.15,
					textAlign: 'center',
					textShadow: '0 8px 24px rgba(0,0,0,0.5)',
				}}
			>
				{problem}
			</div>
		</AbsoluteFill>
	);
};

const DemoBeat: React.FC<{src: string; caption: string}> = ({src, caption}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const punch = spring({frame, fps, config: {damping: 10, mass: 0.4, stiffness: 200}});
	const imgScale = interpolate(punch, [0, 1], [1.15, 1]);
	const captionPunch = spring({frame: frame - 4, fps, config: {damping: 9, mass: 0.4, stiffness: 220}});
	const captionScale = interpolate(captionPunch, [0, 1], [0.6, 1]);

	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<Img
				src={src}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${imgScale})`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: 130,
					left: 50,
					right: 50,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						transform: `scale(${captionScale})`,
						background: GOLD,
						color: '#170F22',
						fontFamily: FONT_FAMILY,
						fontWeight: 900,
						fontSize: 44,
						padding: '18px 40px',
						borderRadius: 14,
						textAlign: 'center',
						boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
					}}
				>
					{caption}
				</div>
			</div>
		</AbsoluteFill>
	);
};

type Segment =
	| {kind: 'problem'; frames: number; problem: string}
	| {kind: 'beat'; frames: number; src: string; caption: string}
	| {kind: 'cta'; frames: number; cta: string; link: string; logoPath?: string};

export const DemoTainmentAd: React.FC<DemoTainmentProps> = ({
	problem,
	images,
	captions,
	cta,
	link,
	music,
	logoPath,
	totalFrames,
}) => {
	const effectiveTotalFrames = totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS);
	const scale = Math.min(1, effectiveTotalFrames / FPS / MIN_DURATION_SECONDS);

	const ctaFrames = secondsToFrames(Math.max(MIN_SCALED_CTA_SECONDS, CTA_SECONDS * scale));
	const problemFrames = problem ? secondsToFrames(Math.max(1.5, PROBLEM_SECONDS * scale)) : 0;
	// No cross-fade transitions here on purpose - hard cuts are part of the
	// fast-paced feel, so segments are simply sequential.

	const beatBudget = Math.max(secondsToFrames(MIN_BEAT_SECONDS), effectiveTotalFrames - ctaFrames - problemFrames);
	const beatFramesEach =
		images.length > 0
			? Math.max(secondsToFrames(MIN_BEAT_SECONDS), Math.floor(beatBudget / images.length))
			: 0;

	const segments: Segment[] = [];
	if (problem) segments.push({kind: 'problem', frames: problemFrames, problem});
	images.forEach((src, i) => {
		segments.push({kind: 'beat', frames: beatFramesEach, src, caption: captions[i] ?? ''});
	});
	segments.push({kind: 'cta', frames: ctaFrames, cta, link, logoPath});

	// Only one cross-fade exists (into the CTA), so only its overlap needs
	// to be accounted for when sizing the last segment to hit the exact total.
	const finalTransitionFrames = secondsToFrames(0.3);
	const rawTotal = segments.reduce((sum, s) => sum + s.frames, 0);
	const deficit = effectiveTotalFrames - (rawTotal - finalTransitionFrames);
	if (deficit > 0) segments[segments.length - 1].frames += deficit;

	return (
		<>
			{music ? <Audio src={music} /> : null}
			<TransitionSeries>
				{segments.map((segment, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={segment.frames}>
							{segment.kind === 'problem' ? <ProblemScreen problem={segment.problem} /> : null}
							{segment.kind === 'beat' ? <DemoBeat src={segment.src} caption={segment.caption} /> : null}
							{segment.kind === 'cta' ? (
								<CtaEnd cta={segment.cta} link={segment.link} logoPath={segment.logoPath} />
							) : null}
						</TransitionSeries.Sequence>
						{i === segments.length - 2 ? (
							<TransitionSeries.Transition
								presentation={fade()}
								timing={linearTiming({durationInFrames: secondsToFrames(0.3)})}
							/>
						) : null}
					</React.Fragment>
				))}
			</TransitionSeries>
		</>
	);
};
