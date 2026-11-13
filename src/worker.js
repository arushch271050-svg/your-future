// Entry point when the site runs as a Cloudflare Worker (static files come from ./public).
// The same handlers also run as Pages Functions from ./functions if the site is set up as Pages.
import * as token from '../functions/api/token.js';
import * as analyze from '../functions/api/analyze.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (request.method === 'POST' && pathname === '/api/token') return token.onRequestPost({ request, env });
    if (request.method === 'POST' && pathname === '/api/analyze') return analyze.onRequestPost({ request, env });
    return env.ASSETS.fetch(request);
  },
};
