'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const SupplierReports = dynamic(() => import('@/components/reports/SupplierReports').then(mod => ({ default: mod.SupplierReports })), {
  loading: () => <Loading />,
  ssr: false
});

export default function SupplierReportsPage() {
  return <SupplierReports />;
}
