import React from 'react';
import {AbsoluteFill, Audio, Img, Series, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// 20s fast-paced reel: hard-cut product images alternating with bold caption
// slides, a white flash between every cut. Graphic sources (with baked-in
// text) render via contain so nothing gets cropped; plain photos use cover.
export const quickCaptionSchema = z.object({
	slides: z.array(
		z.object({
			src: z.string(),
			contain: z.boolean().optional(),
			posX: z.number().optional(),
			posY: z.number().optional(),
			caption: z.string(),
		})
	),
	music: z.string().optional(),
});

export type QuickCaptionProps = z.infer<typeof quickCaptionSchema>;

const FPS = 30;
const NAVY = '#1F3A5F';
const CORAL = '#E8735A';
const CREAM = '#FBF3E7';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const IMAGE_FRAMES = 74;
const CAPTION_FRAMES = 37;
const FLASH_FRAMES = 5;

const FlashOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = frame < 2 ? frame / 2 : Math.max(0, 1 - (frame - 2) / (FLASH_FRAMES - 2));
	return <AbsoluteFill style={{background: 'white', opacity}} />;
};

const ImageSlide: React.FC<{src: string; contain?: boolean; posX?: number; posY?: number}> = ({
	src,
	contain,
	posX = 50,
	posY = 45,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const punch = spring({
		frame,
		fps,
		from: contain ? 0.95 : 1.12,
		to: 1,
		config: {damping: 14, mass: 0.4, stiffness: 300},
	});

	if (contain) {
		return (
			<AbsoluteFill style={{backgroundColor: '#FBEFE9', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${punch})`}} />
			</AbsoluteFill>
		);
	}

	return (
		<AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: `${posX}% ${posY}%`,
					transform: `scale(${punch})`,
				}}
			/>
		</AbsoluteFill>
	);
};

const CaptionSlide: React.FC<{text: string; tone: 'navy' | 'coral'}> = ({text, tone}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.6, to: 1, config: {damping: 10, mass: 0.4, stiffness: 260}});
	return (
		<AbsoluteFill style={{background: tone === 'navy' ? NAVY : CORAL, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 900,
					fontSize: 54,
					color: CREAM,
					textAlign: 'center',
					padding: '0 70px',
					lineHeight: 1.25,
					transform: `scale(${pop})`,
					textShadow: '0 4px 16px rgba(0,0,0,0.35)',
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

export const QuickCaptionAd: React.FC<QuickCaptionProps> = ({slides, music}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<Series>
				{slides.map((s, i) => (
					<React.Fragment key={i}>
						<Series.Sequence durationInFrames={IMAGE_FRAMES}>
							<ImageSlide src={s.src} contain={s.contain} posX={s.posX} posY={s.posY} />
						</Series.Sequence>
						<Series.Sequence durationInFrames={FLASH_FRAMES}>
							<FlashOverlay />
						</Series.Sequence>
						<Series.Sequence durationInFrames={CAPTION_FRAMES}>
							<CaptionSlide text={s.caption} tone={i % 2 === 0 ? 'navy' : 'coral'} />
						</Series.Sequence>
						<Series.Sequence durationInFrames={FLASH_FRAMES}>
							<FlashOverlay />
						</Series.Sequence>
					</React.Fragment>
				))}
			</Series>
			{music ? <Audio src={music} volume={0.55} /> : null}
		</AbsoluteFill>
	);
};

export const calculateQuickCaptionMetadata = ({props}: {props: QuickCaptionProps}) => {
	const count = props.slides?.length ?? 5;
	const total = count * (IMAGE_FRAMES + FLASH_FRAMES + CAPTION_FRAMES + FLASH_FRAMES);
	return {durationInFrames: total};
};
