import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { authClient } from './lib/auth';
import { hydrateFromServer } from './lib/gql/hydrate';
import Toast from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import BottomNav from './components/ui/BottomNav';
import DesktopSidebar from './components/ui/DesktopSidebar';
import HomePage from './pages/HomePage';
import WorkoutsPage from './pages/WorkoutsPage';
import SchedulePage from './pages/SchedulePage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

function CurrentPage() {
  const currentTab = useStore(s => s.currentTab);
  switch (currentTab) {
    case 'home': return <HomePage />;
    case 'workouts': return <WorkoutsPage />;
    case 'schedule': return <SchedulePage />;
    case 'progress': return <ProgressPage />;
    case 'profile': return <ProfilePage />;
    default: return <HomePage />;
  }
}

export default function App() {
  const session = authClient.useSession();
  const syncAuth = useStore(s => s.syncAuth);
  const hydrateStore = useStore(s => s.hydrateStore);
  const isHydrated = useStore(s => s.isHydrated);
  const hydrationAttempted = useRef(false);

  // Sync Neon Auth session → Zustand store + trigger hydration
  useEffect(() => {
    if (session.data?.user) {
      const user = session.data.user;
      syncAuth(true, user.email || '', user.name || '', user.id);

      // Hydrate from server once per session
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
  }, [session.data, session.isPending, syncAuth, hydrateStore]);

  // Loading state
  if (session.isPending) {
    return (
      <div className="relative min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-5 h-5 border border-[#ff9500]/50 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">Initializing</span>
        </div>
      </div>
    );
  }

  if (!session.data?.user) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <AuthPage />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-black text-white">
        <DesktopSidebar />
        <div className="desktop-main">
          <AnimatePresence mode="wait">
            <CurrentPage />
          </AnimatePresence>
        </div>
        <div className="mobile-only">
          <BottomNav />
        </div>
        <Toast />
      </div>
    </ErrorBoundary>
  );
}
