'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Products = dynamic(() => import('@/components/Products').then(mod => ({ default: mod.Products })), {
  loading: () => <Loading />,
  ssr: false
});

export default function ProductsPage() {
  return <Products />;
}

