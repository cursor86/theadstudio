import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';
import {getAudioDurationSeconds} from './audio-duration';
import {SampleLockWatermark} from './SampleLockWatermark';

// Brand-story layout for artisans/makers: logo intro, an "about the maker"
// card, an inspiration quote, then a numbered listicle-style photo passage
// and CTA. Every card (including the text-only ones) carries a blurred,
// dimmed product photo behind it instead of a flat color, so nothing reads
// as an empty placeholder screen - and product photos in the listicle beats
// use contain-fit over the same blurred backdrop so no edge ever gets
// cropped off.
export const artisanStorySchema = z.object({
	logoPath: z.string(),
	brand: z.string(),
	about: z.array(z.string()),
	inspiration: z.string(),
	images: z.array(z.string()),
	captions: z.array(z.string()),
	cta: z.string(),
	link: z.string(),
	music: z.string(),
	locked: z.boolean().optional(),
	durationSeconds: z.number().optional(),
	totalFrames: z.number().optional(),
});

export type ArtisanStoryProps = z.infer<typeof artisanStorySchema>;

const FPS = 30;
const CHARCOAL = '#2B2622';
const CREAM = '#F5F0E8';
const CLAY = '#C1694F';
const CLAY_LIGHT = '#E3A98D';
const FONT = '"Georgia", "Times New Roman", serif';
const SANS = '"Arial", sans-serif';

const GRAIN_URL =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const s2f = (s: number) => Math.round(s * FPS);
const MIN_DURATION_SECONDS = 22;
const MAX_DURATION_SECONDS = 32;

export const calculateArtisanStoryMetadata = async ({props}: {props: ArtisanStoryProps}) => {
	let totalSeconds: number;
	if (props.durationSeconds) {
		totalSeconds = props.durationSeconds;
	} else {
		const audioDuration = props.music ? await getAudioDurationSeconds(props.music) : MIN_DURATION_SECONDS;
		totalSeconds = Math.max(MIN_DURATION_SECONDS, Math.min(audioDuration, MAX_DURATION_SECONDS));
	}
	return {durationInFrames: s2f(totalSeconds), props: {...props, totalFrames: s2f(totalSeconds)}};
};

