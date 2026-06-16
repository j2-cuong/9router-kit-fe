'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { Clock3, CheckCircle2, Loader2, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

type OrderResponse = {
  order: {
    id: string; code: string; status: string; amount: string; currency: string;
    package_id: string; package_name: string; expires_at: string; created_at: string;
  };
  qr_base64: string;
  bank_account: string;
};

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (orderCode: string) => void;
  packageId?: string;
  apiKeyId?: string;
  orderCode?: string;
  title?: string;
};

export function CheckoutModal({ open, onClose, onSuccess, packageId, apiKeyId, orderCode, title }: CheckoutModalProps) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'polling' | 'success' | 'expired'>('idle');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pollLog, setPollLog] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [paidExpiresAt, setPaidExpiresAt] = useState<string>('');

  function log(msg: string) {
    const ts = new Date().toLocaleTimeString('vi-VN');
    const line = `[${ts}] ${msg}`;
    console.log('[CheckoutModal]', line);
    setPollLog(prev => prev ? prev + '\n' + line : line);
  }

  useEffect(() => {
    if (!open) {
      setOrder(null); setError(''); setStatus('idle');
      setApiKey(''); setCopied(false); setPaidExpiresAt(''); setPollLog('');
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    if (orderCode) loadExistingOrder(orderCode);
    else createOrder();
  }, [open, orderCode]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  async function createOrder() {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('9router_account_token') || '';
      const body: any = {};
      if (apiKeyId) body.api_key_id = apiKeyId;
      else if (packageId) body.package_id = packageId;
      const data = await api<OrderResponse>('/account/orders', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body),
      });
      setOrder(data);
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  }

  async function loadExistingOrder(code: string) {
    setLoading(true); setError('');
    try {
      const data = await api<OrderResponse>(`/account/orders/${code}`);
      setOrder(data);
      if (data.order.status === 'paid') {
        const key = await api<{ api_key?: string; expires_at?: string }>(`/account/orders/${code}`);
        if (key.api_key) setApiKey(key.api_key);
        if (key.expires_at) setPaidExpiresAt(key.expires_at);
        setStatus('success');
      } else if (data.order.status === 'expired') setStatus('expired');
      else startPolling();
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  }

  function startPolling() {
    if (!order) return;
    setStatus('polling'); setPollLog('');
    const code = order.order.code;
    const checkUrl = `/account/orders/${code}/check-payment`;
    log(`POST ${checkUrl}`);
    pollRef.current = setInterval(async () => {
      try {
        const data = await api<{ found: boolean; paid?: boolean; expired?: boolean; api_key?: string; expires_at?: string; message?: string }>(checkUrl, { method: 'POST' });
        log(`Response: ${JSON.stringify(data)}`);
        if (data.paid) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (data.api_key) setApiKey(data.api_key);
          if (data.expires_at) setPaidExpiresAt(data.expires_at);
          setStatus('success'); log('Paid → success');
        } else if (data.expired) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('expired'); log('Expired');
        } else {
          log(`Not found: ${data.message || 'chưa thấy giao dịch'} → retrying`);
        }
      } catch (err: any) { log(`Error: ${err?.message || err}`); }
    }, 5000);
  }

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{title || 'Thanh toán'}</DialogTitle>
          <DialogDescription>Hoàn tất thanh toán để kích hoạt gói dịch vụ</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {order && !loading && (
          <div className="space-y-4">
            {/* Order Info */}
            <Card>
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn</span>
                  <strong>{order.order.code}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gói</span>
                  <strong>{order.order.package_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tiền</span>
                  <strong>{Number(order.order.amount).toLocaleString('vi-VN')} VND</strong>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            {order.qr_base64 && (
              <div className="text-center">
                <img src={order.qr_base64} alt="QR Code"
                  className="mx-auto w-60 h-60 rounded-xl border border-border" />
                <p className="text-xs text-muted-foreground mt-2">Quét QR để chuyển khoản</p>
              </div>
            )}

            {/* Bank Info */}
            <Card className="bg-muted/50">
              <CardContent className="p-3 space-y-1 text-sm">
                <p>Nội dung chuyển khoản: <strong>{order.order.code}</strong></p>
                {order.bank_account && <p className="text-muted-foreground">TK: {order.bank_account}</p>}
              </CardContent>
            </Card>

            <Separator />

            {/* Status actions */}
            {status === 'idle' && (
              <Button className="w-full gap-2" onClick={startPolling}>
                <Clock3 size={16} /> Kiểm tra giao dịch
              </Button>
            )}

            {status === 'polling' && (
              <div className="text-center py-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang kiểm tra giao dịch... (mỗi 5 giây)
                </div>
                {pollLog && (
                  <pre className="mt-2 p-3 rounded-lg bg-muted/80 text-xs text-muted-foreground text-left max-h-24 overflow-auto whitespace-pre-wrap break-all">
                    {pollLog}
                  </pre>
                )}
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="h-7 w-7 text-green-500 mx-auto" />
                  <p className="font-semibold text-green-600 dark:text-green-400">Thanh toán thành công!</p>
                </div>
                {apiKey && (
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-xs text-muted-foreground">API Key của bạn:</p>
                      <div className="flex items-center gap-2 bg-background rounded-lg p-3 text-sm">
                        <code className="flex-1 break-all">{apiKey}</code>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyKey}>
                          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </Button>
                      </div>
                      {paidExpiresAt && (
                        <p className="text-xs text-muted-foreground">
                          Hết hạn: {new Date(paidExpiresAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                      <Button className="w-full" onClick={() => onSuccess(order!.order.code)}>
                        Vào dashboard
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {status === 'expired' && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-sm">
                Đơn hàng đã hết hạn. Vui lòng tạo đơn mới.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
