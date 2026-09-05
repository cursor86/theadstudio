import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Outreach/pitch piece: a polished showcase reel built from a prospect's own
// real product photos (Casa Bella - Home & Living, a furniture store), bilingual
// (English + Albanian, matching the store's own Instagram bio language). The
// closing card carries only the store's own branding/handle - it's meant to
// look like their own finished ad; the "this one's a gift" framing lives in
// the outreach DM sent alongside it, not in the video itself.
export const casaBellaConceptSchema = z.object({
	storeHandle: z.string(),
	storeCity: z.string(),
	taglineEn: z.string(),
	taglineSq: z.string(),
	photos: z.array(z.object({src: z.string(), captionEn: z.string(), captionSq: z.string()})),
	music: z.string().optional(),
});

export type CasaBellaConceptProps = z.infer<typeof casaBellaConceptSchema>;

const FPS = 30;
const CHARCOAL = '#1C1A18';
const CHARCOAL_DEEP = '#100F0D';
const CREAM = '#F3ECE1';
const GOLD = '#C9A25C';
const GOLD_SOFT = '#E4C98A';
const SERIF = '"Georgia", "Times New Roman", serif';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

const s2f = (s: number) => Math.round(s * FPS);

const HOOK_SECONDS = 2.4;
const PHOTO_SECONDS = 2.7;
const OUTRO_SECONDS = 3.6;
const TRANSITION_SECONDS = 0.4;

const HookBeat: React.FC<{taglineEn: string; taglineSq: string}> = ({taglineEn, taglineSq}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const wordmarkIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.8}});
	const lineIn = spring({frame: frame - 16, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const ruleWidth = interpolate(frame, [8, 30], [0, 140], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${CHARCOAL} 0%, ${CHARCOAL_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{textAlign: 'center', opacity: wordmarkIn, transform: `translateY(${(1 - wordmarkIn) * 20}px)`}}>
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: CREAM, letterSpacing: 3}}>CASA BELLA</div>
				<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 18, color: GOLD, letterSpacing: 6, marginTop: 6}}>HOME &amp; LIVING</div>
				<div style={{width: ruleWidth, height: 1, background: GOLD, margin: '22px auto'}} />
			</div>
			<div style={{position: 'absolute', bottom: '28%', textAlign: 'center', opacity: lineIn, transform: `translateY(${(1 - lineIn) * 14}px)`, padding: '0 90px'}}>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: CREAM}}>{taglineEn}</div>
				<div style={{fontFamily: SANS, fontSize: 17, color: '#B9B2A6', marginTop: 8}}>{taglineSq}</div>
			</div>
		</AbsoluteFill>
	);
};

const PhotoBeat: React.FC<{src: string; captionEn: string; captionSq: string; index: number; durationInFrames: number}> = ({
	src,
	captionEn,
	captionSq,
	index,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const zoomIn = index % 2 === 0;
	const scale = interpolate(frame, [0, durationInFrames], zoomIn ? [1.0, 1.13] : [1.13, 1.0], {extrapolateRight: 'clamp'});
	const panX = interpolate(frame, [0, durationInFrames], [50, index % 2 === 0 ? 44 : 56], {extrapolateRight: 'clamp'});
	const captionIn = spring({frame: frame - 14, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});

	return (
		<AbsoluteFill style={{backgroundColor: CHARCOAL_DEEP}}>
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<Img
					src={src}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: `${panX}% 50%`,
						transform: `scale(${scale})`,
					}}
				/>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(16,15,13,0.88) 0%, rgba(16,15,13,0.15) 32%, transparent 55%)'}} />
			<div
				style={{
					position: 'absolute',
					left: 60,
					right: 60,
					bottom: 90,
					opacity: captionIn,
					transform: `translateY(${(1 - captionIn) * 18}px)`,
				}}
			>
				<div style={{width: 60, height: 2, background: GOLD, marginBottom: 16}} />
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: CREAM}}>{captionEn}</div>
				<div style={{fontFamily: SANS, fontSize: 19, color: GOLD_SOFT, marginTop: 6}}>{captionSq}</div>
			</div>
		</AbsoluteFill>
	);
};

