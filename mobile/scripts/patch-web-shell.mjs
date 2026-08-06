// Adjusts the HTML shell Expo generates for the web export.
//
// The app ships as a single-page export, and Expo only honours app/+html.tsx
// when it statically renders every route — which this app cannot do, since its
// UI depends on stored state and the resulting hydration mismatches throw. So
// the three head changes it needs are applied here instead:
//
//   viewport-fit=cover  iOS hands the page the notch and home-indicator areas
//                       only with this, and safe-area insets stay 0 without it.
//   theme-color         tints the browser chrome; the root layout keeps it in
//                       sync with the active theme once the app has booted.
//   background-color    those strips otherwise fall back to the document's
//                       white instead of the app's paper colour.
import {readFile, writeFile} from 'node:fs/promises';

const FILE = new URL('../dist/index.html', import.meta.url);
const PAPER = '#efe5d8';
const PAPER_DARK = '#1d1714';

const head = `<meta name="theme-color" content="${PAPER}"/><meta name="apple-mobile-web-app-capable" content="yes"/><style id="safe-area-background">html,body{background-color:${PAPER};}html.dark,html.dark body{background-color:${PAPER_DARK};}</style>`;

const html = await readFile(FILE, 'utf8');

if (!html.includes('name="viewport"')) throw new Error('no viewport meta in dist/index.html');

let patched = html.replace(
  /(<meta name="viewport" content=")([^"]*)(")/,
  (_match, open, content, close) => open + (content.includes('viewport-fit') ? content : `${content}, viewport-fit=cover`) + close,
);

if (!patched.includes('id="safe-area-background"')) patched = patched.replace('</head>', `${head}</head>`);

if (!patched.includes('viewport-fit=cover') || !patched.includes('id="safe-area-background"')) {
  throw new Error('failed to patch dist/index.html');
}

await writeFile(FILE, patched);
console.log('patched dist/index.html: viewport-fit, theme-color, safe-area background');
