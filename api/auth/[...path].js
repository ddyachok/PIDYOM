// Vercel Serverless Function – proxies auth requests to Neon Auth.
// This avoids cross-origin POST issues (Better Auth CSRF 403).

const NEON_AUTH_URL = process.env.VITE_NEON_AUTH_URL; // set in Vercel env vars

export default async function handler(req, res) {
  const subpath = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path || '';

  const target = `${NEON_AUTH_URL}/${subpath}`;

  // Forward the request to Neon Auth
  const headers = { 'content-type': req.headers['content-type'] || 'application/json' };
  if (req.headers.cookie) headers.cookie = req.headers.cookie;

  const fetchOpts = {
    method: req.method,
    headers,
  };

  // Forward body for non-GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOpts.body = JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(target, fetchOpts);

    // Forward status
    res.status(upstream.status);

    // Forward relevant response headers (cookies, content-type, location)
    for (const [key, value] of upstream.headers.entries()) {
      const lower = key.toLowerCase();
      if (['set-cookie', 'content-type', 'location'].includes(lower)) {
        res.setHeader(key, value);
      }
    }

    // For redirects, just send empty body
    if (upstream.status >= 300 && upstream.status < 400) {
      return res.end();
    }

    const body = await upstream.text();
    return res.send(body);
  } catch (err) {
    console.error('[auth-proxy]', err);
    return res.status(502).json({ error: 'Auth proxy failed' });
  }
}
