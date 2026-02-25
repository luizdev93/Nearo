import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../localization/i18n';
import { useUserStore } from '../state/user_store';

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const language = useUserStore((s) => s.profile?.language);

  useEffect(() => {
    if (language && language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
