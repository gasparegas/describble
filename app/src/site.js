// The website around the live drawing: bilingual copy, the clickable gallery and the links
// configured at build time. English is the main language, Italian the second one.
import { createStage } from './stage.js';
import { applyMessage, initialState, sceneFor } from './dialogue.js';

// Filled in by build.mjs from SCRIBBLE_REPO_URL and SCRIBBLE_SUPPORT_URL; empty links stay hidden.
export const SITE_LINKS = { repo: '', support: '' };

export const siteCopy = {
  en: {
    title: 'Scribble: hand-drawn avatars from a sentence',
    headline: 'Describe someone. Watch them get drawn.',
    lede: 'Hand-drawn avatars from a sentence. No AI, no account, nothing to install.',
    inputLabel: 'Describe the character',
    stageLabel: 'The character you are describing',
    download: 'Download PNG',
    downloaded: 'Saved',
    share: 'Copy link',
    shared: 'Link copied',
    surprise: 'Surprise me',
    star: 'Star on GitHub',
    galleryTitle: 'Start from one of these',
    galleryNote: 'Tap a face to write its sentence, then change any word.',
    howTitle: 'No AI. Just words and a pencil.',
    how: [
      'Every word you write picks a piece drawn by hand: hair, hats, glasses, piercings, moods. If it does not know a word, it tells you.',
      'Change a word and only that piece is redrawn. The lines keep wobbling a little, like a sketch that is still alive.',
      'It runs in your browser and keeps working offline. Your sentence never leaves your device.',
    ],
    useTitle: 'Use it as your profile picture',
    use: ['Describe yourself, or anyone.', 'Download the PNG: 1024 × 1024, ready for a round crop.', 'Upload it on GitHub, Discord, Slack or wherever you have a face.'],
    openTitle: 'Open source, and free to use',
    open: 'The code is MIT and every drawing is CC0: use your avatar anywhere, no credit needed. Missing a word or a hat? Suggest it, or draw it.',
    suggest: 'Suggest a word',
    code: 'Read the code',
    supportTitle: 'Keep it free',
    support: 'Scribble has no ads and no paid plan. If it made you smile, you can buy the drawings a coffee.',
    supportLink: 'Support on Ko-fi',
    privacy: 'Your sentence stays in your browser.',
    privacyReports: 'To grow the dictionary, single words it did not understand are counted anonymously. Never your sentence.',
    reports: (on) => `Word reports: ${on ? 'on' : 'off'}`,
    license: 'Code MIT, drawings CC0.',
    noscript: 'Scribble draws with JavaScript. Turn it on to describe your character.',
  },
  it: {
    title: 'Scribble: avatar disegnati a mano da una frase',
    headline: 'Descrivi qualcuno. Guardalo prendere forma.',
    lede: 'Avatar disegnati a mano da una frase. Niente AI, niente account, niente da installare.',
    inputLabel: 'Descrivi il personaggio',
    stageLabel: 'Il personaggio che stai descrivendo',
    download: 'Scarica PNG',
    downloaded: 'Salvato',
    share: 'Copia link',
    shared: 'Link copiato',
    surprise: 'Sorprendimi',
    star: 'Stella su GitHub',
    galleryTitle: 'Parti da uno di questi',
    galleryNote: 'Tocca una faccia per scriverne la frase, poi cambia quello che vuoi.',
    howTitle: 'Niente AI. Solo parole e una matita.',
    how: [
      'Ogni parola che scrivi sceglie un pezzo disegnato a mano: capelli, cappelli, occhiali, piercing, espressioni. Se una parola non la conosce, te lo dice.',
      'Cambi una parola e viene ridisegnato solo quel pezzo. Le linee continuano a tremare un po\', come uno schizzo ancora vivo.',
      'Funziona nel tuo browser, anche offline. La tua frase non lascia mai il tuo dispositivo.',
    ],
    useTitle: 'Usalo come immagine del profilo',
    use: ['Descrivi te stesso, o chi vuoi.', 'Scarica il PNG: 1024 × 1024, pronto anche per il ritaglio tondo.', 'Caricalo su GitHub, Discord, Slack o dove serve una faccia.'],
    openTitle: 'Open source e gratis',
    open: 'Il codice è MIT e ogni disegno è CC0: usa il tuo avatar dove vuoi, senza citare nessuno. Manca una parola o un cappello? Suggeriscilo, o disegnalo.',
    suggest: 'Suggerisci una parola',
    code: 'Leggi il codice',
    supportTitle: 'Tienilo gratis',
    support: 'Scribble non ha pubblicità né piani a pagamento. Se ti ha strappato un sorriso, puoi offrire un caffè ai disegni.',
    supportLink: 'Sostieni su Ko-fi',
    privacy: 'La tua frase resta nel tuo browser.',
    privacyReports: 'Per far crescere il dizionario, le singole parole che non ha capito vengono contate in forma anonima. Mai la frase.',
    reports: (on) => `Segnalazione parole: ${on ? 'attiva' : 'spenta'}`,
    license: 'Codice MIT, disegni CC0.',
    noscript: 'Scribble disegna con JavaScript. Attivalo per descrivere il tuo personaggio.',
  },
};

