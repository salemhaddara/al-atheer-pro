'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Loading } from '@/components/Loading';

const CreateCustomer = dynamic(() => import('@/components/CreateCustomer').then(mod => ({ default: mod.CreateCustomer })), {
    loading: () => <Loading />,
    ssr: false
});

export default function EditCustomerPage() {
    const params = useParams();
    const id = params?.id as string;
    return <CreateCustomer customerId={id} />;
}

