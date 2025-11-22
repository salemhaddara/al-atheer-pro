'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';

const CreateCustomer = dynamic(() => import('@/components/CreateCustomer').then(mod => ({ default: mod.CreateCustomer })), {
    loading: () => <Loading />,
    ssr: false
});

export default function EditCustomerPage({ params }: { params: { id: string } }) {
    return <CreateCustomer customerId={params.id} />;
}

