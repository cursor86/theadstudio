import React from 'react';
import {Composition} from 'remotion';
import {MontageAd, calculateMontageMetadata, montageSchema} from './MontageAd';
import {KenBurnsAd, calculateKenBurnsMetadata, kenBurnsSchema} from './KenBurnsAd';
import {GridAd, calculateGridMetadata, gridSchema} from './GridAd';
import {TestimonialAd, calculateTestimonialMetadata, testimonialSchema} from './TestimonialAd';
import {DemoTainmentAd, calculateDemoTainmentMetadata, demoTainmentSchema} from './DemoTainmentAd';
import {ListicleAd, calculateListicleMetadata, listicleSchema} from './ListicleAd';
import {StoryAd, calculateStoryMetadata, storySchema} from './StoryAd';
import {BuildUpAd, calculateBuildUpMetadata, buildUpSchema} from './BuildUpAd';
import {ArtisanStoryAd, calculateArtisanStoryMetadata, artisanStorySchema} from './ArtisanStoryAd';
import {TradingHubAd, calculateTradingHubMetadata, tradingHubSchema} from './TradingHubAd';
import {VendingAd, calculateVendingMetadata, vendingSchema} from './VendingAd';
import {AgencyReelAd, calculateAgencyReelMetadata, agencyReelSchema} from './AgencyReelAd';
import {MapZoomAd, calculateMapZoomMetadata, mapZoomSchema} from './MapZoomAd';
import {SlimeListicleAd, calculateSlimeListicleMetadata, slimeListicleSchema} from './SlimeListicleAd';
import {SlimeCaseStudyAd, calculateSlimeCaseStudyMetadata, slimeCaseStudySchema} from './SlimeCaseStudyAd';
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
				id="StoryAd"
				component={StoryAd}
				durationInFrames={25 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={storySchema}
				defaultProps={{
					brand: 'theadzstudio',
					tagline: 'Creative Digital Solutions',
					lines: [
						{text: "Every AI ad tool wants $100s a month and a tutorial just to get started.", tone: 'problem'},
						{text: "Startups don't have time for that. They need the ad, not the software.", tone: 'problem'},
						{text: 'theadzstudio: drop in a few product photos —', tone: 'solution'},
						{text: '— get back a high-converting Reel-ready video ad. Same day.', tone: 'solution'},
						{text: 'No editing. No monthly fee. No learning curve. Just the ad.', tone: 'punch'},
					],
					cta: "Let's Make Your First Ad — Free",
					link: 'theadzstudio@gmail.com',
					music: '',
				}}
				calculateMetadata={calculateStoryMetadata}
			/>
			<Composition
				id="BuildUpAd"
				component={BuildUpAd}
				durationInFrames={22 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={buildUpSchema}
				defaultProps={{
					brand: 'theadzstudio',
					tagline: 'Your Social Media Manager, Reimagined',
					cta: "Let's Build Your Brand",
					link: 'theadzstudio@gmail.com',
					music: '',
				}}
				calculateMetadata={calculateBuildUpMetadata}
			/>
			<Composition
				id="ArtisanStoryAd"
				component={ArtisanStoryAd}
				durationInFrames={28 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={artisanStorySchema}
				defaultProps={{
					logoPath: '',
					brand: 'Your Studio Name',
					about: ['The Makers', 'Full-time artisans making small-batch work'],
					inspiration: 'Inspired by nature and handed down craft.',
					images: [],
					captions: [],
					cta: 'Shop Now',
					link: 'yourstore.example',
					music: '',
					locked: false,
				}}
				calculateMetadata={calculateArtisanStoryMetadata}
			/>
			<Composition
				id="TradingHubAd"
				component={TradingHubAd}
				durationInFrames={24 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={tradingHubSchema}
				defaultProps={{
					logoPath: '',
					tagline: 'Trade With Confidence — Live, From Basics to Advanced',
					painPoints: [
						'Random tips that never work?',
						'Charts that make no sense?',
						'Afraid to place your first trade?',
					],
					curriculum: ['Trading Basics', 'Sentiment Analysis', 'Technical Analysis', 'Advanced Strategy'],
					liveCaption: 'Live, interactive sessions with real mentors — every level welcome.',
					cta: 'Enroll Now',
					link: 'sstraders.com',
					music: '',
				}}
				calculateMetadata={calculateTradingHubMetadata}
			/>
			<Composition
				id="VendingAd"
				component={VendingAd}
				durationInFrames={20 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={vendingSchema}
				defaultProps={{
					brand: 'EasyVend',
					tagline: 'Snacks & Drinks. Zero Hassle.',
					painPoints: [
						'Empty break room, missed revenue?',
						'Employees leaving the building for snacks?',
						'Tired of restocking it yourself?',
					],
					locations: ['Offices', 'Gyms', 'Apartments', 'Schools'],
					process: ['Free Consultation', 'Free Installation', 'We Stock & Service', 'You Just Enjoy It'],
					cta: 'Get Your Free Vending Machine',
					contact: 'info@easy-vend.nl  ·  +31 6 41 41 61 16',
					music: '',
					locked: true,
				}}
				calculateMetadata={calculateVendingMetadata}
			/>
			<Composition
				id="AgencyReelAd"
				component={AgencyReelAd}
				durationInFrames={29 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={agencyReelSchema}
				defaultProps={{
					brand: 'TheAdzAgency',
					products: [
						{emoji: '⌚', label: 'Watch'},
						{emoji: '🧴', label: 'Skincare'},
					],
					reasons: [
						'Instant Motion From Any Photo',
						'Studio-Grade Editorial Style',
						'Built To Convert, Not Just Look Good',
					],
					cta: 'Submit Your Product Photos Today',
					contact: 'theadzstudio@gmail.com',
					music: '',
				}}
				calculateMetadata={calculateAgencyReelMetadata}
			/>
			<Composition
				id="MapZoomAd"
				component={MapZoomAd}
				durationInFrames={10 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={mapZoomSchema}
				defaultProps={{
					region: 'Texas',
					caption: '5 Things You Didn’t Know About Texas',
					brand: 'theadzstudio',
					music: '',
				}}
				calculateMetadata={calculateMapZoomMetadata}
			/>
			<Composition
				id="SlimeListicleAd"
				component={SlimeListicleAd}
				durationInFrames={26 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={slimeListicleSchema}
				defaultProps={{
					title: '4 Slimes You NEED 🙌',
					items: [
						{label: '1', text: 'Rainbow Butter Slime 🌈 So Soft!', image: ''},
						{label: '2', text: 'Glitter Pop ✨ So Sparkly!', image: ''},
						{label: '3', text: 'Watermelon Crunch 🍉 Smells SO Good!', image: ''},
						{label: '4', text: 'Cookies & Cream 🍪 Squish It!', image: ''},
					],
					cta: 'Grab Yours Now! 🛍️',
					link: 'Shop the link in bio',
					music: '',
				}}
				calculateMetadata={calculateSlimeListicleMetadata}
			/>
			<Composition
				id="SlimeCaseStudyAd"
				component={SlimeCaseStudyAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={1080}
				height={1080}
				schema={slimeCaseStudySchema}
				defaultProps={{
					hookWords: ['STUCK.', 'STATIC.', 'INVISIBLE.'],
					problemLine: 'Flat Photos. Zero Scroll-Stop.',
					brandLine: 'theadzstudio',
					performanceLabel: 'Daily Ad Generation. Real Growth.',
					viewsTarget: 12400,
					viewsLabel: 'VIEWS',
					multiplierTarget: 3.2,
					multiplierLabel: 'SALES MULTIPLIER',
					revealLine: "Here's The Actual Ad We Built Them",
					portfolioImages: [
						{src: '', label: 'Rainbow Slime'},
						{src: '', label: 'Wooden Apple Diffuser'},
						{src: '', label: 'Visual Timer'},
						{src: '', label: 'Coffee Measuring Cup'},
						{src: '', label: 'Holiday Tumbler'},
					],
					portfolioTitle: 'Just Some Of What We Build',
					outroPunchline: "That's How Fast We Move. That's How We Create.",
					contact: 'theadzstudio@gmail.com',
					logoPath: '',
					music: '',
				}}
				calculateMetadata={calculateSlimeCaseStudyMetadata}
			/>
		</>
	);
};
