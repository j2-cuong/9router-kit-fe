'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError, api } from '../lib/api';
import { Bell, ChevronDown, Clock3, Database, Fingerprint, Gift, KeyRound, ListChecks, LogOut, MonitorSmartphone, RefreshCcw, Settings, ShieldCheck, SquareActivity, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LangToggle } from './LangToggle';
import { useI18n } from '../lib/i18n';
import { getClientDeviceInfo, type ClientDeviceInfo } from '../lib/device';

type LoginResult = {
  access_token: string;
  token_type: string;
  api_key: {
    id: string;
    key_prefix: string;
    status: string;
    token_limit: number;
    token_used: number;
    token_remaining: number;
    expires_at: string;
    expires_in_seconds: number;

    expired?: boolean;

    reset_at?: string;
  };
  package: {
    id: string;
    code: string;
    name: string;
    package_type: string;
    duration_days: number;
    duration_seconds: number;
  };
  router: { id: string; code: string; base_url: string };
  usage: {
    request_count: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    last_request_at?: string | null;
  };
  device?: ClientDeviceInfo & {
    user_agent?: string;
    ip_address?: string;
    requested_at?: string;
  };
};

type AccountSession = {
  access_token: string;
  token_type: string;
  account: { id: string; username: string; email: string; referral_code: string; status: string };
};

type PackagePlan = {
  id: string;
  code: string;
  name: string;
  package_type: string;
  price: string;
  token_limit: number;
  duration_seconds: number;
  duration_days: number;
};

type LeaderboardRow = {
  username: string;
  purchased_keys: number;
  total_spent_vnd: string;
};

type AccountAPIKey = {
  id: string;
  key_prefix: string;
  api_key?: string;
  name: string;
  status: string;
  token_limit: number;
  token_used: number;
  token_remaining: number;
  expires_at: string;
  package_name: string;
  package_price: string;
  note: string;
  created_at: string;
  reset_at?: string;
  package_type?: string;
};

type PromoRecord = {
  milestone: number;
  package_name: string;
  value_vnd: string;
  key_prefix: string;
  created_at: string;
  reset_at?: string;
  package_type?: string;
};

type ReferralRecord = {
  referred_username: string;
  value_vnd: string;
  note: string;
  created_at: string;
  reset_at?: string;
  package_type?: string;
};

type ReferralSummary = {
  earned_vnd: string;
  redeemed_vnd: string;
  available_vnd: string;
};

type RewardRedemptionRecord = {
  package_name: string;
  amount_vnd: string;
  key_prefix: string;
  status: string;
  note: string;
  created_at: string;
  reset_at?: string;
  package_type?: string;
};

type AccountProfile = {
  account_id: string;
  contact_email: string;
  telegram_user_id: string;
  telegram_username: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  note: string;
};

const emptySession: LoginResult = {
  access_token: '',
  token_type: 'Bearer',
  api_key: { id: '', key_prefix: '', status: '', token_limit: 0, token_used: 0, token_remaining: 0, expires_at: '', expires_in_seconds: 0 },
  package: { id: '', code: '', name: '', package_type: '', duration_days: 0, duration_seconds: 0 },
  router: { id: '', code: '', base_url: '' },
  usage: { request_count: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0 }
};

