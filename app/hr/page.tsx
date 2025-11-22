'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const HR = dynamic(() => import('@/components/HR').then(mod => ({ default: mod.HR })), {
  loading: () => <Loading />,
  ssr: false
});

export default function HRPage() {
  return <HR />;
}
