'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/sonner';
import { FullscreenToggle } from '@/components/FullscreenToggle';
import { ReactNode } from 'react';
import { AppLayout } from '../AppLayout';

interface ClientProvidersProps {
  children: ReactNode;
  initialLanguage?: 'ar' | 'en';
}

export function ClientProviders({ children, initialLanguage = 'ar' }: ClientProvidersProps) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <UserProvider>
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster position="top-center" richColors />
        <FullscreenToggle />
      </UserProvider>
    </LanguageProvider>
  );
}

