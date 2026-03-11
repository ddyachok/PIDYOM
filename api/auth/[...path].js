/**
 * Vercel Edge Function — Neon Auth reverse proxy.
 *
 * Safari's ITP blocks third-party cookies. By proxying Neon Auth through
 * the same origin (pidyom.vercel.app), session cookies become first-party
 * and Safari can't block them.
 *
 * Better Auth also performs an Origin header check (CSRF protection), so
 * we spoof the Origin to the Neon Auth server's domain.
 */

export const config = {
  runtime: 'edge',
};

const NEON_AUTH_BASE =
  'https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech';

export default async function handler(req) {
  const url = new URL(req.url);

  // /api/auth/sign-in/email → /neondb/auth/sign-in/email
  const neonPath = url.pathname.replace(/^\/api\/auth/, '/neondb/auth');
  const targetUrl = `${NEON_AUTH_BASE}${neonPath}${url.search}`;

  // Forward headers, but spoof Origin so Neon Auth trusts the request.
  const forwardHeaders = new Headers(req.headers);
  forwardHeaders.set('Origin', NEON_AUTH_BASE);
  forwardHeaders.set('Referer', `${NEON_AUTH_BASE}/`);
  forwardHeaders.delete('host');

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    body: hasBody ? req.body : null,
    duplex: hasBody ? 'half' : undefined,
  });

  // Forward upstream response headers (including Set-Cookie).
  // Without an explicit Domain attribute the browser stores them as
  // first-party cookies for pidyom.vercel.app — visible to Safari.
  const responseHeaders = new Headers(upstream.headers);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
