// Bundles the modules in src/ into self-contained pages: dist/index.html (the live page)
// and dist/chat.html (the earlier chat with Enter, kept for comparison and debugging pages),
// that work from disk or GitHub Pages.
// The modules stay ES modules for the Node tests; import and export are stripped here.
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const engine = ['geometry', 'lexicon', 'parser', 'pen', 'pieces', 'rig', 'stage', 'dialogue', 'export', 'misses'];
const bundle = (entry, extra = []) => [...engine, ...extra, entry]
  .map((name) => readFileSync(join(here, 'src', `${name}.js`), 'utf8')
    .replace(/^import .*$/gm, '')
    .replace(/^export \{[^}]*\};?$/gm, '')
    .replace(/^export /gm, ''))
  .join('\n')
  // The word-report collector is configured at build time and never committed in the source.
  .replace("const REPORT_ENDPOINT = '';", `const REPORT_ENDPOINT = ${JSON.stringify(process.env.DESCRIBBLE_REPORT_ENDPOINT ?? '')};`);
// Parse every bundle before writing it: a syntax error would otherwise leave a blank page.
const checked = (code, name) => {
  try {
    new Function(code);
  } catch (error) {
    throw new Error(`${name} bundle does not parse: ${error.message}`);
  }
  return code;
};
const script = checked(bundle('app', ['gif']), 'chat');

