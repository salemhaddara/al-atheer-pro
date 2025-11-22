'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const BalanceSheet = dynamic(() => import('@/components/reports/BalanceSheet').then(mod => ({ default: mod.BalanceSheet })), {
  loading: () => <Loading />,
  ssr: false
});

export default function BalanceSheetPage() {
  return <BalanceSheet />;
}
