import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [, , propsPath, outputPath, compositionIdArg] = process.argv;
const compositionId = compositionIdArg || 'CatalogueAd';

if (!propsPath || !outputPath) {
	console.error('Usage: node render-still.mjs <props.json> <output.png> [compositionId]');
	process.exit(1);
}

const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));

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

props.productImage = props.productImage ? copyIntoPublic(props.productImage, 'product') : '';

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

	console.log('Rendering still...');
	await renderStill({
		composition,
		serveUrl: bundleLocation,
		output: outputPath,
		inputProps: props,
		browserExecutable,
	});

	console.log('DONE', outputPath);
} finally {
	if (!skipCleanup) {
		fs.rmSync(assetsDir, {recursive: true, force: true});
	}
}
