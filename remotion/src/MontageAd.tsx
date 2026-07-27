import React from 'react';
import {Audio} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';
import {TitleCard} from './TitleCard';
import {PhotoSlide} from './PhotoSlide';
import {FeatureBullets} from './FeatureBullets';
import {CtaEnd} from './CtaEnd';
import {getAudioDurationSeconds} from './audio-duration';
import {
	ABSOLUTE_MAX_DURATION_SECONDS,
	ABSOLUTE_MIN_DURATION_SECONDS,
	CTA_SECONDS,
	FEATURES_SECONDS,
	FPS,
	HERO_SECONDS,
	MAX_DURATION_SECONDS,
	MIN_DURATION_SECONDS,
	MIN_PHOTO_SECONDS_EACH,
	MIN_SCALED_CTA_SECONDS,
	MIN_SCALED_FEATURES_SECONDS,
	MIN_SCALED_HERO_SECONDS,
	MIN_SCALED_TITLE_SECONDS,
	TITLE_SECONDS,
	TRANSITION_SECONDS,
} from './constants';

export const montageSchema = z.object({
	title: z.string(),
	// Optional lead visual shown before everything else (e.g. a pre-designed
	// promo/launch banner) - gets its own longer duration and no title strap,
	// since it's typically already fully art-directed on its own.
	heroImage: z.string().optional(),
	features: z.array(z.string()),
	// Optional second attributes card, shown right after the first, for
	// products with more selling points than fit on one screen.
	features2: z.array(z.string()).optional(),
	cta: z.string(),
	link: z.string(),
	images: z.array(z.string()),
	music: z.string(),
	logoPath: z.string().optional(),
	// Explicit total length request (e.g. 15 for a TikTok cut, 60 for a
	// longer YouTube ad). When omitted, length follows the music track as
	// before, clamped to [MIN_DURATION_SECONDS, MAX_DURATION_SECONDS].
	durationSeconds: z.number().optional(),
	// Injected by calculateMontageMetadata (computed in Node from the actual
	// audio duration) so the component - which renders in the browser and
	// can't read the filesystem itself - knows exactly how many frames it has
	// to fill. Without this the photo section can't be sized correctly and
	// the CTA card can end up pushed past the end of the video.
	totalFrames: z.number().optional(),
});

export type MontageProps = z.infer<typeof montageSchema>;

const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);

// Same budgeting approach as the Python backend: reserve frames for the
// title/features/CTA cards, then fill whatever's left with photos.
export const calculateMontageMetadata = async ({props}: {props: MontageProps}) => {
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
	const durationInFrames = secondsToFrames(totalSeconds);

	return {durationInFrames, props: {...props, totalFrames: durationInFrames}};
};

type Segment =
	| {kind: 'title'; frames: number; title: string; logoPath?: string}
	| {kind: 'photo'; frames: number; src: string; title?: string}
	| {kind: 'features'; frames: number; features: string[]}
	| {kind: 'cta'; frames: number; cta: string; link: string; logoPath?: string};

export const MontageAd: React.FC<MontageProps> = ({
	title,
	heroImage,
	features,
	features2,
	cta,
	link,
	images,
	music,
	logoPath,
	totalFrames,
}) => {
	// Falls back to the max only for the Remotion Studio preview, where
	// calculateMetadata may not have run yet against real props.
	const effectiveTotalFrames = totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS);
	const effectiveTotalSeconds = effectiveTotalFrames / FPS;

	// For short ads (below the original 25s design baseline), shrink the
	// intro/features/CTA cards proportionally instead of leaving them at
	// full length and starving the photo section - a 15s ad can't afford a
	// 4s title card the same way a 30s one can. Longer-than-baseline ads
	// keep these at their normal length; the extra time just goes to photos.
	const scale = Math.min(1, effectiveTotalSeconds / MIN_DURATION_SECONDS);
	const scaled = (base: number, floor: number) => Math.max(floor, base * scale);

	const heroFrames = heroImage ? secondsToFrames(scaled(HERO_SECONDS, MIN_SCALED_HERO_SECONDS)) : 0;
	const titleFrames = title ? secondsToFrames(scaled(TITLE_SECONDS, MIN_SCALED_TITLE_SECONDS)) : 0;
	const ctaFrames = secondsToFrames(scaled(CTA_SECONDS, MIN_SCALED_CTA_SECONDS));
	const featuresFrames =
		features.length > 0 ? secondsToFrames(scaled(FEATURES_SECONDS, MIN_SCALED_FEATURES_SECONDS)) : 0;
	const features2Frames =
		features2 && features2.length > 0 ? secondsToFrames(scaled(FEATURES_SECONDS, MIN_SCALED_FEATURES_SECONDS)) : 0;
	const transitionFrames = secondsToFrames(TRANSITION_SECONDS);
	const minPhotoFrames = secondsToFrames(MIN_PHOTO_SECONDS_EACH);
	const photoBudgetFrames = Math.max(
		minPhotoFrames,
		effectiveTotalFrames - heroFrames - titleFrames - ctaFrames - featuresFrames - features2Frames
	);

	// Every uploaded photo gets exactly one slot - no repeats - with the
	// available time split evenly between them, instead of cycling through
	// the same images to fill a fixed per-photo duration.
	const slotCount = images.length;
	const photoFramesEach = slotCount > 0 ? Math.max(minPhotoFrames, Math.floor(photoBudgetFrames / slotCount)) : 0;

	const segments: Segment[] = [];
	if (heroImage) segments.push({kind: 'photo', frames: heroFrames, src: heroImage});
	if (title) segments.push({kind: 'title', frames: titleFrames, title, logoPath});
	for (let i = 0; i < slotCount; i++) {
		segments.push({kind: 'photo', frames: photoFramesEach, src: images[i], title});
	}
	if (featuresFrames > 0) segments.push({kind: 'features', frames: featuresFrames, features});
	if (features2Frames > 0) segments.push({kind: 'features', frames: features2Frames, features: features2 as string[]});
	segments.push({kind: 'cta', frames: ctaFrames, cta, link, logoPath});

	// TransitionSeries overlaps every adjacent pair of sequences by the
	// transition's duration, so the rendered total is shorter than the raw
	// sum of segment lengths. Extend the last segment (the CTA) by that
	// overlap so the video always fills exactly effectiveTotalFrames instead
	// of ending a bit short with silent/blank trailing frames.
	const transitionsCount = Math.max(0, segments.length - 1);
	const rawTotal = segments.reduce((sum, s) => sum + s.frames, 0);
	const deficit = effectiveTotalFrames - (rawTotal - transitionsCount * transitionFrames);
	if (deficit > 0) {
		segments[segments.length - 1].frames += deficit;
	}

	return (
		<>
			{music ? <Audio src={music} /> : null}
			<TransitionSeries>
				{segments.map((segment, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={segment.frames}>
							{segment.kind === 'title' ? (
								<TitleCard title={segment.title} logoPath={segment.logoPath} />
							) : null}
							{segment.kind === 'photo' ? <PhotoSlide src={segment.src} title={segment.title} /> : null}
							{segment.kind === 'features' ? <FeatureBullets features={segment.features} /> : null}
							{segment.kind === 'cta' ? (
								<CtaEnd cta={segment.cta} link={segment.link} logoPath={segment.logoPath} />
							) : null}
						</TransitionSeries.Sequence>
						{i < segments.length - 1 ? (
							<TransitionSeries.Transition
								presentation={fade()}
								timing={linearTiming({durationInFrames: transitionFrames})}
							/>
						) : null}
					</React.Fragment>
				))}
			</TransitionSeries>
		</>
	);
};
