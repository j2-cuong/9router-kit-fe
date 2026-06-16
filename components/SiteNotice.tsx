'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const HIDDEN_UNTIL = '2026-06-30T00:00:00+07:00';

export function SiteNotice() {
  const { lang } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = new Date(HIDDEN_UNTIL).getTime();
    const now = Date.now();
    if (now < target) {
      const timer = setTimeout(() => setShow(true), target - now);
      return () => clearTimeout(timer);
    }
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <Alert className="mx-auto max-w-3xl border-blue-500/30 bg-blue-950/80 text-blue-100 backdrop-blur-sm dark:bg-blue-950/80 dark:text-blue-100">
        <AlertDescription>
          {lang === 'vi'
            ? '🎉 Dùng Telegram Bot @api_agent_shop_8866_bot để mua gói dung lượng, rẻ hơn 20-30% so với thanh toán qua website!'
            : '🎉 Use Telegram Bot @api_agent_shop_8866_bot to buy packages, 20-30% cheaper than website checkout!'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
