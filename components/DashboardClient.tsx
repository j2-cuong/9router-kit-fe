'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError, api } from '../lib/api';
import {
  Bell, ChevronDown, Clock3, Database, Fingerprint, Gift, KeyRound,
  ListChecks, LogOut, MonitorSmartphone, RefreshCcw, Settings, ShieldCheck,
  SquareActivity, Timer, Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../lib/i18n';
import { getClientDeviceInfo, type ClientDeviceInfo } from '../lib/device';
import { CheckoutModal } from './CheckoutModal';
import { ThemeToggle } from './theme-toggle';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const telegramBotUrl = 'https://t.me/api_agent_shop_8866_bot';

/* ── Types ── */
type LoginResult = {
  access_token: string; token_type: string;
  api_key: { id: string; key_prefix: string; status: string; token_limit: number; token_used: number; token_remaining: number; expires_at: string; expires_in_seconds: number; expired?: boolean; reset_at?: string; };
  package: { id: string; code: string; name: string; package_type: string; duration_days: number; duration_seconds: number; };
  router: { id: string; code: string; base_url: string; };
  usage: { request_count: number; input_tokens: number; output_tokens: number; total_tokens: number; last_request_at?: string | null; };
  device?: ClientDeviceInfo & { user_agent?: string; ip_address?: string; requested_at?: string; };
};

type AccountSession = {
  access_token: string; token_type: string;
  account: { id: string; username: string; email: string; referral_code: string; status: string; };
};

type PackagePlan = { id: string; code: string; name: string; package_type: string; price: string; token_limit: number; duration_seconds: number; duration_days: number; };
type LeaderboardRow = { username: string; purchased_keys: number; total_spent_vnd: string; };
type AccountAPIKey = { id: string; key_prefix: string; api_key?: string; name: string; status: string; token_limit: number; token_used: number; token_remaining: number; expires_at: string; package_name: string; package_price: string; note: string; created_at: string; reset_at?: string; package_type?: string; order_code?: string; };
type PromoRecord = { milestone: number; package_name: string; value_vnd: string; key_prefix: string; created_at: string; reset_at?: string; package_type?: string; };
type ReferralRecord = { referred_username: string; value_vnd: string; note: string; created_at: string; reset_at?: string; package_type?: string; };
type ReferralSummary = { earned_vnd: string; redeemed_vnd: string; available_vnd: string; };
type RewardRedemptionRecord = { package_name: string; amount_vnd: string; key_prefix: string; status: string; note: string; created_at: string; reset_at?: string; package_type?: string; };
type AccountProfile = { account_id: string; contact_email: string; telegram_user_id: string; telegram_username: string; bank_name: string; bank_account_name: string; bank_account_number: string; note: string; };

const emptySession: LoginResult = {
  access_token: '', token_type: 'Bearer',
  api_key: { id: '', key_prefix: '', status: '', token_limit: 0, token_used: 0, token_remaining: 0, expires_at: '', expires_in_seconds: 0 },
  package: { id: '', code: '', name: '', package_type: '', duration_days: 0, duration_seconds: 0 },
  router: { id: '', code: '', base_url: '' },
  usage: { request_count: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0 }
};

/* ── Helpers ── */
function formatDuration(totalSeconds: number) {
  const value = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(value / 86400);
  const hours = Math.floor((value % 86400) / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'medium' }).format(date);
}

function formatCountdown(value: string, nowMs: number) {
  const target = new Date(value).getTime();
  if (!Number.isFinite(target)) return '-';
  const seconds = Math.max(0, Math.floor((target - nowMs) / 1000));
  if (seconds <= 0) return 'Expired';
  return formatDuration(seconds);
}

function formatVND(raw: string | number) {
  const value = Number(String(raw || '0').replace(/,/g, '')) || 0;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);
}

function formatTokenQuota(value: number) {
  if (value <= 0) return 'Unlimited';
  if (value >= 1_000_000 && value % 1_000_000 === 0) return `${value / 1_000_000}M token`;
  return `${value.toLocaleString('vi-VN')} token`;
}

