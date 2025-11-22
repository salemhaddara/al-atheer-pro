'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Customers = dynamic(() => import('@/components/Customers').then(mod => ({ default: mod.Customers })), {
  loading: () => <Loading />,
  ssr: false
});

export default function CustomersPage() {
  return <Customers />;
}

