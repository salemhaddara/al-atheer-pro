'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const PaymentVouchers = dynamic(() => import('@/components/PaymentVouchers').then(mod => ({ default: mod.PaymentVouchers })), {
  loading: () => <Loading />,
  ssr: false
});

export default function PaymentVouchersPage() {
  return <PaymentVouchers />;
}
