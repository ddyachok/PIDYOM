import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.warn(
    '[PIDYOM] VITE_NEON_AUTH_URL is not set. Auth will not work.\n' +
    'Get your Auth URL from: Neon Console → Auth → Configuration'
  );
}

export const authClient = createAuthClient(authUrl || '', {
  adapter: BetterAuthReactAdapter(),
});
