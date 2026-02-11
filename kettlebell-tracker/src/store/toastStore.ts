import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  createdAt: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
}

let id = 0;
function nextId() {
  return `toast-${++id}-${Date.now()}`;
}

const AUTO_DISMISS_MS = 4000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message: string) => {
    const item: ToastItem = { id: nextId(), message, createdAt: Date.now() };
    set((s) => ({ toasts: [...s.toasts, item] }));
    setTimeout(() => {
      get().removeToast(item.id);
    }, AUTO_DISMISS_MS);
  },
  removeToast: (id: string) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
