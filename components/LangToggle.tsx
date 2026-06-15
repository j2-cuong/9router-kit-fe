'use client';

import { useI18n } from '../lib/i18n';

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      className="lang-toggle"
      aria-label="Switch language"
    >
      {lang === 'vi' ? 'EN' : 'VI'}
    </button>
  );
}
