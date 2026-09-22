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

const INK = '#121317';
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

const CheckIcon: React.FC<{size?: number}> = ({size = 64}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: '50%',
			backgroundColor: CREAM,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0,
		}}
	>
		<svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="none">
			<path
				d="M4 12.5L9.5 18L20 6"
				stroke={ORANGE}
				strokeWidth={3.2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	</div>
);

const StarburstBadge: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
	<div style={{position: 'absolute', width: 320, height: 320, ...style}}>
		<svg width={320} height={320} viewBox="0 0 200 200" style={{position: 'absolute', inset: 0}}>
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
				padding: 26,
			}}
		>
			<span style={{fontWeight: 800, fontSize: 44, lineHeight: 1.05, color: INK}}>{text}</span>
		</div>
	</div>
);

export const CatalogueAd: React.FC<CatalogueAdProps> = ({hookLine, brandLine, subLine, discount, cta, link, productImage}) => {
	const features = subLine
		.split('·')
		.map((f) => f.trim())
		.filter(Boolean)
		.slice(0, 3);

	return (
		<AbsoluteFill style={{backgroundColor: INK, fontFamily: 'Arial, sans-serif'}}>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.07) 0%, transparent 55%)',
				}}
			/>

			<SparkleIcon size={40} style={{position: 'absolute', top: 210, left: 60}} />
			<SparkleIcon size={26} style={{position: 'absolute', top: 300, right: 80}} />

			{/* Kicker */}
			<div style={{position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center'}}>
				<span
					style={{
						fontWeight: 700,
						fontSize: 26,
						letterSpacing: 5,
						color: ORANGE_LIGHT,
						textTransform: 'uppercase',
					}}
				>
					Amazon Finds
				</span>
			</div>

			{/* Headline */}
			<div
				style={{
					position: 'absolute',
					top: 62,
					left: 40,
					right: 40,
					textAlign: 'center',
				}}
			>
				<div
					style={{
						fontWeight: 800,
						fontSize: 44,
						lineHeight: 1.15,
						color: CREAM,
						letterSpacing: 0.5,
						textTransform: 'uppercase',
					}}
				>
					{hookLine}
				</div>
			</div>

			{/* Product with reflection - large, the focal point of the ad */}
			<div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{position: 'relative', width: 1300, height: 1300}}>
					<Img
						src={productImage}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'contain',
							filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.5))',
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
							height: '12%',
							overflow: 'hidden',
							opacity: 0.16,
							maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
							WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
						}}
					>
						<Img
							src={productImage}
							style={{
								width: 1300,
								height: 1300,
								objectFit: 'contain',
								transform: 'scaleY(-1)',
							}}
						/>
					</div>
				</div>
				{discount ? (
					<StarburstBadge
						text={discount}
						style={{left: '50%', top: 940, transform: 'translateX(-260px) rotate(-12deg)'}}
					/>
				) : null}
			</div>

			{/* Brand name */}
			<div
				style={{
					position: 'absolute',
					top: 1560,
					left: 50,
					right: 50,
					textAlign: 'center',
				}}
			>
				<div style={{fontWeight: 800, fontSize: 46, color: CREAM, letterSpacing: 1}}>{brandLine}</div>
			</div>

			{/* Feature icon row, in the spirit of the Audible-style icon+label strip */}
			<div
				style={{
					position: 'absolute',
					top: 1636,
					left: 50,
					right: 50,
					display: 'flex',
					flexDirection: 'row',
					justifyContent: features.length > 1 ? 'space-between' : 'center',
					gap: 20,
				}}
			>
				{features.map((feature) => (
					<div
						key={feature}
						style={{
							flex: features.length > 1 ? 1 : undefined,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<CheckIcon size={62} />
						<span
							style={{
								fontWeight: 700,
								fontSize: 16,
								lineHeight: 1.25,
								textAlign: 'center',
								color: `${CREAM}dd`,
								textTransform: 'uppercase',
								letterSpacing: 0.3,
							}}
						>
							{feature}
						</span>
					</div>
				))}
			</div>

			{/* Bold pill CTA button */}
			<div style={{position: 'absolute', top: 1770, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						backgroundColor: ORANGE,
						borderRadius: 999,
						padding: '20px 52px',
						boxShadow: '0 12px 24px rgba(242,112,28,0.35)',
					}}
				>
					<span style={{fontWeight: 800, fontSize: 28, color: CREAM, letterSpacing: 0.5}}>{cta}</span>
					<span style={{fontWeight: 800, fontSize: 28, color: CREAM}}>&rarr;</span>
				</div>
			</div>

			<div style={{position: 'absolute', top: 1858, left: 0, right: 0, textAlign: 'center'}}>
				<span style={{fontWeight: 600, fontSize: 20, color: `${CREAM}88`}}>{link}</span>
			</div>
		</AbsoluteFill>
	);
};

export const calculateCatalogueAdMetadata = () => ({durationInFrames: 1});
