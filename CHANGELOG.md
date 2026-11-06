# Changelog

All notable changes to Describble. The version is shown in the website footer.

## 0.2.1 (2026-11-06)

Words people typed after the Portuguese release, and a way to say thanks.

- After a download, a short line invites a star on GitHub (only when the site has a repository link).
- New words: fair (skin) and fair hair, bold (bald) and bold eyebrows, thick beard, cross necklace, crucifix, cross and triangle earrings, liner, devilish smile, evil grin, windblown hair, drugged, "riga" for a side part.
- Words that change nothing (extremely, three, outside, blush, thick, volto) are no longer reported as unknown.
- The backlog now lists full lips, sunburn, medium-length hair, a big forehead, an energetic expression and beach backgrounds.

## 0.2.0 (2026-11-05)

A real dictionary, and a third language.

- Words now live in `dictionary/`, one file per language, separate from the code, with a checker (`node scripts/dictionary.mjs check | stats | missing <code>`).
- About 550 new Italian and English words and phrases for hair, faces, moods, hats, glasses, beards, clothes and details.
- Understands Portuguese: "menina ruiva com sardas", "cara careca de boné vermelho", "sem óculos". The page itself stays in English and Italian.
- A negation word inside a known phrase no longer negates what follows, so "piercing no nariz e alargadores" keeps both.
- "mascara" means lashes, and "cappello di paglia" is a straw hat, not a cigarette.

## 0.1.1 (2026-11-05)

Words people typed on launch day.

- Understands "dark" as a colour (dark hair, dark jacket) while "dark skin" stays dark skin.
- "blue-eyed", "green-eyed" and friends colour the eyes.
- New synonyms: blouse, button-up, checked, feminine, skinny / slim / thin, magro, "con la riga", woodchopper, ladro / thief.
- Words that change nothing (from, sorry, huge...) are no longer reported as unknown.
- The word backlog now lists bear ears, a Spartan helmet, a camera, drums, tongue out and multicolour hair, plus franchise items left out on purpose.

## 0.1.0 (2026-11-04)

First public release.

- Live drawing: the avatar is drawn while you type, with a 2.5D head that sways, blinks and turns when dragged.
- English and Italian, mixed freely, with honest messages for words it does not know.
- Hundreds of hand-drawn pieces: hair, hats, glasses, piercings and gauges, clothes, moods, jobs and archetypes.
- Download as a 1024 × 1024 PNG, share a link that redraws the same character, or let it surprise you.
- Website at describble.com, in English and Italian, with a clickable gallery and a questions section.
- Private by design: no AI, no accounts, no analytics; only single unknown words can be counted anonymously, and one click turns that off.
