// Rule-based parser: text → found traits, negated traits and unknown words.
import { traits, hairOnlyColors, colors, colorNouns, contextual, ignored, negations, scopeBreakers } from './lexicon.js';

const stripAccents = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');
const MAX_PHRASE = 5;
const COLOR_REACH = 3;

// Drops the final vowel (Italian) or final s (English) to merge singular, plural and gender.
function stem(word) {
  if (word.length < 5) return word;
  if (/[aeio]$/.test(word)) return word.slice(0, -1);
  if (/s$/.test(word)) return word.slice(0, -1);
  return word;
}

function tokenize(text) {
  const clean = stripAccents(text.toLowerCase()).replace(/['’`]/g, ' ').replace(/-/g, ' ');
  return clean.match(/[a-z0-9]+|[,.;:!?()]|\p{Extended_Pictographic}/gu) ?? [];
}

const isBreak = (token) => /^[,.;:!?()]$/.test(token);
const phraseKey = (tokens) => tokens.map(stem).join(' ');

// Two indexes: the exact form wins; the stem merges plurals and genders.
// When different words share a stem ("ragazzo", "ragazza"), the stem keeps only the traits they share.
const exactIndex = new Map();
function buildIndex() {
  const built = new Map();
  const add = (phrase, entry) => built.set(phraseKey(tokenize(phrase)), entry);
  const byStem = new Map();
  for (const [trait, words] of Object.entries(traits)) {
    for (const word of words) {
      const raw = tokenize(word).join(' ');
      exactIndex.set(raw, { traits: [...(exactIndex.get(raw)?.traits ?? []), trait] });
      const key = phraseKey(tokenize(word));
      if (!byStem.has(key)) byStem.set(key, new Set());
      byStem.get(key).add(raw);
    }
  }
  for (const [key, raws] of byStem) {
    const lists = [...raws].map((raw) => exactIndex.get(raw).traits);
    built.set(key, { traits: lists.reduce((shared, list) => shared.filter((t) => list.includes(t))) });
  }
  for (const [value, words] of Object.entries(hairOnlyColors)) for (const word of words) add(word, { traits: [`hairColor:${value}`] });
  for (const [value, words] of Object.entries(colors)) for (const word of words) add(word, { color: value });
  for (const [noun, words] of Object.entries(colorNouns)) for (const word of words) add(word, { noun });
  for (const { trait, near, words } of contextual) for (const word of words) add(word, { contextual: trait, near });
  for (const phrase of ignored) add(phrase, { ignored: true });
  return built;
}

const lexiconIndex = buildIndex();
const typoWords = new Map();
for (const words of [...Object.values(traits), ...Object.values(hairOnlyColors), ...Object.values(colors), ...Object.values(colorNouns)]) {
  for (const word of words) {
    if (!word.includes(' ') && word.length >= 6) typoWords.set(stripAccents(word), lexiconIndex.get(phraseKey(tokenize(word))));
  }
}

// Edit distance <= 1, transpositions included.
function nearOne(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.slice(i + 1) === b.slice(i + 1)) return true;
  if (a.slice(i) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i)) return true;
  return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
}

// Italian augmentatives and diminutives: "sciarpona", "cappellone", "barbetta" → scarf, hat, beard.
// Only used when the word itself is unknown, and only for traits (not colours or nouns).
const ALTERED = ['acciona', 'accione', 'uccia', 'uccio', 'ettina', 'ettino', 'oni', 'one', 'ona', 'ini', 'ino', 'ina', 'ine', 'etti', 'etto', 'etta', 'ette', 'acci', 'accio', 'accia'];
function lookupAltered(token) {
  for (const suffix of ALTERED) {
    if (!token.endsWith(suffix) || token.length - suffix.length < 3) continue;
    const base = token.slice(0, -suffix.length);
    const entry = lexiconIndex.get(base) ?? ['o', 'a', 'i', 'e'].map((v) => exactIndex.get(base + v)).find(Boolean);
    if (entry?.traits?.length) return entry;
  }
  return null;
}

function lookupTypo(token) {
  if (token.length < 6) return null;
  const match = [...typoWords.keys()].find((word) => word[0] === token[0] && nearOne(token, word));
  return match ? typoWords.get(match) : null;
}

// Stretched words: "greeen", "loooong", "eyees". Only runs of three or more letters, or a doubled
// vowel in a word of five letters or more, are shortened, so Italian doubles ("tutta") stay as typed.
// The shortened form is used only when the dictionary knows it.
const knownToken = (token) => exactIndex.has(token) || lexiconIndex.has(phraseKey([token]));
function destretch(token) {
  if (knownToken(token)) return token;
  const runs = [...token.matchAll(/(.)\1+/g)].map((m) => {
    const keep = m[0].length >= 3 ? [2, 1] : /[aeiou]/.test(m[1]) && token.length >= 5 ? [1] : [];
    return { at: m.index, length: m[0].length, letter: m[1], keep };
  }).filter((run) => run.keep.length);
  if (!runs.length || runs.length > 4) return token;
  let variants = [{ text: '', from: 0 }];
  for (const run of runs) {
    variants = variants.flatMap((v) => [run.length, ...run.keep].map((n) => ({
      text: v.text + token.slice(v.from, run.at) + run.letter.repeat(n), from: run.at + run.length,
    })));
  }
  const candidates = variants.map((v) => v.text + token.slice(v.from)).filter((v) => v !== token);
  candidates.sort((a, b) => b.length - a.length);
  return candidates.find(knownToken) ?? token;
}

