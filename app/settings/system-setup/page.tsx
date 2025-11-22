'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const SystemSetup = dynamic(() => import('@/components/SystemSetup').then(mod => ({ default: mod.SystemSetup })), {
  loading: () => <Loading />,
  ssr: false
});

export default function SystemSetupPage() {
  return <SystemSetup />;
}
