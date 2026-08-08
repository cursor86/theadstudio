import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// Sample reel for an Upwork brief: an ongoing "zoom into a map, then
// highlight that state" Reels series. Built as a single continuous camera
// move (not a multi-beat ad) since that's the actual format requested - a
// quick, native Reel, not a 20-30s funnel. The map itself is a stylized
// dot-density landmass (a real, popular data-viz aesthetic on social) rather
// than a literal traced country outline, since we have no way to verify a
// hand-written coastline path is geographically accurate - the skill being
// demonstrated is the zoom/highlight motion work, not cartography.
export const mapZoomSchema = z.object({
	region: z.string(),
	caption: z.string(),
	brand: z.string(),
	music: z.string(),
});

export type MapZoomProps = z.infer<typeof mapZoomSchema>;

const FPS = 30;
const INK = '#0B0F14';
const INK_DEEP = '#05070A';
const DOT = '#3A4A5C';
const ACCENT = '#FF5A5F';
const ACCENT_LIGHT = '#FF8A8E';
const CREAM = '#F4F4FA';
const SANS = '"Arial", "Helvetica Neue", sans-serif';

// Fixed-seed PRNG so dot layout is identical on every frame render (each
// Remotion frame can be a fresh JS context - Math.random() would flicker).
function mulberry32(seed: number) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Loose organic landmass outline (percentage coords) - stylized, not a
// traced real coastline.
const LANDMASS: [number, number][] = [
	[18, 30], [24, 18], [36, 12], [50, 10], [64, 14], [76, 12],
	[88, 20], [92, 32], [86, 42], [90, 52], [82, 62], [84, 74],
	[72, 84], [60, 90], [46, 88], [34, 92], [22, 82], [14, 68],
	[10, 52], [12, 40],
];

function pointInPolygon(x: number, y: number, poly: [number, number][]) {
	let inside = false;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const [xi, yi] = poly[i];
		const [xj, yj] = poly[j];
		const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
}

const TARGET = {x: 62, y: 58}; // % position of the highlighted region within the map
const TARGET_RADIUS = 9; // %

const useDots = () => {
	return useMemo(() => {
		const rand = mulberry32(42);
		const dots: {x: number; y: number; highlighted: boolean; r: number}[] = [];
		const step = 2.6;
		for (let gy = 0; gy < 100; gy += step) {
			for (let gx = 0; gx < 100; gx += step) {
				const jx = gx + (rand() - 0.5) * step * 0.7;
				const jy = gy + (rand() - 0.5) * step * 0.7;
				if (!pointInPolygon(jx, jy, LANDMASS)) continue;
				if (rand() < 0.18) continue; // thin out for a hand-set data-dot look
				const dist = Math.hypot(jx - TARGET.x, jy - TARGET.y);
				dots.push({x: jx, y: jy, highlighted: dist < TARGET_RADIUS, r: 3.2 + rand() * 2.2});
			}
		}
		return dots;
	}, []);
};

const EASE = Easing.bezier(0.32, 0.0, 0.2, 1);