// Closing card carries only the store's own branding - wordmark, tagline,
// Instagram handle, and city - so the reel reads as their own finished ad
// rather than an agency pitch. (The "this one's a gift" framing lives in the
// outreach DM, not baked into the video itself.)
const OutroBeat: React.FC<{storeHandle: string; storeCity: string; taglineEn: string; taglineSq: string}> = ({
	storeHandle,
	storeCity,
	taglineEn,
	taglineSq,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const wordmarkIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.8}});
	const lineIn = spring({frame: frame - 14, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const pillIn = spring({frame: frame - 28, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const ruleWidth = interpolate(frame, [6, 28], [0, 140], {extrapolateRight: 'clamp'});
	const breathe = 1 + Math.sin(frame / 30) * 0.02;

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${CHARCOAL} 0%, ${CHARCOAL_DEEP} 100%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					position: 'absolute',
					width: 480,
					height: 480,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${GOLD}22 0%, transparent 70%)`,
					transform: `scale(${breathe})`,
				}}
			/>
			<div style={{textAlign: 'center', opacity: wordmarkIn, transform: `translateY(${(1 - wordmarkIn) * 20}px)`}}>
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: CREAM, letterSpacing: 3}}>CASA BELLA</div>
				<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 17, color: GOLD, letterSpacing: 6, marginTop: 6}}>HOME &amp; LIVING</div>
				<div style={{width: ruleWidth, height: 1, background: GOLD, margin: '20px auto'}} />
			</div>
			<div style={{textAlign: 'center', opacity: lineIn, transform: `translateY(${(1 - lineIn) * 16}px)`, padding: '0 90px', marginTop: 4}}>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: CREAM}}>{taglineEn}</div>
				<div style={{fontFamily: SANS, fontSize: 16, color: '#B9B2A6', marginTop: 6}}>{taglineSq}</div>
			</div>
			<div
				style={{
					marginTop: 34,
					padding: '15px 32px',
					borderRadius: 999,
					background: 'rgba(255,255,255,0.06)',
					border: `1px solid ${GOLD}55`,
					opacity: pillIn,
					transform: `translateY(${(1 - pillIn) * 16}px)`,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 4,
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 21, color: CREAM}}>{storeHandle}</span>
				<span style={{fontFamily: SANS, fontSize: 15, color: GOLD_SOFT}}>{storeCity}</span>
			</div>
		</AbsoluteFill>
	);
};

export const CasaBellaConceptAd: React.FC<CasaBellaConceptProps> = ({
	storeHandle,
	storeCity,
	taglineEn,
	taglineSq,
	photos,
	music,
}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const timing = linearTiming({durationInFrames: transitionFrames});
	const photoFrames = s2f(PHOTO_SECONDS);

	return (
		<AbsoluteFill style={{backgroundColor: CHARCOAL_DEEP}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={s2f(HOOK_SECONDS)}>
					<HookBeat taglineEn={taglineEn} taglineSq={taglineSq} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={timing} />

				{photos.map((p, i) => (
					<React.Fragment key={i}>
						<TransitionSeries.Sequence durationInFrames={photoFrames}>
							<PhotoBeat src={p.src} captionEn={p.captionEn} captionSq={p.captionSq} index={i} durationInFrames={photoFrames} />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition presentation={fade()} timing={timing} />
					</React.Fragment>
				))}

				<TransitionSeries.Sequence durationInFrames={s2f(OUTRO_SECONDS)}>
					<OutroBeat storeHandle={storeHandle} storeCity={storeCity} taglineEn={taglineEn} taglineSq={taglineSq} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{music ? <Audio src={music} volume={0.5} /> : null}
		</AbsoluteFill>
	);
};

export const calculateCasaBellaConceptMetadata = ({props}: {props: CasaBellaConceptProps}) => {
	const transitionFrames = s2f(TRANSITION_SECONDS);
	const photoCount = props.photos?.length ?? 5;
	const segments = 2 + photoCount; // hook + photos + outro
	const total = s2f(HOOK_SECONDS) + photoCount * s2f(PHOTO_SECONDS) + s2f(OUTRO_SECONDS) - transitionFrames * (segments - 1);
	return {durationInFrames: total};
};
