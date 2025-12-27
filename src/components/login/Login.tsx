'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { LoginForm } from './LoginForm';
import { LoginImageSection } from './LoginImageSection';
import { useIsDesktop } from './useIsDesktop';
import { useRequireGuest } from './useRequireGuest';
import { Loading } from '@/components/Loading';

/**
 * Login component - Only accessible to non-authenticated users
 * Automatically redirects authenticated users to the home page
 */
export function Login() {
    const { direction } = useLanguage();
    const isDesktop = useIsDesktop();
    const { isChecking, isGuest } = useRequireGuest('/');

    const isRTL = direction === 'rtl';

    // Show loading state while checking authentication
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <Loading />
            </div>
        );
    }

    // Only render login form if user is a guest (not authenticated)
    if (!isGuest) {
        // This should not be reached due to redirect, but handle it gracefully
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full max-w-7xl">
                <div className="flex flex-row bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 backdrop-blur-sm"
                    style={{
                        width: isDesktop ? '80%' : '100%',
                        height: '75vh',
                        margin: '0 auto',
                        borderRadius: '2rem'
                    }}>
                    {/* Image Section - Only render on desktop */}
                    {isDesktop && <LoginImageSection isRTL={isRTL} />}

                    {/* Form Section - Always render */}
                    <LoginForm isRTL={isRTL} />
                </div>
            </div>
        </div>
    );
}

