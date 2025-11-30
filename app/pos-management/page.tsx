'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const POSManagement = dynamic(
  () => import('@/components/POSManagement').then(mod => ({ default: mod.POSManagement })),
  {
    loading: () => <Loading />,
    ssr: false,
  }
);

export default function POSManagementPage() {
  return <POSManagement />;
}

