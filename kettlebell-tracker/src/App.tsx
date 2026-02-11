import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { authClient } from './lib/auth';
import GlitchEffect from './components/ui/GlitchEffect';
import Toast from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import BottomNav from './components/ui/BottomNav';
import DesktopSidebar from './components/ui/DesktopSidebar';
import HomePage from './pages/HomePage';
import WorkoutsPage from './pages/WorkoutsPage';
import SchedulePage from './pages/SchedulePage';
import ProgressPage from './pages/ProgressPage';
import EquipmentPage from './pages/EquipmentPage';
import AuthPage from './pages/AuthPage';

function CurrentPage() {
  const currentTab = useStore(s => s.currentTab);
  switch (currentTab) {
    case 'home': return <HomePage />;
    case 'workouts': return <WorkoutsPage />;
    case 'schedule': return <SchedulePage />;
    case 'progress': return <ProgressPage />;
    case 'equipment': return <EquipmentPage />;
    default: return <HomePage />;
  }
}

export default function App() {
  const session = authClient.useSession();
  const syncAuth = useStore(s => s.syncAuth);

  // Sync Neon Auth session → Zustand store
  useEffect(() => {
    if (session.data?.user) {
      const user = session.data.user;
      syncAuth(true, user.email || '', user.name || '');
    } else if (!session.isPending) {
      syncAuth(false, '', '');
    }
  }, [session.data, session.isPending, syncAuth]);

  // Loading state
  if (session.isPending) {
    return (
      <div className="relative min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <div className="w-6 h-6 md:w-8 md:h-8 border border-white/30 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] md:text-[17px] tracking-[0.3em] md:tracking-[0.45em] text-white/40 uppercase">Loading</span>
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
        <GlitchEffect />
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
