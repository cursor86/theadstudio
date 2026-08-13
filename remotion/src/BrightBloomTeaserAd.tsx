import React from 'react';
import {AbsoluteFill, Audio, Img, Series, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// 30s fast-paced "kinetic" teaser for Bright Bloom Suffolk: word-slam text
// bursts, rapid static-crop product cuts (no Ken Burns pan/zoom - just quick
// punch-in snaps), and a white flash between every cut, closing on a fully
// static (no animation at all) shop-interior shot for calm contrast after
// the frenzy.
export const brightBloomTeaserSchema = z.object({
	marketImage: z.string(),
	toteCloseupImage: z.string(),
	collectionImage: z.string(),
	lifestyleImage: z.string(),
	hookText: z.string(),
	toteText: z.string(),
	collectionText: z.string(),
	ctaText: z.string(),
	music: z.string().optional(),
});

export type BrightBloomTeaserProps = z.infer<typeof brightBloomTeaserSchema>;

const FPS = 30;
const NAVY = '#1F3A5F';
const CORAL = '#E8735A';
const CREAM = '#FBF3E7';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const HOOK_WORD_FRAMES = 9;
const SLAM_WORD_FRAMES = 9;
const PRODUCT_CUT_FRAMES = 55;
const FLASH_FRAMES = 5;
const FINAL_STATIC_FRAMES = 250;

type CropPreset = {posX: number; posY: number; scale: number};

const TOTE_CROPS: CropPreset[] = [
	{posX: 50, posY: 35, scale: 1.15},
	{posX: 65, posY: 25, scale: 1.4},
	{posX: 40, posY: 55, scale: 1.3},
];
const COLLECTION_CROPS: CropPreset[] = [
	{posX: 35, posY: 45, scale: 1.3},
	{posX: 65, posY: 45, scale: 1.3},
	{posX: 50, posY: 35, scale: 1.05},
];
const LIFESTYLE_CROPS: CropPreset[] = [
	{posX: 35, posY: 55, scale: 1.25},
	{posX: 75, posY: 60, scale: 1.35},
];

const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);
const slamDuration = (text: string, perWord: number) => wordsOf(text).length * perWord;

const FlashOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = frame < 2 ? frame / 2 : Math.max(0, 1 - (frame - 2) / (FLASH_FRAMES - 2));
	return <AbsoluteFill style={{background: 'white', opacity}} />;
};

const WordSlamBeat: React.FC<{text: string; perWord: number; bg: string}> = ({text, perWord, bg}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = wordsOf(text);
	const index = Math.min(words.length - 1, Math.floor(frame / perWord));
	const localFrame = frame - index * perWord;
	const pop = spring({frame: localFrame, fps, from: 0.5, to: 1, config: {damping: 9, mass: 0.4, stiffness: 260}});
	const flicker = index % 2 === 0 ? NAVY : CORAL;

	return (
		<AbsoluteFill style={{background: bg === 'flicker' ? flicker : bg, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 900,
					fontSize: 78,
					color: CREAM,
					textAlign: 'center',
					padding: '0 60px',
					transform: `scale(${pop})`,
					textShadow: '0 4px 18px rgba(0,0,0,0.35)',
				}}
			>
				{words[index]}
			</div>
		</AbsoluteFill>
	);
};

const ProductCut: React.FC<{src: string; crop: CropPreset}> = ({src, crop}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const punch = spring({frame, fps, from: 1.1, to: 1, config: {damping: 14, mass: 0.4, stiffness: 300}});

	return (
		<AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: `${crop.posX}% ${crop.posY}%`,
					transform: `scale(${crop.scale * punch})`,
				}}
			/>
		</AbsoluteFill>
	);
};