function formatTokenRemaining(limit: number, remaining: number) {
  if (limit <= 0) return 'Unlimited';
  return remaining.toLocaleString('vi-VN');
}

function formatPackageDuration(plan: PackagePlan) {
  if (plan.duration_seconds > 0) return formatDuration(plan.duration_seconds);
  if (plan.duration_days > 0) return `${plan.duration_days}d`;
  return '-';
}

function formatPackageOption(plan: PackagePlan) {
  const quota = String(plan.package_type || '').toLowerCase() === 'hour' || plan.token_limit <= 0
    ? 'Unlimited token' : formatTokenQuota(plan.token_limit);
  return `${plan.name} - ${quota} - ${formatPackageDuration(plan)} - ${formatVND(plan.price)} VND`;
}

function statusLabel(status: string, t: (key: string) => string) {
  const key = status.toLowerCase();
  if (key === 'active') return t('dashboard.status.active');
  if (key === 'activation_required') return 'Cần kích hoạt web';
  if (key === 'pending') return t('dashboard.status.pending');
  if (key === 'rejected') return t('dashboard.status.rejected');
  if (key === 'disabled') return t('dashboard.status.disabled');
  if (key === 'revoked') return t('dashboard.status.revoked');
  return status || '-';
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'paid') return 'default';
  if (s === 'pending' || s === 'activation_required') return 'secondary';
  if (s === 'rejected' || s === 'revoked' || s === 'disabled' || s === 'expired') return 'destructive';
  return 'outline';
}

function formatKeyTokenRemaining(key: AccountAPIKey, t: (key: string) => string) {
  if (key.token_limit <= 0) return t('pricing.unlimited');
  const remaining = Math.max(0, key.token_remaining);
  const percent = Math.floor((remaining / key.token_limit) * 100);
  return `${remaining.toLocaleString('vi-VN')} / ${key.token_limit.toLocaleString('vi-VN')} (${percent}%)`;
}

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text); return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text; textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed'; textarea.style.left = '-9999px';
  document.body.appendChild(textarea); textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) throw new Error('Copy failed');
}

