'use client';

import { useParams, useRouter } from 'next/navigation';
import { CheckoutModal } from '../../../components/CheckoutModal';

export default function PayPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
      <CheckoutModal
        open={true}
        onClose={() => router.push('/dashboard')}
        onSuccess={() => router.push('/dashboard')}
        orderCode={code}
        title="Thanh toán"
      />
    </main>
  );
}
