import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/ui/Logo';
import { authClient } from '../lib/auth';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<'intro' | 'form'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('form'), 1600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === 'sign-up' && !name.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      if (mode === 'sign-up') {
        const { error: signUpError } = await authClient.signUp.email({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
        });
        if (signUpError) {
          setError(signUpError.message || 'Sign up failed');
          setIsLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password: password.trim(),
        });
        if (signInError) {
          setError(signInError.message || 'Sign in failed');
          setIsLoading(false);
          return;
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setError('');
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: window.location.origin,
      });
    } catch (err: any) {
      setError(err?.message || `${provider} login failed`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 md:px-10 md:py-16">
      {/* Background lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.3 }} />
        <motion.div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & title */}
        <motion.div className="flex flex-col items-center mb-12 md:mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <Logo size={90} animate className="md:w-[110px] md:h-[110px]" />
          <h1 className="text-xl md:text-2xl tracking-[0.35em] md:tracking-[0.4em] font-bold mt-8 md:mt-10">PIDYOM</h1>
          <p className="text-[10px] md:text-[11px] tracking-[0.25em] text-white/35 uppercase mt-2">Movement Framework</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'form' && (
            <motion.div key="auth-form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <p className="text-[11px] md:text-[13px] text-white/45 mb-8 text-center leading-relaxed">
                Sign in or create an account to track your workouts
              </p>

              {/* Mode tabs */}
              <div className="flex border border-white/[0.1] mb-8 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setMode('sign-in'); setError(''); }}
                  className={`flex-1 py-4 md:py-5 text-[10px] md:text-[11px] tracking-[0.18em] uppercase transition-colors ${
                    mode === 'sign-in' ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('sign-up'); setError(''); }}
                  className={`flex-1 py-4 md:py-5 text-[10px] md:text-[11px] tracking-[0.18em] uppercase transition-colors border-l border-white/[0.1] ${
                    mode === 'sign-up' ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Sign up
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 border border-red-500/25 bg-red-500/10"
                >
                  <p className="text-[11px] md:text-[12px] text-red-300/90">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {mode === 'sign-up' && (
                    <motion.div key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <label htmlFor="auth-name" className="text-[10px] md:text-[11px] tracking-[0.15em] text-white/45 uppercase block">
                        Name
                      </label>
                      <input
                        id="auth-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full"
                        autoComplete="name"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  <label htmlFor="auth-email" className="text-[10px] md:text-[11px] tracking-[0.15em] text-white/45 uppercase block">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="auth-password" className="text-[10px] md:text-[11px] tracking-[0.15em] text-white/45 uppercase block">
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'sign-up' ? 'At least 8 characters' : 'Your password'}
                    className="w-full"
                    required
                    minLength={mode === 'sign-up' ? 8 : undefined}
                    autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  />
                  {mode === 'sign-up' && (
                    <p className="text-[9px] text-white/30 mt-1">Minimum 8 characters</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim() || (mode === 'sign-up' && !name.trim())}
                  className="btn btn-primary btn-full mt-4 py-4 md:py-5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {mode === 'sign-in' ? 'Signing in…' : 'Creating account…'}
                    </span>
                  ) : (
                    mode === 'sign-in' ? 'Sign in' : 'Create account'
                  )}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-white/[0.08]">
                <p className="text-[10px] text-white/30 text-center mb-5">Or continue with</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    className="btn btn-ghost py-4 text-[10px] flex items-center justify-center gap-2.5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="btn btn-ghost py-4 text-[10px] flex items-center justify-center gap-2.5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="fixed bottom-6 left-0 right-0 text-center text-[8px] tracking-[0.2em] text-white/20 uppercase">v1.0</p>
    </div>
  );
}
