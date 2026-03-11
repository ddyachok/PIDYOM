/**
 * Vercel Node.js Serverless Function — Neon Auth reverse proxy.
 *
 * 1. Spoofs Origin header so Better Auth CSRF check passes.
 * 2. Strips Domain from Set-Cookie so cookies land on pidyom.vercel.app.
 * 3. Passes through redirects (302 → Google OAuth) to the browser.
 */

const NEON_AUTH_BASE =
  'https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech';
const NEON_AUTH_HOST = 'ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech';

const SKIP_HEADERS = new Set([
  'connection', 'keep-alive', 'transfer-encoding', 'upgrade',
]);

module.exports = async function handler(req, res) {
  const pathParts = req.query.path || [];
  const pathStr = Array.isArray(pathParts) ? pathParts.join('/') : pathParts;

  // Rebuild query string without the catch-all 'path' param
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') qs.append(k, v);
  }
  const search = qs.toString() ? '?' + qs.toString() : '';
  const targetUrl = NEON_AUTH_BASE + '/neondb/auth/' + pathStr + search;

  // Build forwarded headers
  const fwd = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!SKIP_HEADERS.has(k.toLowerCase())) {
      fwd[k] = v;
    }
  }
  // Spoof Origin so Better Auth CSRF check passes
  fwd['host'] = NEON_AUTH_HOST;
  fwd['origin'] = NEON_AUTH_BASE;
  if (fwd['referer']) {
    fwd['referer'] = NEON_AUTH_BASE + '/';
  }
  // Avoid double-compression issues
  delete fwd['accept-encoding'];

  // Buffer request body for POST/PUT/PATCH
  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (chunks.length) body = Buffer.concat(chunks);
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: fwd,
    body,
    redirect: 'manual',
  });

  // Forward status
  res.status(upstream.status);

  // Collect Set-Cookie headers separately (may be multiple)
  const cookies = [];
  upstream.headers.forEach(function (value, key) {
    var lower = key.toLowerCase();
    if (SKIP_HEADERS.has(lower)) return;

    if (lower === 'set-cookie') {
      // Strip Domain so cookie applies to pidyom.vercel.app
      cookies.push(value.replace(/;\s*domain=[^;]*/gi, ''));
    } else {
      res.setHeader(key, value);
    }
  });

  if (cookies.length) {
    res.setHeader('set-cookie', cookies);
  }

  // Forward body
  var buf = Buffer.from(await upstream.arrayBuffer());
  res.end(buf);
};
