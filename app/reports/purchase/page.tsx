'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const PurchaseReports = dynamic(() => import('@/components/reports/PurchaseReports').then(mod => ({ default: mod.PurchaseReports })), {
  loading: () => <Loading />,
  ssr: false
});

export default function PurchaseReportsPage() {
  return <PurchaseReports />;
}
