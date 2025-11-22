'use client';

import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { Loading } from '@/components/Loading';

const EmployeeDetails = dynamic(() => import('@/components/EmployeeDetails').then(mod => ({ default: mod.EmployeeDetails })), {
  loading: () => <Loading />,
  ssr: false
});

export default function EmployeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  return (
            <EmployeeDetails 
              employeeId={id} 
              onBack={() => router.push('/employees')} 
            />
  );
}

