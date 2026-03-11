/**
 * Vercel Node.js Serverless Function — Neon Auth reverse proxy.
 *
 * Safari's ITP blocks third-party cookies. By proxying Neon Auth through
 * the same origin (pidyom.vercel.app), session cookies become first-party
 * and Safari can't block them.
 *
 * Uses Node.js runtime (not edge) for reliable response/cookie handling.
 */

const NEON_AUTH_BASE =
  'https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech';

/** Headers we must not forward to the upstream server. */
const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade',
]);

export default async function handler(req, res) {
  // req.query.path is the [...path] catch-all, e.g. ['sign-in', 'social']
  const pathParts = req.query.path ?? [];
  const pathStr = Array.isArray(pathParts) ? pathParts.join('/') : pathParts;

  // Rebuild query string without the 'path' catch-all param
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') qs.append(k, v);
  }
  const qsPart = qs.toString() ? `?${qs.toString()}` : '';
  const targetUrl = `${NEON_AUTH_BASE}/neondb/auth/${pathStr}${qsPart}`;

  // Build forwarded headers
  const forwardHeaders = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) {
      forwardHeaders[k] = v;
    }
  }
  // Point Host at the upstream server so it knows which vhost to use
  forwardHeaders['host'] = new URL(NEON_AUTH_BASE).host;
  // Remove Accept-Encoding so we get a plain (non-compressed) response body
  // that we can forward without worrying about double-decompression.
  delete forwardHeaders['accept-encoding'];

  // Buffer the request body (needed for POST /sign-in/email etc.)
  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    body,
    // Don't follow redirects — social login returns a 302 to Google/GitHub.
    // The browser must follow that redirect, not this function.
    redirect: 'manual',
  });

  // Forward status
  res.status(upstream.status);

  // Forward response headers, fixing up Set-Cookie so cookies land on
  // pidyom.vercel.app instead of the upstream neonauth domain.
  for (const [k, v] of upstream.headers.entries()) {
    const lower = k.toLowerCase();
    if (HOP_BY_HOP.has(lower)) continue;

    if (lower === 'set-cookie') {
      // Strip explicit Domain attribute — browser will default to current host
      const cleaned = v.replace(/;\s*domain=[^;]*/gi, '');
      // Append each Set-Cookie separately (res.setHeader overwrites)
      res.appendHeader('set-cookie', cleaned);
    } else {
      res.setHeader(k, v);
    }
  }

  // Stream the response body
  const buffer = await upstream.arrayBuffer();
  res.end(Buffer.from(buffer));
}
