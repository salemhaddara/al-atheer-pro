'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const InventoryReports = dynamic(() => import('@/components/reports/InventoryReports').then(mod => ({ default: mod.InventoryReports })), {
  loading: () => <Loading />,
  ssr: false
});

export default function InventoryReportsPage() {
  return <InventoryReports />;
}
