'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/sonner';
import { FullscreenToggle } from '@/components/FullscreenToggle';
import { ReactNode } from 'react';
import { AppLayout } from '../AppLayout';
import { AuthGuard } from '../login/AuthGuard';
import { usePathname } from 'next/navigation';

interface ClientProvidersProps {
  children: ReactNode;
  initialLanguage?: 'ar' | 'en';
}

export function ClientProviders({ children, initialLanguage = 'ar' }: ClientProvidersProps) {
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith('/login');

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <UserProvider>
        {isLoginPage ? (
          children
        ) : (
          <AuthGuard>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthGuard>
        )}
        <Toaster position="top-center" richColors />
        {!isLoginPage && <FullscreenToggle />}
      </UserProvider>
    </LanguageProvider>
  );
}

