// Adjusts the HTML shell Expo generates for the web export.
//
// The app ships as a single-page export, and Expo only honours app/+html.tsx
// when it statically renders every route — which this app cannot do, since its
// UI depends on stored state and the resulting hydration mismatches throw. So
// the three head changes it needs are applied here instead:
//
//   viewport            iOS hands the page the notch and home-indicator areas,
//                       while fixed scaling keeps the installed app app-like.
//   theme-color         tints the browser chrome; the root layout keeps it in
//                       sync with the active theme once the app has booted.
//   background-color    those strips otherwise fall back to the document's
//                       white instead of the app's paper colour.
import {readFile, writeFile} from 'node:fs/promises';

const FILE = new URL('../dist/index.html', import.meta.url);
const PAPER = '#efe5d8';
const PAPER_DARK = '#1d1714';

// The shell is an app frame: the document itself never scrolls, an inner view
// does. Left alone, dragging past the end of that view bounces the whole page
// and exposes the blank area around it, and taps carry the browser's 300ms
// double-tap delay.
const css = [
  `html,body,#root{width:100%;height:100%;min-height:100%;}`,
  `html,body{background-color:${PAPER};overflow:hidden;}`,
  `body{min-height:100dvh;}`,
  `html.dark,html.dark body{background-color:${PAPER_DARK};}`,
  `html,body{overscroll-behavior:none;}`,
  `body{-webkit-tap-highlight-color:transparent;touch-action:manipulation;}`,
  // Keeps a scrolled-to-the-end list from handing the gesture to the page.
  `div{overscroll-behavior-y:contain;}`,
  // react-native-safe-area-context reports zeroes in the browser, which would
  // leave the menu short of the bottom edge and no strip under the status bar.
  // These take the real values straight from the viewport; the elements are
  // tagged with dataSet in (tabs)/_layout.tsx.
  `[data-safe-top]{height:env(safe-area-inset-top)!important;}`,
  `[data-safe-bottom]{padding-bottom:calc(8px + env(safe-area-inset-bottom))!important;}`,
  // Screen content clears the status bar and the menu while still scrolling
  // under both — 62px is the tab bar, 16px the screen's own edge padding.
  `[data-screen-pad]{padding-top:calc(16px + env(safe-area-inset-top))!important;padding-bottom:calc(78px + env(safe-area-inset-bottom))!important;}`,
  // Standalone headers must keep controls and text below the status bar.
  `[data-safe-header]{padding-top:calc(12px + env(safe-area-inset-top))!important;}`,
  // Keeps the overflow button clear of the status bar.
  `[data-safe-top-offset]{top:calc(12px + env(safe-area-inset-top))!important;}`,
].join('');

const head = `<meta name="theme-color" content="${PAPER}"/><meta name="apple-mobile-web-app-capable" content="yes"/><style id="safe-area-background">${css}</style>`;

const html = await readFile(FILE, 'utf8');

if (!html.includes('name="viewport"')) throw new Error('no viewport meta in dist/index.html');

let patched = html.replace(
  /(<meta name="viewport" content=")([^"]*)(")/,
  (_match, open, content, close) => {
    const settings = content
      .split(',')
      .map((setting) => setting.trim())
      .filter((setting) => !/^(maximum-scale|user-scalable|viewport-fit)\s*=/.test(setting));

    settings.push('maximum-scale=1', 'user-scalable=no', 'viewport-fit=cover');
    return `${open}${settings.join(', ')}${close}`;
  },
);

if (!patched.includes('id="safe-area-background"')) patched = patched.replace('</head>', `${head}</head>`);

if (
  !patched.includes('maximum-scale=1') ||
  !patched.includes('user-scalable=no') ||
  !patched.includes('viewport-fit=cover') ||
  !patched.includes('id="safe-area-background"')
) {
  throw new Error('failed to patch dist/index.html');
}

await writeFile(FILE, patched);
console.log('patched dist/index.html: fixed viewport, fullscreen shell, theme-color, safe-area background');
