'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bot, Cable, Clock, Coins, Gauge, LogIn, Menu, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';
import { LangToggle } from './LangToggle';
import AuthPanel from './AuthPanel';
import { useI18n } from '../lib/i18n';
import { api } from '../lib/api';

type PackagePlan = {
  id: string;
  code: string;
  name: string;
  package_type: 'token' | 'hour' | 'week' | string;
  price: string;
  token_limit: number;
  duration_seconds: number;
  duration_days: number;
  description: string;
  reset_after_hours?: number;
  max_resets_per_day?: number;
  limit_token_unlimited?: number;
  delay_seconds_after_limit?: number;
};

const modelKeys = ['claude', 'gpt', 'gemini', 'codex'] as const;
const modelNames = ['Claude 4.8', 'GPT 5.5', 'Gemini 3.5', 'Codex IDE'];
const modelTags = ['premium', 'routing', 'studio', 'ready'] as const;
const featureIcons = [Cable, Bot, Gauge, ShieldCheck] as const;
const featureKeys = ['endpoint', 'premium', 'packages', 'telegram'] as const;
const telegramBotUrl = 'https://t.me/api_agent_shop_8866_bot';

export function MarketingNav() {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className={isScrolled ? 'top-nav top-nav-scrolled' : 'top-nav'}>
        <Link className="nav-logo" href="/">AzGate</Link>
        <div className="nav-actions">
        <Link className="nav-link" href="/pricing">{t('nav.pricing')}</Link>
        <Link className="nav-link" href="/bulk">{t('nav.bulk')}</Link>
        <Link className="nav-link" href="/referral">{t('nav.referral')}</Link>
        <Link className="nav-link" href="/bot">{t('nav.bot')}</Link>
        <LangToggle />
        <button type="button" className="btn btn-sm" onClick={() => setIsAuthOpen(true)}>
          <LogIn size={16} /> {t('nav.login')}
        </button>
        </div>
        <button type="button" className="nav-hamburger" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </nav>
      {isMenuOpen && (
        <div className="nav-mobile-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="nav-mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="nav-mobile-header">
              <span className="nav-mobile-title">Menu</span>
              <button type="button" className="nav-mobile-close" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <div className="nav-mobile-links">
              <Link className="nav-mobile-link" href="/pricing" onClick={() => setIsMenuOpen(false)}>{t('nav.pricing')}</Link>
              <Link className="nav-mobile-link" href="/bulk" onClick={() => setIsMenuOpen(false)}>{t('nav.bulk')}</Link>
              <Link className="nav-mobile-link" href="/referral" onClick={() => setIsMenuOpen(false)}>{t('nav.referral')}</Link>
              <Link className="nav-mobile-link" href="/bot" onClick={() => setIsMenuOpen(false)}>{t('nav.bot')}</Link>
            </div>
          </div>
        </div>
      )}
      {isAuthOpen && <AuthPanel variant="modal" onClose={() => setIsAuthOpen(false)} />}
    </>
  );
}