const FinalStatic: React.FC<{src: string; text: string}> = ({src, text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const textIn = spring({frame: frame - 8, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill>
				<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 40%)'}} />
			<div
				style={{
					position: 'absolute',
					left: 48,
					right: 48,
					bottom: 130,
					textAlign: 'center',
					opacity: textIn,
					transform: `translateY(${(1 - textIn) * 16}px)`,
				}}
			>
				<span
					style={{
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 38,
						lineHeight: 1.25,
						color: CREAM,
						textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 24px rgba(0,0,0,0.35)',
					}}
				>
					{text}
				</span>
			</div>
		</AbsoluteFill>
	);
};

// Fixed 8-cut sequence covering every crop preset across the three product
// photos, in an interleaved order so the same image never repeats back to back.
const buildCuts = (toteCloseupImage: string, collectionImage: string, lifestyleImage: string) => [
	{src: toteCloseupImage, crop: TOTE_CROPS[0]},
	{src: collectionImage, crop: COLLECTION_CROPS[0]},
	{src: lifestyleImage, crop: LIFESTYLE_CROPS[0]},
	{src: toteCloseupImage, crop: TOTE_CROPS[1]},
	{src: collectionImage, crop: COLLECTION_CROPS[1]},
	{src: lifestyleImage, crop: LIFESTYLE_CROPS[1]},
	{src: toteCloseupImage, crop: TOTE_CROPS[2]},
	{src: collectionImage, crop: COLLECTION_CROPS[2]},
];

export const BrightBloomTeaserAd: React.FC<BrightBloomTeaserProps> = ({
	marketImage,
	toteCloseupImage,
	collectionImage,
	lifestyleImage,
	hookText,
	toteText,
	collectionText,
	ctaText,
	music,
}) => {
	const cuts = buildCuts(toteCloseupImage, collectionImage, lifestyleImage);
	const hookFrames = slamDuration(hookText, HOOK_WORD_FRAMES);
	const toteSlamFrames = slamDuration(toteText, SLAM_WORD_FRAMES);
	const collectionSlamFrames = slamDuration(collectionText, SLAM_WORD_FRAMES);

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<Series>
				<Series.Sequence durationInFrames={hookFrames}>
					<WordSlamBeat text={hookText} perWord={HOOK_WORD_FRAMES} bg="flicker" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={FLASH_FRAMES}>
					<FlashOverlay />
				</Series.Sequence>

				{cuts.slice(0, 4).map((c, i) => (
					<React.Fragment key={`a${i}`}>
						<Series.Sequence durationInFrames={PRODUCT_CUT_FRAMES}>
							<ProductCut src={c.src} crop={c.crop} />
						</Series.Sequence>
						<Series.Sequence durationInFrames={FLASH_FRAMES}>
							<FlashOverlay />
						</Series.Sequence>
					</React.Fragment>
				))}

				<Series.Sequence durationInFrames={toteSlamFrames}>
					<WordSlamBeat text={toteText} perWord={SLAM_WORD_FRAMES} bg={NAVY} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={FLASH_FRAMES}>
					<FlashOverlay />
				</Series.Sequence>

				{cuts.slice(4, 7).map((c, i) => (
					<React.Fragment key={`b${i}`}>
						<Series.Sequence durationInFrames={PRODUCT_CUT_FRAMES}>
							<ProductCut src={c.src} crop={c.crop} />
						</Series.Sequence>
						<Series.Sequence durationInFrames={FLASH_FRAMES}>
							<FlashOverlay />
						</Series.Sequence>
					</React.Fragment>
				))}

				<Series.Sequence durationInFrames={collectionSlamFrames}>
					<WordSlamBeat text={collectionText} perWord={SLAM_WORD_FRAMES} bg={CORAL} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={FLASH_FRAMES}>
					<FlashOverlay />
				</Series.Sequence>

				<Series.Sequence durationInFrames={PRODUCT_CUT_FRAMES}>
					<ProductCut src={cuts[7].src} crop={cuts[7].crop} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={FLASH_FRAMES}>
					<FlashOverlay />
				</Series.Sequence>

				<Series.Sequence durationInFrames={FINAL_STATIC_FRAMES}>
					<FinalStatic src={marketImage} text={ctaText} />
				</Series.Sequence>
			</Series>
			{music ? <Audio src={music} volume={0.55} /> : null}
		</AbsoluteFill>
	);
};

export const calculateBrightBloomTeaserMetadata = ({props}: {props: BrightBloomTeaserProps}) => {
	const hookFrames = slamDuration(props.hookText, HOOK_WORD_FRAMES);
	const toteSlamFrames = slamDuration(props.toteText, SLAM_WORD_FRAMES);
	const collectionSlamFrames = slamDuration(props.collectionText, SLAM_WORD_FRAMES);
	// 8 product cuts + 8 matching flashes, plus a flash after each of the 3 text beats
	const cutsAndFlashes = 8 * (PRODUCT_CUT_FRAMES + FLASH_FRAMES);
	const textFlashes = 3 * FLASH_FRAMES;
	const total = hookFrames + toteSlamFrames + collectionSlamFrames + cutsAndFlashes + textFlashes + FINAL_STATIC_FRAMES;
	return {durationInFrames: total};
};
