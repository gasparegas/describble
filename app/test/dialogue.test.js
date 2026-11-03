import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMessage, describe, initialState, missesIn, restoreState, sceneFor } from '../src/dialogue.js';
import { catalog } from '../src/pieces.js';

const run = (...messages) => messages.reduce((acc, text, turn) => applyMessage(acc.state, text, turn), { state: initialState() });
const visible = (state) => Object.fromEntries(Object.entries(sceneFor(state).slots).filter(([, s]) => s.variant !== 'none').map(([k, s]) => [k, s.variant]));

test('the GitHub avatar example gives blond hair and a cigarette', () => {
  const { state, reply } = run('biondo, sigaretta in bocca');
  assert.equal(sceneFor(state).colors.hair, '#e8c15a');
  assert.equal(visible(state).smoke, 'cigarette');
  assert.doesNotMatch(reply, /non lo so/);
});

test('a hat that covers the head leaves only the locks', () => {
  const { state } = run('capelli lunghi', 'berretto nero');
  assert.equal(visible(state).hair, 'under');
  assert.equal(visible(state).hat, 'beanie');
});

test('a negation removes a piece', () => {
  const { state } = run('barba e occhiali', 'senza occhiali');
  assert.equal(visible(state).eyewear, undefined);
  assert.match(visible(state).beard, /^beard-/);
});

test('ok finishes: everything at full confidence', () => {
  const { state } = run('occhi stanchi', 'ok');
  const scene = sceneFor(state);
  assert.ok(Object.values(scene.slots).every((s) => s.c === 1));
});

test('actions do not change the state', () => {
  const before = run('barba').state;
  for (const text of ['scarica', 'annulla', 'aiuto']) assert.equal(applyMessage(before, text).state, before);
  assert.equal(applyMessage(before, 'scarica').action, 'download');
});

test('an unknown word gets an honest reply', () => {
  const { reply, state } = run('stempiatissimo');
  assert.match(reply, /Non so ancora disegnare/);
  assert.equal(state.started, false);
});

test('every variant used by the scene exists in the catalog', () => {
  const texts = ['spiky', 'ricci', 'calvo', 'coda di cavallo', 'chignon', 'cresta', 'spettinato', 'trecce', 'cilindro', 'cappello da cowboy', 'corona', 'bandana', 'cappuccio', 'pizzetto', 'baffi', 'barba di 3 giorni', 'occhiali da sole', 'benda', 'pipa', 'cuffie', 'tatuaggio', 'mascherina', 'sciarpa', 'collana', 'lentiggini', 'cicatrice', 'orecchino', 'piercing', 'occhiaie', 'vecchio', 'giacca', 'completo', 'camicia', 'maglione', 'cappotto', 'divisa',
    'afro', 'caschetto', 'frangia', 'ciuffo', 'rasato', 'codini', 'riga di lato', 'undercut', 'viso tondo', 'mascella squadrata', 'viso lungo', 'mento a punta',
    'nasino', 'nasone', 'naso lungo', 'naso a punta', 'sopracciglia folte', 'cappello da strega', 'basco', 'aureola', 'corna', 'cravatta', 'basette', 'brufoli', 'monociglio', 'rossetto', 'occhi chiusi',
    'emo', 'dreadlocks', 'barba lunga', 'cappello di babbo natale', 'cuoco', 'orecchie da gatto', 'vichingo', 'occhiali tondi', 'monocolo', 'dolcevita', 'canotta',
    'a righe', 'a pois', 'a fiori', 'a quadri', 'lacrime', 'sudato', 'cerotto', 'naso da clown', 'orecchie a sventola', 'orecchie da elfo', 'occhi a mandorla', 'sfondo blu', 'viso tondo con la barba', 'viso lungo e barba lunga',
    'capelli lunghi e mossi', 'due chignon', 'pixie', 'coda laterale', 'pon pon', 'cappellino al contrario', 'hijab', 'turbante', 'orecchie da coniglio', 'orecchie da volpe', 'coroncina di fiori', 'cerchietto',
    'occhiali pixel', 'visore vr', 'cyberpunk', 'vestitino', 'armatura', 'maglietta col teschio', 'cuore', 'stella', 'fulmine', 'codice', 'cuffie con microfono', 'cyborg', 'ninja', 'pittura di guerra', 'neo',
    'girocollo', 'orecchini a cerchio', 'fiocco', 'fermaglio', 'mantello', 'ciglia lunghe', 'ombretto', 'canini', 'zombie', 'alieno', 'pelle blu', 'programmatore', 'gamer', 'pirata', 'mago', 'strega', 'vampiro',
    'regina', 'hipster', 'punk', 'hacker', 'babbo natale', 'pagliaccio', 'ragazza', 'donna con il velo',
    'gomma da masticare', 'lecca lecca', 'stuzzicadenti', 'rosa tra i denti', 'papillon', 'badge', 'matita', 'fiore dietro l orecchio', 'occhiali in testa', 'auricolari',
    'viso a cuore', 'viso largo con la barba', 'doppio mento', 'fossette', 'zigomi', 'sopracciglio alzato',
    'mullet', 'riga in mezzo', 'wolf cut', 'coda alta', 'afro puffs', 'cappello da pescatore', 'cappellino da festa', 'fedora', 'occhiali a cuore', 'paraorecchie', 'baffi a manubrio', 'felpa nike', 'maglietta di github',
    'salopette', 'piumino', 'polo', 'gilet', 'grembiule', 'giubbotto college'];
  for (const text of texts) {
    const scene = sceneFor(run(text).state);
    for (const [slot, { variant }] of Object.entries(scene.slots)) assert.ok(catalog[slot]?.[variant], `${text}: ${slot}/${variant}`);
  }
});