const page = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,interactive-widget=resizes-content">
<title>Describble · chat</title>
<style>
@property --accent { syntax: '<color>'; inherits: true; initial-value: #6f7fa8; }
:root { --accent: #6f7fa8; --bg: #f4efe4; --paper: #fbf6ec; --ink: #1b1b1f; --muted: #6b6760; transition: --accent .6s; }
@media (prefers-color-scheme: dark) { :root { --bg: #1c1b19; --ink: #f1ece2; --muted: #a39e94; } }
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body { background: color-mix(in oklch, var(--bg) 88%, var(--accent)); color: var(--ink); font: 16px/1.4 ui-rounded, system-ui, sans-serif; }
main { display: grid; grid-template-rows: auto 1fr auto; height: 100dvh; max-width: 520px; margin: 0 auto; padding: 16px; gap: 12px; }
#stage { width: min(100%, 46dvh); aspect-ratio: 1; margin: 0 auto; display: block; border-radius: 24px; background: var(--paper);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent) 45%, transparent), 0 18px 40px -20px color-mix(in oklch, var(--accent) 70%, black); }
#log { overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 4px 2px; scroll-behavior: smooth; }
#log p { margin: 0; max-width: 85%; padding: 8px 12px; border-radius: 16px; }
#log .me { align-self: flex-end; background: color-mix(in oklch, var(--accent) 22%, var(--paper)); color: #1b1b1f; border-bottom-right-radius: 4px; }
#log .bot { align-self: flex-start; color: var(--muted); padding-left: 2px; }
#say { width: 100%; font: inherit; padding: 14px 16px; border-radius: 16px; border: 2px solid color-mix(in oklch, var(--accent) 55%, transparent);
  background: var(--paper); color: #1b1b1f; outline: none; }
#say:focus { border-color: var(--accent); }
#catalog { display: none; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 16px; }
#gif { display: none; }
#catalog figure { margin: 0; } #catalog svg { width: 100%; display: block; } #catalog figcaption { font-size: 12px; }
body[data-mode=catalog] main { display: none; } body[data-mode=catalog] #catalog { display: grid; }
body[data-mode=misses] main { display: none; }
body[data-mode=misses] #catalog { display: block; padding: 24px; font-size: 15px; }
body[data-mode=misses] #catalog textarea { width: 100%; height: 220px; font: 13px ui-monospace, monospace; }
body[data-mode=gallery] { background: #0d0e12; }
body[data-mode=gallery] main { display: none; }
body[data-mode=gallery] #catalog { display: grid; grid-template-columns: repeat(4, 1fr); gap: 34px 28px; padding: 40px; }
body[data-mode=gallery] #catalog svg { border-radius: 50%; box-shadow: 0 0 0 2px rgba(243, 239, 230, .14), 0 20px 60px -24px rgba(0, 0, 0, .9); }
body[data-mode=gallery] #catalog figcaption { margin-top: 12px; text-align: center; font-size: 15px; color: rgba(243, 239, 230, .75); }
</style>
<main>
<svg id="stage" role="img" aria-label="The character you are describing"></svg>
<div id="log" aria-live="polite"></div>
<input id="say" autocomplete="off" autofocus placeholder="blond, cigarette in mouth…" aria-label="Describe the character">
</main>
<div id="catalog"></div>
<pre id="gif"></pre>
<script>
${script}
</script>
</html>
`;

mkdirSync(join(here, 'dist'), { recursive: true });
writeFileSync(join(here, 'dist', 'chat.html'), page);
console.log(`ok: dist/chat.html (${(page.length / 1024).toFixed(0)} KB)`);


// ---------- the website: the live drawing as the hero, then the gallery and the project ----------
// Optional links, given at build time so forks never point at someone else's pages.
const links = { repo: process.env.DESCRIBBLE_REPO_URL ?? '', support: process.env.DESCRIBBLE_SUPPORT_URL ?? '' };
// A light, dependency-free minification of the published script: whole-line comments, blank
// lines and indentation go away; everything else is kept as written. Checked to render the same.
const minify = (code) => process.env.DESCRIBBLE_NO_MINIFY ? code : code.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('//')).join('\n');
const siteScript = checked(minify(checked(bundle('live', ['site'])
  .replace("const SITE_LINKS = { repo: '', support: '' };", `const SITE_LINKS = ${JSON.stringify(links)};`), 'live')), 'minified live');

// The display face (Bricolage Grotesque, SIL OFL 1.1, see assets/fonts/OFL.txt) is inlined,
// so the page never asks a font service for it.
const displayFont = readFileSync(join(here, 'assets', 'fonts', 'bricolage-grotesque-latin-750.woff2')).toString('base64');

// The mark (app/assets/brand/mark.svg): a face whose nose is a text cursor. It is the favicon
// and sits inline next to the wordmark; the PNG icons beside it are published as files.
const markSvg = readFileSync(join(here, 'assets', 'brand', 'mark.svg'), 'utf8').replace(/<!--[\s\S]*?-->\s*/g, '').trim();
const favicon = `data:image/svg+xml,${encodeURIComponent(markSvg)}`;
// GitHub's own mark (Octicons mark-github, MIT, by GitHub), used only to link to the repository.
const githubMark = '<svg class="gh" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656"/></svg>';
const markInline = markSvg.replace('<svg ', '<svg class="mark" aria-hidden="true" ').replace(/ role="img" aria-label="Describble"/, '');

const site = (script) => `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,interactive-widget=resizes-content">
<title>Describble: free avatar maker from a sentence, no AI</title>
<meta name="description" content="Type a description and get a hand-drawn avatar in seconds. Free pfp maker: no AI, no photo, no sign-up. Download a PNG for Discord, GitHub or WhatsApp.">
<link rel="alternate" hreflang="en" href="https://describble.com/">
<link rel="alternate" hreflang="it" href="https://describble.com/it/">
<link rel="alternate" hreflang="x-default" href="https://describble.com/">
<meta property="og:locale" content="en_US">
<!--structured-data-->
<meta name="theme-color" content="#0f1118">
<meta name="color-scheme" content="dark">
<meta property="og:title" content="Describble: free avatar maker from a sentence, no AI">
<meta property="og:description" content="Type a description and get a hand-drawn avatar in seconds. No AI, no photo, no sign-up. Free and open source.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://describble.com/">
<link rel="canonical" href="https://describble.com/">
<link rel="icon" href="${favicon}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:image" content="https://describble.com/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Describble: a hand-drawn avatar appearing from a sentence">
<meta name="twitter:card" content="summary_large_image">
<style>
@font-face { font-family: "Bricolage Grotesque"; font-weight: 750; font-display: swap; src: url(data:font/woff2;base64,${displayFont}) format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212; }
:root {
  --night: #0f1118; --paper: #f6efe1; --ink: #1b1b1f;
  --text: #f6efe1; --muted: rgba(246, 239, 225, .72); --faint: rgba(246, 239, 225, .58); --rule: rgba(246, 239, 225, .16);
  --accent: #e8c15a;
  --font: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", sans-serif;
  --display: "Bricolage Grotesque", var(--font);
  --wide: 1180px; --gutter: clamp(16px, 4vw, 40px);
  color-scheme: dark;
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
html, body { margin: 0; overflow-x: clip; }
html { scroll-behavior: smooth; }
body { background: var(--night); color: var(--text); font: 17px/1.5 var(--font); -webkit-font-smoothing: antialiased; }
a { color: inherit; text-underline-offset: .2em; }
button { font: inherit; color: inherit; }
::selection { background: var(--paper); color: var(--ink); }
html { scrollbar-color: var(--rule) var(--night); }
h1, h2 { text-wrap: balance; }
:focus-visible { outline: 2px solid var(--paper); outline-offset: 3px; }
#lines { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; }

header { position: absolute; inset: 0 0 auto; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 16px;
  max-width: var(--wide); margin: 0 auto; padding: 18px var(--gutter); }
.wordmark { display: inline-flex; align-items: center; gap: 10px; font-family: var(--display); font-weight: 750; font-size: 20px; letter-spacing: -.01em; text-decoration: none; }
.mark { width: 30px; height: 30px; flex: none; }
.tools { display: flex; align-items: center; gap: 6px; }
.lang { border: 0; background: none; padding: 6px 8px; border-radius: 8px; color: var(--faint); cursor: pointer; }
.lang[aria-pressed=true] { color: var(--text); background: var(--rule); }
.gh { width: 18px; height: 18px; flex: none; }
.star { display: inline-flex; align-items: center; gap: 8px; margin-left: 8px; padding: 7px 14px; border: 1px solid var(--rule); border-radius: 999px; text-decoration: none; font-size: 15px; }
.star:hover { border-color: var(--muted); }

#hero { position: relative; z-index: 1; display: grid; gap: 18px 56px; align-items: center; min-height: 100svh;
  max-width: var(--wide); margin: 0 auto; padding: 76px var(--gutter) 28px;
  grid-template-columns: minmax(0, 1fr); grid-template-areas: "intro" "drawing" "composer"; }
.intro { grid-area: intro; }
.drawing { grid-area: drawing; display: grid; place-items: center; }
.composer { grid-area: composer; display: grid; gap: 12px; }
h1 { margin: 0; font-family: var(--display); font-size: clamp(1.9rem, 4.4vw, 3.7rem); line-height: 1.04; letter-spacing: -.025em; font-weight: 750; overflow-wrap: break-word; min-width: 0; }
.lede { margin: 14px 0 0; max-width: 30em; color: var(--muted); font-size: 1.1rem; }
#stage { width: min(100%, 64svh, 560px); aspect-ratio: 1; display: block; cursor: grab; touch-action: none; border-radius: 50%;
  box-shadow: 0 0 0 2px var(--rule), 0 30px 90px -30px rgba(0, 0, 0, .9), 0 0 140px -50px var(--accent); transition: box-shadow .8s; }
#stage:active { cursor: grabbing; }
#say { width: 100%; min-height: 3.2em; max-height: 9em; resize: none; font: inherit; font-size: 21px; line-height: 1.35; padding: 8px 0; border: 0;
  border-bottom: 1px solid var(--rule); background: transparent; color: var(--text); caret-color: var(--text); outline: none; }
#say::placeholder { color: var(--faint); }
#say:focus { border-bottom-color: var(--muted); }
#say:focus-visible { outline: none; border-bottom: 2px solid var(--paper); }
.actions { display: flex; flex-wrap: wrap; gap: 10px; }
.button { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 20px; border-radius: 999px; border: 1px solid var(--rule);
  background: none; cursor: pointer; text-decoration: none; font-family: var(--display); font-weight: 750; font-size: 16px; transition: border-color .2s, background-color .2s; }
.button:hover { border-color: var(--muted); }
.button:disabled { opacity: .45; cursor: default; }
.button:disabled:hover { border-color: var(--rule); }
.button.primary { background: var(--paper); color: var(--ink); border-color: var(--paper); }
.button.primary:hover:not(:disabled) { background: #fffaf0; }
.button.primary:disabled:hover { border-color: var(--paper); }
#status { min-height: 1.5em; margin: 0; color: var(--muted); font-size: 15px; }
noscript p { color: var(--muted); }

section { position: relative; z-index: 1; max-width: var(--wide); margin: 0 auto; padding: clamp(64px, 10vw, 120px) var(--gutter) 0; }
h2 { margin: 0 0 12px; font-family: var(--display); font-size: clamp(1.6rem, 3vw, 2.4rem); line-height: 1.1; letter-spacing: -.02em; font-weight: 750; max-width: 22em; }
section > p { max-width: 36em; color: var(--muted); margin: 0 0 20px; }
#gallery { list-style: none; margin: 28px 0 0; padding: 0; display: grid; gap: 28px 22px; grid-template-columns: repeat(auto-fill, minmax(min(150px, 40%), 1fr)); }
#gallery button { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; text-align: center; }
#gallery figure { margin: 0; }
#gallery svg { display: block; width: 100%; aspect-ratio: 1; border-radius: 50%; box-shadow: 0 0 0 2px var(--rule), 0 18px 50px -24px rgba(0, 0, 0, .9);
  transition: transform .25s, box-shadow .25s; }
#gallery button:hover svg { transform: translateY(-3px); box-shadow: 0 0 0 2px var(--muted), 0 24px 60px -24px rgba(0, 0, 0, .9); }
#gallery button:focus-visible { outline: none; }
#gallery button:focus-visible svg { box-shadow: 0 0 0 3px var(--paper); }
#gallery figcaption { margin-top: 10px; font-size: 14px; line-height: 1.35; color: var(--muted); }
.how { display: grid; gap: 20px 40px; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); margin-top: 24px; }
.how p { margin: 0; padding-top: 16px; border-top: 1px solid var(--rule); color: var(--muted); }
ol.steps { margin: 20px 0 0; padding-left: 1.4em; display: grid; gap: 10px; max-width: 36em; color: var(--muted); }
ol.steps li::marker { color: var(--text); font-weight: 700; }
footer { position: relative; z-index: 1; max-width: var(--wide); margin: clamp(64px, 10vw, 120px) auto 0; padding: 28px var(--gutter) 40px;
  border-top: 1px solid var(--rule); display: grid; gap: 8px; color: var(--faint); font-size: 14px; }
footer p { margin: 0; max-width: 46em; }
.faq { display: grid; gap: 10px; max-width: 46em; margin-top: 20px; }
.faq details { border-top: 1px solid var(--rule); padding: 14px 0 4px; }
.faq summary { cursor: pointer; font-weight: 650; list-style: none; }
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after { content: "+"; float: right; color: var(--muted); }
.faq details[open] summary::after { content: "–"; }
.faq p { color: var(--muted); margin: 10px 0 8px; }
.other-language { color: var(--muted); }
.footer-links { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.footer-links a { color: var(--muted); }
.footer-links a:hover { color: var(--text); }
#report { justify-self: start; border: 1px solid var(--rule); background: none; border-radius: 999px; padding: 4px 12px; color: var(--muted); cursor: pointer; font-size: 13px; }

@media (min-width: 900px) {
  #hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); grid-template-areas: "intro drawing" "composer drawing"; align-content: center; }
  .intro { align-self: end; }
  .composer { align-self: start; }
  #stage { width: min(100%, 76svh, 560px); }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  #stage, #gallery svg, .button { transition: none; }
  #gallery button:hover svg { transform: none; }
}
</style>
<canvas id="lines" aria-hidden="true"></canvas>
<header>
  <a class="wordmark" href="#hero">${markInline}<span>Describble</span></a>
  <nav class="tools" aria-label="Language and project">
    <button class="lang" type="button" data-lang="en" aria-pressed="true">EN</button>
    <button class="lang" type="button" data-lang="it" aria-pressed="false">IT</button>
    <a class="star" data-link="repo" href="#">${githubMark}<span data-copy="github">GitHub</span></a>
  </nav>
</header>
<main>
  <div id="hero">
    <div class="intro">
      <h1 data-copy="headline">Describe someone. Watch them get drawn.</h1>
      <p class="lede" data-copy="lede">Hand-drawn avatars from a sentence. No AI, no account, nothing to install.</p>
    </div>
    <div class="drawing"><svg id="stage" role="img" aria-label="The character you are describing"></svg></div>
    <div class="composer">
      <textarea id="say" rows="2" autocomplete="off" spellcheck="false" aria-label="Describe the character" placeholder="blond, cigarette in mouth, tired eyes…"></textarea>
      <p id="status" aria-live="polite"></p>
      <div class="actions">
        <button class="button primary" id="download" type="button" data-copy="download" disabled>Download PNG</button>
        <button class="button" id="share" type="button" data-copy="share" disabled>Copy link</button>
        <button class="button" id="surprise" type="button" data-copy="surprise">Surprise me</button>
      </div>
      <noscript><p data-copy="noscript">Describble draws with JavaScript. Turn it on to describe your character.</p></noscript>
    </div>
  </div>

  <section aria-labelledby="gallery-title">
    <h2 id="gallery-title" data-copy="galleryTitle">Start from one of these</h2>
    <p data-copy="galleryNote">Tap a face to write its sentence, then change any word.</p>
    <ul id="gallery"></ul>
  </section>

  <section aria-labelledby="how-title">
    <h2 id="how-title" data-copy="howTitle">No AI. Just words and a pencil.</h2>
    <div class="how" data-copy="how"><p></p><p></p><p></p></div>
  </section>

  <section aria-labelledby="use-title">
    <h2 id="use-title" data-copy="useTitle">Use it as your profile picture</h2>
    <ol class="steps" data-copy="use"><li></li><li></li><li></li></ol>
  </section>

  <section aria-labelledby="open-title">
    <h2 id="open-title" data-copy="openTitle">Open source, and free to use</h2>
    <p data-copy="open"></p>
    <div class="actions" data-needs="repo">
      <a class="button primary" data-link="repo" href="#">${githubMark}<span data-copy="viewOnGithub">View on GitHub</span></a>
      <a class="button" data-link="issues" data-copy="suggest" href="#">Suggest a word</a>
    </div>
  </section>

  <section aria-labelledby="faq-title">
    <h2 id="faq-title" data-copy="faqTitle">Questions</h2>
    <div class="faq">
      <details><summary data-copy="faqQ1"></summary><p data-copy="faqA1"></p></details>
      <details><summary data-copy="faqQ2"></summary><p data-copy="faqA2"></p></details>
      <details><summary data-copy="faqQ3"></summary><p data-copy="faqA3"></p></details>
      <details><summary data-copy="faqQ4"></summary><p data-copy="faqA4"></p></details>
      <details><summary data-copy="faqQ5"></summary><p data-copy="faqA5"></p></details>
      <details><summary data-copy="faqQ6"></summary><p data-copy="faqA6"></p></details>
    </div>
  </section>

  <section aria-labelledby="support-title" data-needs="support">
    <h2 id="support-title" data-copy="supportTitle">Keep it free</h2>
    <p data-copy="support"></p>
    <div class="actions"><a class="button" data-link="support" data-copy="supportLink" href="#">Support on Ko-fi</a></div>
  </section>
</main>
<footer>
  <p data-copy="privacy">Your sentence stays in your browser.</p>
  <p id="privacy-reports" data-copy="privacyReports" hidden></p>
  <button id="report" type="button" hidden></button>
  <p data-copy="license">Code MIT, drawings CC0.</p>
  <p><a class="other-language" href="/it/" hreflang="it">Italiano</a></p>
  <nav class="footer-links" aria-label="Project" data-needs="repo">
    <a data-link="privacy" data-copy="footerPrivacy" href="#">Privacy</a>
    <a data-link="repo" data-copy="footerCode" href="#">Source code</a>
    <a data-link="issues" data-copy="footerIssue" href="#">Report a problem</a>
  </nav>
</footer>
<script>
${script}
</script>
</html>
`;
// Each language gets a complete page: the copy from site.js is written into the HTML, so search
// engines and visitors without JavaScript read it too. English at /, Italian at /it/.
const { siteCopy } = await import('./src/site.js');
const SITE_REPO = links.repo.replace(/\/+$/, '');
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const prerender = (html, lang) => {
  const copy = siteCopy[lang];
  const url = lang === 'it' ? 'https://describble.com/it/' : 'https://describble.com/';
  let out = html
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(copy.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escapeHtml(copy.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escapeHtml(copy.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escapeHtml(copy.description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:locale" content=")[^"]*/, `$1${lang === 'it' ? 'it_IT' : 'en_US'}`);
  out = out.replace(/(<(\w+)\b[^>]*\bdata-copy="(\w+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (whole, open, tag, key, inner, close) => {
    const value = copy[key];
    if (typeof value === 'string') return open + escapeHtml(value) + close;
    if (Array.isArray(value)) {
      const child = inner.match(/<(\w+)/)?.[1] ?? 'p';
      return open + value.map((item) => `<${child}>${escapeHtml(item)}</${child}>`).join('') + close;
    }
    return whole;
  });
  // The footer points to the other language as a plain link search engines can follow.
  if (lang === 'it') out = out.replace('href="/it/" hreflang="it">Italiano</a>', 'href="/" hreflang="en">English</a>');
  // Structured data: the site as a free web app, and the questions section as an FAQ.
  const faq = [1, 2, 3, 4, 5, 6].map((i) => ({ '@type': 'Question', name: copy[`faqQ${i}`], acceptedAnswer: { '@type': 'Answer', text: copy[`faqA${i}`] } }));
  const data = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Describble', url, description: copy.description, inLanguage: lang,
      applicationCategory: 'DesignApplication', operatingSystem: 'Any (web browser)', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, image: 'https://describble.com/og.png',
      sameAs: SITE_REPO ? [SITE_REPO] : [] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: faq },
  ];
  out = out.replace('<!--structured-data-->', `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`);
  // The aria-labels set by the script start right in the page's language.
  return out
    .replace('aria-label="Describe the character"', `aria-label="${escapeHtml(copy.inputLabel)}"`)
    .replace('aria-label="The character you are describing"', `aria-label="${escapeHtml(copy.stageLabel)}"`);
};
const live = prerender(site(siteScript), 'en');
const liveItalian = prerender(site(siteScript), 'it');
writeFileSync(join(here, 'dist', 'index.html'), live);
console.log(`ok: dist/index.html (${(live.length / 1024).toFixed(0)} KB${links.repo ? '' : ', no repo link yet'})`);

// ---------- what gets published: dist/site/ (Cloudflare Pages or GitHub Pages) ----------
// A strict Content Security Policy: only our own inline script and style (by hash) may run,
// fonts and images come from data:/blob: URLs, and the only address the page may contact
// is the optional word-report collector.
const hashOf = (text) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;
const inline = (tag) => live.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))[1];
const reportOrigin = process.env.DESCRIBBLE_REPORT_ENDPOINT ? new URL(process.env.DESCRIBBLE_REPORT_ENDPOINT).origin : "'none'";
const csp = [
  "default-src 'none'",
  `script-src ${hashOf(inline('script'))}`,
  `style-src ${hashOf(inline('style'))}`,
  "img-src 'self' data: blob:",
  'font-src data:',
  `connect-src ${reportOrigin}`,
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');
const headers = `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
`;
mkdirSync(join(here, 'dist', 'site'), { recursive: true });
writeFileSync(join(here, 'dist', 'site', 'index.html'), live);
mkdirSync(join(here, 'dist', 'site', 'it'), { recursive: true });
writeFileSync(join(here, 'dist', 'site', 'it', 'index.html'), liveItalian);
writeFileSync(join(here, 'dist', 'site', '_headers'), headers);
// For search engines: everything may be crawled, and the sitemap lists both languages as alternates.
const today = new Date().toISOString().slice(0, 10);
const pageEntry = (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="https://describble.com/"/>
    <xhtml:link rel="alternate" hreflang="it" href="https://describble.com/it/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://describble.com/"/>
  </url>`;
writeFileSync(join(here, 'dist', 'site', 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pageEntry('https://describble.com/')}
${pageEntry('https://describble.com/it/')}
</urlset>
`);
writeFileSync(join(here, 'dist', 'site', 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: https://describble.com/sitemap.xml\n');
// Icons and the social preview, rendered once from the mark (see app/assets/brand/README.md).
for (const file of ['apple-touch-icon.png', 'og.png']) {
  copyFileSync(join(here, 'assets', 'brand', file), join(here, 'dist', 'site', file));
}
console.log('ok: dist/site/ (index.html and _headers, ready to publish)');
