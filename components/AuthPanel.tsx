'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, LogIn, UserPlus, ShieldAlert } from 'lucide-react';
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

export function AuthPanel() {
  const { t } = useI18n();
  const [mode, setMode] = useState<'api-key' | 'account'>('api-key');
  const [accountMode, setAccountMode] = useState<'login' | 'register'>('login');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [telegramUserID, setTelegramUserID] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeNotice, setActiveNotice] = useState<{ title: string; content: string; image_url: string; status: string } | null>(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    api<any>('/notifications/active')
      .then(res => {
        if (res && res.status === 'active') {
          setActiveNotice(res);
        }
      })
      .catch(() => {});
  }, []);

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
    } catch (err) {
      // Expired keys now login normally (dashboard shows renew option)
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-shell shell-grid">
    <div className="noise" />
    <div className="hero-sheen" />
    <nav className="top-nav">
      <Link className="btn btn-sm" href="/"><ArrowLeft size={16} /> {t('auth.home')}</Link>
      <LangToggle />
    </nav>
    {activeNotice && (
      <div className="panel" style={{
        border: '1px solid rgba(239, 68, 68, 0.28)',
        background: 'rgba(70, 10, 18, 0.55)',
        color: '#ffd9df',
        padding: '16px',
        borderRadius: '16px',
        marginBottom: '20px',
        display: 'grid',
        gap: '8px',
        maxWidth: '440px',
        width: '100%',
        marginInline: 'auto'
      }}>
        <strong style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#fca5a5', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          <ShieldAlert size={16} /> Thông Báo Bảo Trì Hệ Thống
        </strong>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{activeNotice.title}</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.85, whiteSpace: 'pre-wrap' }}>{activeNotice.content}</p>
        {activeNotice.image_url && (
          <div style={{ marginTop: '8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', maxWidth: '320px' }}>
            <img src={activeNotice.image_url} alt="Bảo trì" style={{ width: '100%', height: 'auto' }} />
          </div>
        )}
      </div>
    )}
    <form onSubmit={submit} className="panel auth-card">
      <div style={{ display: 'grid', gap: 12, marginBottom: 22 }}>
        <span className="floating-note"><KeyRound size={16} /> {t('auth.badge')}</span>
        <h1 style={{ margin: 0, fontSize: '2.1rem', lineHeight: 1.02, letterSpacing: '-.04em' }}>{t('auth.title')}</h1>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>{t('auth.subtitle')}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <button type="button" className={mode === 'api-key' ? 'btn btn-primary' : 'btn'} onClick={() => setMode('api-key')}>API key</button>
        <button type="button" className={mode === 'account' ? 'btn btn-primary' : 'btn'} onClick={() => setMode('account')}>{t('auth.usernameMode')}</button>
      </div>
      {mode === 'api-key' ? <div style={{ display: 'grid', gap: 12 }}>
        <div className="activation-warning">
          <strong>Canh bao kich hoat thiet bi</strong>
          <p>Chi dang nhap API key tren may cua ban. Khong kich hoat ho nguoi khac, vi key se bi khoa theo thiet bi dang nhap dau tien va khong the kich hoat tren may khac neu chua duoc admin mo khoa. Thoi han key van tinh tu luc duoc cap/duyet, ke ca khi ban chua kich hoat thiet bi.</p>
        </div>
        <div className="field">
          <label className="label" htmlFor="apiKey">API Key</label>
          <input id="apiKey" className="input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="ktx_live_..." autoComplete="off" spellCheck={false} />
        </div>
      </div> : <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className={accountMode === 'login' ? 'btn btn-primary btn-sm' : 'btn btn-sm'} onClick={() => setAccountMode('login')}>{t('auth.login')}</button>
          <button type="button" className={accountMode === 'register' ? 'btn btn-primary btn-sm' : 'btn btn-sm'} onClick={() => setAccountMode('register')}>{t('auth.register')}</button>
        </div>
        <div className="field"><label className="label" htmlFor="username">{t('auth.username')}</label><input id="username" className="input" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></div>
        {accountMode === 'register' && <div className="field"><label className="label" htmlFor="email">Email</label><input id="email" className="input" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></div>}
        <div className="field"><label className="label" htmlFor="password">{t('auth.password')}</label><input id="password" className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={accountMode === 'register' ? 'new-password' : 'current-password'} /></div>
        {accountMode === 'register' && <div className="field"><label className="label" htmlFor="confirmPassword">Nhập lại mật khẩu</label><input id="confirmPassword" className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" /></div>}
        {accountMode === 'register' && <div className="field"><label className="label" htmlFor="referralCode">{t('auth.referralCode')}</label><input id="referralCode" className="input" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder={t('auth.optional')} /></div>}
        {accountMode === 'register' && <div className="field">
          <label className="label" htmlFor="captchaInput">Mã xác nhận Captcha</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #2e1065, #3b0764)',
              color: '#d8b4fe',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              letterSpacing: 4,
              fontStyle: 'italic',
              textDecoration: 'line-through',
              userSelect: 'none',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
              border: '1px solid rgba(168,85,247,0.3)'
            }}>{captchaCode}</span>
            <button type="button" className="btn btn-sm" onClick={generateCaptcha} style={{ padding: '11px 12px' }}>Tải lại</button>
          </div>
          <input id="captchaInput" className="input" style={{ marginTop: 8 }} value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} placeholder="Nhập mã Captcha ở trên" autoComplete="off" />
        </div>}
      </div>}
      {error && <p style={{ marginTop: 16, border: '1px solid rgba(255, 100, 100, .26)', background: 'rgba(70, 10, 18, .55)', color: '#ffd9df', padding: '12px 14px', borderRadius: 14 }}>{error}</p>}
      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} disabled={busy}>{busy ? t('auth.verifying') : mode === 'account' && accountMode === 'register' ? <><UserPlus size={18} /> {t('auth.createAccount')}</> : <><LogIn size={18} /> {t('auth.enterDashboard')}</>}</button>
    </form>
  </main>;
}
