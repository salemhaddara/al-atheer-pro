'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const OpeningInventory = dynamic(
  () => import('@/components/OpeningInventory').then(mod => ({ default: mod.OpeningInventory })),
  {
    loading: () => <Loading />,
    ssr: false
  }
);

export default function OpeningInventoryPage() {
  return <OpeningInventory />;
}


