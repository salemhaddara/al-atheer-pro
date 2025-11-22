'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Services = dynamic(() => import('@/components/Services').then(mod => ({ default: mod.Services })), {
  loading: () => <Loading />,
  ssr: false
});

export default function ServicesPage() {
  return <Services />;
}
