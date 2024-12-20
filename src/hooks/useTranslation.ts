import { useLanguageStore } from '@/store/useLanguageStore';

type TranslationKey = string;
type TranslationValues = Record<string, string>;

// This is a simple implementation. In a real app, you'd want to load translations from JSON files
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.overview': 'Overview',
    'nav.workOrders': 'Work Orders',
    'nav.quotes': 'Quotes',
  },
  es: {
    'nav.overview': 'Descripción general',
    'nav.workOrders': 'Órdenes de trabajo',
    'nav.quotes': 'Cotizaciones',
  },
  fr: {
    'nav.overview': 'Aperçu',
    'nav.workOrders': 'Ordres de travail',
    'nav.quotes': 'Devis',
  },
  pt: {
    'nav.overview': 'Visão geral',
    'nav.workOrders': 'Ordens de serviço',
    'nav.quotes': 'Cotações',
  },
};

export const useTranslation = () => {
  const { currentLanguage } = useLanguageStore();

  const t = (key: TranslationKey, values?: TranslationValues) => {
    let text = translations[currentLanguage.code]?.[key] || translations.en[key] || key;

    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        text = text.replace(`{{${key}}}`, value);
      });
    }

    return text;
  };

  return { t };
};