// Gallery sentences: each one is a real input, so tapping it shows exactly how it was made.
export const siteGallery = {
  en: [
    'blond, cigarette in mouth, tired eyes',
    'girl with a pink bob and heart glasses',
    'vampire with a cape',
    'grandma with curlers and reading glasses',
    'gamer with headset and backwards cap',
    'girl with gauges, septum and fuchsia hair',
    'construction worker with a hard hat and a beard',
    'fedora, matrix glasses, open black shirt',
    'old sailor with a pipe and a white beard',
    'punk with a green mohawk and a leather jacket',
    'nun smiling',
    'kid with braces and big glasses',
  ],
  it: [
    'biondo, sigaretta in bocca, occhi stanchi',
    'ragazza con caschetto rosa e occhiali a cuore',
    'vampiro con il mantello',
    'nonna con i bigodini e gli occhiali a mezzaluna',
    'gamer con le cuffie e il cappellino al contrario',
    'ragazza con dilatatori, septum e capelli fucsia',
    'muratore con il casco e la barba',
    'cappello italiano, occhiali da matrix, camicia nera aperta',
    'vecchio marinaio con la pipa e la barba bianca',
    'punk con cresta verde e chiodo',
    'suora sorridente',
    'ragazzino con l apparecchio e occhiali grandi',
  ],
};

// A shared link carries the sentence and the seed after the #, which browsers never send to a server.
export function shareLink(text, seed) {
  const url = new URL(location.href);
  url.hash = new URLSearchParams({ s: text, k: seed.toString(36) }).toString();
  return url.href;
}

export function readSharedLink() {
  const params = new URLSearchParams(location.hash.slice(1));
  const text = (params.get('s') ?? '').slice(0, 400);
  const seed = parseInt(params.get('k') ?? '', 36);
  return text.trim() ? { text, seed: Number.isFinite(seed) ? seed : undefined } : null;
}

// Copies with the clipboard API where allowed (https), with the old selection trick as a fallback (file://).
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text });
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const done = document.execCommand('copy');
    area.remove();
    return done;
  }
}

// Saved choice first, then the browser language; English for everyone else.
export function pickSiteLanguage() {
  try {
    const saved = localStorage.getItem('scribble-lang');
    if (saved === 'en' || saved === 'it') return saved;
  } catch {}
  return (navigator.language ?? 'en').toLowerCase().startsWith('it') ? 'it' : 'en';
}

export function saveSiteLanguage(lang) {
  try {
    localStorage.setItem('scribble-lang', lang);
  } catch {}
}

// Writes the copy into every [data-copy] element; list keys fill the element's <li> or <p> children.
export function applySiteLanguage(lang) {
  const copy = siteCopy[lang];
  document.documentElement.lang = lang;
  document.title = copy.title;
  for (const element of document.querySelectorAll('[data-copy]')) {
    const value = copy[element.dataset.copy];
    if (Array.isArray(value)) {
      [...element.children].forEach((child, i) => { child.textContent = value[i] ?? ''; });
    } else if (typeof value === 'string') {
      element.textContent = value;
    }
  }
  for (const button of document.querySelectorAll('[data-lang]')) button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  document.querySelectorAll('#gallery figcaption').forEach((caption, i) => { caption.textContent = siteGallery[lang][i]; });
}

// Links are shown only when configured, so a fork never points at someone else's page.
export function applySiteLinks() {
  const repo = SITE_LINKS.repo.replace(/\/+$/, '');
  const targets = { repo, issues: repo && `${repo}/issues/new/choose`, support: SITE_LINKS.support };
  for (const element of document.querySelectorAll('[data-link]')) {
    const href = targets[element.dataset.link];
    if (href) element.href = href;
    else element.hidden = true;
  }
  for (const block of document.querySelectorAll('[data-needs]')) {
    if (!targets[block.dataset.needs]) block.hidden = true;
  }
}

// Draws the gallery once, still (no boil), and calls onPick with the sentence and seed a face was made from.
export function buildSiteGallery(lang, onPick) {
  const list = document.querySelector('#gallery');
  siteGallery.en.forEach((_, i) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    const caption = document.createElement('figcaption');
    const figure = document.createElement('figure');
    figure.append(svg, caption);
    button.append(figure);
    item.append(button);
    list.append(item);
    const state = { ...applyMessage({ ...initialState('en'), seed: 1000 + i * 7 }, siteGallery.en[i]).state, confirmed: true };
    const stage = createStage(svg, { instant: true });
    stage.update(sceneFor(state), 0);
    stage.setPose({ yaw: [-0.3, 0, 0.3][i % 3] });
    stage.draw(1, 0);
    button.addEventListener('click', () => onPick(siteGallery[document.documentElement.lang === 'it' ? 'it' : 'en'][i], 1000 + i * 7));
  });
  applySiteLanguage(lang);
}