// Accessories with their own colour: "green scarf" becomes itemColor:scarf.green.
const COLORABLE = ['scarf', 'tie', 'bowtie', 'bow', 'earmuffs', 'headphones', 'headset', 'cape', 'mask', 'choker'].map((d) => `detail:${d}`);
const hasTrait = (hit, prefix) => hit.traits?.some((trait) => trait.startsWith(prefix));

// "uncolored": the colour belongs to this piece, but the catalog has no colour slot for it.
const nounOf = (hit) => {
  if (hit.noun) return hit.noun;
  if (hasTrait(hit, 'clothes:')) return 'clothes';
  if (hasTrait(hit, 'hat:') && !hasTrait(hit, 'hat:hood')) return 'hat';
  if (hasTrait(hit, 'hair:')) return 'hair';
  if (hasTrait(hit, 'facial:')) return 'beard';
  const item = hit.traits?.find((trait) => COLORABLE.includes(trait))?.slice(7);
  if (item) return `item.${item}`;
  if (hasTrait(hit, 'detail:')) return 'uncolored';
  return null;
};

export { tokenize };

export function parse(text) {
  const tokens = tokenize(text).map(destretch);
  const hits = [];
  const consumed = new Array(tokens.length).fill(false);
  for (let i = 0; i < tokens.length; i++) {
    if (isBreak(tokens[i])) continue;
    let found = null;
    for (let size = Math.min(MAX_PHRASE, tokens.length - i); size >= 1 && !found; size--) {
      const slice = tokens.slice(i, i + size);
      const entry = exactIndex.get(slice.join(' ')) ?? lexiconIndex.get(phraseKey(slice));
      if (entry) found = { ...entry, start: i, end: i + size };
    }
    if (!found) {
      const altered = lookupAltered(tokens[i]);
      if (altered) found = { ...altered, start: i, end: i + 1 };
    }
    if (!found) {
      const typo = lookupTypo(tokens[i]);
      if (typo) found = { ...typo, start: i, end: i + 1, typo: true };
    }
    if (found) {
      hits.push(found);
      consumed.fill(true, found.start, found.end);
      i = found.end - 1;
    }
  }

  const negated = new Set();
  tokens.forEach((token, i) => {
    // A negation word inside a known phrase belongs to it: Portuguese "piercing no nariz" negates nothing.
    if (!negations.includes(token) || consumed[i]) return;
    for (let j = i + 1; j < Math.min(tokens.length, i + 7); j++) {
      if (isBreak(tokens[j]) || scopeBreakers.includes(tokens[j])) break;
      negated.add(j);
    }
  });

  const found = new Set();
  const removed = new Set();
  const place = (hit, trait) => (negated.has(hit.start) ? removed : found).add(trait);
  const crossesBreak = (a, b) => tokens.slice(Math.min(a, b), Math.max(a, b)).some(isBreak);

  const refined = new Set();
  for (const hit of hits) {
    for (const trait of hit.traits ?? []) place(hit, trait);
    if (hit.contextual) {
      // near is a noun kind ('hair') or an exact trait ('clothes:shirt'); the adjective may sit after a colour.
      const matches = (other) => (hit.near.includes(':') ? other.traits?.includes(hit.near) : nounOf(other) === hit.near);
      const close = hits.some((other) => matches(other) && Math.abs(hit.start - other.start) <= 2);
      if (close) place(hit, hit.contextual);
      // An adjective that refines an exact trait replaces it: "open shirt" is not also a plain shirt.
      if (close && hit.near.includes(':')) refined.add(hit.near);
    }
    if (!hit.color) continue;
    const owners = hits
      .filter((other) => nounOf(other) && !crossesBreak(hit.start, other.start))
      .map((other) => ({ other, reach: Math.abs(hit.start - other.start) }))
      .filter(({ reach }) => reach <= COLOR_REACH)
      .sort((a, b) => a.reach - b.reach || a.other.start - b.other.start);
    const owner = owners[0]?.other;
    const noun = owner && nounOf(owner);
    if (noun?.startsWith('item.')) place(hit, `itemColor:${noun.slice(5)}.${hit.color}`);
    else if (noun && noun !== 'uncolored') place(hit, `${noun}Color:${hit.color}`);
    else if (!owner) place(hit, `accent:${hit.color}`);
  }

  const unknown = tokens.filter((token, i) => !consumed[i] && !isBreak(token));
  for (const trait of refined) found.delete(trait);
  // "cappello" alone never replaces a specific hat named in the same text ("cuoco con il cappello").
  if (found.has('hat:generic') && [...found].some((t) => t.startsWith('hat:') && t !== 'hat:generic')) found.delete('hat:generic');
  return { found: [...found], removed: [...removed], unknown };
}
