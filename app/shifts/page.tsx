'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Shifts = dynamic(() => import('@/components/Shifts').then(mod => ({ default: mod.Shifts })), {
  loading: () => <Loading />,
  ssr: false
});

export default function ShiftsPage() {
  return <Shifts />;
}
