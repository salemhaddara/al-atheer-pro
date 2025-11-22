'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../contexts/LanguageContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [currentCompany, setCurrentCompany] = useState('شركة الأمل للتجارة');
  const { direction } = useLanguage();

  return (
    <>
      <Sidebar
        currentCompany={currentCompany}
        onCompanyChange={setCurrentCompany}
      />
      <main 
        className="min-h-screen p-8 bg-gray-50"
        style={{
          marginLeft: direction === 'ltr' ? '16rem' : '0',
          marginRight: direction === 'rtl' ? '16rem' : '0'
        }}
      >
        {children}
      </main>
    </>
  );
}

