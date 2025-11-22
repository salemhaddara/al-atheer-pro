'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const AccountStatements = dynamic(() => import('@/components/AccountStatements').then(mod => ({ default: mod.AccountStatements })), {
  loading: () => <Loading />,
  ssr: false
});

export default function AccountStatementsPage() {
  return <AccountStatements />;
}
