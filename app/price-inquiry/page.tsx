'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';
import { AppLayout } from '@/components/AppLayout';

const PriceInquiry = dynamic(
  () => import('@/components/PriceInquiry').then(mod => ({ default: mod.PriceInquiry })),
  {
    loading: () => <Loading />,
    ssr: false,
  }
);

export default function PriceInquiryPage() {
  return (
    <AppLayout>
      <PriceInquiry />
    </AppLayout>
  );
}



