'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Safes = dynamic(() => import('@/components/Safes').then(mod => ({ default: mod.Safes })), {
  loading: () => <Loading />,
  ssr: false
});

export default function SafesPage() {
  return <Safes />;
}
