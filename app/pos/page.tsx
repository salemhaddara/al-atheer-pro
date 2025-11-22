'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const POS = dynamic(() => import('@/components/POS').then(mod => ({ default: mod.POS })), {
  loading: () => <Loading />,
  ssr: false
});

export default function POSPage() {
  return <POS />;
}

