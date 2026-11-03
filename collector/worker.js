// Word-report collector: a Cloudflare Worker that counts the words Describble did not understand.
// It stores only "language + word → count". No IP addresses, no sentences, no identifiers.
//
// POST /            body {"words": ["frullatore"], "lang": "it"}  → counts each word
// GET  /export      header "Authorization: Bearer <EXPORT_TOKEN>"  → all counts as JSON
//
// Bindings (see wrangler.toml.example): KV namespace WORDS, secret EXPORT_TOKEN.

const WORD = /^\p{Ll}{3,24}$/u;
const LANGS = new Set(['it', 'en']);
const MAX_WORDS = 8;
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...CORS } });
}

async function record(request, env) {
  let payload;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  const lang = LANGS.has(payload?.lang) ? payload.lang : 'it';
  const words = [...new Set(Array.isArray(payload?.words) ? payload.words : [])]
    .filter((word) => typeof word === 'string' && WORD.test(word))
    .slice(0, MAX_WORDS);
  for (const word of words) {
    const key = `${lang}:${word}`;
    const count = Number(await env.WORDS.get(key)) || 0;
    await env.WORDS.put(key, String(count + 1));
  }
  return json({ ok: true, counted: words.length });
}

async function exportCounts(request, env) {
  if (!env.EXPORT_TOKEN || request.headers.get('authorization') !== `Bearer ${env.EXPORT_TOKEN}`) {
    return json({ error: 'unauthorized' }, 401);
  }
  const counts = {};
  let cursor;
  do {
    const page = await env.WORDS.list({ cursor });
    for (const { name } of page.keys) counts[name] = Number(await env.WORDS.get(name)) || 0;
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return json(Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1])));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method === 'POST' && url.pathname === '/') return record(request, env);
    if (request.method === 'GET' && url.pathname === '/export') return exportCounts(request, env);
    return json({ error: 'not found' }, 404);
  },
};
