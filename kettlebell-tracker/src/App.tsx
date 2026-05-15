import { useEffect, useLayoutEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import i18n from './i18n';
import { useStore } from './store/useStore';
import { authClient } from './lib/auth';
import { hydrateFromServer } from './lib/gql/hydrate';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import WorkoutsPage from './pages/WorkoutsPage';
import SchedulePage from './pages/SchedulePage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import ClubPage from './pages/ClubPage';
import DossierPage from './pages/DossierPage';
import NotImplementedPage from './pages/NotImplementedPage';
import BrandShowcase from './pages/__brand';

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (authClient as any).useSession();
  const syncAuth = useStore(s => s.syncAuth);
  const hydrateStore = useStore(s => s.hydrateStore);
  const theme = useStore(s => s.theme);
  const themePref = useStore(s => s.themePref);
  const setTheme = useStore(s => s.setTheme);
  const lang = useStore(s => s.lang);
  const hydrationAttempted = useRef(false);

  // Apply theme to <html> before paint to prevent flash
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Re-resolve when system preference changes (only when pref is 'system')
  useEffect(() => {
    if (themePref !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(mq.matches ? 'dark' : 'light');
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [themePref, setTheme]);

  // Sync zustand lang → i18next
  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang);
  }, [lang]);

  const _isPreview = !!new URLSearchParams(window.location.search).get('preview');

  // Sync Neon Auth session → Zustand store + trigger hydration
  useEffect(() => {
    if (_isPreview) return; // Skip auth sync in preview mode
    if (session.data?.user) {
      const user = session.data.user;
      syncAuth(true, user.email || '', user.name || '', user.id);

      if (!hydrationAttempted.current) {
        hydrationAttempted.current = true;
        hydrateFromServer(user.id, user.email || '', user.name || '')
          .then((data) => {
            hydrateStore(data);
            console.log('[PIDYOM] Hydrated from server, profileId:', data.profileId);
          })
          .catch((err) => {
            console.warn('[PIDYOM] Hydration failed (using local data):', err);
            hydrateStore({
              profileId: null,
              userName: user.name || '',
              userEmail: user.email || '',
              userEquipment: useStore.getState().userEquipment,
              workouts: useStore.getState().workouts,
              schedule: useStore.getState().schedule,
              unlockedExercises: useStore.getState().unlockedExercises,
            });
          });
      }
    } else if (!session.isPending) {
      syncAuth(false, '', '');
      hydrationAttempted.current = false;
    }
  }, [session.data, session.isPending, syncAuth, hydrateStore, _isPreview]);

  // Loading state — auth bootstrap
  if (session.isPending && !_isPreview) {
    return (
      <div className="relative min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--ink)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-4 h-4 border rounded-full animate-spin"
            style={{ borderColor: 'var(--ink-22)', borderTopColor: 'transparent' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--ink-22)' }}>
            Initializing
          </span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Dev-only brand showcase — bypasses auth, no chrome (lives outside RootLayout). */}
        {import.meta.env.DEV && (
          <Route path="/__brand" element={<BrandShowcase />} />
        )}

        {/* Auth-only route: rendered when no user. */}
        <Route
          path="/auth"
          element={!session.data?.user || _isPreview ? <AuthPage /> : <Navigate to="/" replace />}
        />

        {/* App routes — wrapped by RootLayout (handles tabbar suppression) */}
        <Route element={<RootLayout />}>
          {!session.data?.user && !_isPreview ? (
            // Unauthenticated: any non-/auth path falls back to AuthPage.
            <Route path="*" element={<AuthPage />} />
          ) : (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/dossier/:id" element={<DossierPage />} />
              <Route path="/dossier/:id/edit" element={<DossierPage />} />

              <Route path="/club" element={<ClubPage />} />
              <Route path="/club/new" element={<NotImplementedPage surface="club / new session (coach)" />} />

              <Route path="/train" element={<Navigate to="/train/today" replace />} />
              <Route path="/train/today" element={<WorkoutsPage />} />
              <Route path="/train/today/active/:workoutId" element={<NotImplementedPage surface="train / active workout" />} />
              <Route path="/train/plan" element={<SchedulePage />} />
              <Route path="/train/progress" element={<ProgressPage />} />

              <Route path="/you" element={<Navigate to="/you/profile" replace />} />
              <Route path="/you/profile" element={<ProfilePage />} />
              <Route path="/you/settings" element={<NotImplementedPage surface="you / settings" />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
