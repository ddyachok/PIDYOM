import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import DesktopSidebar from '../components/ui/DesktopSidebar';
import Toast from '../components/ui/Toast';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Routes where the navigation chrome is suppressed.
// Per the design brief: silence over chrome on Home + Dossier + workout-in-progress + auth.
function isChromeSuppressed(pathname: string): boolean {
  if (pathname === '/') return true;
  if (pathname.startsWith('/dossier/')) return true;
  if (pathname.startsWith('/train/today/active/')) return true;
  if (pathname.startsWith('/auth')) return true;
  return false;
}

export default function RootLayout() {
  const { pathname } = useLocation();
  const suppressChrome = isChromeSuppressed(pathname);

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen">
        {!suppressChrome && <DesktopSidebar />}
        <div className={suppressChrome ? '' : 'desktop-main'}>
          <Outlet />
        </div>
        {!suppressChrome && (
          <div className="mobile-only">
            <BottomNav />
          </div>
        )}
        <Toast />
      </div>
    </ErrorBoundary>
  );
}
