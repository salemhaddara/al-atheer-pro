'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const CustomerReports = dynamic(() => import('@/components/reports/CustomerReports').then(mod => ({ default: mod.CustomerReports })), {
  loading: () => <Loading />,
  ssr: false
});

export default function CustomerReportsPage() {
  return <CustomerReports />;
}
