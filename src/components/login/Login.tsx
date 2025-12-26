'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { getAuthToken } from '@/lib/api';
import { LoginForm } from './LoginForm';
import { LoginImageSection } from './LoginImageSection';
import { useIsDesktop } from './useIsDesktop';

export function Login() {
    const { direction } = useLanguage();
    const { currentUser } = useUser();
    const router = useRouter();
    const isDesktop = useIsDesktop();

    // Redirect if already authenticated
    useEffect(() => {
        const token = getAuthToken();
        if (token && currentUser) {
            router.push('/');
        }
    }, [currentUser, router]);

    const isRTL = direction === 'rtl';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full max-w-7xl">
                <div className="flex flex-row bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 backdrop-blur-sm"
                    style={{
                        width: '75%',
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

