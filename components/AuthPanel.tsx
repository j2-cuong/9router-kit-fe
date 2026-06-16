'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { ApiError, api } from '../lib/api';
import { useRouter } from 'next/navigation';
import { useI18n } from '../lib/i18n';
import { getClientDeviceInfo, type ClientDeviceInfo } from '../lib/device';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type LoginResult = {
  access_token: string;
  token_type: string;
  api_key: {
    id: string; key_prefix: string; status: string;
    token_limit: number; token_used: number; token_remaining: number;
    expires_at: string; expires_in_seconds: number;
  };
  package: { id: string; code: string; name: string; duration_days: number; duration_seconds: number; };
  router: { id: string; code: string; base_url: string };
  usage: { request_count: number; input_tokens: number; output_tokens: number; total_tokens: number; last_request_at?: string | null; };
  device?: ClientDeviceInfo & { user_agent?: string; ip_address?: string; requested_at?: string; };
};

type AuthPanelProps = { variant?: 'page' | 'modal'; onClose?: () => void; };

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
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setCaptchaCode(code);
  };

  useEffect(() => {
    if (accountMode === 'register') { generateCaptcha(); setCaptchaInput(''); }
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
        const data = await api<LoginResult>('/auth/api-key/login', {
          method: 'POST', body: JSON.stringify({ api_key: apiKey, ...getClientDeviceInfo() })
        });
        localStorage.setItem('9router_auth_mode', 'api-key');
        localStorage.setItem('9router_api_key', apiKey.trim());
        localStorage.setItem('9router_session', JSON.stringify(data));
      } else {
        if (accountMode === 'register') {
          if (password !== confirmPassword) { setError('Mật khẩu xác nhận không trùng khớp.'); setBusy(false); return; }
          if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) { setError('Mã xác nhận Captcha không chính xác.'); setBusy(false); return; }
        }
        const path = accountMode === 'register' ? '/account/register' : '/account/login';
        const payload = accountMode === 'register'
          ? { username, email, password, referral_code: referralCode }
          : { username, password };
        const data = await api<any>(path, { method: 'POST', body: JSON.stringify(payload) });
        localStorage.setItem('9router_auth_mode', 'account');
        localStorage.setItem('9router_account_token', data.access_token);
        localStorage.setItem('9router_account_session', JSON.stringify(data));
        if (accountMode === 'register') localStorage.setItem('9router_just_registered', 'true');
      }
      router.push('/dashboard');
      onClose?.();
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  }

  const formContent = (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={15} className="text-muted-foreground" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{t('auth.badge')}</span>
      </div>
      <div>
        <h1 className="text-xl font-bold">{t('auth.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('auth.subtitle')}</p>
      </div>

      {/* Tab: API Key / Account */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'api-key' | 'account')}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="api-key">API key</TabsTrigger>
          <TabsTrigger value="account">{t('auth.usernameMode')}</TabsTrigger>
        </TabsList>

        <TabsContent value="api-key" className="space-y-4 mt-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3 text-xs space-y-1">
            <strong className="text-amber-800 dark:text-amber-300">Cảnh báo kích hoạt thiết bị</strong>
            <p className="text-amber-700 dark:text-amber-400">
              Chỉ đăng nhập API key trên máy của bạn. Không kích hoạt hộ người khác, vì key sẽ bị khóa theo thiết bị đăng nhập đầu tiên và không thể kích hoạt trên máy khác nếu chưa được admin mở khóa. Thời hạn key vẫn tính từ lúc được cấp/duyệt, kể cả khi bạn chưa kích hoạt thiết bị.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input id="apiKey" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="ktx_live_..." autoComplete="off" spellCheck={false} />
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Tabs value={accountMode} onValueChange={(v) => setAccountMode(v as 'login' | 'register')}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('auth.username')}</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username">{t('auth.username')}</Label>
                <Input id="reg-username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">{t('auth.password')}</Label>
                <Input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Nhập lại mật khẩu</Label>
                <Input id="reg-confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-referral">{t('auth.referralCode')}</Label>
                <Input id="reg-referral" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder={t('auth.optional')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-captcha">Mã xác nhận Captcha</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg tracking-widest bg-muted px-3 py-1.5 rounded select-none">{captchaCode}</span>
                  <Button type="button" variant="outline" size="sm" onClick={generateCaptcha}>Tải lại</Button>
                </div>
                <Input id="reg-captcha" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} placeholder="Nhập mã Captcha ở trên" autoComplete="off" />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={busy} className="w-full gap-2">
        {busy ? t('auth.verifying') : (
          mode === 'account' && accountMode === 'register'
            ? <><UserPlus size={18} /> {t('auth.createAccount')}</>
            : <><LogIn size={18} /> {t('auth.enterDashboard')}</>
        )}
      </Button>
    </form>
  );

  // Modal variant
  if (isModal) {
    return (
      <Dialog open onOpenChange={(open) => { if (!open) onClose?.(); }}>
        <DialogContent className="sm:max-w-[440px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="sr-only">{t('auth.title')}</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Page variant
  return (
    <main className="shell-grid min-h-screen flex items-center justify-center">
      <div className="noise" />
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/"><ArrowLeft size={16} /> {t('auth.home')}</Link>
        </Button>
        <ThemeToggle />
      </nav>
      <div className="w-full max-w-md mx-auto px-4">
        {formContent}
      </div>
    </main>
  );
}
