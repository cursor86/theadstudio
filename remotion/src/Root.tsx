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
import {TradingHubPoster, calculateTradingHubPosterMetadata, tradingHubPosterSchema} from './TradingHubPoster';
import {SlimeAsmrAd, calculateSlimeAsmrMetadata, slimeAsmrSchema} from './SlimeAsmrAd';
import {TransformationPromoAd, calculateTransformationPromoMetadata, transformationPromoSchema} from './TransformationPromoAd';
import {CasaBellaConceptAd, calculateCasaBellaConceptMetadata, casaBellaConceptSchema} from './CasaBellaConceptAd';
import {BrightBloomTeaserAd, calculateBrightBloomTeaserMetadata, brightBloomTeaserSchema} from './BrightBloomTeaserAd';
import {HandbagShowcaseAd, calculateHandbagShowcaseMetadata, handbagShowcaseSchema} from './HandbagShowcaseAd';
import {QuickCaptionAd, calculateQuickCaptionMetadata, quickCaptionSchema} from './QuickCaptionAd';
import {BookPromoAd, calculateBookPromoMetadata, bookPromoSchema} from './BookPromoAd';
import {Projekt46BikesAd, calculateProjekt46Metadata, projekt46Schema} from './Projekt46BikesAd';
import {NewFineraAd, calculateNewFineraMetadata, newFineraSchema} from './NewFineraAd';
import {MomsCommunityAd, calculateMomsCommunityMetadata, momsCommunitySchema} from './MomsCommunityAd';
import {SunscreenMotionAd, calculateSunscreenMotionMetadata, sunscreenMotionSchema} from './SunscreenMotionAd';
import {AffiliateMotionAd, calculateAffiliateMotionMetadata, affiliateMotionSchema} from './AffiliateMotionAd';
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
			<Composition
				id="TradingHubPoster"
				component={TradingHubPoster}
				durationInFrames={30}
				fps={FPS}
				width={1080}
				height={1080}
				schema={tradingHubPosterSchema}
				defaultProps={{
					title: 'Real Sentiment & Technical Analysis',
					sentimentLabel: 'Market Sentiment: Bullish',
					statLeft: '📈 10-Day Trend',
					statRight: '🎯 Live Signal',
					watermark: 'theadzstudio',
				}}
				calculateMetadata={calculateTradingHubPosterMetadata}
			/>
			<Composition
				id="SlimeAsmrAd"
				component={SlimeAsmrAd}
				durationInFrames={20 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={slimeAsmrSchema}
				defaultProps={{
					heroImage: '',
					flavorLabel: 'Butter Slime',
					openingLine: 'Slow. Soft. Satisfying.',
					closingLine: 'Content that feels as good as it looks.',
					brandName: 'theadzstudio',
					contact: 'theadzstudio@gmail.com',
					music: '',
				}}
				calculateMetadata={calculateSlimeAsmrMetadata}
			/>
			<Composition
				id="TransformationPromoAd"
				component={TransformationPromoAd}
				durationInFrames={16 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={transformationPromoSchema}
				defaultProps={{
					brandName: 'theadzstudio',
					tagline: 'Creative Digital Solutions',
					beforeLabel: 'What You Give Us',
					beforeImages: [],
					beforePainPoints: ['Random Product Photos', 'Low Social Presence', 'Low-Quality Content', 'Fewer Sales'],
					afterLabel: 'What You Get',
					afterImages: [],
					afterWins: ['Scroll-Stopping Content', 'More Likes & Followers', 'Higher Sales'],
					logoPath: '',
					cta: 'Ready To Level Up Your Content?',
					contact: 'theadzstudio@gmail.com',
				}}
				calculateMetadata={calculateTransformationPromoMetadata}
			/>
			<Composition
				id="CasaBellaConceptAd"
				component={CasaBellaConceptAd}
				durationInFrames={20 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={casaBellaConceptSchema}
				defaultProps={{
					storeHandle: '@mobileria_casabella',
					storeCity: 'Gjakovë, Kosovë',
					taglineEn: 'Furniture That Feels Like Home',
					taglineSq: 'Mobilje Që Ndihen Si Shtëpi',
					photos: [],
					music: '',
				}}
				calculateMetadata={calculateCasaBellaConceptMetadata}
			/>
			<Composition
				id="BrightBloomTeaserAd"
				component={BrightBloomTeaserAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={brightBloomTeaserSchema}
				defaultProps={{
					marketImage: '',
					toteCloseupImage: '',
					collectionImage: '',
					lifestyleImage: '',
					hookText: 'Stop buying boring, mass-produced bags. 🌸',
					toteText: 'Meet the ultimate everyday tote.',
					collectionText: 'Premium quilted cotton. Slow, artisan fashion.',
					ctaText: "Designed in Suffolk. Tap the link to claim your print before it sells out. ✨",
					music: '',
				}}
				calculateMetadata={calculateBrightBloomTeaserMetadata}
			/>
			<Composition
				id="HandbagShowcaseAd"
				component={HandbagShowcaseAd}
				durationInFrames={26 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={handbagShowcaseSchema}
				defaultProps={{
					provideImages: [],
					provideHeadline: 'THIS IS WHAT YOU PROVIDE US',
					adImage: '',
					adRevealText: "HERE'S OUR AD",
					exclusiveText: 'Versatile. Handmade. Exclusive handbags — only at our store.',
					exclusiveImage: '',
					fabricsText: 'Colours that pop. Fabrics that last.',
					fabricsImage: '',
					finalImage: '',
					finalTagline: 'Waiting for you with our crafts.',
					brandName: 'theadzstudio',
					ctaLine: "That's the difference we bring to your story.",
					contact: 'theadzstudio@gmail.com',
					logoPath: '',
					music: '',
				}}
				calculateMetadata={calculateHandbagShowcaseMetadata}
			/>
			<Composition
				id="QuickCaptionAd"
				component={QuickCaptionAd}
				durationInFrames={20 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={quickCaptionSchema}
				defaultProps={{
					slides: [],
					music: '',
				}}
				calculateMetadata={calculateQuickCaptionMetadata}
			/>
			<Composition
				id="BookPromoAd"
				component={BookPromoAd}
				durationInFrames={20 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={bookPromoSchema}
				defaultProps={{
					hookLine: 'Every few years, the ground shifts under sellers and business owners. 2027 is shaping up to be one of those years.',
					coverImage: '',
					insideImages: [],
					insideCaptions: [],
					summarySlides: [
						{
							title: 'TOP NICHES TO WATCH',
							items: ['Personalized pet keepsakes', 'AI-assisted custom portraits', 'Sustainable home & kitchen goods', 'Wellness ritual kits'],
						},
						{
							title: 'BONUS: 150+ PRODUCT IDEAS',
							items: ['Printables & Planners', 'AI-Assisted Art & Design', 'Personalized Physical Goods', 'Wellness & Ritual'],
						},
					],
					audienceLine: 'For Etsy sellers, Shopify owners, and makers building for what’s next.',
					ctaLine: 'Get your copy before 2027 catches everyone else off guard.',
					shopLine: 'Available Now on Etsy',
					music: '',
				}}
				calculateMetadata={calculateBookPromoMetadata}
			/>
			<Composition
				id="Projekt46BikesAd"
				component={Projekt46BikesAd}
				durationInFrames={17 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={projekt46Schema}
				defaultProps={{
					videoSrc: '',
					brand: 'PROJEKT 46 BIKES',
					tagline: 'BUILT. TESTED. RIDDEN.',
					ctaLine: 'COMING SOON',
					music: '',
				}}
				calculateMetadata={calculateProjekt46Metadata}
			/>
			<Composition
				id="NewFineraAd"
				component={NewFineraAd}
				durationInFrames={20 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={newFineraSchema}
				defaultProps={{
					brand: 'NewFinera',
					tagline: 'Bookkeeping & Virtual CFO for growing businesses.',
					kpis: [
						{label: 'Revenue', value: '$128K'},
						{label: 'Expenses', value: '$54K'},
						{label: 'Net Cash Flow', value: '+$21K'},
					],
					painLine: 'Manual books. Missed deadlines. No time to look ahead.',
					reliefLine: 'Your books. Handled.',
					valueLine: 'Virtual CFO insight, without the full-time cost.',
					services: [
						{
							title: 'BOOKKEEPING & SYSTEMS SETUP',
							price: 'From $350/month',
							items: ['Chart of accounts setup', 'Xero or MYOB management', 'Monthly bank reconciliation', 'Accounts payable/receivable tracking'],
						},
						{
							title: 'VIRTUAL CFO & MANAGEMENT ACCOUNTS',
							price: 'From $750/month',
							items: ['Monthly management accounts', 'Cash flow forecasting', 'Budget vs. actual analysis', 'KPI dashboard + monthly review call'],
						},
					],
					freeToolsLine: 'Free tax calculators, salary guides, and financial articles — no strings attached.',
					cta: 'Book Your Free Consultation',
					contact: '',
					walletImage: '',
					deviceImage: '',
					music: '',
				}}
				calculateMetadata={calculateNewFineraMetadata}
			/>
			<Composition
				id="MomsCommunityAd"
				component={MomsCommunityAd}
				durationInFrames={30 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={momsCommunitySchema}
				defaultProps={{
					bannerText: "Let's Build a Community of Love, Support, and Growing Together!",
					headline: 'CALLING ALL MOTHERS & STAY-AT-HOME MOMS!',
					scriptMessage: 'Building their small business & showing their talents in the beautiful things they make.',
					ctaLine: 'Then find ONE other mom-owned business in the comments and show them some love.',
					ctaHighlight: 'ONE',
					brand: 'theadzstudio',
					tagline: 'Creative Digital Solutions',
					footerLine: "Tag a mom-owned business below, and we'll feature it.",
					music: '',
					musicVolume: 0.5,
				}}
				calculateMetadata={calculateMomsCommunityMetadata}
			/>
			<Composition
				id="SunscreenMotionAd"
				component={SunscreenMotionAd}
				durationInFrames={10 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={sunscreenMotionSchema}
				defaultProps={{
					hookLine: 'Sunscreen that actually disappears.',
					benefitLine: 'Glides on clear. Weightless. Layers under makeup — zero white cast, zero grease.',
					brandLine: 'La Roche-Posay Anthelios Invisible Fluid SPF50+',
					subLine: 'DERMATOLOGIST-TESTED · BROAD-SPECTRUM · RRP $39.99',
					cta: 'SHOP NOW',
					link: 'amazon.com.au',
					music: '',
				}}
				calculateMetadata={calculateSunscreenMotionMetadata}
			/>
			<Composition
				id="AffiliateMotionAd"
				component={AffiliateMotionAd}
				durationInFrames={10 * FPS}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				schema={affiliateMotionSchema}
				defaultProps={{
					hookLine: 'The smart speaker that runs your whole home.',
					benefitLine: 'Hands-free control for lights, timers & music — voice-controls your whole smart home setup.',
					brandLine: 'Amazon Echo Dot (5th Gen) with Clock',
					subLine: 'BUILT-IN CLOCK · COMPACT DESIGN · HANDS-FREE ALEXA',
					cta: 'SHOP NOW',
					link: 'amazon.com.au',
					iconKey: 'speaker',
					music: '',
				}}
				calculateMetadata={calculateAffiliateMotionMetadata}
			/>
		</>
	);
};
