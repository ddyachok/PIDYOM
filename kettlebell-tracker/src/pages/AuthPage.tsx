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
    const timer = setTimeout(() => setPhase('form'), 2400);
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
      // Session will be picked up by App.tsx via useSession
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Decorative lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/[0.04] to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.div
          className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />
        {/* Corner brackets */}
        <motion.div
          className="absolute top-8 left-8 w-12 h-12 border-l border-t border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        />
        <motion.div
          className="absolute top-8 right-8 w-12 h-12 border-r border-t border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        />
        <motion.div
          className="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        />
        <motion.div
          className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        />
      </div>

      <div className="w-full max-w-xs relative z-10">
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Logo size={100} animate />

          <motion.h1
            className="text-xl tracking-[0.4em] font-bold mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            PIDYOM
          </motion.h1>

          <motion.div
            className="flex items-center gap-3 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <div className="w-8 h-px bg-white/10" />
            <span className="text-[8px] tracking-[0.4em] text-white/25 uppercase">
              Movement Framework
            </span>
            <div className="w-8 h-px bg-white/10" />
          </motion.div>
        </motion.div>

        {/* Form */}
        <AnimatePresence mode="wait">
          {phase === 'form' && (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Mode tabs */}
              <div className="flex items-center gap-0 mb-8 border border-white/[0.08]">
                <button
                  onClick={() => { setMode('sign-in'); setError(''); }}
                  className={`flex-1 py-3 text-[9px] tracking-[0.2em] uppercase transition-all ${
                    mode === 'sign-in'
                      ? 'bg-white/[0.04] text-white'
                      : 'text-white/25 hover:text-white/40'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('sign-up'); setError(''); }}
                  className={`flex-1 py-3 text-[9px] tracking-[0.2em] uppercase transition-all border-l border-white/[0.08] ${
                    mode === 'sign-up'
                      ? 'bg-white/[0.04] text-white'
                      : 'text-white/25 hover:text-white/40'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Social providers */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  className="btn btn-ghost py-3 text-[9px]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="btn btn-ghost py-3 text-[9px]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[8px] tracking-[0.2em] text-white/15 uppercase">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 border border-red-500/20 bg-red-500/5"
                >
                  <p className="text-[9px] text-red-400/80 tracking-[0.05em]">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {mode === 'sign-up' && (
                    <motion.div
                      key="name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-[9px] tracking-[0.2em] text-white/25 uppercase block mb-2">
                        Name
                      </label>
                      <input
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

                <div>
                  <label className="text-[9px] tracking-[0.2em] text-white/25 uppercase block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="text-[9px] tracking-[0.2em] text-white/25 uppercase block mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'sign-up' ? 'Min 8 characters' : '••••••••'}
                    className="w-full"
                    required
                    minLength={mode === 'sign-up' ? 8 : undefined}
                    autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="btn btn-full mt-6 relative overflow-hidden disabled:opacity-30"
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-3 h-3 border border-white/40 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      {mode === 'sign-in' ? 'Signing in...' : 'Creating account...'}
                    </motion.div>
                  ) : (
                    mode === 'sign-in' ? 'Sign In' : 'Create Account'
                  )}
                </motion.button>
              </form>

              <motion.p
                className="text-[8px] text-white/15 text-center mt-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Kettlebell · Rings · Bodyweight · Rope Flow
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Version */}
      <motion.div
        className="fixed bottom-6 text-[7px] tracking-[0.3em] text-white/10 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        v1.0 · 2025
      </motion.div>
    </div>
  );
}
