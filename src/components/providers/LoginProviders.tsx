'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

interface LoginProvidersProps {
    children: ReactNode;
    initialLanguage?: 'ar' | 'en';
}

export function LoginProviders({ children, initialLanguage = 'ar' }: LoginProvidersProps) {
    return (
        <LanguageProvider initialLanguage={initialLanguage}>
            <UserProvider>
                {children}
                <Toaster position="top-center" richColors />
            </UserProvider>
        </LanguageProvider>
    );
}

