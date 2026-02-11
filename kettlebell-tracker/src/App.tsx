import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { authClient } from './lib/auth';
import GrainOverlay from './components/ui/GrainOverlay';
import GlitchEffect from './components/ui/GlitchEffect';
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
        <GrainOverlay />
        <div className="flex flex-col items-center gap-4">
          <div className="w-5 h-5 border border-white/30 border-t-transparent rounded-full animate-spin" />
          <span className="text-[9px] tracking-[0.3em] text-white/20 uppercase">Loading</span>
        </div>
      </div>
    );
  }

  if (!session.data?.user) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <GrainOverlay />
        <AuthPage />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <GrainOverlay />
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
    </div>
  );
}
