'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { dictionaries, type Dict } from './dictionaries';

type Lang = 'vi' | 'en';

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({ lang: 'vi', setLang: () => {}, t: (k) => k });

export function useI18n() {
  return useContext(I18nContext);
}

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi');
  const [dict, setDict] = useState<Dict>(dictionaries.vi);

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'en') {
      setLangState('en');
      setDict(dictionaries.en);
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setDict(dictionaries[l]);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: string) => getNestedValue(dict, key), [dict]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}
