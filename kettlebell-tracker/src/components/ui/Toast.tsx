import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/toastStore';

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed z-[200] pointer-events-none flex flex-col items-center px-4 pb-6 left-0 right-0 md:left-auto md:right-8 md:top-8 md:pb-0 md:items-end"
      style={{ bottom: 'max(80px, env(safe-area-inset-bottom))' }}
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto relative mb-2 md:mb-3 pl-4 pr-8 py-3 md:pl-5 md:pr-10 md:py-3.5 bg-white/[0.08] border border-white/15 backdrop-blur-sm shadow-lg min-w-[200px] max-w-[90vw] md:max-w-sm"
            role="status"
          >
            <p className="text-[11px] md:text-[13px] tracking-[0.06em] text-white/90">{t.message}</p>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Dismiss"
            >
              <span className="text-white/40 text-[10px]">×</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