test('new pieces come from the text', () => {
  const scene = sceneFor(run('viso tondo, nasone, frangia rossa, rossetto e corna').state);
  assert.equal(scene.slots.head.variant, 'round');
  assert.equal(scene.slots.nose.variant, 'big');
  assert.equal(scene.slots.hair.variant, 'bangs');
  assert.equal(scene.slots.hat.variant, 'horns');
  assert.ok(scene.face.lips);
});

test('the beard follows the face shape', () => {
  assert.equal(sceneFor(run('viso squadrato e barba').state).slots.beard.variant, 'beard-square');
  assert.match(sceneFor(run('barba lunga').state).slots.beard.variant, /^longBeard-/);
});

test('a coloured background ends up in the scene colours', () => {
  assert.ok(sceneFor(run('sfondo verde').state).colors.background);
});

test('archetypes turn on several traits with one word', () => {
  const vampire = sceneFor(run('vampiro').state);
  assert.equal(vampire.slots['detail:cape'].variant, 'on');
  assert.ok(vampire.face.fangs);
  const dev = sceneFor(run('programmatore').state);
  assert.equal(dev.slots.clothes.variant, 'hoodie');
  assert.equal(dev.slots.print.variant, 'code');
});

test('girl: lashes and long hair by default, but chosen hair wins', () => {
  const girl = sceneFor(run('ragazza').state);
  assert.ok(girl.face.lashes);
  assert.ok(['long', 'wavyLong', 'bob', 'ponytail', 'bun', 'highPonytail', 'pixie'].includes(girl.slots.hair.variant));
  assert.equal(sceneFor(run('ragazza con la cresta').state).slots.hair.variant, 'mohawk');
});

test('long + wavy become long wavy hair', () => {
  assert.equal(sceneFor(run('capelli lunghi', 'mossi').state).slots.hair.variant, 'wavyLong');
});

test('a hijab covers hair and ears', () => {
  const scene = sceneFor(run('capelli rossi', 'hijab').state);
  assert.equal(scene.slots.hair.variant, 'none');
  assert.equal(scene.slots.ears.variant, 'none');
});

