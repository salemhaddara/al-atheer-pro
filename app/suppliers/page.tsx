'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Suppliers = dynamic(() => import('@/components/Suppliers').then(mod => ({ default: mod.Suppliers })), {
  loading: () => <Loading />,
  ssr: false
});

export default function SuppliersPage() {
  return <Suppliers />;
}
