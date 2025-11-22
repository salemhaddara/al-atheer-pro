'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const ReceiptVouchers = dynamic(() => import('@/components/ReceiptVouchers').then(mod => ({ default: mod.ReceiptVouchers })), {
  loading: () => <Loading />,
  ssr: false
});

export default function ReceiptVouchersPage() {
  return <ReceiptVouchers />;
}