export function HomeMarketingPage() {
  const { t } = useI18n();
  const models = modelKeys.map((key, index) => ({
    name: modelNames[index],
    meta: t(`models.${key}.meta`),
    tag: t(`models.${modelTags[index]}`),
  }));
  const features = featureKeys.map((key, index) => ({
    icon: featureIcons[index],
    title: t(`features.${key}.title`),
    text: t(`features.${key}.text`),
  }));

  return (
    <main className="shell-grid">
      <JsonLd />
      <MarketingNav />
      <section className="hero route-hero">
        <div className="noise" />
        <div className="hero-sheen" />
        <div className="hero-content route-home-content">
          <div>
            <span className="floating-note"><Sparkles size={16} /> {t('hero.badge')}</span>
            <p className="eyebrow">{t('hero.eyebrow')}</p>
            <h1 className="hero-title"><span className="glow">{t('hero.title')}</span></h1>
            <p className="hero-subtitle">{t('hero.subtitle')}</p>
            <div className="hero-actions">
              <AuthCtaButton iconSize={18} />
              <Link className="btn" href="/pricing">{t('hero.ctaPricing')}</Link>
            </div>
          </div>

          <div className="route-card-grid" aria-label="9router pages">
            <RouteCard href="/pricing" title={t('routes.pricing.title')} text={t('routes.pricing.text')} icon={<Coins size={20} />} />
            <RouteCard href="/bulk" title={t('routes.bulk.title')} text={t('routes.bulk.text')} icon={<Gauge size={20} />} />
            <RouteCard href="/referral" title={t('routes.referral.title')} text={t('routes.referral.text')} icon={<Sparkles size={20} />} />
            <RouteCard href="/bot" title={t('routes.bot.title')} text={t('routes.bot.text')} icon={<Bot size={20} />} />
          </div>

          <div className="model-strip" aria-label="Supported premium model cards">
            {models.map(model => (
              <article className="model-card" key={model.name}>
                <span className="model-tag">{model.tag}</span>
                <h2 className="model-name">{model.name}</h2>
                <p className="model-meta">{model.meta}</p>
              </article>
            ))}
          </div>

          <div className="section-grid route-feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article className="panel metric" key={title}>
                <Icon color="var(--cyan)" size={26} />
                <h2>{title}</h2>
                <p className="muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}

export function MarketingFooter() {
  const { t } = useI18n();
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-inner">
        <Link className="marketing-footer-link" href="/terms">{t('nav.terms')}</Link>
        <span className="marketing-footer-sep">·</span>
        <Link className="marketing-footer-link" href="/policy">{t('nav.policy')}</Link>
        <span className="marketing-footer-copy">© {new Date().getFullYear()} AzGate</span>
      </div>
    </footer>
  );
}

export function PricingPage() {
  const { t } = useI18n();
  const [packages, setPackages] = useState<PackagePlan[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  useEffect(() => {
    api<{ items: PackagePlan[] }>('/account/packages')
      .then(data => setPackages(data.items))
      .catch(() => setPackages([]))
      .finally(() => setIsLoadingPackages(false));
  }, []);

  const visiblePackages = useMemo(() => packages.filter(plan => !isDefaultPackage(plan)), [packages]);
  const hourlyPlans = useMemo(() => visiblePackages.filter(isHourlyPackage), [visiblePackages]);
  const tokenPlans = useMemo(() => visiblePackages.filter(p => isTokenPackage(p) && !isWeeklyPackage(p)), [visiblePackages]);
  const weekPlans = useMemo(() => visiblePackages.filter(isWeeklyPackage), [visiblePackages]);

  return (
    <RouteShell>
      <section className="section route-page-section">
        <div className="pricing-header">
          <span className="floating-note"><Coins size={16} /> {t('pricing.badge')}</span>
          <h1>{t('pricing.title')}</h1>
          <p className="muted route-lead">{t('pricing.lead')}</p>
        </div>

        <div className="pricing-grid pricing-grid-3">
          <div className="pricing-card pricing-card-hour">
            <div className="pricing-card-head">
              <Clock size={20} color="var(--cyan)" />
              <h2>{t('pricing.hourly')}</h2>
              <p className="muted">{t('pricing.hourlyDesc')}</p>
            </div>
            <div className="pricing-card-body">
              {isLoadingPackages && <PricingSkeleton rows={3} />}
              {!isLoadingPackages && hourlyPlans.length === 0 && <p className="muted">{t('pricing.noPlans')}</p>}
              {hourlyPlans.map((plan, index) => (
                <div className={index === 2 ? 'pricing-row pricing-best' : 'pricing-row'} key={plan.id}>
                  <span className="pricing-price">{formatCompactVND(plan.price)}</span>
                  <span className="pricing-meta">{formatPlanDuration(plan, t)}</span>
                  <span className={index === 2 ? 'pricing-badge badge-best' : 'pricing-badge'}>{index === 2 ? t('pricing.bestChoice') : t('pricing.unlimited')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pricing-card pricing-card-token">
            <div className="pricing-card-head">
              <Zap size={20} color="var(--violet)" />
              <h2>{t('pricing.tokenBased')}</h2>
              <p className="muted">{t('pricing.tokenBasedDesc')}</p>
            </div>
            <div className="pricing-card-body">
              <div className="pricing-table">
                <div className="pricing-table-head">
                  <span>{t('pricing.token')}</span>
                  <span>{t('pricing.price')}</span>
                  <span>{t('pricing.duration')}</span>
                </div>
                {isLoadingPackages && <PricingTableSkeleton rows={4} />}
                {!isLoadingPackages && tokenPlans.length === 0 && <div className="pricing-table-row"><span>{t('pricing.noPlans')}</span><span>-</span><span>-</span></div>}
                {tokenPlans.map(plan => (
                  <div className="pricing-table-row" key={plan.id}>
                    <span>{formatToken(effectiveTokenLimit(plan))}</span>
                    <span className="pricing-price">{formatCompactVND(plan.price)}</span>
                    <span>{formatPlanDuration(plan, t)}</span>
                  </div>
                ))}
              </div>
              <p className="pricing-table-note muted">Dùng hết token sẽ hết quyền truy cập. Mua thêm quota để tiếp tục.</p>
            </div>
          </div>

          <div className="pricing-card pricing-card-week">
            <div className="pricing-card-head">
              <Coins size={20} color="#f59e0b" />
              <h2>{t('pricing.weekly')}</h2>
              <p className="muted">{t('pricing.weeklyDesc')}</p>
            </div>
            <div className="pricing-card-body">
              <div className="pricing-table">
                <div className="pricing-table-head">
                  <span>{t('pricing.token')}</span>
                  <span>{t('pricing.price')}</span>
                  <span>{t('pricing.duration')}</span>
                </div>
                {isLoadingPackages && <PricingTableSkeleton rows={3} />}
                {!isLoadingPackages && weekPlans.length === 0 && <div className="pricing-table-row"><span>{t('pricing.noWeekPlans')}</span><span>-</span><span>-</span></div>}
                {weekPlans.map(plan => (
                  <div className="pricing-table-row" key={plan.id}>
                    <span>{formatToken(plan.token_limit)}<span className="muted">/ngày</span></span>
                    <span className="pricing-price">{formatCompactVND(plan.price)}</span>
                    <span>
                      {plan.duration_days > 0 ? `${plan.duration_days} ${plan.duration_days === 1 ? 'ngày' : 'ngày'}` : '-'}
                      {plan.reset_after_hours ? <span className="pricing-badge badge-reset">Reset {plan.reset_after_hours}h</span> : null}
                    </span>
                  </div>
                ))}
              </div>
              <p className="pricing-table-note muted">Dùng hết token trong ngày sẽ hết quyền truy cập. Token reset mỗi {weekPlans[0]?.reset_after_hours || 5}h.</p>
            </div>
          </div>
        </div>

        <p className="pricing-note muted">{t('pricing.note')}</p>
        <div className="pricing-cta">
          <Link className="btn btn-primary" href="/bot">{t('pricing.buyNow')} <ArrowRight size={16} /></Link>
        </div>
      </section>
    </RouteShell>
  );
}

export function BulkPage() {
  const { t } = useI18n();
  return (
    <RouteShell>
      <InfoHeader badge={t('bulk.badge')} title={t('bulk.title')} lead={t('bulk.lead')} icon={<Coins size={16} />} />
      <div className="section info-grid">
        <InfoCard title={t('bulk.cards.milestone.title')} text={t('bulk.cards.milestone.text')} />
        <InfoCard title={t('bulk.cards.auto.title')} text={t('bulk.cards.auto.text')} />
      </div>
    </RouteShell>
  );
}

export function ReferralPage() {
  const { t } = useI18n();
  return (
    <RouteShell>
      <InfoHeader badge={t('referral.badge')} title={t('referral.title')} lead={t('referral.lead')} icon={<Sparkles size={16} />} />
      <div className="section info-grid three">
        <InfoCard title={t('referral.steps.register.title')} text={t('referral.steps.register.text')} />
        <InfoCard title={t('referral.steps.reward.title')} text={t('referral.steps.reward.text')} />
        <InfoCard title={t('referral.steps.redeem.title')} text={t('referral.steps.redeem.text')} />
      </div>
    </RouteShell>
  );
}

export function BotPage() {
  const { t } = useI18n();
  return (
    <RouteShell>
      <section className="section route-page-section">
        <div className="section-grid bot-route-grid">
          <article className="panel metric">
            <span className="floating-note"><Bot size={16} /> {t('botQr.badge')}</span>
            <h1>{t('botQr.title')}</h1>
            <p className="muted">{t('botQr.text')}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={telegramBotUrl} target="_blank" rel="noopener noreferrer">{t('botQr.badge')} <ArrowRight size={16} /></a>
              <Link className="btn" href="/pricing">{t('hero.ctaPricing')}</Link>
            </div>
          </article>
          <aside className="panel metric bot-qr-panel">
            <Image src="/bot.png" alt={t('botQr.imageAlt')} width={320} height={320} priority />
          </aside>
        </div>
      </section>
    </RouteShell>
  );
}

export function TermsPage() {
  const { t } = useI18n();
  return <LegalPage badge={t('terms.badge')} title={t('terms.title')} items={['service', 'payment', 'fairUse', 'rewards'].map(key => t(`terms.items.${key}`))} />;
}

export function PolicyPage() {
  const { t } = useI18n();
  return <LegalPage badge={t('policy.badge')} title={t('policy.title')} items={['data', 'keys', 'abuse', 'refund'].map(key => t(`policy.items.${key}`))} />;
}

function PricingSkeleton({ rows }: { rows: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <div className="pricing-row pricing-row-skeleton" key={index}>
      <span className="skeleton-line skeleton-price" />
      <span className="skeleton-line skeleton-meta" />
      <span className="skeleton-line skeleton-badge" />
    </div>
  ));
}

function PricingTableSkeleton({ rows }: { rows: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <div className="pricing-table-row pricing-row-skeleton" key={index}>
      <span className="skeleton-line" />
      <span className="skeleton-line" />
      <span className="skeleton-line" />
    </div>
  ));
}

function RouteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="shell-grid route-shell">
      <MarketingNav />
      <div className="noise" />
      <div className="hero-sheen" />
      <div className="route-content">{children}</div>
      <MarketingFooter />
    </main>
  );
}

function InfoHeader({ badge, title, lead, icon }: { badge: string; title: string; lead: string; icon: React.ReactNode }) {
  return (
    <section className="section route-page-section info-section">
      <span className="floating-note">{icon} {badge}</span>
      <h1>{title}</h1>
      <p className="muted route-lead">{lead}</p>
    </section>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="panel metric">
      <h2>{title}</h2>
      <p className="muted">{text}</p>
    </article>
  );
}

function LegalPage({ badge, title, items }: { badge: string; title: string; items: string[] }) {
  return (
    <RouteShell>
      <section className="section route-page-section info-section legal-section">
        <span className="floating-note"><ShieldCheck size={16} /> {badge}</span>
        <h1>{title}</h1>
        <div className="panel metric legal-copy">
          {items.map(item => <p key={item}>{item}</p>)}
        </div>
      </section>
    </RouteShell>
  );
}


function AuthCtaButton({ iconSize }: { iconSize: number }) {
  const { t } = useI18n();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setIsAuthOpen(true)}>
        {t('hero.cta')} <ArrowRight size={iconSize} />
      </button>
      {isAuthOpen && <AuthPanel variant="modal" onClose={() => setIsAuthOpen(false)} />}
    </>
  );
}

