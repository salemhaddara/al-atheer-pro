'use client';

import { ReactNode } from 'react';
import { useRequireAuth } from './useRequireAuth';
import { Loading } from '@/components/Loading';

interface AuthGuardProps {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * Component to protect routes that require authentication
 * Shows loading state while checking authentication
 * Redirects unauthenticated users to login page
 */
export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
    const { isChecking, isAuthenticated } = useRequireAuth(redirectTo);

    // Show loading state while checking authentication
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <Loading />
            </div>
        );
    }

    // Only render children if authenticated
    if (!isAuthenticated) {
        // This should not be reached due to redirect, but handle it gracefully
        return null;
    }

    return <>{children}</>;
}





