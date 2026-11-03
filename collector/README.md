# Word-report collector

A tiny Cloudflare Worker that counts the words Scribble did not understand, so maintainers know which words to add to the lexicon. It is optional: without it, the app sends nothing.

## What it stores

Only `language:word → count`, for example `it:frullatore → 12`. No IP addresses, no sentences, no cookies, no identifiers. The app sends single lowercase words (capitalised words are skipped because they are usually names) and never sends anything when the browser signals Global Privacy Control or the user switches reports off.

## Deploy

1. Create a KV namespace and copy `wrangler.toml.example` to `wrangler.toml` with its id.
2. Set the export secret: `npx wrangler secret put EXPORT_TOKEN`.
3. Deploy: `npx wrangler deploy`.
4. Build the app with the collector URL: `SCRIBBLE_REPORT_ENDPOINT=https://… node build.mjs` in `app/`.

## Read the counts

```bash
curl -H "Authorization: Bearer $EXPORT_TOKEN" https://<your-worker>/export
```

Or turn them straight into a to-do list, with the words the current lexicon already handles set apart:

```bash
cd app && EXPORT_TOKEN=… node scripts/triage.mjs https://<your-worker>/export --min=3
```

Add the frequent words to `app/src/lexicon.js`, with a regression test, and the next visitors will be understood.
