'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { X, CheckCircle2, Loader2, Copy, Check } from 'lucide-react';

type OrderResponse = {
  order: {
    id: string;
    code: string;
    status: string;
    amount: string;
    currency: string;
    package_id: string;
    package_name: string;
    expires_at: string;
    created_at: string;
  };
  qronly_base64?: string;
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

  useEffect(() => {
    if (!open) {
      setOrder(null);
      setError('');
      setStatus('idle');
      setApiKey('');
      setCopied(false);
      setPaidExpiresAt('');
      setPollLog('');
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    if (orderCode) {
      loadExistingOrder(orderCode);
    } else {
      createOrder();
    }
  }, [open, orderCode]);

  useEffect(() => {
    if (open && order && status === 'idle' && order.order.status === 'pending') {
      startPolling();
    }
  }, [open, order, status]);

  async function createOrder() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('9router_account_token') || '';
      const body: any = {};
      if (apiKeyId) body.api_key_id = apiKeyId;
      else if (packageId) body.package_id = packageId;
      const data = await api<OrderResponse>('/account/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      setOrder(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadExistingOrder(code: string) {
    setLoading(true);
    setError('');
    try {
      const data = await api<OrderResponse>(`/account/orders/${code}`);
      setOrder(data);
      if (data.order.status === 'paid') {
        const key = await api<{ api_key?: string; expires_at?: string }>(`/account/orders/${code}`);
        if (key.api_key) setApiKey(key.api_key);
        if (key.expires_at) setPaidExpiresAt(key.expires_at);
        setStatus('success');
      } else if (data.order.status === 'expired') {
        setStatus('expired');
      } else {
        startPolling();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const [pollLog, setPollLog] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);
  const [paidExpiresAt, setPaidExpiresAt] = useState<string>('');

  function log(msg: string) {
    const ts = new Date().toLocaleTimeString('vi-VN');
    const line = `[${ts}] ${msg}`;
    console.log('[CheckoutModal]', line);
    setPollLog(prev => prev ? prev + '\n' + line : line);
  }

  function startPolling() {
    if (!order) return;
    setStatus('polling');
    setPollLog('');
    const code = order.order.code;
    const checkUrl = `/account/orders/${code}/check-payment`;
    const statusUrl = `/account/orders/${code}`;
    log(`POST ${checkUrl}`);
    pollRef.current = setInterval(async () => {
      try {
        const data = await api<{ found: boolean; paid?: boolean; expired?: boolean; api_key?: string; expires_at?: string; message?: string }>(checkUrl, { method: 'POST' });
        log(`Response: ${JSON.stringify(data)}`);
        if (data.paid) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (data.api_key) setApiKey(data.api_key);
          if (data.expires_at) setPaidExpiresAt(data.expires_at);
          setStatus('success');
          log('Paid → success');
        } else if (data.expired) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('expired');
          log('Expired');
        } else {
          log(`Not found: ${data.message || 'chưa thấy giao dịch'} → retrying`);
        }
      } catch (err: any) {
        log(`Error: ${err?.message || err}`);
      }
    }, 5000);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Đã sao chép ${label}`);
    } catch {}
  }

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="panel panel-strong" style={{ width: '100%', maxWidth: 440, maxHeight: '90vh', overflow: 'auto', padding: 28, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ margin: '0 0 18px', fontSize: '1.3rem' }}>{title || 'Thanh toán'}</h2>

        {toast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, padding: '10px 20px', borderRadius: 10, background: 'rgba(0,0,0,0.85)', color: '#86efac', fontSize: '0.85rem', border: '1px solid rgba(134,239,172,.3)', backdropFilter: 'blur(8px)', pointerEvents: 'none' }}>
            {toast}
          </div>
        )}
        {loading && <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={32} className="spin" /></div>}

        {error && <div style={{ padding: 14, borderRadius: 10, border: '1px solid rgba(255,100,100,.3)', color: '#ffd9df', marginBottom: 14 }}>{error}</div>}

        {order && !loading && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mã đơn</span>
                <strong>{order.order.code}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gói</span>
                <strong>{order.order.package_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số tiền</span>
                <strong>{Number(order.order.amount).toLocaleString('vi-VN')} VND</strong>
              </div>
            </div>

            {(order.bank_account || order.qronly_base64) && (() => {
              const vietqrSrc = order.bank_account
                ? `https://img.vietqr.io/image/${order.bank_account}-qr_only.png?amount=${Math.round(Number(order.order.amount))}&addInfo=${encodeURIComponent(order.order.code)}`
                : order.qronly_base64;
              return (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <img src={vietqrSrc} alt="QR Code" style={{ width: 240, height: 240, borderRadius: 10, border: '1px solid rgba(126,232,255,.15)' }} />
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quét QR để chuyển khoản</p>
                </div>
              );
            })()}

            {status === 'polling' && (
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 16 }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <Loader2 size={20} className="spin" style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  <span style={{ verticalAlign: 'middle' }}>Đang kiểm tra giao dịch...</span>
                </div>
                <div style={{ display: 'grid', gap: 10, fontSize: '0.85rem' }}>
                  {order.bank_account && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span>Số tài khoản: <strong>{order.bank_account}</strong></span>
                      <button onClick={() => copyText(order.bank_account!, 'số tài khoản')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span>Số tiền: <strong>{Number(order.order.amount).toLocaleString('vi-VN')} VND</strong></span>
                    <button onClick={() => copyText(Number(order.order.amount).toLocaleString('vi-VN') + ' VND', 'số tiền')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}>
                      <Copy size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span>Nội dung: <strong>{order.order.code}</strong></span>
                    <button onClick={() => copyText(order.order.code, 'nội dung chuyển khoản')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div style={{ padding: '12px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: 16, color: '#86efac' }}>
                  <CheckCircle2 size={28} />
                  <p style={{ margin: '8px 0 0', fontWeight: 600 }}>Thanh toán thành công!</p>
                </div>
                {apiKey && (
                  <div style={{ padding: 14, borderRadius: 10, border: '1px solid rgba(134,239,172,.25)', background: 'rgba(134,239,172,0.06)' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>API Key của bạn:</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px' }}>
                      <code style={{ flex: 1, fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--text-main)' }}>{apiKey}</code>
                      <button onClick={copyKey} style={{ background: 'none', border: 'none', color: copied ? '#86efac' : 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    {paidExpiresAt && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Hết hạn: {new Date(paidExpiresAt).toLocaleString('vi-VN')}</p>
                    )}
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={() => onSuccess(order!.order.code)}>
                      Vào dashboard
                    </button>
                  </div>
                )}
              </div>
            )}

            {status === 'expired' && (
              <div style={{ padding: 14, borderRadius: 10, border: '1px solid rgba(255,180,0,.3)', background: 'rgba(60,40,0,.3)', textAlign: 'center' }}>
                Đơn hàng đã hết hạn. Vui lòng tạo đơn mới.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
