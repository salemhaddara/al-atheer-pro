'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Quotations = dynamic(() => import('@/components/Quotations').then(mod => ({ default: mod.Quotations })), {
  loading: () => <Loading />,
  ssr: false
});

export default function QuotationsPage() {
  return <Quotations />;
}