// Every text-only card gets one of the client's own product photos as a
// blurred, dimmed backdrop instead of a flat gradient - keeps the "quiet"
// slides from reading as empty/dull placeholders.
const Background: React.FC<{bgImage: string; children?: React.ReactNode}> = ({bgImage, children}) => {
	const frame = useCurrentFrame();
	const drift = 1 + Math.sin(frame / 140) * 0.02;
	return (
		<AbsoluteFill style={{background: CHARCOAL, overflow: 'hidden'}}>
			<Img
				src={bgImage}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					filter: 'blur(18px) brightness(0.38) saturate(0.9)',
					transform: `scale(${1.1 * drift})`,
				}}
			/>
			<AbsoluteFill
				style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(43,38,34,0.35) 0%, rgba(20,17,15,0.75) 100%)'}}
			/>
			<AbsoluteFill style={{backgroundImage: GRAIN_URL, opacity: 0.045, mixBlendMode: 'overlay'}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

const LogoIntro: React.FC<{logoPath: string; brand: string; bgImage: string}> = ({logoPath, brand, bgImage}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.85, to: 1, config: {damping: 15, mass: 0.7, stiffness: 90}});
	const opacity = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<Background bgImage={bgImage}>
			<div style={{opacity, transform: `scale(${pop})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div
					style={{
						padding: 20,
						background: CREAM,
						border: `3px solid ${CLAY}`,
						boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
					}}
				>
					<Img src={logoPath} style={{width: 260, display: 'block'}} />
				</div>
				<div style={{marginTop: 26, fontFamily: FONT, fontStyle: 'italic', fontWeight: 700, fontSize: 30, color: CREAM}}>
					{brand}
				</div>
			</div>
		</Background>
	);
};

const AboutCard: React.FC<{lines: string[]; bgImage: string}> = ({lines, bgImage}) => (
	<Background bgImage={bgImage}>
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 90px'}}>
			<div
				style={{
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 20,
					letterSpacing: 3,
					color: CLAY_LIGHT,
					marginBottom: 26,
				}}
			>
				THE MAKERS
			</div>
			{lines.map((line, i) => {
				const frame = useCurrentFrame();
				const delay = i * 12;
				const opacity = interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				const y = interpolate(frame, [delay, delay + 16], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<div
						key={i}
						style={{
							opacity,
							transform: `translateY(${y}px)`,
							fontFamily: FONT,
							fontWeight: i === 0 ? 700 : 400,
							fontSize: i === 0 ? 46 : 30,
							lineHeight: 1.4,
							textAlign: 'center',
							color: CREAM,
							marginBottom: 14,
						}}
					>
						{line}
					</div>
				);
			})}
		</div>
	</Background>
);

const InspirationCard: React.FC<{text: string; bgImage: string}> = ({text, bgImage}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<Background bgImage={bgImage}>
			<div style={{opacity, padding: '0 100px', textAlign: 'center'}}>
				<div style={{fontFamily: FONT, fontSize: 54, color: CLAY_LIGHT, lineHeight: 0.3}}>&ldquo;</div>
				<div style={{fontFamily: FONT, fontStyle: 'italic', fontWeight: 600, fontSize: 38, lineHeight: 1.5, color: CREAM}}>
					{text}
				</div>
			</div>
		</Background>
	);
};

// Listicle-style product beat: numbered badge + caption, with the photo
// shown full (contain-fit) over its own blurred copy as backdrop - the
// same fix used in ListicleAd, so no product photo ever gets cropped.
const ListicleProductCard: React.FC<{index: number; total: number; src: string; caption: string}> = ({
	index,
	total,
	src,
	caption,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const badgePop = spring({frame, fps, config: {damping: 11, mass: 0.5, stiffness: 160}});
	const textOpacity = interpolate(frame, [12, 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const textY = interpolate(frame, [12, 28], [18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: CHARCOAL}}>
			<Img
				src={src}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					filter: 'blur(50px) brightness(0.5)',
					transform: 'scale(1.15)',
				}}
			/>
			<Img src={src} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain'}} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.82) 100%)',
				}}
			/>
			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', padding: '0 80px 120px'}}>
				<div
					style={{
						transform: `scale(${badgePop})`,
						background: CLAY,
						color: CREAM,
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 30,
						width: 64,
						height: 64,
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 24,
						boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
					}}
				>
					{index}/{total}
				</div>
				<div
					style={{
						opacity: textOpacity,
						transform: `translateY(${textY}px)`,
						color: CREAM,
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 40,
						textAlign: 'center',
						textShadow: '0 4px 14px rgba(0,0,0,0.6)',
					}}
				>
					{caption}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const OutroCard: React.FC<{cta: string; link: string; bgImage: string}> = ({cta, link, bgImage}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const scale = spring({frame, fps, from: 0.85, to: 1, config: {damping: 14, mass: 0.6, stiffness: 100}});
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Background bgImage={bgImage}>
			<div
				style={{
					opacity,
					transform: `scale(${scale})`,
					padding: '20px 46px',
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 42,
					color: CHARCOAL,
					background: CREAM,
					boxShadow: '0 16px 34px rgba(0,0,0,0.35)',
					marginBottom: 30,
				}}
			>
				{cta}
			</div>
			<div style={{opacity, fontFamily: FONT, fontStyle: 'italic', fontSize: 26, color: CLAY_LIGHT}}>{link}</div>
		</Background>
	);
};

export const ArtisanStoryAd: React.FC<ArtisanStoryProps> = ({
	logoPath,
	brand,
	about,
	inspiration,
	images,
	captions,
	cta,
	link,
	music,
	locked,
	totalFrames,
}) => {
	const transitionFrames = s2f(0.4);
	const timing = linearTiming({durationInFrames: transitionFrames});

	const introFrames = s2f(2.6);
	const aboutFrames = s2f(3.6);
	const inspirationFrames = s2f(3.4);
	const outroFrames = s2f(3.4);
	const fixedFrames = introFrames + aboutFrames + inspirationFrames + outroFrames;

	const effectiveTotal = totalFrames ?? s2f(28);
	const photoBudget = Math.max(s2f(images.length * 2.5), effectiveTotal - fixedFrames);
	const photoFramesEach = images.length > 0 ? Math.floor(photoBudget / images.length) : 0;

	const bg = (i: number) => images[i % images.length] ?? images[0];

	return (
		<>
			{music ? <Audio src={music} volume={0.5} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={introFrames}>
					<LogoIntro logoPath={logoPath} brand={brand} bgImage={bg(0)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={aboutFrames}>
					<AboutCard lines={about} bgImage={bg(1)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={inspirationFrames}>
					<InspirationCard text={inspiration} bgImage={bg(2)} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				{images.map((src, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={photoFramesEach}>
							<ListicleProductCard index={i + 1} total={images.length} src={src} caption={captions[i] ?? ''} />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition presentation={fade()} timing={timing} />
					</React.Fragment>
				))}

				<TransitionSeries.Sequence durationInFrames={outroFrames}>
					<OutroCard cta={cta} link={link} bgImage={bg(3)} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{locked ? <SampleLockWatermark /> : null}
		</>
	);
};
