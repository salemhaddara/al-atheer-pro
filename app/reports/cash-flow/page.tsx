'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const CashFlow = dynamic(() => import('@/components/reports/CashFlow').then(mod => ({ default: mod.CashFlow })), {
  loading: () => <Loading />,
  ssr: false
});

export default function CashFlowPage() {
  return <CashFlow />;
}
