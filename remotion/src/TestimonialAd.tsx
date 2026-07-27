import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, useCurrentFrame} from 'remotion';
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
	TRANSITION_SECONDS,
} from './constants';

// A "UGC testimonial" style built from review/quote cards (star rating,
// quote, reviewer name) - NOT a talking-head/actor video, since this
// pipeline has no real presenter or AI avatar. Reads like a screenshotted
// customer review rather than pretending to be a filmed testimonial.
export const testimonialSchema = z.object({
	reviews: z.array(
		z.object({
			quote: z.string(),
			name: z.string(),
			rating: z.number().min(1).max(5).optional(),
		})
	),
	productImage: z.string().optional(),
	cta: z.string(),
	link: z.string(),
	music: z.string(),
	logoPath: z.string().optional(),
	durationSeconds: z.number().optional(),
	totalFrames: z.number().optional(),
});

export type TestimonialProps = z.infer<typeof testimonialSchema>;

const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);
const REVIEW_SECONDS = 5.5;
const PRODUCT_SECONDS = 3;

export const calculateTestimonialMetadata = async ({props}: {props: TestimonialProps}) => {
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

const Stars: React.FC<{rating: number; frame: number}> = ({rating, frame}) => (
	<div style={{display: 'flex', gap: 12, marginBottom: 40}}>
		{[1, 2, 3, 4, 5].map((i) => {
			const delay = i * 4;
			const scale = interpolate(frame, [delay, delay + 12], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
			return (
				<span
					key={i}
					style={{
						fontSize: 56,
						transform: `scale(${scale})`,
						color: i <= rating ? GOLD : 'rgba(255,255,255,0.2)',
					}}
				>
					★
				</span>
			);
		})}
	</div>
);

const ReviewCard: React.FC<{quote: string; name: string; rating: number}> = ({quote, name, rating}) => {
	const frame = useCurrentFrame();
	const quoteOpacity = interpolate(frame, [15, 35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const quoteY = interpolate(frame, [15, 35], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const nameOpacity = interpolate(frame, [45, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill
			style={{
				background: 'radial-gradient(circle at 50% 30%, #202030 0%, #0c0c14 70%)',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				padding: '0 90px',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 40,
					fontSize: 260,
					color: 'rgba(212,175,55,0.12)',
					fontFamily: 'Georgia, serif',
					fontWeight: 900,
				}}
			>
				&#8220;
			</div>
			<Stars rating={rating} frame={frame} />
			<div
				style={{
					opacity: quoteOpacity,
					transform: `translateY(${quoteY}px)`,
					color: 'white',
					fontFamily: FONT_FAMILY,
					fontWeight: 700,
					fontSize: 50,
					lineHeight: 1.35,
					textAlign: 'center',
				}}
			>
				&#8220;{quote}&#8221;
			</div>
			<div
				style={{
					opacity: nameOpacity,
					marginTop: 46,
					color: GOLD,
					fontFamily: FONT_FAMILY,
					fontWeight: 700,
					fontSize: 32,
				}}
			>
				&mdash; {name}
			</div>
			<div
				style={{
					opacity: nameOpacity,
					marginTop: 10,
					color: 'rgba(255,255,255,0.5)',
					fontFamily: FONT_FAMILY,
					fontWeight: 600,
					fontSize: 24,
					letterSpacing: 2,
				}}
			>
				VERIFIED CUSTOMER
			</div>
		</AbsoluteFill>
	);
};

const ProductBeat: React.FC<{src: string}> = ({src}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Img
				src={src}
				style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity}}
			/>
		</AbsoluteFill>
	);
};

type Segment =
	| {kind: 'review'; frames: number; quote: string; name: string; rating: number}
	| {kind: 'product'; frames: number; src: string}
	| {kind: 'cta'; frames: number; cta: string; link: string; logoPath?: string};

export const TestimonialAd: React.FC<TestimonialProps> = ({
	reviews,
	productImage,
	cta,
	link,
	music,
	logoPath,
	totalFrames,
}) => {
	const effectiveTotalFrames = totalFrames ?? secondsToFrames(MAX_DURATION_SECONDS);
	const scale = Math.min(1, effectiveTotalFrames / FPS / MIN_DURATION_SECONDS);

	const ctaFrames = secondsToFrames(Math.max(MIN_SCALED_CTA_SECONDS, CTA_SECONDS * scale));
	const productFrames = productImage ? secondsToFrames(Math.max(1.5, PRODUCT_SECONDS * scale)) : 0;
	const transitionFrames = secondsToFrames(TRANSITION_SECONDS);

	const reserved = ctaFrames + productFrames;
	const reviewBudget = Math.max(secondsToFrames(3), effectiveTotalFrames - reserved);
	const reviewFramesEach =
		reviews.length > 0 ? Math.max(secondsToFrames(3), Math.floor(reviewBudget / reviews.length)) : 0;

	const segments: Segment[] = [];
	reviews.forEach((r) => {
		segments.push({kind: 'review', frames: reviewFramesEach, quote: r.quote, name: r.name, rating: r.rating ?? 5});
	});
	if (productImage) segments.push({kind: 'product', frames: productFrames, src: productImage});
	segments.push({kind: 'cta', frames: ctaFrames, cta, link, logoPath});

	const transitionsCount = Math.max(0, segments.length - 1);
	const rawTotal = segments.reduce((sum, s) => sum + s.frames, 0);
	const deficit = effectiveTotalFrames - (rawTotal - transitionsCount * transitionFrames);
	if (deficit > 0) segments[segments.length - 1].frames += deficit;

	return (
		<>
			{music ? <Audio src={music} /> : null}
			<TransitionSeries>
				{segments.map((segment, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={segment.frames}>
							{segment.kind === 'review' ? (
								<ReviewCard quote={segment.quote} name={segment.name} rating={segment.rating} />
							) : null}
							{segment.kind === 'product' ? <ProductBeat src={segment.src} /> : null}
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
