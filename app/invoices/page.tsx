'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Invoices = dynamic(() => import('@/components/Invoices').then(mod => ({ default: mod.Invoices })), {
  loading: () => <Loading />,
  ssr: false
});

export default function InvoicesPage() {
  return <Invoices />;
}