export function DashboardClient() {
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
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const router = useRouter();

  useEffect(() => {
    const mode = (localStorage.getItem('9router_auth_mode') || 'api-key') as 'api-key' | 'account';
    setAuthMode(mode);
    if (mode === 'account') {
      const token = localStorage.getItem('9router_account_token');
      if (!token) {
        router.push('/login');
        return;
      }
      loadAccountDashboard(token);
      return;
    }
    const stored = localStorage.getItem('9router_api_key');
    if (!stored) {
      router.push('/login');
      return;
    }
    setApiKey(stored);
  }, [router]);

  async function loadAccountDashboard(token: string) {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const me = await api<{ account: AccountSession['account'] }>('/account/me', { headers });
      const pkg = await api<{ items: PackagePlan[] }>('/account/packages');
      const board = await api<{ items: LeaderboardRow[] }>('/account/leaderboard');
      const keys = await api<{ items: AccountAPIKey[] }>('/account/api-keys', { headers });
      const profileData = await api<{ profile: AccountProfile }>('/account/profile', { headers });
      const promo = await api<{ items: PromoRecord[] }>('/account/promotions', { headers });
      const referral = await api<{ items: ReferralRecord[] }>('/account/referrals', { headers });
      const referralOverview = await api<{ summary: ReferralSummary; rewards: ReferralRecord[]; redemptions: RewardRedemptionRecord[] }>('/account/referral-overview', { headers }).catch(() => null);
      const stored = localStorage.getItem('9router_account_session');
      const base = stored ? JSON.parse(stored) : { access_token: token, token_type: 'Bearer' };
      setAccountSession({ ...base, account: me.account });
      setPackages(pkg.items);
      setLeaderboard(board.items);
      setAccountKeys(keys.items);
      setPromotions(promo.items);
      setReferrals(referralOverview?.rewards || referral.items);
      setReferralSummary(referralOverview?.summary || { earned_vnd: '0', redeemed_vnd: '0', available_vnd: '0' });
      setRedemptions(referralOverview?.redemptions || []);
      setProfile(profileData.profile);
      setSelectedPackage(pkg.items[0]?.id || '');
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!apiKey) return;
    let mounted = true;
    api<LoginResult>('/auth/api-key/login', { method: 'POST', body: JSON.stringify({ api_key: apiKey, ...getClientDeviceInfo() }) })
      .then(data => {
        if (!mounted) return;
        setSession(data);
        localStorage.setItem('9router_session', JSON.stringify(data));
        setError('');
      })
      .catch(err => {
        if (!mounted) return;
        if (err instanceof ApiError && err.code === 'API_KEY_EXPIRED') {
          router.push('/expired');
          return;
        }
        setError((err as Error).message);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [apiKey]);

  useEffect(() => {
    if (authMode !== 'api-key') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [authMode]);

  const expiresLabel = useMemo(() => formatCountdown(session.api_key.expires_at, now), [session.api_key.expires_at, now]);

  const cards = [
    { label: 'Requests', value: session.usage.request_count, icon: ListChecks },
    { label: 'Input tokens', value: session.usage.input_tokens, icon: Database },
    { label: 'Output tokens', value: session.usage.output_tokens, icon: SquareActivity },
    { label: 'Time left', value: expiresLabel, icon: Clock3 }
  ];

  if (loading) return <main className="shell-grid auth-shell"><div className="panel auth-card">Loading...</div></main>;

  if (authMode === 'account' && accountSession) return <AccountDashboard2
    session={accountSession}
    packages={packages}
    leaderboard={leaderboard}
    accountKeys={accountKeys}
    promotions={promotions}
    referrals={referrals}
    referralSummary={referralSummary}
    redemptions={redemptions}
    profile={profile}
    setProfile={setProfile}
    selectedPackage={selectedPackage}
    setSelectedPackage={setSelectedPackage}
    createdKey={createdKey}
    error={error}
    onCreate={async () => {
      const token = localStorage.getItem('9router_account_token') || '';
      const data = await api<any>('/account/api-keys', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ package_id: selectedPackage }) });
      setCreatedKey(data);
      await loadAccountDashboard(token);
    }}
    onDelete={async (id) => {
      const token = localStorage.getItem('9router_account_token') || '';
      await api(`/account/api-keys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      await loadAccountDashboard(token);
    }}
    onSaveProfile={async () => {
      const token = localStorage.getItem('9router_account_token') || '';
      const data = await api<{ profile: AccountProfile }>('/account/profile', { method: 'PUT', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(profile) });
      setProfile(data.profile);
    }}
  />;

  return <main className="shell-grid api-dashboard-shell">
    <div className="noise" />
    <div className="hero-sheen" />
    <section className="api-dashboard-full-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <span className="floating-note"><ShieldCheck size={16} /> Authenticated dashboard</span>
          <h1 style={{ margin: '14px 0 8px', fontSize: '2.4rem', letterSpacing: '-.04em' }}>API Key overview</h1>
          <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>Key {session.api_key.key_prefix} - Package {session.package.name}</p>
        </div>
        <button className="btn" onClick={() => location.reload()}><RefreshCcw size={16} /> Refresh</button>
      </div>

      {error && <div className="panel metric" style={{ marginBottom: 18, borderColor: 'rgba(255,100,100,.3)', color: '#ffd9df' }}>{error}</div>}

      <div className="section-grid" style={{ marginBottom: 20 }}>
        {cards.map(card => <article key={card.label} className="panel metric" style={{ gridColumn: 'span 3' }}>
          <card.icon color="var(--cyan)" size={22} />
          <div className="metric-value" style={{ fontSize: card.label === 'Time left' ? '1.6rem' : '2rem' }}>{String(card.value)}</div>
          <div className="metric-label">{card.label}</div>
        </article>)}
      </div>

      <ApiKeyRequestCard session={session} timeLeft={expiresLabel} />
    </section>
  </main>;
}

function ApiKeyRequestCard({ session, timeLeft }: { session: LoginResult; timeLeft: string }) {
  const device = session.device || getClientDeviceInfo();
  const requestedAt = session.device?.requested_at ? formatDate(session.device.requested_at) : '-';
  const tokenRemaining = formatTokenRemaining(session.api_key.token_limit, session.api_key.token_remaining);

  return <article className="panel panel-strong request-card">
    <div className="request-card-head">
      <span className="floating-note"><MonitorSmartphone size={16} /> Device request</span>
      <div>
        <h2>API key details</h2>
        <p className="muted">The latest login request for key {session.api_key.key_prefix} came from this device profile.</p>
      </div>
    </div>
    <div className="request-card-grid">
      <div className="request-card-section">
        <h3><KeyRound size={17} /> Key and package</h3>
        <InfoLine label="Status" value={session.api_key.status || '-'} />
        <InfoLine label="Package" value={session.package.name || '-'} />
        <InfoLine label="Token limit" value={formatTokenQuota(session.api_key.token_limit)} />
        <InfoLine label="Token remaining" value={tokenRemaining} />
        <InfoLine label="Expires at" value={formatDate(session.api_key.expires_at)} />
        <InfoLine label="Time left" value={timeLeft} />
        {session.package.package_type === 'week' && session.api_key.reset_at && (
          <InfoLine label="Reset at" value={formatDate(session.api_key.reset_at)} />
        )}

        {session.api_key.expired && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, border: '1px solid rgba(255, 180, 0, 0.3)', background: 'rgba(60, 40, 0, 0.3)' }}>
            <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>Key hết hạn</strong>
            <p style={{ margin: '6px 0', fontSize: '0.85rem', opacity: 0.85 }}>
              API key này đã hết hạn. Bạn có thể gia hạn để tiếp tục sử dụng.
            </p>
            <a href={`https://t.me/API_Agent_Shop_8866_bot?start=renew_${session.api_key.id}`}
               target="_blank" rel="noopener noreferrer"
               className="btn btn-primary"
               style={{ width: '100%', textAlign: 'center', textDecoration: 'none', marginTop: 8 }}>
              Gia hạn qua Telegram
            </a>
          </div>
        )}

      </div>
      <div className="request-card-section">
        <h3><SquareActivity size={17} /> Usage</h3>
        <InfoLine label="Request count" value={session.usage.request_count.toLocaleString('vi-VN')} />
        <InfoLine label="Input tokens" value={session.usage.input_tokens.toLocaleString('vi-VN')} />
        <InfoLine label="Output tokens" value={session.usage.output_tokens.toLocaleString('vi-VN')} />
        <InfoLine label="Last request" value={session.usage.last_request_at ? formatDate(session.usage.last_request_at) : '-'} />
      </div>
      <div className="request-card-section device-section">
        <h3><Fingerprint size={17} /> Device sent with request</h3>
        <div className="activation-warning" style={{ marginBottom: 4 }}>
          <strong>Device activated</strong>
          <p>This API key is now locked to the device used for this web login. Do not share this Device ID or activate keys for other people. Expiration is counted from approval time, not activation time.</p>
        </div>
        <InfoLine label="Fingerprint" value={device.device_fingerprint || '-'} />
        <InfoLine label="Device ID" value={shortenDeviceID(device.device_id)} />
        {device.device_id && <button type="button" className="btn btn-sm" style={{ width: 'fit-content' }} onClick={() => copyText(device.device_id)}>Copy X-Device-ID</button>}
        <InfoLine label="Platform" value={device.platform || '-'} />
        <InfoLine label="Screen" value={device.screen || '-'} />
        <InfoLine label="Language" value={device.language || '-'} />
        <InfoLine label="Timezone" value={device.timezone || '-'} />
        <InfoLine label="IP address" value={session.device?.ip_address || '-'} />
        <InfoLine label="Requested at" value={requestedAt} />
        <InfoLine label="User agent" value={session.device?.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : '-')} />
      </div>
    </div>
  </article>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div className="info-line"><span>{label}</span><strong>{value}</strong></div>;
}

