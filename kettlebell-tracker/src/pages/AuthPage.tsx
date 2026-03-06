import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '../lib/auth';
import { useStore } from '../store/useStore';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthPage() {
  const theme = useStore(s => s.theme);
  const isLight = theme === 'light';
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const titleColor = isLight ? '#0A0A0A' : '#F5F4EB';

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
    <div className="page-light min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Background dot grid handled by .page-light::before */}
      <div className="relative z-10 w-full max-w-sm">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: titleColor,
              textTransform: 'uppercase',
            }}
          >
            PIDYOM
          </div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: '0.25em',
              color: '#6A6A62',
              textTransform: 'uppercase',
              marginTop: 6,
            }}
          >
            Movement Framework
          </div>
          {/* Acid accent bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            style={{ height: 2, background: '#C6FF00', width: 32, marginTop: 12, transformOrigin: 'left' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* Mode toggle */}
          <div className="mode-toggle mb-8">
            <button
              type="button"
              className={`mode-toggle__btn${mode === 'sign-in' ? ' mode-toggle__btn--active' : ''}`}
              onClick={() => { setMode('sign-in'); setError(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mode-toggle__btn${mode === 'sign-up' ? ' mode-toggle__btn--active' : ''}`}
              onClick={() => { setMode('sign-up'); setError(''); }}
            >
              Create
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(239,68,68,0.08)',
                    borderLeft: '2px solid #ef4444',
                  }}
                >
                  <p style={{ fontSize: 11, color: '#ef4444', fontFamily: 'Space Mono, monospace' }}>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'sign-up' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div style={{ paddingBottom: 4 }}>
                    <label
                      htmlFor="auth-name"
                      style={{ display: 'block', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6A6A62', marginBottom: 6, fontFamily: 'Space Mono, monospace' }}
                    >
                      Name
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="field"
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label
                htmlFor="auth-email"
                style={{ display: 'block', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6A6A62', marginBottom: 6, fontFamily: 'Space Mono, monospace' }}
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="field"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                style={{ display: 'block', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6A6A62', marginBottom: 6, fontFamily: 'Space Mono, monospace' }}
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'sign-up' ? 'Min 8 characters' : '••••••••'}
                className="field"
                required
                minLength={mode === 'sign-up' ? 8 : undefined}
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim() || (mode === 'sign-up' && !name.trim())}
              className="btn btn-solid btn-full mt-6"
              style={{ letterSpacing: '0.12em', fontSize: 11 }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  {mode === 'sign-in' ? 'Signing in…' : 'Creating…'}
                </span>
              ) : (
                mode === 'sign-in' ? 'AUTHENTICATE →' : 'CREATE ACCOUNT →'
              )}
            </button>
          </form>

          {/* Social divider */}
          <div className="mt-8 mb-5 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#C0C0B8' }} />
            <span style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6A6A62', fontFamily: 'Space Mono, monospace' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#C0C0B8' }} />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="btn btn-outink flex items-center justify-center gap-2"
              style={{ fontSize: 10, padding: '11px 16px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="btn btn-outink flex items-center justify-center gap-2"
              style={{ fontSize: 10, padding: '11px 16px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>
        </motion.div>

        <p
          className="text-center mt-10"
          style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C0C0B8', fontFamily: 'Space Mono, monospace' }}
        >
          v1.0 // PIDYOM
        </p>
      </div>
    </div>
  );
}