test('meme expressions and archetypes', () => {
  const doomer = sceneFor(run('doomer').state);
  assert.equal(doomer.slots.hat.variant, 'beanie');
  assert.equal(doomer.colors.hat, '#34343c');
  assert.deepEqual(doomer.face.eyes, { vuoto: 1 });
  assert.deepEqual(sceneFor(run('chad').state).face.mouth, { compiaciuto: 1 });
  assert.equal(sceneFor(run('disperato').state).slots['detail:tears'].variant, 'on');
});

test('smug raises an eyebrow', () => {
  assert.ok(sceneFor(run('compiaciuto').state).face.browRaise);
  assert.ok(sceneFor(run('sopracciglio alzato').state).face.browRaise);
  assert.ok(!sceneFor(run('felice').state).face.browRaise);
});

test('job and style archetypes', () => {
  const cop = sceneFor(run('poliziotto').state);
  assert.equal(cop.slots.clothes.variant, 'uniform');
  assert.equal(cop.slots.hat.variant, 'cap');
  assert.equal(sceneFor(run('surfer').state).slots.hair.variant, 'wavyLong');
  assert.equal(sceneFor(run('nonna').state).slots.hair.variant, 'bun');
});

test('a near-miss word gets a suggestion', () => {
  assert.match(applyMessage(initialState(), 'chignonne').reply, /Intendevi/);
});

test('a real brand becomes an invented brand on the shirt', () => {
  const { state, reply } = run('felpa nike');
  const scene = sceneFor(state);
  assert.equal(scene.slots.print.variant, 'brand');
  assert.notEqual(scene.colors.brandName.toLowerCase(), 'nike');
  assert.equal(sceneFor(run('maglietta nike').state).colors.brandName, scene.colors.brandName);
  assert.match(reply, /inventato/);
});

test('English input gets English replies', () => {
  const { reply, state } = run('blond guy with a beanie and a cigarette');
  assert.equal(state.lang, 'en');
  assert.match(reply, /hair|beanie|cigarette/);
  assert.doesNotMatch(reply, /capelli/);
  assert.match(applyMessage(state, 'download').reply, /PNG/);
});

test('every lexicon detail has a slot in the scene', async () => {
  const { traits } = await import('../src/lexicon.js');
  const special = ['cigarette', 'pipe', 'gum', 'lollipop', 'toothpick', 'rose', 'eyepatch', 'lipstick', 'lashes', 'eyeshadow', 'fangs'];
  for (const trait of Object.keys(traits).filter((t) => t.startsWith('detail:'))) {
    const name = trait.slice(7);
    if (special.includes(name)) continue;
    assert.ok(sceneFor(initialState()).slots[trait], `missing slot ${trait}`);
  }
});

test('colours reach accessories, beard and moustache', () => {
  const scene = sceneFor(run('sciarpa verde, paraorecchie rosa e barba bianca').state);
  assert.equal(scene.colors.scarf, '#4f9a5f');
  assert.equal(scene.colors.earmuffs, '#ef9ac0');
  assert.equal(scene.colors.beard, '#ecebe6');
  assert.notEqual(scene.colors.hair, scene.colors.beard);
});

test('a suit has a tie, but not together with a bow tie', () => {
  assert.equal(sceneFor(run('completo').state).slots['detail:tie'].variant, 'on');
  assert.equal(sceneFor(run('completo con papillon').state).slots['detail:tie'].variant, 'none');
});

test('a broken or tampered shared state never crashes the scene', () => {
  for (const raw of [null, 'x', 42, {}, { hair: null }, { hair: { style: 5 } }, { details: 'x' }, { conf: { head: 9 } }, { started: true, hat: { type: 'x'.repeat(1000) } }]) {
    const state = restoreState(raw);
    assert.ok(sceneFor(state).slots.head);
    assert.ok(applyMessage(state, 'barba').reply);
  }
  const kept = restoreState(run('biondo con la barba').state);
  assert.equal(sceneFor(kept).colors.hair, '#e8c15a');
});

