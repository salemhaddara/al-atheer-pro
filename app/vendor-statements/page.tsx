'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const VendorStatements = dynamic(() => import('@/components/VendorStatements').then(mod => ({ default: mod.VendorStatements })), {
  loading: () => <Loading />,
  ssr: false
});

export default function VendorStatementsPage() {
  return <VendorStatements />;
}
