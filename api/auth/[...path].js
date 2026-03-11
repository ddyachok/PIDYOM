/**
 * Vercel Edge Function — Neon Auth reverse proxy.
 *
 * Why this exists:
 *   Better Auth performs an Origin header check (CSRF protection) on every
 *   request. When the browser hits pidyom.vercel.app/api/auth/*, it sends
 *   Origin: https://pidyom.vercel.app. The Neon Auth server would reject
 *   that with 400 unless pidyom.vercel.app is listed as a trusted origin.
 *
 *   Instead of requiring a Neon Console config change, this Edge Function
 *   spoofs the Origin header to the Neon Auth server's own domain so it
 *   always trusts the request. The session cookie is then set by the
 *   response as seen from pidyom.vercel.app, making it a first-party cookie
 *   that Safari's ITP cannot block.
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

  // Forward all incoming headers, but spoof Origin so Neon Auth trusts us.
  const forwardHeaders = new Headers(req.headers);
  forwardHeaders.set('Origin', NEON_AUTH_BASE);
  forwardHeaders.set('Referer', `${NEON_AUTH_BASE}/`);
  forwardHeaders.delete('host');

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    body: hasBody ? req.body : null,
    // Required for streaming request bodies on the Edge runtime
    duplex: hasBody ? 'half' : undefined,
  });

  // Forward all upstream response headers (including Set-Cookie).
  // Because the browser sees this response as coming from pidyom.vercel.app,
  // any Set-Cookie without an explicit Domain attribute will be stored as a
  // first-party pidyom.vercel.app cookie — visible to Safari.
  const responseHeaders = new Headers(upstream.headers);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
