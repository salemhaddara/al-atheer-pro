'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Reports = dynamic(() => import('@/components/Reports').then(mod => ({ default: mod.Reports })), {
  loading: () => <Loading />,
  ssr: false
});

export default function ReportsPage() {
  return <Reports />;
}
