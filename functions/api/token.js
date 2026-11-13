// Creates a short-lived Gemini Live token so the browser never sees the real API key.
// The key lives in Cloudflare: Settings > Variables and Secrets > GEMINI_API_KEY (type: Secret).
export async function onRequestPost({ request, env }) {
  const key = env.GEMINI_API_KEY;
  if (!key) return json({ error: 'missing_key' }, 500);
  if (!sameSite(request)) return json({ error: 'forbidden' }, 403);

  const now = Date.now();
  const r = await fetch('https://generativelanguage.googleapis.com/v1alpha/auth_tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
      newSessionExpireTime: new Date(now + 2 * 60 * 1000).toISOString(),
    }),
  }).catch(() => null);
  if (!r) return json({ error: 'network_error' }, 502);
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.name) {
    const e = d.error || {};
    return json({ error: e.status || 'token_failed', message: e.message || '' }, r.status === 429 ? 429 : 502);
  }
  return json({ token: d.name });
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
