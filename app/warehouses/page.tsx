'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Warehouses = dynamic(() => import('@/components/Warehouses').then(mod => ({ default: mod.Warehouses })), {
  loading: () => <Loading />,
  ssr: false
});

export default function WarehousesPage() {
  return <Warehouses />;
}

