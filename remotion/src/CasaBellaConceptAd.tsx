import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {z} from 'zod';

// Outreach/pitch piece: a polished showcase reel built from a prospect's own
// real product photos (Casa Bella - Home & Living, a furniture store), bilingual
// (English + Albanian, matching the store's own Instagram bio language), closing
// with an honest "concept by theadzstudio" credit rather than pretending to be
// their official content - this is a sample sent cold to open a conversation.
export const casaBellaConceptSchema = z.object({
	storeHandle: z.string(),
	storeCity: z.string(),
	taglineEn: z.string(),
	taglineSq: z.string(),
	photos: z.array(z.object({src: z.string(), captionEn: z.string(), captionSq: z.string()})),
	pitchLineEn: z.string(),
	pitchLineSq: z.string(),
	ctaEn: z.string(),
	ctaSq: z.string(),
	contact: z.string(),
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

const OutroBeat: React.FC<{
	storeHandle: string;
	storeCity: string;
	pitchLineEn: string;
	pitchLineSq: string;
	ctaEn: string;
	ctaSq: string;
	contact: string;
}> = ({storeHandle, storeCity, pitchLineEn, pitchLineSq, ctaEn, ctaSq, contact}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tagIn = spring({frame, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const pitchIn = spring({frame: frame - 12, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const ctaIn = spring({frame: frame - 26, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
	const pillIn = spring({frame: frame - 38, fps, from: 0, to: 1, config: {damping: 15, mass: 0.7}});
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
			<div
				style={{
					opacity: tagIn,
					transform: `translateY(${(1 - tagIn) * 14}px)`,
					padding: '8px 20px',
					borderRadius: 999,
					border: `1px solid ${GOLD}66`,
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 15,
					letterSpacing: 2,
					color: GOLD_SOFT,
					marginBottom: 26,
				}}
			>
				CONCEPT AD FOR {storeHandle.toUpperCase()} · {storeCity.toUpperCase()}
			</div>
			<div
				style={{
					opacity: pitchIn,
					transform: `translateY(${(1 - pitchIn) * 16}px)`,
					textAlign: 'center',
					padding: '0 90px',
				}}
			>
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: CREAM}}>{pitchLineEn}</div>
				<div style={{fontFamily: SANS, fontSize: 18, color: '#B9B2A6', marginTop: 8}}>{pitchLineSq}</div>
			</div>
			<div
				style={{
					opacity: ctaIn,
					transform: `translateY(${(1 - ctaIn) * 16}px)`,
					textAlign: 'center',
					marginTop: 30,
				}}
			>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: GOLD}}>{ctaEn}</div>
				<div style={{fontFamily: SANS, fontSize: 16, color: GOLD_SOFT, marginTop: 4}}>{ctaSq}</div>
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
				}}
			>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, color: CREAM}}>{contact}</span>
			</div>
			<div style={{position: 'absolute', bottom: 56, fontFamily: SANS, fontSize: 14, letterSpacing: 1, color: '#726A5C'}}>Crafted by theadzstudio</div>
		</AbsoluteFill>
	);
};

export const CasaBellaConceptAd: React.FC<CasaBellaConceptProps> = ({
	storeHandle,
	storeCity,
	taglineEn,
	taglineSq,
	photos,
	pitchLineEn,
	pitchLineSq,
	ctaEn,
	ctaSq,
	contact,
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
					<OutroBeat
						storeHandle={storeHandle}
						storeCity={storeCity}
						pitchLineEn={pitchLineEn}
						pitchLineSq={pitchLineSq}
						ctaEn={ctaEn}
						ctaSq={ctaSq}
						contact={contact}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
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
