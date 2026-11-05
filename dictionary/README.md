# The Describble dictionary

Everything Describble understands is here, as data, separate from the code.

- `concepts.json`: what can be drawn. Each concept is a `slot:variant` id (for example `hat:beanie`) backed by a piece in `app/src/pieces.js`, plus the colours, the nouns a colour can attach to and the adjectives that only count next to a noun. `label.it` is the word Italian replies use.
- `lang/<code>.json`: the words of one language for those concepts, plus its colours, negations ("without") and words that change nothing ("person"). One file per language.
- `brands.json`: real brand names. They are recognised only to print an invented name instead; they are never drawn.
- `schema/`: JSON Schemas for the files above, so editors can autocomplete and flag mistakes.

The parser merges every language: you can mix them in one sentence. The website inlines these files at build time and loads nothing else.

## Tools

From `app/`:

```bash
node scripts/dictionary.mjs check        # is everything well formed?
node scripts/dictionary.mjs stats        # words per language
node scripts/dictionary.mjs missing pt   # concepts with no Portuguese words yet
```

`check` also runs with the tests, so a broken file fails CI. See [CONTRIBUTING.md](../CONTRIBUTING.md) for adding words and languages.

## License

The dictionary is part of the code and released under the MIT License. Please add only words you wrote yourself: do not copy lists from other dictionaries, whose licenses may not allow it.
