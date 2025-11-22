'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Branches = dynamic(() => import('@/components/Branches').then(mod => ({ default: mod.Branches })), {
  loading: () => <Loading />,
  ssr: false
});

export default function BranchesPage() {
  return <Branches />;
}
