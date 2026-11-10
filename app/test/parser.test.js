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

test('words people typed on launch day', () => {
  const cases = {
    'dark hair': 'hairColor:black', 'dark jacket': 'clothesColor:black', 'blue-eyed girl': 'eyeColor:blue', 'girl in a blouse': 'clothes:shirt',
    'checked shirt': 'pattern:plaid', 'feminine guy': 'gender:female', 'skinny guy': 'face:long', 'magro con la riga': 'hair:sidepart',
    'woodchopper': 'facial:beard', 'ladro': 'pattern:stripes',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  assert.ok(parse('dark skin').found.includes('skin:dark'));
  assert.ok(!parse('dark skin').found.includes('hairColor:black'));
  assert.deepEqual(parse('glasses from describble').unknown, []);
});

test('Portuguese descriptions', () => {
  const cases = {
    'menina ruiva com sardas e óculos redondos': ['gender:female', 'hairColor:red', 'detail:freckles', 'eyewear:round'],
    'cara careca de barba e boné vermelho': ['hair:bald', 'facial:beard', 'hat:cap', 'hatColor:red'],
    'programador cansado com moletom cinza': ['clothes:hoodie', 'print:code', 'mood:tired', 'clothesColor:grey'],
    'velhinha de óculos com coque grisalho': ['age:old', 'eyewear:glasses', 'hair:bun', 'hairColor:grey'],
    'fundo azul, cabelo rosa curto': ['backgroundColor:blue', 'hairColor:pink', 'hair:short'],
    'rapaz com piercing no nariz e alargadores': ['detail:piercing', 'detail:gauges'],
  };
  for (const [text, traits] of Object.entries(cases)) {
    for (const trait of traits) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  }
  assert.deepEqual(parse('sem óculos').removed, ['eyewear:glasses']);
  assert.deepEqual(parse('rapaz com piercing no nariz e alargadores').removed, []);
  // English "no" still negates, and Portuguese words that look like Italian or English ones stay out.
  assert.deepEqual(parse('no glasses').removed, ['eyewear:glasses']);
  for (const word of ['sembra', 'bravo', 'mascara']) assert.ok(!parse(word).found.some((t) => /eyeshadow|angry|mask/.test(t)), word);
});

test('words people typed after the Portuguese release', () => {
  const cases = {
    'fair hair': 'hairColor:blond', 'fair, freckles': 'skin:pale', 'bold guy': 'hair:bald', 'bold eyebrows': 'brows:thick',
    'cross necklace': 'detail:necklace', 'triangle earrings': 'detail:earring', 'liner': 'detail:eyeshadow', 'devilish smile': 'mouth:smirk',
    'windblown hair': 'hair:messy', 'drugged': 'mood:tired', 'capelli con la riga': 'hair:sidepart',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  assert.deepEqual(parse('extremely tired').unknown, []);
  assert.ok(!parse('bold eyebrows').found.includes('hair:bald'));
});

test('stretched words are read as the word they stretch', () => {
  const cases = { 'greeen eyes': 'eyeColor:green', 'loooong hair': 'hair:long', 'baaald': 'hair:bald', 'glassses': 'eyewear:glasses', 'happpy': 'mood:happy' };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  assert.deepEqual(parse('eyees').unknown, []);
  // Italian doubled consonants are real words, never shortened: "tutta" is not "tuta" (tracksuit).
  assert.ok(!parse('tutta rossa').found.includes('clothes:tracksuit'));
});

test('a colour between two nouns goes to the one that has no colour yet', () => {
  const cases = {
    'green hat purple t-shirt': ['hatColor:green', 'clothesColor:purple'], 'blue eyes red hair': ['eyeColor:blue', 'hairColor:red'],
    'red scarf blue jacket': ['itemColor:scarf.red', 'clothesColor:blue'], 'occhi blu capelli rossi': ['eyeColor:blue', 'hairColor:red'],
  };
  for (const [text, traits] of Object.entries(cases)) {
    const { found } = parse(text);
    for (const trait of traits) assert.ok(found.includes(trait), `${text}: ${found}`);
  }
  assert.ok(!parse('green hat purple t-shirt').found.includes('hatColor:purple'));
  // With a single noun, both colours still belong to it.
  assert.deepEqual(parse('red and blue scarf').found.filter((t) => t.startsWith('itemColor')).sort(), ['itemColor:scarf.blue', 'itemColor:scarf.red']);
});

test('words people typed on the r/webdev day: skin as a noun, noses, moods, joined words', () => {
  const cases = {
    'white skin': 'skin:pale', 'skin tone dark': 'skin:dark', 'light brown skin': 'skin:tan', 'pelle scura': 'skin:dark', 'pele morena': 'skin:tan',
    'round nose': 'nose:button', 'bulbous nose': 'nose:big', 'big nouse': 'nose:big', 'strong chin': 'face:square', 'mento pronunciato': 'face:square',
    'confident guy': 'mood:smug', 'excited girl': 'mood:happy', 'horrified man': 'mood:scared', 'maschera da hockey': 'detail:mask',
    'redglasses': 'eyewear:glasses', 'longbeard': 'facial:longBeard',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  // A colour next to skin never becomes a hair or accent colour, and yellow skin draws nothing.
  assert.deepEqual(parse('yellow skin').found, []);
  assert.ok(!parse('white skin').found.some((t) => t.startsWith('accent:')));
  for (const text of ['wearing a hat', 'slightly tired', 'fairly long hair', 'sulla testa', 'orecchie nascoste']) {
    assert.deepEqual(parse(text).unknown.filter((w) => w !== 'a'), [], text);
  }
  // Joined words split only into real entries: "leather" stays one word.
  assert.ok(parse('leather jacket').found.includes('clothes:jacket'));
});

test('words people typed after the r/webdev day: hair, beards, glasses, faces and typos', () => {
  const cases = {
    'salt and pepper hair': 'hairColor:grey', 'left parting': 'hair:sidepart', 'comb over': 'hair:sidepart', 'bowl cut': 'hair:bangs',
    'fluffy hair': 'hair:messy', 'trimmed beard': 'facial:beard', 'neckbeard': 'facial:beard', 'rimless glasses': 'eyewear:glasses',
    'rectangular glasses': 'eyewear:glasses', 'bushy eyebrows': 'brows:thick', 'sharp jawline': 'face:square', 'oval face': 'face:long',
    'double chin': 'face:round', 'hook nosed': 'nose:pointy', 'ballcap': 'hat:cap', 'evil': 'mood:smug', 'dead eyes': 'mood:blank',
    'campire': 'detail:fangs', 'alian': 'skin:green', 'tatto': 'detail:tattoo', 'whute hoodie': 'clothesColor:white', 'drak hair': 'hairColor:black',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  // "olive" alone is a colour, not a skin tone; "40 year old" does not make someone old.
  assert.ok(parse('olive shirt').found.includes('clothesColor:green'));
  assert.ok(!parse('olive shirt').found.includes('skin:tan'));
  assert.ok(!parse('40 year old man').found.includes('age:old'));
  // Italian "salta" must not collide with English words.
  assert.deepEqual(parse('salta').found, []);
});

test('words people typed on 10 November: moods, jobs, filler and glued words', () => {
  const cases = {
    'embarrassed girl': 'mood:scared', 'nervous guy': 'mood:scared', 'shy boy': 'mood:scared', 'wonky smile': 'mouth:smirk',
    'genius': 'eyewear:glasses', 'businessman': 'clothes:suit', 'rich man': 'clothes:suit', 'millionaire': 'clothes:suit',
    'mancap': 'hat:cap', 'glassesand': 'eyewear:glasses',
  };
  for (const [text, trait] of Object.entries(cases)) assert.ok(parse(text).found.includes(trait), `${text}: ${parse(text).found}`);
  // "hatred" is a word of its own, not a red hat.
  assert.deepEqual(parse('hatred').found, []);
  for (const text of ['absolutely terrible ideas about things', 'wears glasses', 'arms and legs']) {
    assert.deepEqual(parse(text).unknown.filter((w) => w !== 'and'), [], text);
  }
});