/* ── Main Dashboard Client ── */
export function DashboardClient() {
  const { t, lang } = useI18n();
  const router = useRouter();

  const [session, setSession] = useState<LoginResult>(emptySession);
  const [apiKey, setApiKey] = useState('');
  const [authMode, setAuthMode] = useState<'api-key' | 'account'>('api-key');
  const [accountSession, setAccountSession] = useState<AccountSession | null>(null);
  const [packages, setPackages] = useState<PackagePlan[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [accountKeys, setAccountKeys] = useState<AccountAPIKey[]>([]);
  const [promotions, setPromotions] = useState<PromoRecord[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [referralSummary, setReferralSummary] = useState<ReferralSummary>({ earned_vnd: '0', redeemed_vnd: '0', available_vnd: '0' });
  const [redemptions, setRedemptions] = useState<RewardRedemptionRecord[]>([]);
  const [profile, setProfile] = useState<AccountProfile>({ account_id: '', contact_email: '', telegram_user_id: '', telegram_username: '', bank_name: '', bank_account_name: '', bank_account_number: '', note: '' });
  const [selectedPackage, setSelectedPackage] = useState('');
  const [createdKey, setCreatedKey] = useState<any>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPackageId, setCheckoutPackageId] = useState('');
  const [checkoutApiKeyId, setCheckoutApiKeyId] = useState('');
  const [checkoutTitle, setCheckoutTitle] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const nav = useMemo(() => [
    ['overview', t('dashboard.nav.overview'), SquareActivity],
    ['keys', t('dashboard.nav.keys'), KeyRound],
    ['promos', t('dashboard.nav.promos'), Gift],
    ['leaders', t('dashboard.nav.leaders'), Trophy],
  ] as const, [t]);

  /* ── Auth / Data Loading ── */
  useEffect(() => {
    const storedMode = (localStorage.getItem('9router_auth_mode') || 'api-key') as 'api-key' | 'account';
    setAuthMode(storedMode);
    if (storedMode === 'account') {
      const stored = localStorage.getItem('9router_account_session');
      if (stored) { try { setAccountSession(JSON.parse(stored)); } catch {} }
    } else {
      const storedKey = localStorage.getItem('9router_api_key') || '';
      const storedSession = localStorage.getItem('9router_session');
      if (storedKey) setApiKey(storedKey);
      if (storedSession) { try { setSession(JSON.parse(storedSession)); } catch {} }
    }
  }, []);

  useEffect(() => {
    if (authMode === 'api-key' && apiKey) {
      loadApiKeyDashboard();
    } else if (accountSession) {
      loadAccountDashboard();
    }
  }, [authMode, apiKey, accountSession?.access_token]);

  const justRegistered = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const val = localStorage.getItem('9router_just_registered');
    if (val) { localStorage.removeItem('9router_just_registered'); return true; }
    return false;
  }, []);

  const authHeaders = useMemo((): Record<string, string> => {
    if (authMode === 'account' && accountSession) {
      return { Authorization: `Bearer ${accountSession.access_token}`, 'Content-Type': 'application/json' };
    }
    return { Authorization: '', 'Content-Type': 'application/json' };
  }, [authMode, accountSession]);

  async function loadApiKeyDashboard() {
    try {
      const res = await fetch(`/account/me`, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (body?.api_key) setSession({ ...emptySession, ...body });
    } catch (e) { setError((e as Error).message); }
  }

  async function loadAccountDashboard() {
    const headers = authHeaders;
    try {
      const [keysData, pkgData, promoData, refData, refSumData, redeemData, profileData, leaderData] = await Promise.allSettled([
        api<AccountAPIKey[]>('/account/api-keys', { headers }),
        api<PackagePlan[]>('/account/packages', { headers }),
        api<PromoRecord[]>('/account/promotions', { headers }),
        api<ReferralRecord[]>('/account/referrals', { headers }),
        api<ReferralSummary>('/account/referral-overview', { headers }),
        api<RewardRedemptionRecord[]>('/account/referrals', { headers }),
        api<AccountProfile>('/account/profile', { headers }),
        api<LeaderboardRow[]>('/account/leaderboard', { headers }),
      ]);
      if (keysData.status === 'fulfilled') setAccountKeys(keysData.value);
      if (pkgData.status === 'fulfilled') setPackages(pkgData.value.filter(p => p.code !== 'default'));
      if (promoData.status === 'fulfilled') setPromotions(promoData.value);
      if (refData.status === 'fulfilled') setReferrals(refData.value);
      if (refSumData.status === 'fulfilled') setReferralSummary(refSumData.value);
      if (redeemData.status === 'fulfilled') setRedemptions(redeemData.value);
      if (profileData.status === 'fulfilled') setProfile(profileData.value);
      if (leaderData.status === 'fulfilled') setLeaderboard(leaderData.value);
    } catch (e) { setError((e as Error).message); }
  }

  useEffect(() => {
    setPendingCount(accountKeys.filter(k => k.status === 'pending').length);
  }, [accountKeys]);

  function onRefreshDashboard() { loadAccountDashboard(); }

  /* ── Logout ── */
  function logout() {
    localStorage.removeItem('9router_auth_mode');
    localStorage.removeItem('9router_api_key');
    localStorage.removeItem('9router_session');
    localStorage.removeItem('9router_account_token');
    localStorage.removeItem('9router_account_session');
    router.push('/login');
  }

  /* ── Request Key ── */
  async function handleRequestKey() {
    if (!selectedPackage) return;
    try {
      const data = await api<any>('/account/api-keys', {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ package_id: selectedPackage, ...getClientDeviceInfo() }),
      });
      setCreatedKey(data);
      setSelectedPackage('');
      loadAccountDashboard();
    } catch (e) { setError((e as Error).message); }
  }

  /* ── Delete Key ── */
  async function handleDeleteKey(keyId: string) {
    try {
      await api(`/account/api-keys/${keyId}`, { method: 'DELETE', headers: authHeaders });
      setDeleteConfirm(null);
      loadAccountDashboard();
    } catch (e) { setError((e as Error).message); }
  }

  /* ── Open Checkout ── */
  function openCheckout(pkgId: string, title: string) {
    setCheckoutPackageId(pkgId);
    setCheckoutApiKeyId('');
    setCheckoutTitle(title);
    setCheckoutOpen(true);
  }

  function openBuyKey(keyId: string, title: string) {
    setCheckoutPackageId('');
    setCheckoutApiKeyId(keyId);
    setCheckoutTitle(title);
    setCheckoutOpen(true);
  }

  /* ── Copy key with feedback ── */
  async function handleCopy(keyId: string, text: string) {
    try {
      await copyText(text);
      setCopiedMap(prev => ({ ...prev, [keyId]: true }));
      setTimeout(() => setCopiedMap(prev => ({ ...prev, [keyId]: false })), 2000);
    } catch {}
  }

  /* ── Save Profile ── */
  async function handleSaveProfile() {
    try {
      await api('/account/profile', { method: 'POST', headers: authHeaders, body: JSON.stringify(profile) });
    } catch {}
  }

  /* ── Filter keys ── */
  const filteredKeys = useMemo(() => {
    let list = accountKeys;
    if (statusFilter !== 'all') list = list.filter(k => k.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(k =>
        k.key_prefix?.toLowerCase().includes(q) ||
        k.package_name?.toLowerCase().includes(q) ||
        k.status?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [accountKeys, statusFilter, searchQuery]);

  const isApiKeyMode = authMode === 'api-key';

  if (!apiKey && !accountSession) {
    return (
      <main className="shell-grid min-h-screen flex items-center justify-center">
        <div className="noise" />
        <Card className="mx-auto max-w-sm w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>{t('dashboard.notLoggedIn')}</CardTitle>
            <CardDescription>{t('dashboard.loginPrompt')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/login')}>
              {t('nav.login')}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="shell-grid min-h-screen">
      <div className="noise" />
      <div className="flex min-h-screen">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background/60 backdrop-blur-sm p-4 gap-1">
          <div className="flex items-center justify-between mb-6 px-2">
            <strong className="text-lg font-extrabold tracking-tight">9router</strong>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2 px-2 py-3 border-b border-border mb-2">
            <ShieldCheck size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium truncate">
              {authMode === 'account' ? accountSession?.account?.username || 'Account' : apiKey?.slice(0, 16) + '...'}
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  tab === id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <Icon size={18} />
                {label}
                {id === 'keys' && pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">{pendingCount}</Badge>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                  <Settings size={16} /> {t('dashboard.settings')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut size={16} className="mr-2" /> {t('dashboard.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden mb-6">
            <strong className="text-lg font-extrabold">9router</strong>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><ChevronDown size={18} /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {nav.map(([id, label]) => (
                    <DropdownMenuItem key={id} onClick={() => setTab(id)}>{label}</DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut size={14} className="mr-2" /> {t('dashboard.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ── Overview Tab ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">{t('dashboard.overview')}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Database size={16} /> {t('dashboard.tokenUsage')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isApiKeyMode
                        ? (session.usage?.total_tokens ?? 0).toLocaleString('vi-VN')
                        : accountKeys.reduce((s, k) => s + k.token_used, 0).toLocaleString('vi-VN')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Timer size={16} /> {t('dashboard.timeRemaining')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isApiKeyMode
                        ? formatCountdown(session.api_key?.expires_at || '', Date.now())
                        : `${accountKeys.length} keys`}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MonitorSmartphone size={16} /> {t('dashboard.devices')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {session.device ? '1' : accountKeys.filter(k => k.status === 'active').length.toString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <RefreshCcw size={16} /> {t('dashboard.requests')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isApiKeyMode
                        ? (session.usage?.request_count ?? 0).toLocaleString('vi-VN')
                        : '-'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* API Key Mode details */}
              {isApiKeyMode && session.api_key?.id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><KeyRound size={18} /> {t('dashboard.keyDetails')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={statusBadgeVariant(session.api_key.status)}>{statusLabel(session.api_key.status, t)}</Badge></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('dashboard.table.package')}</span><span>{session.package?.name || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('dashboard.tokenUsage')}</span><span>{formatKeyTokenRemaining({ ...session.api_key, package_name: "", package_price: "", note: "", created_at: "", name: "" } as AccountAPIKey, t)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('dashboard.table.expires')}</span><span>{formatDate(session.api_key.expires_at)}</span></div>
                  </CardContent>
                </Card>
              )}

              {/* Account Mode - Recent Keys */}
              {!isApiKeyMode && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.keysTitle')} ({accountKeys.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>{t('dashboard.table.status')}</TableHead>
                          <TableHead>{t('dashboard.table.package')}</TableHead>
                          <TableHead>{t('dashboard.table.used')}</TableHead>
                          <TableHead>{t('dashboard.table.expires')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountKeys.slice(0, 5).map(key => (
                          <TableRow key={key.id}>
                            <TableCell className="font-mono text-xs">{key.key_prefix}...</TableCell>
                            <TableCell><Badge variant={statusBadgeVariant(key.status)}>{statusLabel(key.status, t)}</Badge></TableCell>
                            <TableCell>{key.package_name}</TableCell>
                            <TableCell>{formatTokenRemaining(key.token_limit, key.token_remaining)}</TableCell>
                            <TableCell className="text-xs">{formatDate(key.expires_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Keys Tab ── */}
          {tab === 'keys' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">{t('dashboard.keysTitle')}</h1>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button><KeyRound size={16} className="mr-2" /> {t('dashboard.requestKey')}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('dashboard.requestKeyText')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('dashboard.selectPackage')} />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map(pkg => (
                            <SelectItem key={pkg.id} value={pkg.id}>{formatPackageOption(pkg)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className="w-full" onClick={handleRequestKey} disabled={!selectedPackage}>
                        {t('dashboard.requestApproval')}
                      </Button>
                      {createdKey && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-2 text-sm">
                          <p className="font-medium text-green-600 dark:text-green-400">{t('dashboard.newKey')}</p>
                          <p className="text-muted-foreground">{t('dashboard.telegramNotified')}: <strong>{createdKey.key_prefix}</strong></p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder={t('dashboard.searchKeys')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="sm:max-w-xs"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="sm:w-40">
                    <SelectValue placeholder={t('dashboard.table.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">{t('dashboard.status.active')}</SelectItem>
                    <SelectItem value="pending">{t('dashboard.status.pending')}</SelectItem>
                    <SelectItem value="activation_required">Cần kích hoạt</SelectItem>
                    <SelectItem value="rejected">{t('dashboard.status.rejected')}</SelectItem>
                    <SelectItem value="disabled">{t('dashboard.status.disabled')}</SelectItem>
                    <SelectItem value="revoked">{t('dashboard.status.revoked')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Keys Table */}
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>{t('dashboard.table.status')}</TableHead>
                        <TableHead>{t('dashboard.table.package')}</TableHead>
                        <TableHead>{t('dashboard.table.used')}</TableHead>
                        <TableHead>{t('dashboard.table.expires')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            {t('dashboard.noKeys')}
                          </TableCell>
                        </TableRow>
                      ) : filteredKeys.map(key => (
                        <TableRow key={key.id}>
                          <TableCell className="font-mono text-xs max-w-[120px] truncate">{key.key_prefix}...</TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(key.status)}>{statusLabel(key.status, t)}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{key.package_name}</TableCell>
                          <TableCell className="text-xs">{formatTokenRemaining(key.token_limit, key.token_remaining)}</TableCell>
                          <TableCell className="text-xs">{formatDate(key.expires_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {key.api_key && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(key.id, key.api_key!)}>
                                  {copiedMap[key.id] ? <span className="text-xs text-green-500">OK</span> : <span className="text-xs">Copy</span>}
                                </Button>
                              )}
                              {key.status === 'pending' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(key.id)}>
                                  ✕
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Delete Confirm Dialog */}
              <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('dashboard.confirmDelete')}</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t('dashboard.cancel')}</Button>
                    <Button variant="destructive" onClick={() => deleteConfirm && handleDeleteKey(deleteConfirm)}>{t('dashboard.delete')}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* ── Promotions Tab ── */}
          {tab === 'promos' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">{t('dashboard.promosTitle')}</h1>

              <Card>
                <CardHeader><CardTitle>{t('dashboard.promotionText')}</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('dashboard.table.milestone')}</TableHead>
                        <TableHead>{t('dashboard.table.package')}</TableHead>
                        <TableHead>{t('dashboard.table.value')}</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>{t('dashboard.table.date')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotions.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{p.milestone}</TableCell>
                          <TableCell>{p.package_name}</TableCell>
                          <TableCell>{formatVND(p.value_vnd)} VND</TableCell>
                          <TableCell className="font-mono text-xs">{p.key_prefix}...</TableCell>
                          <TableCell className="text-xs">{formatDate(p.created_at)}</TableCell>
                        </TableRow>
                      ))}
                      {promotions.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No promotions yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>{t('dashboard.referralRewards')}</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('dashboard.referralEarned')}</span><span>{formatVND(referralSummary.earned_vnd)} VND</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('dashboard.referralRedeemed')}</span><span>{formatVND(referralSummary.redeemed_vnd)} VND</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('dashboard.referralAvailable')}</span><strong>{formatVND(referralSummary.available_vnd)} VND</strong></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>{t('dashboard.rewardRedemptions')}</CardTitle></CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('dashboard.table.package')}</TableHead>
                          <TableHead>{t('dashboard.table.value')}</TableHead>
                          <TableHead>{t('dashboard.table.date')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redemptions.slice(0, 10).map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.package_name}</TableCell>
                            <TableCell>{formatVND(r.amount_vnd)} VND</TableCell>
                            <TableCell className="text-xs">{formatDate(r.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Referrals Table */}
              {referrals.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>{t('dashboard.referral')}</CardTitle></CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('dashboard.table.user')}</TableHead>
                          <TableHead>{t('dashboard.table.value')}</TableHead>
                          <TableHead>{t('dashboard.table.note')}</TableHead>
                          <TableHead>{t('dashboard.table.date')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.referred_username}</TableCell>
                            <TableCell>{formatVND(r.value_vnd)} VND</TableCell>
                            <TableCell>{r.note}</TableCell>
                            <TableCell className="text-xs">{formatDate(r.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Leaderboard Tab ── */}
          {tab === 'leaders' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">{t('dashboard.leaderboard')}</h1>
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('dashboard.table.user')}</TableHead>
                        <TableHead>{t('dashboard.table.totalSpent')}</TableHead>
                        <TableHead>{t('dashboard.table.purchased')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map(row => (
                        <TableRow key={row.username}>
                          <TableCell className="font-medium">{row.username}</TableCell>
                          <TableCell>{formatVND(row.total_spent_vnd)} VND</TableCell>
                          <TableCell>{row.purchased_keys}</TableCell>
                        </TableRow>
                      ))}
                      {leaderboard.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Settings modal for mobile */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('dashboard.settings')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Telegram User ID</Label>
              <Input value={profile.telegram_user_id} onChange={e => setProfile(p => ({ ...p, telegram_user_id: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telegram Username</Label>
              <Input value={profile.telegram_username} onChange={e => setProfile(p => ({ ...p, telegram_username: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('dashboard.fields.bankName')}</Label>
              <Input value={profile.bank_name} onChange={e => setProfile(p => ({ ...p, bank_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('dashboard.fields.bankAccountName')}</Label>
              <Input value={profile.bank_account_name} onChange={e => setProfile(p => ({ ...p, bank_account_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('dashboard.fields.bankAccountNumber')}</Label>
              <Input value={profile.bank_account_number} onChange={e => setProfile(p => ({ ...p, bank_account_number: e.target.value }))} />
            </div>
            <Button className="w-full" disabled={savingProfile} onClick={async () => { setSavingProfile(true); try { await handleSaveProfile(); } finally { setSavingProfile(false); } }}>
              {savingProfile ? t('dashboard.saving') : t('dashboard.saveSettings')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => { setCheckoutOpen(false); loadAccountDashboard(); }}
        packageId={checkoutPackageId}
        apiKeyId={checkoutApiKeyId}
        title={checkoutTitle}
      />
    </main>
  );
}
