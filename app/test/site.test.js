import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siteCopy, sitePages, pageCopy } from '../src/site.js';

// Every page written for one search must be complete in its language, and unique.
test('search pages have their own complete copy', () => {
  const titles = new Set([siteCopy.en.title, siteCopy.it.title]);
  for (const [id, page] of Object.entries(sitePages)) {
    assert.match(page.path, /^\/[a-z0-9/-]+\/$/, id);
    const own = page[page.lang];
    for (const key of ['title', 'description', 'kicker', 'headline', 'lede', 'pageTitle', 'faqQ1', 'faqA1']) assert.ok(own?.[key], `${id}: ${key}`);
    assert.ok(own.pageText.length >= 2, `${id}: pageText`);
    assert.ok(own.description.length <= 170, `${id}: description is ${own.description.length} characters`);
    assert.ok(!titles.has(own.title), `${id}: title is not unique`);
    titles.add(own.title);
    assert.equal(pageCopy(id, page.lang).download, siteCopy[page.lang].download);
  }
});

test('every site language has the whole copy', () => {
  for (const lang of Object.keys(siteCopy)) {
    const missing = Object.keys(siteCopy.en).filter((key) => !(key in siteCopy[lang]));
    assert.deepEqual(missing, [], `${lang} is missing ${missing}`);
  }
});

// Tapping a gallery face writes its sentence in the page's language: it must draw the same face.
test('gallery sentences draw the same face in every language', async () => {
  const { parse } = await import('../src/parser.js');
  const { siteGallery } = await import('../src/site.js');
  for (const lang of Object.keys(siteGallery)) {
    assert.equal(siteGallery[lang].length, siteGallery.en.length, lang);
    siteGallery[lang].forEach((sentence, i) => {
      const expected = new Set(parse(siteGallery.en[i]).found);
      const found = new Set(parse(sentence).found);
      assert.deepEqual([...found].sort(), [...expected].sort(), `${lang}: "${sentence}"`);
    });
  }
});
