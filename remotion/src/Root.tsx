import React from 'react';
import {Composition} from 'remotion';
import {MontageAd, calculateMontageMetadata, montageSchema} from './MontageAd';
import {KenBurnsAd, calculateKenBurnsMetadata, kenBurnsSchema} from './KenBurnsAd';
import {GridAd, calculateGridMetadata, gridSchema} from './GridAd';
import {TestimonialAd, calculateTestimonialMetadata, testimonialSchema} from './TestimonialAd';
import {DemoTainmentAd, calculateDemoTainmentMetadata, demoTainmentSchema} from './DemoTainmentAd';
import {ListicleAd, calculateListicleMetadata, listicleSchema} from './ListicleAd';
import {AvatarUGCAd, calculateAvatarUGCMetadata, avatarUGCSchema} from './AvatarUGCAd';
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
			<Composition
				id="TestimonialAd"
				component={TestimonialAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={testimonialSchema}
				defaultProps={{
					reviews: [
						{quote: 'This changed how I do things every day.', name: 'Alex P.', rating: 5},
						{quote: 'Worth every penny, would buy again.', name: 'Jordan K.', rating: 5},
					],
					productImage: '',
					cta: 'Shop Now',
					link: 'yourstore.com',
					music: '',
					logoPath: '',
				}}
				calculateMetadata={calculateTestimonialMetadata}
			/>
			<Composition
				id="DemoTainmentAd"
				component={DemoTainmentAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={demoTainmentSchema}
				defaultProps={{
					problem: 'Tired of the same old problem?',
					images: [],
					captions: ['Here\'s the fix', 'So easy', 'You\'ll love it'],
					cta: 'Shop Now',
					link: 'yourstore.com',
					music: '',
					logoPath: '',
				}}
				calculateMetadata={calculateDemoTainmentMetadata}
			/>
			<Composition
				id="ListicleAd"
				component={ListicleAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={listicleSchema}
				defaultProps={{
					title: '5 Reasons You Need This',
					items: [
						{label: '1', text: 'First reason'},
						{label: '2', text: 'Second reason'},
						{label: '3', text: 'Third reason'},
					],
					cta: 'Shop Now',
					link: 'yourstore.com',
					music: '',
					logoPath: '',
				}}
				calculateMetadata={calculateListicleMetadata}
			/>
			<Composition
				id="AvatarUGCAd"
				component={AvatarUGCAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={avatarUGCSchema}
				defaultProps={{
					beats: [
						{image: '', caption: 'First line', kind: 'avatar'},
						{image: '', caption: 'Second line', kind: 'feature'},
					],
					voiceover: '',
					music: '',
					cta: 'Shop Now',
					link: 'yourstore.com',
					logoPath: '',
				}}
				calculateMetadata={calculateAvatarUGCMetadata}
			/>
		</>
	);
};
