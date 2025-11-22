'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const Settings = dynamic(() => import('@/components/Settings').then(mod => ({ default: mod.Settings })), {
  loading: () => <Loading />,
  ssr: false
});

export default function SettingsPage() {
  return <Settings />;
}