export const MapZoomAd: React.FC<MapZoomProps> = ({region, caption, brand, music}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const dots = useDots();

	const mapIn = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});

	// Camera zoom: wide -> pushed in on TARGET, eased.
	const zoomProgress = interpolate(frame, [18, 96], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE,
	});
	const scale = 1 + zoomProgress * 3.4;
	// Map is a square canvas centered in the (taller) portrait frame. With
	// transform-origin 0 0, "translate(tx,ty) scale(s)" maps a local point p
	// to screen position s*p + (tx,ty) - so the translate must be solved
	// against the CURRENT scale each frame, not a flat pixel offset, or the
	// camera drifts to the wrong spot entirely as it zooms in.
	const mapSize = width; // square canvas, width-constrained
	const targetPxX = (TARGET.x / 100) * mapSize;
	const targetPxY = (TARGET.y / 100) * mapSize;
	const viewportCenterX = width / 2;
	const viewportCenterY = height * 0.42;
	const lookAtX = interpolate(zoomProgress, [0, 1], [mapSize / 2, targetPxX]);
	const lookAtY = interpolate(zoomProgress, [0, 1], [mapSize / 2, targetPxY]);
	const translateX = viewportCenterX - scale * lookAtX;
	const translateY = viewportCenterY - scale * lookAtY;

	const highlightIn = interpolate(frame, [90, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pinDrop = interpolate(frame, [92, 108], [-40, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bounce,
	});
	const pinOpacity = interpolate(frame, [92, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pulse = 1 + Math.sin(Math.max(0, frame - 110) / 8) * 0.08 * interpolate(frame, [108, 118], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const labelOpacity = interpolate(frame, [112, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const labelY = interpolate(frame, [112, 128], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const captionOpacity = interpolate(frame, [128, 144], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const bugOpacity = interpolate(frame, [150, 165], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 20%, ${INK} 0%, ${INK_DEEP} 70%)`, overflow: 'hidden'}}>
			{music ? <Audio src={music} volume={0.5} /> : null}

			<AbsoluteFill
				style={{
					opacity: mapIn,
					transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
					transformOrigin: '0 0',
				}}
			>
				<div style={{position: 'absolute', width: mapSize, height: mapSize, top: 0, left: 0}}>
					{dots.map((d, i) => {
						const isHighlighted = d.highlighted;
						// Blend from the neutral dot color to the accent only as
						// highlightIn ramps, so the target stays hidden among the
						// crowd until the camera has actually arrived.
						const t = isHighlighted ? highlightIn : 0;
						const r = Math.round(58 + (255 - 58) * t);
						const g = Math.round(74 + (90 - 74) * t);
						const b = Math.round(92 + (95 - 92) * t);
						const sizeMult = isHighlighted ? 1 + t * 0.4 * pulse : 1;
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: `${d.x}%`,
									top: `${d.y}%`,
									width: d.r * sizeMult,
									height: d.r * sizeMult,
									marginLeft: -(d.r / 2),
									marginTop: -(d.r / 2),
									borderRadius: '50%',
									background: `rgb(${r},${g},${b})`,
									boxShadow: isHighlighted && t > 0.1 ? `0 0 ${10 * t}px rgba(255,90,95,0.8)` : 'none',
								}}
							/>
						);
					})}
				</div>
			</AbsoluteFill>

			{/* Pin + label sit in screen space (outside the zoomed/transformed layer) */}
			<div
				style={{
					position: 'absolute',
					left: viewportCenterX,
					top: viewportCenterY,
					transform: `translate(-50%, calc(-100% + ${pinDrop}px))`,
					opacity: pinOpacity,
					fontSize: 64,
					filter: `drop-shadow(0 0 18px rgba(255,90,95,0.7))`,
				}}
			>
				📍
			</div>

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: viewportCenterY + 90,
					textAlign: 'center',
					opacity: labelOpacity,
					transform: `translateY(${labelY}px)`,
				}}
			>
				<div
					style={{
						display: 'inline-block',
						padding: '14px 34px',
						borderRadius: 999,
						background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 100%)`,
						color: 'white',
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 40,
						letterSpacing: 1,
						boxShadow: '0 12px 30px rgba(255,90,95,0.4)',
					}}
				>
					{region.toUpperCase()}
				</div>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 220,
					textAlign: 'center',
					opacity: captionOpacity,
					padding: '0 90px',
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 30,
					color: CREAM,
					textShadow: '0 4px 20px rgba(0,0,0,0.6)',
				}}
			>
				{caption}
			</div>

			<div
				style={{
					position: 'absolute',
					bottom: 60,
					left: 0,
					right: 0,
					display: 'flex',
					justifyContent: 'center',
					opacity: bugOpacity,
				}}
			>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 20,
						letterSpacing: 2,
						color: 'rgba(244,244,250,0.55)',
					}}
				>
					{brand.toUpperCase()}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const DURATION_SECONDS = 10;
export const calculateMapZoomMetadata = () => ({durationInFrames: Math.round(DURATION_SECONDS * FPS)});
