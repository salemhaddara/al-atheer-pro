'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const ProfitLoss = dynamic(() => import('@/components/reports/ProfitLoss').then(mod => ({ default: mod.ProfitLoss })), {
  loading: () => <Loading />,
  ssr: false
});

export default function ProfitLossPage() {
  return <ProfitLoss />;
}
