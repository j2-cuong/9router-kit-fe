'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Bot, Cable, Clock, Coins, Gauge, LogIn, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { LangToggle } from './LangToggle';
import { useI18n } from '../lib/i18n';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MarketingNav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`top-nav ${scrolled ? 'scrolled' : ''}`}>
      <Link className="nav-logo" href="/">9router</Link>
      <div className="nav-actions">
        <Link className="nav-link" href="/pricing">{t('nav.pricing')}</Link>
        <Link className="nav-link" href="/bulk">{t('nav.bulk')}</Link>
        <Link className="nav-link" href="/bot">{t('nav.bot')}</Link>
        <LangToggle />
        <Link className="btn btn-sm btn-primary" href="/login">
          <LogIn size={16} /> {t('nav.login')}
        </Link>
      </div>
    </nav>
  );
}

export function HomeMarketingPage() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.from('.hero-title .glow', {
      duration: 1.5,
      y: 40,
      autoAlpha: 0,
      skewY: 2,
    })
    .from('.hero-subtitle', {
      duration: 1,
      y: 20,
      autoAlpha: 0,
    }, '-=1')
    .from('.hero-actions .btn', {
      duration: 0.8,
      y: 20,
      autoAlpha: 0,
      stagger: 0.1,
    }, '-=0.8')
    .from('.route-card', {
      duration: 0.8,
      y: 30,
      autoAlpha: 0,
      stagger: 0.05,
      clearProps: 'all'
    }, '-=0.5');

    // Scroll reveal for cards
    gsap.utils.toArray<HTMLElement>('.route-card').forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=50',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

  }, { scope: containerRef });

  return (
    <main className="shell-grid" ref={containerRef}>
      <MarketingNav />
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <span className="floating-note" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
              <Sparkles size={16} /> {t('hero.badge')}
            </span>
            <h1 className="hero-title"><span className="glow">{t('hero.title')}</span></h1>
            <p className="hero-subtitle">{t('hero.subtitle')}</p>
            <div className="hero-actions" style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
              <Link className="btn btn-primary" href="/login">{t('hero.cta')} <ArrowRight size={18} /></Link>
              <Link className="btn" href="/pricing">{t('hero.ctaPricing')}</Link>
            </div>
          </div>

          <div className="route-card-grid" style={{ marginTop: '80px' }}>
            <RouteCard href="/pricing" title={t('routes.pricing.title')} text={t('routes.pricing.text')} icon={<Coins size={24} color="var(--amber)" />} />
            <RouteCard href="/bulk" title={t('routes.bulk.title')} text={t('routes.bulk.text')} icon={<Zap size={24} color="var(--cyan)" />} />
            <RouteCard href="/bot" title={t('routes.bot.title')} text={t('routes.bot.text')} icon={<Bot size={24} color="var(--violet)" />} />
            <RouteCard href="/referral" title={t('routes.referral.title')} text={t('routes.referral.text')} icon={<Sparkles size={24} color="#ff7eb6" />} />
          </div>
        </div>
      </section>
    </main>
  );
}

function RouteCard({ href, title, text, icon }: { href: string; title: string; text: string; icon: React.ReactNode }) {
  return (
    <Link className="panel route-card" href={href}>
      <div className="card-icon" style={{ marginBottom: '8px' }}>{icon}</div>
      <strong style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</strong>
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5 }}>{text}</p>
    </Link>
  );
}
