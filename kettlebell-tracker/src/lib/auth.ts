import { createInternalNeonAuth } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.warn(
    '[PIDYOM] VITE_NEON_AUTH_URL is not set. Auth will not work.\n' +
    'Get your Auth URL from: Neon Console → Auth → Configuration'
  );
}

// createInternalNeonAuth returns { adapter, getJWTToken }
// createAuthClient only returns the adapter — no getJWTToken!
const neonAuth = createInternalNeonAuth(authUrl || '', {
  adapter: BetterAuthReactAdapter(),
});

/** Better Auth client (useSession, signIn, signOut, etc.) */
export const authClient = neonAuth.adapter;

/** Get JWT token for GraphQL requests */
export const getJWTToken = () => neonAuth.getJWTToken();
