'use client';

import Link from 'next/link';
import { ArrowLeft, KeyRound, LogIn, Sparkles } from 'lucide-react';
import { LangToggle } from '../../components/LangToggle';
import { useI18n } from '../../lib/i18n';

export default function ExpiredPage() {
  const { t } = useI18n();

  return <main className="shell-grid auth-shell expired-shell">
    <div className="noise" />
    <div className="hero-sheen" />
    <nav className="top-nav">
      <Link className="btn btn-sm" href="/"><ArrowLeft size={16} /> {t('expired.home')}</Link>
      <LangToggle />
    </nav>
    <section className="panel auth-card expired-card">
      <div className="expired-orbit" aria-hidden="true"><span /><span /><span /></div>
      <span className="floating-note"><KeyRound size={16} /> {t('expired.badge')}</span>
      <h1 style={{ margin: '18px 0 10px', fontSize: '2.2rem', lineHeight: 1.05, letterSpacing: '-.04em' }}>{t('expired.title')}</h1>
      <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>{t('expired.text')}</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
        <Link className="btn btn-primary" href="/"><LogIn size={18} /> {t('expired.login')}</Link>
        <Link className="btn" href="/"><Sparkles size={18} /> {t('expired.home')}</Link>
      </div>
    </section>
  </main>;
}
