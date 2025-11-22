'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const TrialBalance = dynamic(() => import('@/components/reports/TrialBalance').then(mod => ({ default: mod.TrialBalance })), {
  loading: () => <Loading />,
  ssr: false
});

export default function TrialBalancePage() {
  return <TrialBalance />;
}
