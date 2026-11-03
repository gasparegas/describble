import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/parser.js';
import { corpus } from './corpus.js';

// The labelled corpus must not regress: coverage of in-catalog traits over the whole corpus.
test('corpus coverage stays at 92% or more', () => {
  let wanted = 0;
  let caught = 0;
  for (const [, text, expected] of corpus) {
    const { found, removed } = parse(text);
    for (const trait of expected) {
      wanted += 1;
      if (trait.startsWith('-') ? removed.includes(trait.slice(1)) : found.includes(trait)) caught += 1;
    }
  }
  assert.ok(caught / wanted >= 0.92, `coverage ${(caught / wanted * 100).toFixed(1)}%`);
});

test('the exact form beats the stem: ragazzo is not ragazza', () => {
  assert.ok(!parse('ragazzo').found.includes('gender:female'));
  assert.ok(parse('ragazza').found.includes('gender:female'));
});

test('realistic sentences: previously missing phrases stay recognised', () => {
  const cases = {
    'capelli rasati ai lati': 'hair:undercut',
    'occhiali da vista': 'eyewear:glasses',
    'barba sfatta': 'facial:stubble',
    'cute anime girl with twin tails': 'hair:pigtails',
    'guy with a man bun': 'hair:bun',
    'orecchini d oro': 'detail:earring',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text} → ${trait}`);
});

test('italian augmentatives and diminutives map to the base word', () => {
  const cases = { sciarpona: 'detail:scarf', cappellone: 'hat:generic', occhialoni: 'eyewear:glasses', barbetta: 'facial:stubble', barbona: 'facial:longBeard', felpona: 'clothes:hoodie', berrettino: 'hat:beanie', baffoni: 'facial:moustache' };
  for (const [word, trait] of Object.entries(cases)) assert.ok(parse(word).found.includes(trait), `${word} → ${trait}: ${parse(word).found}`);
  for (const word of ['mattone', 'cartone', 'bottone']) assert.deepEqual(parse(word).found, [], word);
});

test('the user example: italian hat, slim sunglasses, open black shirt', () => {
  const { found } = parse('capello italiano, biondo, sigaretta, occhiali da sole da matrix, camicia nera aperta');
  for (const trait of ['hat:fedora', 'hairColor:blond', 'detail:cigarette', 'eyewear:slim', 'clothes:openShirt', 'clothesColor:black']) assert.ok(found.includes(trait), `${trait}: ${found}`);
  assert.ok(!parse('giacca aperta').found.includes('clothes:openShirt'));
  assert.deepEqual(parse('fedora, matrix glasses, open black shirt').found.filter((t) => /^(eyewear|clothes):/.test(t)), ['eyewear:slim', 'clothes:openShirt']);
  assert.ok(parse('capelli lunghi').found.includes('hair:long'));
});

test('piercings and stretched lobes', () => {
  const cases = {
    'dilatatori al lobo': 'detail:gauges', 'ear gauges': 'detail:gauges', 'piercing al setto': 'detail:septum',
    'piercing al sopracciglio': 'detail:browPiercing', 'anello al labbro': 'detail:lipRing', 'snake bites': 'detail:lipRing',
    'labret': 'detail:labret', 'brillantino al naso': 'detail:nostril', 'industrial': 'detail:industrial', 'helix': 'detail:helix',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  const many = parse('pieno di piercing').found;
  for (const trait of ['detail:gauges', 'detail:septum', 'detail:lipRing', 'detail:browPiercing']) assert.ok(many.includes(trait), `${trait}: ${many}`);
});

test('everyday words: tracksuit, curlers, reading glasses, side shave, biker', () => {
  const cases = {
    'ragazzo con la tuta': 'clothes:tracksuit', 'nonna con i bigodini': 'detail:curlers', 'occhiali a mezzaluna': 'eyewear:reading',
    'capelli rasati di lato': 'hair:undercut', 'half shaved head': 'hair:undercut', 'biker': 'clothes:jacket',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  assert.ok(!parse('half shaved head').found.includes('hair:bald'));
});

test('colour synonyms map to the nearest drawable colour', () => {
  const cases = {
    'capelli fucsia': 'hairColor:pink', 'capelli lilla': 'hairColor:purple', 'felpa bordeaux': 'clothesColor:red', 'silver hair': 'hairColor:grey',
    'capelli corvini': 'hairColor:black', 'hoodie teal': 'clothesColor:blue', 'felpa verde militare': 'clothesColor:green', 'capelli biondo platino': 'hairColor:blond',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  assert.ok(!parse('felpa verde militare').found.includes('clothes:uniform'));
  assert.ok(parse('prete').found.includes('clothes:clerical'));
  assert.ok(!parse("i don't know").found.includes('clothes:clerical'));
});

test('more headwear: hard hat, bowler, graduation cap, nun veil', () => {
  const cases = { 'muratore con il casco': 'hat:helmet', 'hard hat': 'hat:helmet', 'bombetta': 'hat:bowler', 'bowler hat': 'hat:bowler', 'cappello da laurea': 'hat:graduation', 'graduation cap': 'hat:graduation', 'suora': 'hat:veil', 'diadema': 'hat:crown' };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
});

test('everyday english: perm, aviators, denim, braces', () => {
  const cases = { 'old lady with a perm': 'hair:curly', 'mullet and aviators': 'eyewear:sunglasses', 'denim jacket': 'clothesColor:blue', 'kid with braces': 'detail:braces', 'apparecchio ai denti': 'detail:braces' };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  assert.deepEqual(parse('person with rosy cheeks').unknown.filter((w) => !['with'].includes(w)), []);
});

test('pajamas are a striped shirt unless another pattern is named', () => {
  assert.ok(parse('in pigiama').found.includes('pattern:stripes'));
  const dots = parse('pigiama a pois').found.filter((t) => t.startsWith('pattern:'));
  assert.equal(dots.at(-1), 'pattern:dots');
  assert.ok(parse('messy bun and a scrunchie').found.includes('detail:hairclip'));
});

test('jobs: a plain "cappello" never replaces a specific hat', () => {
  assert.ok(parse('cuoco con il cappello').found.includes('hat:chef'));
  assert.ok(!parse('cuoco con il cappello').found.includes('hat:generic'));
  assert.ok(parse('un cappello').found.includes('hat:generic'));
  const cases = { 'studentessa con lo zaino': 'detail:backpack', 'medico con lo stetoscopio': 'detail:stethoscope', 'pompiere': 'hat:helmet', 'pittore': 'hat:beret', 'cameriere': 'detail:bowtie', 'mechanic': 'clothes:overalls', 'calciatore': 'clothes:tshirt' };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
});
