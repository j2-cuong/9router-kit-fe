'use client';

import { ReactNode } from 'react';
import { I18nProvider } from '../lib/i18n';
import { SmokeField } from './SmokeField';

export function Providers({ children }: { children: ReactNode }) {
  return <I18nProvider><SmokeField intensity={1.05} />{children}</I18nProvider>;
}