function shortenDeviceID(value: string) {
  if (!value) return '-';
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function AccountDashboard2({ session, packages, leaderboard, accountKeys, promotions, referrals, referralSummary, redemptions, profile, setProfile, selectedPackage, setSelectedPackage, createdKey, error, onCreate, onDelete, onSaveProfile }: { session: AccountSession; packages: PackagePlan[]; leaderboard: LeaderboardRow[]; accountKeys: AccountAPIKey[]; promotions: PromoRecord[]; referrals: ReferralRecord[]; referralSummary: ReferralSummary; redemptions: RewardRedemptionRecord[]; profile: AccountProfile; setProfile: (profile: AccountProfile) => void; selectedPackage: string; setSelectedPackage: (v: string) => void; createdKey: any; error: string; onCreate: () => Promise<void>; onDelete: (id: string) => Promise<void>; onSaveProfile: () => Promise<void> }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [tab, setTab] = useState<'overview' | 'keys' | 'promos' | 'leaders' | 'settings'>('overview');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [keyQuery, setKeyQuery] = useState('');
  const [keyPage, setKeyPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());
  const keyPageSize = 10;
  const filteredAccountKeys = useMemo(() => {
    const needle = keyQuery.trim().toLowerCase();
    if (!needle) return accountKeys;
    return accountKeys.filter(k => [k.key_prefix, k.status, k.package_name, k.note].some(v => String(v || '').toLowerCase().includes(needle)));
  }, [accountKeys, keyQuery]);
  const keyPageCount = Math.max(1, Math.ceil(filteredAccountKeys.length / keyPageSize));
  const keyCurrentPage = Math.min(keyPage, keyPageCount);
  const visibleAccountKeys = filteredAccountKeys.slice((keyCurrentPage - 1) * keyPageSize, keyCurrentPage * keyPageSize);
  useEffect(() => { setKeyPage(1); }, [keyQuery, accountKeys.length]);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const updateProfile = (patch: Partial<AccountProfile>) => setProfile({ ...profile, ...patch });
  const initials = session.account.username.slice(0, 2).toUpperCase();
  const approvedKeys = accountKeys.filter(k => k.status === 'active' && k.api_key);
  const activationKeys = accountKeys.filter(k => k.status === 'activation_required' && k.api_key);
  const pendingKeys = accountKeys.filter(k => k.status === 'pending');
  const nav = [
    ['overview', t('dashboard.nav.overview'), ShieldCheck],
    ['keys', t('dashboard.nav.keys'), KeyRound],
    ['promos', t('dashboard.nav.promos'), Gift],
    ['leaders', t('dashboard.nav.leaders'), Trophy],
  ] as const;
  return <main className="shell-grid account-dashboard-shell">
    <div className="noise" />
    <div className="hero-sheen" />
    <section className="account-shell account-full-shell">
      <aside className="account-sidebar">
        <div className="account-sidebar-brand"><strong>9router</strong><LangToggle /></div>
        <div className="account-sidebar-profile"><span className="floating-note"><ShieldCheck size={16} /> {t('dashboard.account')}</span><h1>{session.account.username}</h1><p className="muted">{t('dashboard.referral')}: {session.account.referral_code}</p></div>
        <nav className="account-sidebar-nav">{nav.map(([id, label, Icon]) => <button key={id} type="button" className={tab === id ? 'btn btn-primary' : 'btn'} onClick={() => setTab(id)}><Icon size={17} />{label}</button>)}</nav>
      </aside>
      <div className="account-main">
        <div className="dashboard-topbar">
        <div>
          <span className="floating-note"><ShieldCheck size={16} /> {t('dashboard.badge')}</span>
          <h1 style={{ margin: '14px 0 8px', fontSize: '2.1rem', letterSpacing: '-.03em' }}>{t('dashboard.welcome')}, {session.account.username}</h1>
          <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>{t('dashboard.subtitle')}</p>
        </div>
        <div className="avatar-menu-wrap">
          <button type="button" className="avatar-button" onClick={() => setAccountMenuOpen(v => !v)} aria-label={t('dashboard.accountMenu')}>
            <span className="avatar-circle">{initials}</span>
            <span className="avatar-name">{session.account.username}</span>
            <ChevronDown size={16} />
          </button>
          {accountMenuOpen && <div className="avatar-menu panel panel-strong">
            <button type="button" onClick={() => { setTab('settings'); setAccountMenuOpen(false); }}><Settings size={16} /> {t('dashboard.settings')}</button>
            <button type="button" onClick={() => { localStorage.removeItem('9router_account_token'); localStorage.removeItem('9router_account_session'); localStorage.removeItem('9router_auth_mode'); location.href = '/login'; }}><LogOut size={16} /> {t('dashboard.logout')}</button>
          </div>}
        </div>
        </div>
      {approvedKeys.length > 0 && <div className="panel metric" style={{ marginBottom: 18, borderColor: 'rgba(74,222,128,.28)' }}><Bell size={18} color="#86efac" /> <strong>{t('dashboard.approvedNotice')}</strong><p className="muted" style={{ margin: '8px 0 0' }}>{t('dashboard.approvedText')}</p></div>}
      {activationKeys.length > 0 && <div className="panel metric" style={{ marginBottom: 18, borderColor: 'rgba(255,196,87,.32)' }}><Bell size={18} color="#facc15" /> <strong>API key can kich hoat tren web</strong><p className="muted" style={{ margin: '8px 0 0' }}>Copy key trong danh sach API key, dang xuat, roi dang nhap bang API key tren dung may cua ban de kich hoat thiet bi. Khong kich hoat ho nguoi khac. Thoi han key van tinh tu luc duoc cap/duyet.</p></div>}
      {pendingKeys.length > 0 && <div className="panel metric" style={{ marginBottom: 18, borderColor: 'rgba(125,211,252,.28)' }}><Bell size={18} color="var(--cyan)" /> <strong>{t('dashboard.pendingNotice')}</strong><p className="muted" style={{ margin: '8px 0 0' }}>{t('dashboard.pendingText')}</p></div>}
      {error && <div className="panel metric" style={{ marginBottom: 18, borderColor: 'rgba(255,100,100,.3)', color: '#ffd9df' }}>{error}</div>}
      <div className="section-grid" style={{ marginBottom: 20 }}>
        <article className="panel metric" style={{ gridColumn: 'span 6' }}>
          <h2 style={{ marginTop: 0 }}>{t('dashboard.requestKey')}</h2>
          <p className="muted">{t('dashboard.requestKeyText')}</p>
          <select className="input" value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)}>
            {packages.map(p => <option key={p.id} value={p.id}>{formatPackageOption(p)}</option>)}
          </select>
          <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={busy || !selectedPackage} onClick={async () => { setBusy(true); try { await onCreate(); } finally { setBusy(false); } }}>{busy ? t('dashboard.sending') : t('dashboard.requestApproval')}</button>
        </article>
        <article className="panel metric" style={{ gridColumn: 'span 6' }}>
          <h2 style={{ marginTop: 0 }}>{t('dashboard.promotion')}</h2>
          <p className="muted">{t('dashboard.promotionText')}</p>
          {createdKey?.status === 'pending' && <div className="panel" style={{ padding: 14, marginTop: 12 }}><strong>{t('dashboard.waitingApproval')}</strong><br /><span className="muted">{t('dashboard.telegramNotified')}: {createdKey.api_key?.key_prefix}</span></div>}
          {createdKey?.api_key?.api_key && <div className="panel" style={{ padding: 14, marginTop: 12, wordBreak: 'break-all' }}><strong>{t('dashboard.newKey')}</strong><br />{createdKey.api_key.api_key}<br /><button type="button" className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => copyText(createdKey.api_key.api_key)}>{t('dashboard.copy')}</button></div>}
          {createdKey?.promo_key?.api_key && <div className="panel" style={{ padding: 14, marginTop: 12, wordBreak: 'break-all', borderColor: 'rgba(126,232,255,.35)' }}><strong>{t('dashboard.promoKey')}</strong><br />{createdKey.promo_key.api_key}<br /><button type="button" className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => copyText(createdKey.promo_key.api_key)}>{t('dashboard.copy')}</button></div>}
        </article>
      </div>
      {tab === 'overview' && <article className="panel panel-strong"><div style={{ padding: 20, borderBottom: '1px solid rgba(126,232,255,.08)' }}><strong>{t('dashboard.summary')}</strong></div><div style={{ padding: 20, overflowX: 'auto' }}><table className="glassy-table dashboard-table"><tbody><Row label={t('dashboard.fields.username')} value={session.account.username} /><Row label={t('dashboard.fields.email')} value={profile.contact_email || session.account.email || '-'} /><Row label={t('dashboard.fields.telegram')} value={profile.telegram_username || profile.telegram_user_id || '-'} /><Row label={t('dashboard.fields.referralCode')} value={session.account.referral_code} /><Row label={t('dashboard.fields.keysOwned')} value={String(accountKeys.length)} /><Row label={t('dashboard.fields.promotionsReceived')} value={String(promotions.length)} /><Row label={t('dashboard.fields.referralRewards')} value={`${formatVND(referralSummary.available_vnd)} VND`} /></tbody></table></div></article>}

      {tab === 'keys' && <article className="panel panel-strong"><div style={{ padding: 20, borderBottom: '1px solid rgba(126,232,255,.08)' }}><strong>{t('dashboard.keysTitle')}</strong></div><div style={{ padding: 20, display: 'grid', gap: 14, overflowX: 'auto' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}><input className="input" style={{ maxWidth: 360 }} value={keyQuery} onChange={e => setKeyQuery(e.target.value)} placeholder={t('dashboard.searchKeys')} /><span className="muted">{t('dashboard.showing')}: {visibleAccountKeys.length}/{filteredAccountKeys.length}</span></div><table className="glassy-table dashboard-table"><thead><tr><th>{t('dashboard.table.key')}</th><th>{t('dashboard.table.status')}</th><th>{t('dashboard.table.package')}</th><th>{t('dashboard.table.price')}</th><th>{t('dashboard.table.used')}</th><th>{t('dashboard.table.remain')}</th><th>{t('dashboard.table.timeLeft')}</th><th>Reset</th><th>{t('dashboard.copy')}</th><th>{t('dashboard.delete')}</th><th>Gia hạn</th></tr></thead><tbody>{visibleAccountKeys.map(k => <tr key={k.id}><td>{k.key_prefix}</td><td>{statusLabel(k.status, t)}</td><td>{k.package_name}</td><td>{formatVND(k.package_price)} VND</td><td>{k.token_used.toLocaleString('vi-VN')}</td><td>{formatKeyTokenRemaining(k, t)}</td><td>{formatCountdown(k.expires_at, now)}</td><td>{k.package_type === 'week' && k.reset_at ? formatCountdown(k.reset_at, now) : '-'}</td><td><button type="button" className="btn btn-sm" onClick={() => copyText(k.api_key || k.key_prefix)}>{t('dashboard.copy')}</button></td><td>{k.status !== 'active' ? <button type="button" className="btn btn-sm" onClick={() => { if (window.confirm(t('dashboard.confirmDelete'))) void onDelete(k.id); }}>{t('dashboard.delete')}</button> : '-'}</td><td>{(() => { const dt = new Date(k.expires_at).getTime(); if (isNaN(dt) || dt > Date.now()) return '-'; return <a href={'https://t.me/API_Agent_Shop_8866_bot?start=renew_' + k.id} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{textDecoration:'none'}}>Gia hạn</a>; })()}</td></tr>)}</tbody></table>{filteredAccountKeys.length > keyPageSize && <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><span className="muted">{keyCurrentPage}/{keyPageCount}</span><div style={{ display: 'flex', gap: 8 }}><button type="button" className="btn btn-sm" disabled={keyCurrentPage <= 1} onClick={() => setKeyPage(p => Math.max(1, p - 1))}>{t('dashboard.previous')}</button><button type="button" className="btn btn-sm" disabled={keyCurrentPage >= keyPageCount} onClick={() => setKeyPage(p => Math.min(keyPageCount, p + 1))}>{t('dashboard.next')}</button></div></div>}</div></article>}      {tab === 'promos' && <article className="panel panel-strong"><div style={{ padding: 20, borderBottom: '1px solid rgba(126,232,255,.08)' }}><strong>{t('dashboard.promosTitle')}</strong></div><div style={{ padding: 20, display: 'grid', gap: 20, overflowX: 'auto' }}><section><h3>{t('dashboard.promoKeys')}</h3><table className="glassy-table dashboard-table"><thead><tr><th>{t('dashboard.table.milestone')}</th><th>{t('dashboard.table.package')}</th><th>{t('dashboard.table.value')}</th><th>{t('dashboard.table.key')}</th><th>{t('dashboard.table.date')}</th></tr></thead><tbody>{promotions.map(p => <tr key={`${p.milestone}-${p.created_at}`}><td>{formatVND(p.milestone * 500000)} VND</td><td>{p.package_name}</td><td>{formatVND(p.value_vnd)} VND</td><td>{p.key_prefix || '-'}</td><td>{formatDate(p.created_at)}</td></tr>)}</tbody></table></section><section><h3>{t('dashboard.referralRewards')}</h3><div className="section-grid" style={{ marginBottom: 14 }}><article className="panel metric" style={{ gridColumn: 'span 4' }}><div className="metric-label">{t('dashboard.referralEarned')}</div><div className="metric-value" style={{ fontSize: '1.5rem' }}>{formatVND(referralSummary.earned_vnd)} VND</div></article><article className="panel metric" style={{ gridColumn: 'span 4' }}><div className="metric-label">{t('dashboard.referralRedeemed')}</div><div className="metric-value" style={{ fontSize: '1.5rem' }}>{formatVND(referralSummary.redeemed_vnd)} VND</div></article><article className="panel metric" style={{ gridColumn: 'span 4' }}><div className="metric-label">{t('dashboard.referralAvailable')}</div><div className="metric-value" style={{ fontSize: '1.5rem' }}>{formatVND(referralSummary.available_vnd)} VND</div></article></div><table className="glassy-table dashboard-table"><thead><tr><th>{t('dashboard.table.user')}</th><th>{t('dashboard.table.value')}</th><th>{t('dashboard.table.note')}</th><th>{t('dashboard.table.date')}</th></tr></thead><tbody>{referrals.map(r => <tr key={`${r.created_at}-${r.referred_username}`}><td>{r.referred_username || '-'}</td><td>{formatVND(r.value_vnd)} VND</td><td>{r.note}</td><td>{formatDate(r.created_at)}</td></tr>)}</tbody></table></section><section><h3>{t('dashboard.rewardRedemptions')}</h3><table className="glassy-table dashboard-table"><thead><tr><th>{t('dashboard.table.package')}</th><th>{t('dashboard.table.value')}</th><th>{t('dashboard.table.key')}</th><th>{t('dashboard.table.status')}</th><th>{t('dashboard.table.date')}</th></tr></thead><tbody>{redemptions.map(r => <tr key={`${r.created_at}-${r.key_prefix}`}><td>{r.package_name || '-'}</td><td>{formatVND(r.amount_vnd)} VND</td><td>{r.key_prefix || '-'}</td><td>{r.status}</td><td>{formatDate(r.created_at)}</td></tr>)}</tbody></table></section></div></article>}

      {tab === 'settings' && <article className="panel panel-strong"><div style={{ padding: 20, borderBottom: '1px solid rgba(126,232,255,.08)' }}><strong>{t('dashboard.settings')}</strong></div><div style={{ padding: 20, display: 'grid', gap: 14 }}><div className="field"><label className="label">{t('dashboard.fields.email')}</label><input className="input" value={profile.contact_email || ''} onChange={e => updateProfile({ contact_email: e.target.value })} /></div><div className="field"><label className="label">{t('dashboard.fields.telegramUserId')}</label><div style={{ display: 'flex', gap: 8 }}><input className="input" style={{ flex: 1 }} value={profile.telegram_user_id || ''} onChange={e => updateProfile({ telegram_user_id: e.target.value })} placeholder={t('dashboard.numericId')} /><a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: 13 }}>Get ID</a></div></div><div className="field"><label className="label">{t('dashboard.fields.telegramUsername')}</label><input className="input" value={profile.telegram_username || ''} onChange={e => updateProfile({ telegram_username: e.target.value })} /></div><div className="field"><label className="label">{t('dashboard.fields.bankName')}</label><input className="input" value={profile.bank_name || ''} onChange={e => updateProfile({ bank_name: e.target.value })} /></div><div className="field"><label className="label">{t('dashboard.fields.bankAccountName')}</label><input className="input" value={profile.bank_account_name || ''} onChange={e => updateProfile({ bank_account_name: e.target.value })} /></div><div className="field"><label className="label">{t('dashboard.fields.bankAccountNumber')}</label><input className="input" value={profile.bank_account_number || ''} onChange={e => updateProfile({ bank_account_number: e.target.value })} /></div><div className="field"><label className="label">{t('dashboard.table.note')}</label><input className="input" value={profile.note || ''} onChange={e => updateProfile({ note: e.target.value })} /></div><button type="button" className="btn btn-primary" disabled={savingProfile} onClick={async () => { setSavingProfile(true); try { await onSaveProfile(); } finally { setSavingProfile(false); } }}>{savingProfile ? t('dashboard.saving') : t('dashboard.saveSettings')}</button></div></article>}
      {tab === 'leaders' && <article className="panel panel-strong"><div style={{ padding: 20, borderBottom: '1px solid rgba(126,232,255,.08)' }}><strong>{t('dashboard.leaderboard')}</strong></div><div style={{ padding: 20, overflowX: 'auto' }}><table className="glassy-table dashboard-table"><thead><tr><th>{t('dashboard.table.user')}</th><th>{t('dashboard.table.totalSpent')}</th><th>{t('dashboard.table.purchased')}</th></tr></thead><tbody>{leaderboard.map(row => <tr key={row.username}><td>{row.username}</td><td>{formatVND(row.total_spent_vnd)} VND</td><td>{row.purchased_keys}</td></tr>)}</tbody></table></div></article>}
      </div>
    </section>
  </main>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <tr><th>{label}</th><td>{value}</td></tr>;
}

