'use client';

import { ReactNode } from 'react';
import { I18nProvider } from '../lib/i18n';
import { SmokeField } from './SmokeField';
import { SiteNotice } from './SiteNotice';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <SmokeField
        intensity={0.82}
        ignoredSelector=".top-nav, .panel, .pricing-card, .model-card, .btn, a, button, input, textarea, select, [data-no-smoke]"
      />
      <SiteNotice />
      {children}
    </I18nProvider>
  );
}
