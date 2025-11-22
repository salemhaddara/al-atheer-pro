'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Companies = dynamic(() => import('@/components/Companies').then(mod => ({ default: mod.Companies })), {
  loading: () => <Loading />,
  ssr: false
});

export default function CompaniesPage() {
  return <Companies />;
}
