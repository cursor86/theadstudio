import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {z} from 'zod';

// Static, editorial-style still image: solid brand-dark background, a bold
// punchy headline, the product floating with a soft reflection, and a
// brand/tagline footer - replaces the earlier checklist-catalogue layout
// per reference (a Harry's-style ad: dark background, big headline type,
// product + reflection, logo + tagline, no badge/checklist clutter).
export const catalogueAdSchema = z.object({
	hookLine: z.string(),
	brandLine: z.string(),
	subLine: z.string(),
	discount: z.string().optional(),
	cta: z.string(),
	link: z.string(),
	productImage: z.string(),
});

export type CatalogueAdProps = z.infer<typeof catalogueAdSchema>;

const INK = '#1F1B16';
const CREAM = '#FBF7F0';
const ORANGE = '#F2701C';
const ORANGE_LIGHT = '#FFA35C';

const SparkleIcon: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 34, style}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
		<path d="M50 6C50 30 56 42 78 48C56 54 50 66 50 90C50 66 44 54 22 48C44 42 50 30 50 6Z" fill={ORANGE_LIGHT} opacity={0.85} />
	</svg>
);

const starburstPoints = (cx: number, cy: number, outerR: number, innerR: number, spikes: number) => {
	const pts: string[] = [];
	const step = Math.PI / spikes;
	for (let i = 0; i < spikes * 2; i++) {
		const r = i % 2 === 0 ? outerR : innerR;
		const angle = i * step - Math.PI / 2;
		pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
	}
	return pts.join(' ');
};

const StarburstBadge: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
	<div style={{position: 'absolute', width: 240, height: 240, ...style}}>
		<svg width={240} height={240} viewBox="0 0 200 200" style={{position: 'absolute', inset: 0}}>
			<polygon
				points={starburstPoints(100, 100, 100, 82, 14)}
				fill={ORANGE_LIGHT}
				stroke={INK}
				strokeWidth={3}
			/>
		</svg>
		<div
			style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				padding: 20,
			}}
		>
			<span style={{fontWeight: 800, fontSize: 34, lineHeight: 1.05, color: INK}}>{text}</span>
		</div>
	</div>
);

export const CatalogueAd: React.FC<CatalogueAdProps> = ({hookLine, brandLine, subLine, discount, cta, link, productImage}) => {
	return (
		<AbsoluteFill style={{backgroundColor: INK, fontFamily: 'Arial, sans-serif'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse at 50% 30%, ${ORANGE}33 0%, transparent 60%)`,
				}}
			/>

			<SparkleIcon size={44} style={{position: 'absolute', top: 430, left: 110}} />
			<SparkleIcon size={26} style={{position: 'absolute', top: 560, right: 140}} />

			{/* Headline */}
			<div
				style={{
					position: 'absolute',
					top: 110,
					left: 80,
					right: 80,
					textAlign: 'center',
				}}
			>
				<div
					style={{
						fontWeight: 800,
						fontSize: 40,
						lineHeight: 1.3,
						color: CREAM,
						letterSpacing: 0.5,
						textTransform: 'uppercase',
					}}
				>
					{hookLine}
				</div>
			</div>

			{/* Product with reflection */}
			<div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{position: 'relative', width: 640, height: 640}}>
					<Img
						src={productImage}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'contain',
							filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))',
							maskImage: 'radial-gradient(ellipse 60% 58% at 50% 46%, black 30%, transparent 92%)',
							WebkitMaskImage: 'radial-gradient(ellipse 60% 58% at 50% 46%, black 30%, transparent 92%)',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							top: '100%',
							left: 0,
							width: '100%',
							height: '55%',
							overflow: 'hidden',
							opacity: 0.28,
							maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
							WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
						}}
					>
						<Img
							src={productImage}
							style={{
								width: 640,
								height: 640,
								objectFit: 'contain',
								transform: 'scaleY(-1)',
							}}
						/>
					</div>
				</div>
				{discount ? (
					<StarburstBadge
						text={discount}
						style={{left: '50%', top: 520, transform: 'translateX(-190px) rotate(-12deg)'}}
					/>
				) : null}
			</div>

			{/* Brand + tagline footer */}
			<div
				style={{
					position: 'absolute',
					bottom: 200,
					left: 80,
					right: 80,
					textAlign: 'center',
				}}
			>
				<div style={{fontWeight: 800, fontSize: 58, color: CREAM, letterSpacing: 1}}>{brandLine}</div>
				<div style={{marginTop: 14, fontWeight: 600, fontSize: 28, color: `${CREAM}bb`}}>{subLine}</div>
			</div>

			{/* CTA + discount, kept minimal */}
			<div
				style={{
					position: 'absolute',
					bottom: 90,
					left: 0,
					right: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 10,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
					<span style={{fontWeight: 700, fontSize: 24, color: ORANGE_LIGHT, letterSpacing: 1}}>{cta}</span>
					<span style={{fontWeight: 600, fontSize: 24, color: `${CREAM}88`}}>&middot;</span>
					<span style={{fontWeight: 600, fontSize: 24, color: `${CREAM}88`}}>{link}</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const calculateCatalogueAdMetadata = () => ({durationInFrames: 1});
