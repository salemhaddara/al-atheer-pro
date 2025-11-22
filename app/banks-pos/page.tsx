'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const BanksPOS = dynamic(() => import('@/components/BanksPOS').then(mod => ({ default: mod.BanksPOS })), {
  loading: () => <Loading />,
  ssr: false
});

export default function BanksPOSPage() {
  return <BanksPOS />;
}
