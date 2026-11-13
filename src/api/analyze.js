// Detailed AI assessment on the result page ("ประเมินละเอียดด้วย AI").
// Sends the page's prompt to Gemini and returns its JSON answer. Uses the same GEMINI_API_KEY secret.
// Fast models first, no long 'thinking', and a time limit per try so the result page never hangs.
const MODELS = [
  { id: 'gemini-2.5-flash-lite', thinking: null },
  { id: 'gemini-2.5-flash', thinking: { thinkingBudget: 0 } },
  { id: 'gemini-flash-lite-latest', thinking: null },
];
const PER_TRY_MS = 12000;

export async function onRequestPost({ request, env }) {
  const key = env.GEMINI_API_KEY;
  if (!key) return json({ error: 'missing_key' }, 500);
  if (!sameSite(request)) return json({ error: 'forbidden' }, 403);

  let prompt = '';
  try { ({ prompt } = await request.json()); } catch {}
  if (typeof prompt !== 'string' || !prompt || prompt.length > 20000) return json({ error: 'bad_request' }, 400);

  for (const model of MODELS) {
    const generationConfig = { responseMimeType: 'application/json', temperature: 0.4 };
    if (model.thinking) generationConfig.thinkingConfig = model.thinking;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig }),
      signal: AbortSignal.timeout(PER_TRY_MS),
    }).catch(() => null);
    if (!r || !r.ok) continue;
    const d = await r.json().catch(() => ({}));
    const text = ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [])
      .map((p) => p.text || '').join('');
    const parsed = parseJson(text);
    if (parsed) return json(parsed);
  }
  return json({ error: 'ai_failed' }, 502);
}

function parseJson(t) {
  try { return JSON.parse(t); } catch {}
  try { return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); } catch {}
  return null;
}

function sameSite(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
