'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { X, Clock3, CheckCircle2, Loader2 } from 'lucide-react';

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
  qr_base64: string;
  bank_account: string;
};

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (orderCode: string) => void;
  packageId?: string;
  apiKeyId?: string;
  title?: string;
};

export function CheckoutModal({ open, onClose, onSuccess, packageId, apiKeyId, title }: CheckoutModalProps) {
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
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    createOrder();
  }, [open]);

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

  function startPolling() {
    if (!order) return;
    setStatus('polling');
    pollRef.current = setInterval(async () => {
      try {
        const data = await api<{ order: { status: string } }>(`/account/orders/${order.order.code}`);
        if (data.order.status === 'paid') {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('success');
          setTimeout(() => onSuccess(order.order.code), 2000);
        } else if (data.order.status === 'expired') {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('expired');
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);
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

            {order.qr_base64 && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img src={`data:image/png;base64,${order.qr_base64}`} alt="QR Code" style={{ width: 240, height: 240, borderRadius: 10, border: '1px solid rgba(126,232,255,.15)' }} />
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quét QR để chuyển khoản</p>
              </div>
            )}

            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 16, fontSize: '0.85rem' }}>
              <p style={{ margin: '0 0 6px' }}>Nội dung chuyển khoản: <strong>{order.order.code}</strong></p>
              {order.bank_account && <p style={{ margin: 0 }}>TK: {order.bank_account}</p>}
            </div>

            {status === 'idle' && (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={startPolling}>
                <Clock3 size={16} /> Kiểm tra giao dịch
              </button>
            )}

            {status === 'polling' && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Loader2 size={20} className="spin" style={{ marginRight: 8 }} />
                Đang kiểm tra... (mỗi 5 giây)
              </div>
            )}

            {status === 'success' && (
              <div style={{ textAlign: 'center', padding: '12px 0', color: '#86efac' }}>
                <CheckCircle2 size={24} style={{ marginRight: 8 }} />
                Thanh toán thành công!
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
