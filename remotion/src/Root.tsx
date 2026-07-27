import React from 'react';
import {Composition} from 'remotion';
import {MontageAd, calculateMontageMetadata, montageSchema} from './MontageAd';
import {KenBurnsAd, calculateKenBurnsMetadata, kenBurnsSchema} from './KenBurnsAd';
import {GridAd, calculateGridMetadata, gridSchema} from './GridAd';
import {FPS, HEIGHT, WIDTH} from './constants';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MontageAd"
				component={MontageAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={montageSchema}
				defaultProps={{
					title: 'Your Product Name',
					features: ['First key feature', 'Second key feature', 'Third key feature'],
					cta: 'Shop Now',
					link: 'yourstore.com',
					images: [],
					music: '',
					logoPath: '',
				}}
				calculateMetadata={calculateMontageMetadata}
			/>
			<Composition
				id="KenBurnsAd"
				component={KenBurnsAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={kenBurnsSchema}
				defaultProps={{
					hook: 'Your Hook Line',
					captions: ['First caption', 'Second caption', 'Third caption'],
					cta: 'Shop Now',
					link: 'yourstore.com',
					images: [],
					music: '',
					logoPath: '',
				}}
				calculateMetadata={calculateKenBurnsMetadata}
			/>
			<Composition
				id="GridAd"
				component={GridAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={gridSchema}
				defaultProps={{
					title: 'Your Product Name',
					captions: ['First caption', 'Second caption', 'Third caption', 'Fourth caption'],
					cta: 'Shop Now',
					link: 'yourstore.com',
					images: [],
					music: '',
					logoPath: '',
				}}
				calculateMetadata={calculateGridMetadata}
			/>
		</>
	);
};