test('edge-case inputs stay short and sensible', () => {
  assert.ok(applyMessage(initialState(), 'x'.repeat(20000)).reply.length < 200);
  assert.equal(applyMessage(initialState(), 'no no no').state.lang, 'it');
  assert.match(applyMessage(initialState(), 'rosso').reply, /per cosa/);
  assert.match(applyMessage(initialState(), 'capelli rossi verdi').reply, /verdi/);
  assert.doesNotMatch(applyMessage(initialState(), 'capelli rossi verdi').reply, /rossi/);
});

test('the drawing has a readable description in the user language', () => {
  assert.match(describe(initialState()), /niente/);
  const it = describe(run('biondo con berretto e sigaretta').state);
  assert.match(it, /biondi/);
  assert.match(it, /berretto/);
  const en = describe(run('blond guy with a beanie').state);
  assert.match(en, /blond hair/);
  assert.match(en, /beanie/);
});

test('unmentioned traits vary between descriptions but stay stable for one', () => {
  const looks = new Set();
  for (const text of ['occhiali', 'barba', 'triste', 'sigaretta', 'berretto rosso', 'felice', 'cuffie', 'neo']) {
    const scene = sceneFor(run(text).state);
    looks.add(`${scene.slots.hair.variant}|${scene.colors.hair}|${scene.slots.clothes.variant}|${scene.slots.head.variant}`);
  }
  assert.ok(looks.size >= 5, `only ${looks.size} different looks`);
  const first = run('occhiali').state;
  const later = applyMessage(first, 'sorriso').state;
  assert.equal(sceneFor(later).slots.hair.variant, sceneFor(first).slots.hair.variant);
  assert.equal(sceneFor(later).colors.clothes, sceneFor(first).colors.clothes);
  assert.equal(restoreState(later).seed, later.seed);
});

test('surprise me makes a random but valid character', () => {
  const looks = new Set();
  for (let i = 0; i < 20; i++) {
    const { state, action } = applyMessage(initialState(), 'sorprendimi', 0, i / 20);
    assert.equal(action, 'random');
    const scene = sceneFor(state);
    for (const [slot, { variant }] of Object.entries(scene.slots)) assert.ok(catalog[slot]?.[variant], `${slot}/${variant}`);
    looks.add(JSON.stringify(Object.values(scene.slots).map((s) => s.variant)));
  }
  assert.ok(looks.size >= 15);
  assert.match(applyMessage(initialState('en'), 'surprise me', 0, 0.3).reply, /random/);
});

test('misses are only the meaningful unknown words', () => {
  assert.deepEqual(missesIn('tizio pelato con il frullatore in testa'), ['frullatore']);
  assert.deepEqual(missesIn('biondo, sigaretta in bocca'), []);
  assert.deepEqual(missesIn('ok scarica'), []);
});

test('reports carry single lowercase words only, never names', async () => {
  globalThis.navigator ??= {};
  const { reportableWords, REPORT_ENDPOINT } = await import('../src/misses.js');
  assert.deepEqual(reportableWords(['frullatore', 'maria', 'x', 'ab12'], 'tizio con il frullatore e Maria'), ['frullatore']);
  assert.equal(REPORT_ENDPOINT, '', 'the published code must not point to a collector until it is deployed on purpose');
});

test('the description includes colours, background and print', () => {
  const text = describe(run('berretto rosso, sciarpa verde, barba bianca, felpa nike a righe, sfondo blu').state);
  for (const part of ['berretto rosso', 'sciarpa verde', 'barba bianca', 'sfondo blu', 'righe', 'stampa']) assert.ok(text.includes(part), `${part} in ${text}`);
});

test('item and colour merge with Italian agreement', () => {
  const it = (text) => applyMessage(initialState(), text).reply;
  assert.match(it('berretto rosso'), /berretto rosso/);
  assert.match(it('felpa nera'), /felpa nera/);
  assert.match(it('bandana rossa'), /bandana rossa/);
  assert.match(it('maglione verde'), /maglione verde/);
  assert.match(applyMessage(initialState('en'), 'black hoodie and red beanie').reply, /black hoodie.*red beanie|red beanie.*black hoodie/);
});
