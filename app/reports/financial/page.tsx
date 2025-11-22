'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const FinancialReports = dynamic(() => import('@/components/reports/FinancialReports').then(mod => ({ default: mod.FinancialReports })), {
  loading: () => <Loading />,
  ssr: false
});

export default function FinancialReportsPage() {
  return <FinancialReports />;
}