function RouteCard({ href, title, text, icon }: { href: string; title: string; text: string; icon: React.ReactNode }) {
  return (
    <Link className="panel metric route-card" href={href}>
      <span>{icon}</span>
      <strong>{title}</strong>
      <p className="muted">{text}</p>
    </Link>
  );
}

function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '9router',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web, Windows, macOS, Linux',
    description: 'A modern API gateway for coding IDEs and premium AI models including Claude 4.8, GPT 5.5 and Gemini 3.5.',
    offers: { '@type': 'Offer', price: 'See Telegram bot', priceCurrency: 'VND' },
    featureList: ['OpenAI-compatible API', 'IDE model routing', 'Telegram pricing bot', 'API key dashboard', 'Token usage telemetry']
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

function isDefaultPackage(plan: PackagePlan) {
  const code = String(plan.code || '').trim().toLowerCase();
  const name = String(plan.name || '').trim().toLowerCase();
  return code === 'default' || code === 'default_api_key' || name === 'default';
}

function formatCompactVND(raw: string | number) {
  const value = Number(String(raw || '0').replace(/,/g, '')) || 0;
  if (value >= 1000 && value % 1000 === 0) return `${value / 1000}k`;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);
}

function packageText(plan: PackagePlan) {
  return `${plan.code || ''} ${plan.name || ''} ${plan.description || ''}`.toLowerCase();
}

