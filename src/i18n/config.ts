import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useLanguageStore } from '@/store/useLanguageStore';
import en from './locales/en.json';
import es from './locales/es.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false
    },
    debug: true // This will help us see what's happening with translations
  });

// Listen to language changes from Zustand store
useLanguageStore.subscribe(
  (state) => state.currentLanguage,
  (language) => {
    console.log('Language changed in store:', language.code);
    i18n.changeLanguage(language.code);
  }
);

export default i18n;
