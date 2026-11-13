// Entry point when the site runs as a Cloudflare Worker (static files come from ./public).
// API routes: /api/token (Gemini Live token) and /api/analyze (AI assessment on the result page).
import * as token from './api/token.js';
import * as analyze from './api/analyze.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (request.method === 'POST' && pathname === '/api/token') return token.onRequestPost({ request, env });
    if (request.method === 'POST' && pathname === '/api/analyze') return analyze.onRequestPost({ request, env });
    return env.ASSETS.fetch(request);
  },
};