function formatDuration(totalSeconds: number) {
  const value = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
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

function formatKeyTokenRemaining(key: AccountAPIKey, t: (key: string) => string) {
  if (key.token_limit <= 0) return t('pricing.unlimited');
  const remaining = Math.max(0, key.token_remaining);
  const percent = Math.floor((remaining / key.token_limit) * 100);
  return `${remaining.toLocaleString('vi-VN')} / ${key.token_limit.toLocaleString('vi-VN')} (${percent}%)`;
}

function formatVND(raw: string | number) {
  const value = Number(String(raw || '0').replace(/,/g, '')) || 0;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);
}

function formatPackageOption(plan: PackagePlan) {
  const quota = String(plan.package_type || '').toLowerCase() === 'hour' || plan.token_limit <= 0
    ? 'Unlimited token'
    : formatTokenQuota(plan.token_limit);
  return `${plan.name} - ${quota} - ${formatPackageDuration(plan)} - ${formatVND(plan.price)} VND`;
}

function formatPackageDuration(plan: PackagePlan) {
  if (plan.duration_seconds > 0) return formatDuration(plan.duration_seconds);
  if (plan.duration_days > 0) return `${plan.duration_days}d`;
  return '-';
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

function statusLabel(status: string, t: (key: string) => string) {
  const key = status.toLowerCase();
  if (key === 'active') return t('dashboard.status.active');
  if (key === 'activation_required') return 'Can kich hoat web';
  if (key === 'pending') return t('dashboard.status.pending');
  if (key === 'rejected') return t('dashboard.status.rejected');
  if (key === 'disabled') return t('dashboard.status.disabled');
  if (key === 'revoked') return t('dashboard.status.revoked');
  return status || '-';
}

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) throw new Error('Copy failed');
}
