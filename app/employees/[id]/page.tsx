'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/Loading';

const EmployeeDetails = dynamic(() => import('@/components/EmployeeDetails').then(mod => ({ default: mod.EmployeeDetails })), {
  loading: () => <Loading />,
  ssr: false
});

export default function EmployeeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
            <EmployeeDetails 
              employeeId={params.id} 
              onBack={() => router.push('/employees')} 
            />
  );
}

