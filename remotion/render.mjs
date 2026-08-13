import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [, , propsPath, outputPath, compositionIdArg] = process.argv;
const compositionId = compositionIdArg || 'MontageAd';

if (!propsPath || !outputPath) {
	console.error('Usage: node render.mjs <props.json> <output.mp4> [compositionId]');
	console.error('  compositionId: MontageAd (default) | KenBurnsAd | GridAd | TestimonialAd | DemoTainmentAd | ListicleAd');
	process.exit(1);
}

const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));

// Remotion's dev server serves the project's public/ folder over http://,
// and a page served over http:// can't load file:// media (Chrome blocks
// it as an unknown/unsafe scheme). So instead of pointing at the uploaded
// files directly, copy them into public/render-assets/<runId>/ and reference
// them by the relative path Remotion serves them at.
const runId = crypto.randomUUID();
const assetsDir = path.join(__dirname, 'public', 'render-assets', runId);
fs.mkdirSync(assetsDir, {recursive: true});

const copyIntoPublic = (absolutePath, index) => {
	if (!absolutePath) return '';
	const ext = path.extname(absolutePath) || '';
	const destName = `${index}${ext}`;
	fs.copyFileSync(absolutePath, path.join(assetsDir, destName));
	return `/public/render-assets/${runId}/${destName}`;
};

props.images = (props.images ?? []).map((p, i) => copyIntoPublic(p, `img${i}`));
props.music = copyIntoPublic(props.music, 'music');
props.logoPath = props.logoPath ? copyIntoPublic(props.logoPath, 'logo') : '';
props.heroImage = props.heroImage ? copyIntoPublic(props.heroImage, 'hero') : '';
props.productImage = props.productImage ? copyIntoPublic(props.productImage, 'product') : '';
props.videoSrc = props.videoSrc ? copyIntoPublic(props.videoSrc, 'video') : '';
props.marketImage = props.marketImage ? copyIntoPublic(props.marketImage, 'market') : '';
props.toteCloseupImage = props.toteCloseupImage ? copyIntoPublic(props.toteCloseupImage, 'tote') : '';
props.collectionImage = props.collectionImage ? copyIntoPublic(props.collectionImage, 'collection') : '';
props.lifestyleImage = props.lifestyleImage ? copyIntoPublic(props.lifestyleImage, 'lifestyle') : '';
props.adImage = props.adImage ? copyIntoPublic(props.adImage, 'ad') : '';
props.exclusiveImage = props.exclusiveImage ? copyIntoPublic(props.exclusiveImage, 'exclusive') : '';
props.fabricsImage = props.fabricsImage ? copyIntoPublic(props.fabricsImage, 'fabrics') : '';
props.finalImage = props.finalImage ? copyIntoPublic(props.finalImage, 'final') : '';
if (Array.isArray(props.provideImages)) {
	props.provideImages = props.provideImages.map((p, i) => copyIntoPublic(p, `provide${i}`));
}
if (Array.isArray(props.items)) {
	props.items = props.items.map((item, i) =>
		item && item.image ? {...item, image: copyIntoPublic(item.image, `item${i}`)} : item
	);
}
if (Array.isArray(props.beforeImages)) {
	props.beforeImages = props.beforeImages.map((p, i) => copyIntoPublic(p, `before${i}`));
}
if (Array.isArray(props.afterImages)) {
	props.afterImages = props.afterImages.map((p, i) => copyIntoPublic(p, `after${i}`));
}
if (Array.isArray(props.portfolioImages)) {
	props.portfolioImages = props.portfolioImages.map((item, i) =>
		item && item.src ? {...item, src: copyIntoPublic(item.src, `portfolio${i}`)} : item
	);
}
if (Array.isArray(props.photos)) {
	props.photos = props.photos.map((item, i) => (item && item.src ? {...item, src: copyIntoPublic(item.src, `photo${i}`)} : item));
}

const candidateBrowserPaths = [
	process.env.REMOTION_BROWSER_EXECUTABLE,
	'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
].filter(Boolean);
const browserExecutable = candidateBrowserPaths.find((p) => p && fs.existsSync(p)) ?? null;

const skipCleanup = process.env.REMOTION_DEBUG_KEEP_ASSETS === '1';

try {
	console.log('Bundling Remotion project...');
	const bundleLocation = await bundle({
		entryPoint: path.join(__dirname, 'src', 'index.ts'),
	});

	console.log(`Selecting composition "${compositionId}"...`);
	const composition = await selectComposition({
		serveUrl: bundleLocation,
		id: compositionId,
		inputProps: props,
		browserExecutable,
	});

	console.log(`Rendering ${composition.durationInFrames} frames at ${composition.fps}fps...`);
	await renderMedia({
		composition,
		serveUrl: bundleLocation,
		codec: 'h264',
		outputLocation: outputPath,
		inputProps: props,
		browserExecutable,
		onProgress: ({renderedFrames}) => {
			if (renderedFrames % 30 === 0) {
				console.log(`  rendered frame ${renderedFrames}`);
			}
		},
	});

	console.log('DONE', outputPath);
} finally {
	if (!skipCleanup) {
		fs.rmSync(assetsDir, {recursive: true, force: true});
	}
}
