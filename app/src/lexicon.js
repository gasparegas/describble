// The words live in dictionary/ at the repository root: concepts.json lists what can be drawn,
// lang/<language>.json gives the words for each concept, brands.json the real brands to replace.
// This module merges every language into the tables the parser reads. Multi-word phrases take
// precedence; real brands are recognised only to replace them with an invented one (see dialogue.js).
// build.mjs inlines these JSON files, since the published page loads nothing else.
import conceptsFile from '../../dictionary/concepts.json' with { type: 'json' };
import brandsFile from '../../dictionary/brands.json' with { type: 'json' };
import dictionaryIt from '../../dictionary/lang/it.json' with { type: 'json' };
import dictionaryEn from '../../dictionary/lang/en.json' with { type: 'json' };
import dictionaryPt from '../../dictionary/lang/pt.json' with { type: 'json' };

// Every language the parser understands; a new language is a new file imported here.
export const dictionaryLanguages = [dictionaryIt, dictionaryEn, dictionaryPt];

const uniqueWords = (words) => [...new Set(words)];
// All the words every language gives for one key of one section, in language order.
const wordsFor = (section, key) => uniqueWords(dictionaryLanguages.flatMap((language) => language[section]?.[key] ?? []));
const tableFor = (section, keys) => Object.fromEntries(keys.map((key) => [key, wordsFor(section, key)]));
const listFor = (section) => uniqueWords(dictionaryLanguages.flatMap((language) => language[section] ?? []));

export const traits = {
  ...Object.fromEntries(brandsFile.brands.map((brand) => [`brand:${brand.replace(/ /g, '')}`, [brand]])),
  // The Italian label comes first: Italian replies name a trait by its first word.
  ...Object.fromEntries(conceptsFile.concepts.map(({ id, label }) => [id, uniqueWords([label.it, ...wordsFor('concepts', id)])])),
};

// Words that already are a hair colour, even without mentioning hair.
export const hairOnlyColors = tableFor('hairOnlyColors', conceptsFile.hairOnlyColors);
export const colors = tableFor('colors', conceptsFile.colors);
// Nouns a nearby colour attaches to. Garments and hats in the catalog already count.
export const colorNouns = tableFor('colorNouns', conceptsFile.colorNouns);
// Adjectives that only count next to the right noun: "cappotto lungo" (long coat) is not long hair.
export const contextual = conceptsFile.contextual.map(({ trait, near }) => ({ trait, near, words: wordsFor('contextual', trait) }));
// Words that are understood but change nothing, so they are not reported as misses.
export const ignored = listFor('ignored');
export const negations = listFor('negations');
export const scopeBreakers = listFor('scopeBreakers');
