import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ua from './locales/ua.json';
import en from './locales/en.json';

// Read persisted lang preference once at boot. Subsequent changes are
// pushed into i18n via `useStore.setLang` (wired in App.tsx).
function readPersistedLang(): 'ua' | 'en' {
  if (typeof window === 'undefined') return 'ua';
  try {
    const raw = window.localStorage.getItem('pidyom-storage');
    if (!raw) return 'ua';
    const parsed = JSON.parse(raw);
    const lang = parsed?.state?.lang;
    return lang === 'en' ? 'en' : 'ua';
  } catch {
    return 'ua';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ua: { translation: ua },
      en: { translation: en },
    },
    lng: readPersistedLang(),
    fallbackLng: 'ua',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export default i18n;
