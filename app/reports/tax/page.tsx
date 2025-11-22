'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const TaxReports = dynamic(() => import('@/components/reports/TaxReports').then(mod => ({ default: mod.TaxReports })), {
  loading: () => <Loading />,
  ssr: false
});

export default function TaxReportsPage() {
  return <TaxReports />;
}
