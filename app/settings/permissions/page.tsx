'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Permissions = dynamic(() => import('@/components/permissions/Permissions').then(mod => ({ default: mod.Permissions })), {
  loading: () => <Loading />,
  ssr: false
});

export default function PermissionsPage() {
  return <Permissions />;
}
