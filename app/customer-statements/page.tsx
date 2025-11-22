'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const CustomerStatements = dynamic(() => import('@/components/CustomerStatements').then(mod => ({ default: mod.CustomerStatements })), {
  loading: () => <Loading />,
  ssr: false
});

export default function CustomerStatementsPage() {
  return <CustomerStatements />;
}
