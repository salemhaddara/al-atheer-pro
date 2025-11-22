'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const ChartOfAccounts = dynamic(() => import('@/components/ChartOfAccounts').then(mod => ({ default: mod.ChartOfAccounts })), {
  loading: () => <Loading />,
  ssr: false
});

export default function ChartOfAccountsPage() {
  return <ChartOfAccounts />;
}
