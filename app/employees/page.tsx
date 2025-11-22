'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/Loading';

const Employees = dynamic(() => import('@/components/Employees').then(mod => ({ default: mod.Employees })), {
  loading: () => <Loading />,
  ssr: false
});

export default function EmployeesPage() {
  const router = useRouter();

  const handleViewEmployee = (employeeId: string) => {
    // Prefetch the employee details page for faster navigation
    router.prefetch(`/employees/${employeeId}`);
    router.push(`/employees/${employeeId}`);
  };

  return <Employees onViewEmployee={handleViewEmployee} />;
}