function isTokenPackage(plan: PackagePlan) {
  if (String(plan.package_type || '').toLowerCase() === 'token') return true;
  if (String(plan.package_type || '').toLowerCase() === 'hour') return false;
  return effectiveTokenLimit(plan) > 0 || String(plan.code || '').toLowerCase().startsWith('token_');
}

function isHourlyPackage(plan: PackagePlan) {
  const text = packageText(plan);
  if (String(plan.package_type || '').toLowerCase() === 'hour') return true;
  if (String(plan.package_type || '').toLowerCase() === 'token') return false;
  if (String(plan.package_type || '').toLowerCase() === 'week') return false;
  return !isTokenPackage(plan) || String(plan.code || '').toLowerCase().startsWith('hour') || text.includes('unlimited') || text.includes('không giới hạn') || text.includes('khong gioi han');
}

function isWeeklyPackage(plan: PackagePlan) {
  if (String(plan.package_type || '').toLowerCase() === 'week') return true;
  return false;
}

function effectiveTokenLimit(plan: PackagePlan) {
  if (plan.token_limit > 0) return plan.token_limit;
  const match = packageText(plan).match(/(\d+(?:[\.,]\d+)?)\s*m/);
  if (!match) return 0;
  return Math.round(Number(match[1].replace(',', '.')) * 1_000_000) || 0;
}

function formatToken(value: number) {
  if (value >= 1_000_000 && value % 1_000_000 === 0) return `${value / 1_000_000}M`;
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatPlanDuration(plan: PackagePlan, t: (key: string) => string) {
  if (plan.duration_seconds > 0) {
    const hours = plan.duration_seconds / 3600;
    const label = hours === 1 ? t('pricing.hour') : t('pricing.hours');
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${label}`;
  }
  if (plan.duration_days > 0) return `${plan.duration_days}d`;
  const inferredHours = inferHours(plan);
  if (inferredHours > 0) {
    const label = inferredHours === 1 ? t('pricing.hour') : t('pricing.hours');
    return `${Number.isInteger(inferredHours) ? inferredHours : inferredHours.toFixed(1)} ${label}`;
  }
  return '-';
}

function inferHours(plan: PackagePlan) {
  const match = packageText(plan).match(/(\d+(?:[\.,]\d+)?)\s*(giờ|gio|hour|hours|h)/);
  if (!match) return 0;
  const hours = Number(match[1].replace(',', '.'));
  return Number.isFinite(hours) ? hours : 0;
}
