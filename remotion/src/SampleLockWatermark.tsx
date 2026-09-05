import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

// Diagonal tiled "locked preview" watermark + corner badge, laid over an
// otherwise-finished ad so it can be shared with prospective clients as a
// portfolio/outreach sample without handing over a usable final file.
export const SampleLockWatermark: React.FC<{label?: string; badge?: string}> = ({
	label = 'SAMPLE · LOCKED PREVIEW · THEADZSTUDIO',
	badge = '🔒 Locked Sample — theadzstudio@gmail.com',
}) => {
	const {width, height} = useVideoConfig();

	const cols = 3;
	const rows = 6;
	const cellW = width / cols;
	const cellH = height / rows;

	const tiles: React.ReactNode[] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const offset = r % 2 === 0 ? 0 : cellW / 2;
			tiles.push(
				<div
					key={`${r}-${c}`}
					style={{
						position: 'absolute',
						left: c * cellW + offset - cellW / 2,
						top: r * cellH,
						width: cellW * 2,
						height: cellH,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transform: 'rotate(-28deg)',
					}}
				>
					<span
						style={{
							fontFamily: 'sans-serif',
							fontWeight: 700,
							fontSize: 22,
							letterSpacing: 2,
							color: 'rgba(255,255,255,0.5)',
							textShadow: '0 0 3px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.75)',
							whiteSpace: 'nowrap',
						}}
					>
						{label}
					</span>
				</div>
			);
		}
	}

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{overflow: 'hidden'}}>{tiles}</AbsoluteFill>

			<div style={{position: 'absolute', top: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div
					style={{
						padding: '10px 22px',
						borderRadius: 9999,
						background: 'rgba(20,14,8,0.55)',
						border: '1px solid rgba(255,255,255,0.35)',
						color: '#F4ECDA',
						fontFamily: 'sans-serif',
						fontWeight: 700,
						fontSize: 22,
						letterSpacing: 1,
					}}
				>
					{badge}
				</div>
			</div>
		</AbsoluteFill>
	);
};
