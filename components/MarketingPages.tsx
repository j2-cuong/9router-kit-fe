'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Bot, Cable, Clock, Coins, Gauge, LogIn, Menu,
  ShieldCheck, Sparkles, X, Zap
} from 'lucide-react';
import AuthPanel from './AuthPanel';
import { useI18n } from '../lib/i18n';
import { api } from '../lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose,
} from '@/components/ui/sheet';
import { ThemeToggle } from './theme-toggle';

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

/* ── Navigation ── */
export function MarketingNav() {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/pricing', label: t('nav.pricing') },
    { href: '/bulk', label: t('nav.bulk') },
    { href: '/referral', label: t('nav.referral') },
    { href: '/bot', label: t('nav.bot') },
    { href: '/terms', label: t('nav.terms') },
    { href: '/policy', label: t('nav.policy') },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex items-center justify-between',
          'px-4 md:px-8 lg:px-14 h-[72px]',
          'transition-all duration-300',
          isScrolled
            ? 'bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm'
            : 'bg-transparent'
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-brand-cyan bg-clip-text text-transparent"
        >
          AzGate
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAuthOpen(true)}
            className="hidden md:inline-flex"
          >
            <LogIn className="mr-1.5 h-4 w-4" />
            {t('nav.login')}
          </Button>

          {/* Mobile Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="bg-gradient-to-r from-foreground to-brand-cyan bg-clip-text text-transparent">
                  AzGate
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-6">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <div className="mt-6 px-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsAuthOpen(true);
                    document.querySelector<HTMLElement>('[data-state="open"]')?.click();
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('nav.login')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {isAuthOpen && <AuthPanel variant="modal" onClose={() => setIsAuthOpen(false)} />}
    </>
  );
}

/* ── Auth CTA Button ── */
function AuthCtaButton({ iconSize }: { iconSize: number }) {
  const { t } = useI18n();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  return (
    <>
      <Button size="lg" onClick={() => setIsAuthOpen(true)} className="gap-2">
        {t('hero.cta')} <ArrowRight size={iconSize} />
      </Button>
      {isAuthOpen && <AuthPanel variant="modal" onClose={() => setIsAuthOpen(false)} />}
    </>
  );
}

/* ── Route Card ── */
function RouteCard({ href, title, text, icon }: { href: string; title: string; text: string; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <Card className="h-full hover:-translate-y-1 transition-all duration-200 hover:border-brand-cyan/30 hover:shadow-lg hover:shadow-brand-cyan/5 cursor-pointer">
        <CardContent className="p-5 flex flex-col gap-3">
          <span className="text-brand-cyan">{icon}</span>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── JSON-LD ── */
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

/* ── Shells ── */
function RouteShell({ hero, children }: { hero?: boolean; children: React.ReactNode }) {
  return (
    <main className="shell-grid">
      {children}
    </main>
  );
}

function LoadingShell() {
  return (
    <RouteShell>
      <div className="min-h-screen pt-[84px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    </RouteShell>
  );
}

function NotFoundShell({ onRetry }: { onRetry?: () => void }) {
  return (
    <RouteShell>
      <div className="min-h-screen pt-[84px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">Not found</h2>
          <p className="text-sm text-muted-foreground">The requested content could not be loaded.</p>
          {onRetry && <Button variant="outline" onClick={onRetry}>Retry</Button>}
        </div>
      </div>
    </RouteShell>
  );
}

function LegalPage({ badge, title, items }: { badge: string; title: string; items: string[] }) {
  return (
    <RouteShell>
      <div className="min-h-screen pt-[84px] max-w-3xl mx-auto px-4 py-20">
        <Badge variant="outline" className="mb-4 gap-1.5">
          <ShieldCheck size={14} /> {badge}
        </Badge>
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            {items.map((item, i) => <p key={i} className="text-muted-foreground leading-relaxed">{item}</p>)}
          </CardContent>
        </Card>
      </div>
    </RouteShell>
  );
}

/* ── Home Page ── */
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
    <RouteShell>
      <JsonLd />
      <MarketingNav />

      <section className="relative min-h-screen overflow-hidden">
        <div className="noise" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-20 md:pt-40">
          {/* Hero */}
          <div className="max-w-3xl mb-16">
            <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1.5 text-sm">
              <Sparkles size={16} /> {t('hero.badge')}
            </Badge>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{t('hero.eyebrow')}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-brand-cyan to-brand-violet to-foreground bg-clip-text text-transparent animate-[shimmer_9s_linear_infinite] bg-[length:220%_100%]">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-prose mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <AuthCtaButton iconSize={18} />
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">{t('hero.ctaPricing')}</Link>
              </Button>
            </div>
          </div>

          {/* Route Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <RouteCard href="/pricing" title={t('routes.pricing.title')} text={t('routes.pricing.text')} icon={<Coins size={20} />} />
            <RouteCard href="/bulk" title={t('routes.bulk.title')} text={t('routes.bulk.text')} icon={<Gauge size={20} />} />
            <RouteCard href="/referral" title={t('routes.referral.title')} text={t('routes.referral.text')} icon={<Sparkles size={20} />} />
            <RouteCard href="/bot" title={t('routes.bot.title')} text={t('routes.bot.text')} icon={<Bot size={20} />} />
          </div>

          {/* Model Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {models.map((model, i) => (
              <Card key={model.name} className="relative overflow-hidden group">
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(126,232,255,0.08), rgba(188,140,255,0.06), transparent)',
                    animation: `cardSweep 4s ease-in-out ${i * 1}s infinite`,
                  }}
                />
                <CardHeader>
                  <Badge variant="secondary" className="absolute top-3 right-3">{model.tag}</Badge>
                  <CardTitle className="text-base">{model.name}</CardTitle>
                  <CardDescription className="text-sm">{model.meta}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} className="hover:border-brand-cyan/20 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-cyan">
                        <Icon size={20} />
                      </div>
                      <CardTitle className="text-lg">{feat.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Usage Section */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={20} className="text-brand-cyan" />
                {t('usage.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('usage.text')}</p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{t('cta.text')}</p>
            <div className="flex justify-center gap-3">
              <AuthCtaButton iconSize={18} />
              <Button variant="outline" size="lg" asChild>
                <Link href={telegramBotUrl} target="_blank" rel="noreferrer">
                  <Bot className="mr-2 h-5 w-5" /> {t('cta.telegram')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-border pt-8 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2026 AzGate. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/terms" className="hover:text-foreground transition-colors">{t('nav.terms')}</Link>
                <Link href="/policy" className="hover:text-foreground transition-colors">{t('nav.policy')}</Link>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </RouteShell>
  );
}

/* ── Pricing Page ── */
export function PricingContent() {
  const { t, lang } = useI18n();
  const [plans, setPlans] = useState<PackagePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const fetchPlans = useMemo(() => async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api<PackagePlan[]>("/account/packages");
      setPlans(data.filter(p => !isDefaultPackage(p)));
    } catch (e: any) {
      setError(e?.message || t('pricing.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const { tokenPlans, hourlyPlans, weeklyPlans } = useMemo(() => {
    const token: PackagePlan[] = [];
    const hourly: PackagePlan[] = [];
    const weekly: PackagePlan[] = [];
    for (const p of plans) {
      if (isWeeklyPackage(p)) weekly.push(p);
      else if (isHourlyPackage(p)) hourly.push(p);
      else token.push(p);
    }
    return {
      tokenPlans: token.sort((a, b) => Number(a.price) - Number(b.price)),
      hourlyPlans: hourly.sort((a, b) => Number(a.price) - Number(b.price)),
      weeklyPlans: weekly.sort((a, b) => Number(a.price) - Number(b.price)),
    };
  }, [plans]);

  if (loading) return <LoadingShell />;
  if (error) return <NotFoundShell onRetry={fetchPlans} />;

  return (
    <RouteShell>
      <MarketingNav />
      <div className="min-h-screen pt-[84px] max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Coins size={14} /> {t('pricing.badge')}
          </Badge>
          <h1 className="text-3xl font-bold mb-3">{t('pricing.title')}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{t('pricing.subtitle')}</p>
        </div>

        {/* Token Plans */}
        {tokenPlans.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Zap size={20} className="text-brand-cyan" />
              {t('pricing.payPerToken')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tokenPlans.map(plan => (
                <PricingCard key={plan.id} plan={plan} onBuy={() => setIsAuthOpen(true)} t={t} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Hourly Plans */}
        {hourlyPlans.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-brand-cyan" />
              {t('pricing.unlimited')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {hourlyPlans.map(plan => (
                <PricingCard key={plan.id} plan={plan} onBuy={() => setIsAuthOpen(true)} t={t} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Weekly Plans */}
        {weeklyPlans.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-brand-cyan" />
              Weekly
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weeklyPlans.map(plan => (
                <PricingCard key={plan.id} plan={plan} onBuy={() => setIsAuthOpen(true)} t={t} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {plans.length === 0 && (
          <NotFoundShell />
        )}
      </div>
      {isAuthOpen && <AuthPanel variant="modal" onClose={() => setIsAuthOpen(false)} />}
    </RouteShell>
  );
}

/* ── Pricing Card ── */
function PricingCard({ plan, onBuy, t, lang }: {
  plan: PackagePlan;
  onBuy: () => void;
  t: (key: string) => string;
  lang: string;
}) {
  const isToken = isTokenPackage(plan);
  const isHourly = isHourlyPackage(plan);
  const tokens = effectiveTokenLimit(plan);
  const minutes = plan.duration_seconds > 0 ? Math.round(plan.duration_seconds / 60) : 0;
  const isPopular = plan.duration_days >= 28 || tokens >= 10_000_000 || minutes >= 1440;

  return (
    <Card className={cn(
      'relative flex flex-col',
      isPopular && 'border-brand-cyan/40 shadow-lg shadow-brand-cyan/5'
    )}>
      {isPopular && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-cyan text-brand-cyan-dark hover:bg-brand-cyan">
          {t('pricing.popular')}
        </Badge>
      )}
      <CardHeader>
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <span className="text-lg font-bold">
            {formatCompactVND(plan.price)}
            <span className="text-xs font-normal text-muted-foreground ml-0.5">đ</span>
          </span>
        </div>
        {plan.description && (
          <CardDescription className="text-xs leading-relaxed">{plan.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <div className="space-y-1.5 text-sm">
          {isToken && tokens > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tokens</span>
              <span className="font-medium">{formatToken(tokens)}</span>
            </div>
          )}
          {isHourly && minutes > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{minutes} min</span>
            </div>
          )}
          {plan.duration_days > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid</span>
              <span className="font-medium">{plan.duration_days}d</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('pricing.duration')}</span>
            <span className="font-medium">{formatPlanDuration(plan, t)}</span>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <Button className="w-full" variant={isPopular ? 'default' : 'outline'} onClick={onBuy}>
            {t('pricing.buyNow')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Helper functions ── */
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

/* ── Page export wrappers ── */

export function PricingPage() {
  return <PricingContent />;
}

export function BulkPage() {
  const { t } = useI18n();
  return (
    <RouteShell>
      <MarketingNav />
      <div className="min-h-screen pt-[84px] max-w-3xl mx-auto px-4 py-20">
        <Badge variant="outline" className="mb-4 gap-1.5"><Gauge size={14} /> {t('bulk.badge')}</Badge>
        <h1 className="text-3xl font-bold mb-6">{t('bulk.title')}</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">{t('bulk.text')}</p>
          </CardContent>
        </Card>
      </div>
    </RouteShell>
  );
}

export function ReferralPage() {
  const { t } = useI18n();
  return (
    <RouteShell>
      <MarketingNav />
      <div className="min-h-screen pt-[84px] max-w-3xl mx-auto px-4 py-20">
        <Badge variant="outline" className="mb-4 gap-1.5"><Sparkles size={14} /> {t('referral.badge')}</Badge>
        <h1 className="text-3xl font-bold mb-6">{t('referral.title')}</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">{t('referral.text')}</p>
          </CardContent>
        </Card>
      </div>
    </RouteShell>
  );
}

export function BotPage() {
  const { t } = useI18n();
  return (
    <RouteShell>
      <MarketingNav />
      <div className="min-h-screen pt-[84px] max-w-3xl mx-auto px-4 py-20">
        <Badge variant="outline" className="mb-4 gap-1.5"><Bot size={14} /> {t('botQr.badge')}</Badge>
        <h1 className="text-3xl font-bold mb-6">{t('botQr.title')}</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">{t('botQr.text')}</p>
          </CardContent>
        </Card>
      </div>
    </RouteShell>
  );
}

export function TermsPage() {
  const { t } = useI18n();
  const rawItems: Record<string, string> = t('terms.items') as unknown as Record<string, string>;
  const items = Object.values(rawItems || {});
  return <LegalPage badge={t('terms.badge')} title={t('terms.title')} items={items} />;
}

export function PolicyPage() {
  const { t } = useI18n();
  const rawItems: Record<string, string> = t('policy.items') as unknown as Record<string, string>;
  const items = Object.values(rawItems || {});
  return <LegalPage badge={t('policy.badge')} title={t('policy.title')} items={items} />;
}
