import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion';
import {DARK_PURPLE, FONT_FAMILY, GOLD, GOLD_GRADIENT} from './constants';

export const CtaEnd: React.FC<{cta: string; link: string; logoPath?: string}> = ({
	cta,
	link,
	logoPath,
}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill
			style={{
				background: GOLD_GRADIENT,
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				gap: 54,
				opacity,
			}}
		>
			{cta ? (
				<div
					style={{
						background: GOLD,
						color: DARK_PURPLE,
						fontFamily: FONT_FAMILY,
						fontWeight: 800,
						fontSize: 69,
						padding: '33px 105px',
						borderRadius: 15,
					}}
				>
					{cta}
				</div>
			) : null}
			{link ? (
				<div style={{
						color: GOLD,
						fontFamily: FONT_FAMILY,
						fontWeight: 700,
						fontSize: 39,
						textDecoration: 'underline',
						textUnderlineOffset: 6,
					}}>
					{link}
				</div>
			) : null}
			{logoPath ? <Img src={logoPath} style={{height: 195, marginTop: 15}} /> : null}
		</AbsoluteFill>
	);
};
