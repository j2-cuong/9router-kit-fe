'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { api } from '../lib/api';

type Notice = {
  title: string;
  content: string;
  image_url: string;
  status: string;
};

const dismissMs = 3 * 60 * 60 * 1000;
const storageKey = 'azgate_notice_dismissed_until';

export function SiteNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedUntil = Number(localStorage.getItem(storageKey) || 0);
    if (Date.now() < dismissedUntil) return;

    api<Notice>('/notifications/active')
      .then(res => {
        if (res?.status === 'active') {
          setNotice(res);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  function closeNotice() {
    localStorage.setItem(storageKey, String(Date.now() + dismissMs));
    setVisible(false);
  }

  if (!visible || !notice) return null;

  return (
    <aside className="site-notice" role="status" aria-live="polite">
      <div className="site-notice-icon"><ShieldAlert size={18} /></div>
      <div className="site-notice-body">
        <strong>{notice.title}</strong>
        <p>{notice.content}</p>
        {notice.image_url && <img src={notice.image_url} alt="Thông báo" />}
      </div>
      <button type="button" className="site-notice-close" onClick={closeNotice} aria-label="Đóng thông báo">
        <X size={16} />
      </button>
    </aside>
  );
}
