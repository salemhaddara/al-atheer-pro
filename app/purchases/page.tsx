'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Purchases = dynamic(() => import('@/components/Purchases').then(mod => ({ default: mod.Purchases })), {
  loading: () => <Loading />,
  ssr: false
});

export default function PurchasesPage() {
  return <Purchases />;
}

