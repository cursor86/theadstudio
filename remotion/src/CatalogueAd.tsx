import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {z} from 'zod';

// Static catalogue-style still image: AI-styled product photo, a discount/
// offer badge, a short feature list, and a CTA - replaces the 10s video
// format for the daily affiliate batch.
export const catalogueAdSchema = z.object({
	brandLine: z.string(),
	features: z.array(z.string()).min(1).max(4),
	discount: z.string().optional(),
	cta: z.string(),
	link: z.string(),
	productImage: z.string(),
});

export type CatalogueAdProps = z.infer<typeof catalogueAdSchema>;

const CREAM = '#FBF7F0';
const INK = '#1F1B16';
const ORANGE = '#F2701C';
const ORANGE_LIGHT = '#FFA35C';

const CheckIcon: React.FC = () => (
	<svg width={34} height={34} viewBox="0 0 100 100" fill="none">
		<circle cx="50" cy="50" r="44" fill={ORANGE} />
		<path d="M30 52L43 65L72 34" stroke={CREAM} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const CatalogueAd: React.FC<CatalogueAdProps> = ({brandLine, features, discount, cta, link, productImage}) => {
	return (
		<AbsoluteFill style={{backgroundColor: CREAM, fontFamily: 'Arial, sans-serif'}}>
			{/* Photo card */}
			<div
				style={{
					position: 'absolute',
					top: 90,
					left: 60,
					right: 60,
					height: 900,
					borderRadius: 36,
					overflow: 'hidden',
					boxShadow: '0 24px 50px rgba(0,0,0,0.14)',
					backgroundColor: '#fff',
				}}
			>
				<Img src={productImage} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</div>

			{discount ? (
				<div
					style={{
						position: 'absolute',
						top: 130,
						right: 100,
						background: `linear-gradient(135deg, ${ORANGE_LIGHT}, ${ORANGE})`,
						borderRadius: 999,
						padding: '16px 30px',
						boxShadow: '0 10px 24px rgba(242,112,28,0.45)',
						transform: 'rotate(4deg)',
					}}
				>
					<span style={{fontWeight: 800, fontSize: 30, color: INK, letterSpacing: 0.5}}>{discount}</span>
				</div>
			) : null}

			{/* Brand name */}
			<div
				style={{
					position: 'absolute',
					top: 1030,
					left: 70,
					right: 70,
					fontWeight: 800,
					fontSize: 52,
					lineHeight: 1.15,
					color: INK,
					textAlign: 'center',
				}}
			>
				{brandLine}
			</div>

			<div
				style={{
					position: 'absolute',
					top: 1030 + 2 * 52 * 1.15 + 26,
					left: 340,
					width: 400,
					height: 4,
					background: ORANGE,
					borderRadius: 2,
				}}
			/>

			{/* Feature list */}
			<div
				style={{
					position: 'absolute',
					top: 1030 + 2 * 52 * 1.15 + 60,
					left: 90,
					right: 90,
					display: 'flex',
					flexDirection: 'column',
					gap: 22,
				}}
			>
				{features.map((f, i) => (
					<div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 18}}>
						<div style={{flexShrink: 0, marginTop: 2}}>
							<CheckIcon />
						</div>
						<div style={{fontWeight: 600, fontSize: 30, lineHeight: 1.3, color: `${INK}dd`}}>{f}</div>
					</div>
				))}
			</div>

			{/* CTA */}
			<div style={{position: 'absolute', bottom: 110, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
				<div
					style={{
						padding: '26px 70px',
						borderRadius: 999,
						background: ORANGE,
						boxShadow: `0 14px 30px ${ORANGE}66`,
					}}
				>
					<span style={{fontWeight: 800, fontSize: 38, color: INK}}>{cta}</span>
				</div>
				<div style={{fontWeight: 600, fontSize: 26, color: `${INK}99`}}>{link}</div>
			</div>
		</AbsoluteFill>
	);
};

export const calculateCatalogueAdMetadata = () => ({durationInFrames: 1});
