import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';
import {getAudioDurationSeconds} from './audio-duration';

// Brand-story layout for artisans/makers: logo intro, an "about the maker"
// card, an inspiration quote, then a Ken Burns-style photo passage and CTA.
// Different narrative shape from the other layouts - this one leads with
// who made it and why before showing the work, which suits handmade/craft
// sellers better than a straight product montage.
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
	durationSeconds: z.number().optional(),
	totalFrames: z.number().optional(),
});

export type ArtisanStoryProps = z.infer<typeof artisanStorySchema>;

const FPS = 30;
const CREAM = '#F4ECDA';
const PARCHMENT = '#EFE2C4';
const SEPIA = '#6B4A32';
const DEEP_BROWN = '#2E1D12';
const ANTIQUE_GOLD = '#B8863B';
const ANTIQUE_GOLD_LIGHT = '#DDB979';
const FONT = '"Georgia", "Times New Roman", serif';

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

const Background: React.FC<{children?: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const vignette = 0.5 + Math.sin(frame / 60) * 0.08;
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse at 50% 42%, ${PARCHMENT} 0%, ${CREAM} 55%, #E4D3AC 100%)`,
				overflow: 'hidden',
			}}
		>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(46,29,18,${vignette}) 100%)`,
				}}
			/>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

const LogoIntro: React.FC<{logoPath: string; brand: string}> = ({logoPath, brand}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, from: 0.85, to: 1, config: {damping: 15, mass: 0.7, stiffness: 90}});
	const opacity = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<Background>
			<div style={{opacity, transform: `scale(${pop})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div
					style={{
						padding: 20,
						background: 'white',
						border: `3px solid ${ANTIQUE_GOLD}`,
						boxShadow: '0 24px 60px rgba(46,29,18,0.25)',
					}}
				>
					<Img src={logoPath} style={{width: 260, display: 'block'}} />
				</div>
				<div style={{marginTop: 26, fontFamily: FONT, fontStyle: 'italic', fontWeight: 700, fontSize: 30, color: DEEP_BROWN}}>
					{brand}
				</div>
			</div>
		</Background>
	);
};

const AboutCard: React.FC<{lines: string[]}> = ({lines}) => (
	<Background>
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 90px'}}>
			<div
				style={{
					fontFamily: '"Arial", sans-serif',
					fontWeight: 700,
					fontSize: 20,
					letterSpacing: 3,
					color: ANTIQUE_GOLD,
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
							color: DEEP_BROWN,
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

const InspirationCard: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<Background>
			<div style={{opacity, padding: '0 100px', textAlign: 'center'}}>
				<div style={{fontFamily: FONT, fontSize: 54, color: ANTIQUE_GOLD_LIGHT, lineHeight: 0.3}}>&ldquo;</div>
				<div style={{fontFamily: FONT, fontStyle: 'italic', fontWeight: 600, fontSize: 38, lineHeight: 1.5, color: SEPIA}}>
					{text}
				</div>
			</div>
		</Background>
	);
};

const KenBurnsPhoto: React.FC<{src: string; caption: string}> = ({src, caption}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, 200], [1, 1.14], {extrapolateRight: 'clamp'});
	const captionOpacity = interpolate(frame, [14, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const captionY = interpolate(frame, [14, 30], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Img
				src={src}
				style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)',
				}}
			/>
			<div style={{position: 'absolute', bottom: 70, left: 50, right: 50, opacity: captionOpacity, transform: `translateY(${captionY}px)`}}>
				<div
					style={{
						display: 'inline-block',
						background: 'rgba(0,0,0,0.55)',
						borderLeft: `6px solid ${ANTIQUE_GOLD}`,
						padding: '18px 28px',
						borderRadius: 6,
					}}
				>
					<span style={{color: 'white', fontFamily: FONT, fontWeight: 700, fontSize: 34}}>{caption}</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const OutroCard: React.FC<{cta: string; link: string}> = ({cta, link}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const scale = spring({frame, fps, from: 0.85, to: 1, config: {damping: 14, mass: 0.6, stiffness: 100}});
	const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<Background>
			<div
				style={{
					opacity,
					transform: `scale(${scale})`,
					padding: '20px 46px',
					fontFamily: FONT,
					fontSize: 42,
					color: DEEP_BROWN,
					border: `2px solid ${ANTIQUE_GOLD}`,
					background: PARCHMENT,
					marginBottom: 30,
				}}
			>
				{cta}
			</div>
			<div style={{opacity, fontFamily: FONT, fontStyle: 'italic', fontSize: 26, color: SEPIA}}>{link}</div>
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

	return (
		<>
			{music ? <Audio src={music} volume={0.5} /> : null}
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={introFrames}>
					<LogoIntro logoPath={logoPath} brand={brand} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={aboutFrames}>
					<AboutCard lines={about} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				<TransitionSeries.Sequence durationInFrames={inspirationFrames}>
					<InspirationCard text={inspiration} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				{images.map((src, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={photoFramesEach}>
							<KenBurnsPhoto src={src} caption={captions[i] ?? ''} />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition presentation={fade()} timing={timing} />
					</React.Fragment>
				))}

				<TransitionSeries.Sequence durationInFrames={outroFrames}>
					<OutroCard cta={cta} link={link} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};
