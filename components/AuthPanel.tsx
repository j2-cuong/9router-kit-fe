'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, LogIn, UserPlus, X } from 'lucide-react';
import { ApiError, api } from '../lib/api';
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
  };
  package: {
    id: string;
    code: string;
    name: string;
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
type AuthPanelProps = {
  variant?: 'page' | 'modal';
  onClose?: () => void;
};
export default function AuthPanel({ variant = 'page', onClose }: AuthPanelProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<'api-key' | 'account'>('api-key');
  const [accountMode, setAccountMode] = useState<'login' | 'register'>('login');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const isModal = variant === 'modal';
  const generateCaptcha = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaCode(code);
  };
  useEffect(() => {
    if (accountMode === 'register') {
      generateCaptcha();
      setCaptchaInput('');
    }
  }, [accountMode]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      localStorage.removeItem('9router_api_key');
      localStorage.removeItem('9router_account_token');
      if (mode === 'api-key') {
        const data = await api<LoginResult>('/auth/api-key/login', { method: 'POST', body: JSON.stringify({ api_key: apiKey, ...getClientDeviceInfo() }) });
        localStorage.setItem('9router_auth_mode', 'api-key');
        localStorage.setItem('9router_api_key', apiKey.trim());
        localStorage.setItem('9router_session', JSON.stringify(data));
      } else {
        if (accountMode === 'register') {
          if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp.');
            setBusy(false);
            return;
          }
          if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
            setError('Mã xác nhận Captcha không chính xác.');
            setBusy(false);
            return;
          }
        }
        const path = accountMode === 'register' ? '/account/register' : '/account/login';
        const payload = accountMode === 'register'
          ? { username, email, password, referral_code: referralCode }
          : { username, password };
        const data = await api<any>(path, { method: 'POST', body: JSON.stringify(payload) });
        localStorage.setItem('9router_auth_mode', 'account');
        localStorage.setItem('9router_account_token', data.access_token);
        localStorage.setItem('9router_account_session', JSON.stringify(data));
        if (accountMode === 'register') {
          localStorage.setItem('9router_just_registered', 'true');
        }
      }
      router.push('/dashboard');
      onClose?.();
    } catch (err) {
      // Expired keys now login normally (dashboard shows renew option)
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const authForm = (
      <form onSubmit={submit} className={isModal ? 'panel auth-card auth-card-modal' : 'panel auth-card'}>
        <div className="auth-card-header">
          <div className="auth-card-topline">
            <span className="auth-kicker"><KeyRound size={15} /> {t('auth.badge')}</span>
            {isModal && <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close auth modal"><X size={17} /></button>}
          </div>
          <h1 id={isModal ? 'auth-modal-title' : undefined}>{t('auth.title')}</h1>
          <p className="muted">{t('auth.subtitle')}</p>
        </div>
        <div className="auth-mode-switch" role="tablist" aria-label="Auth method">
          <button type="button" className={mode === 'api-key' ? 'active' : ''} onClick={() => setMode('api-key')}>API key</button>
          <button type="button" className={mode === 'account' ? 'active' : ''} onClick={() => setMode('account')}>{t('auth.usernameMode')}</button>
        </div>
        {mode === 'api-key' ? <div className="auth-fields">
          <div className="activation-warning">
            <strong>Canh bao kich hoat thiet bi</strong>
            <p>Chi dang nhap API key tren may cua ban. Khong kich hoat ho nguoi khac, vi key se bi khoa theo thiet bi dang nhap dau tien va khong the kich hoat tren may khac neu chua duoc admin mo khoa. Thoi han key van tinh tu luc duoc cap/duyet, ke ca khi ban chua kich hoat thiet bi.</p>
          </div>
          <div className="field">
            <label className="label" htmlFor="apiKey">API Key</label>
            <input id="apiKey" className="input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="ktx_live_..." autoComplete="off" spellCheck={false} />
          </div>
        </div> : <div className="auth-fields">
          <div className="auth-submode-switch">
            <button type="button" className={accountMode === 'login' ? 'active' : ''} onClick={() => setAccountMode('login')}>{t('auth.login')}</button>
            <button type="button" className={accountMode === 'register' ? 'active' : ''} onClick={() => setAccountMode('register')}>{t('auth.register')}</button>
          </div>
          <div className="field"><label className="label" htmlFor="username">{t('auth.username')}</label><input id="username" className="input" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></div>
          {accountMode === 'register' && <div className="field"><label className="label" htmlFor="email">Email</label><input id="email" className="input" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></div>}
          <div className="field"><label className="label" htmlFor="password">{t('auth.password')}</label><input id="password" className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={accountMode === 'register' ? 'new-password' : 'current-password'} /></div>
          {accountMode === 'register' && <div className="field"><label className="label" htmlFor="confirmPassword">Nhập lại mật khẩu</label><input id="confirmPassword" className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" /></div>}
          {accountMode === 'register' && <div className="field"><label className="label" htmlFor="referralCode">{t('auth.referralCode')}</label><input id="referralCode" className="input" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder={t('auth.optional')} /></div>}
          {accountMode === 'register' && <div className="field">
            <label className="label" htmlFor="captchaInput">Mã xác nhận Captcha</label>
            <div className="captcha-row">
              <span className="captcha-code">{captchaCode}</span>
              <button type="button" className="captcha-refresh" onClick={generateCaptcha}>Tải lại</button>
            </div>
            <input id="captchaInput" className="input" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} placeholder="Nhập mã Captcha ở trên" autoComplete="off" />
          </div>}
        </div>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>{busy ? t('auth.verifying') : mode === 'account' && accountMode === 'register' ? <><UserPlus size={18} /> {t('auth.createAccount')}</> : <><LogIn size={18} /> {t('auth.enterDashboard')}</>}</button>
      </form>
  );
  if (isModal) {
    return (
      <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={onClose}>
        <div className="auth-modal-shell" onClick={event => event.stopPropagation()}>
          {authForm}
        </div>
      </div>
    );
  }
  return <main className="auth-shell shell-grid">
    <div className="noise" />
    <div className="hero-sheen" />
    <nav className="auth-nav" data-no-smoke>
      <Link className="btn btn-sm" href="/"><ArrowLeft size={16} /> {t('auth.home')}</Link>
      <LangToggle />
    </nav>
    {authForm}
  </main>;
}