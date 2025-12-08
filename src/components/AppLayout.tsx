'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../contexts/LanguageContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [currentCompany, setCurrentCompany] = useState('شركة الأمل للتجارة');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });
  const { direction } = useLanguage();

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <>
      <Sidebar
        currentCompany={currentCompany}
        onCompanyChange={setCurrentCompany}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
      />
      <main
        className="min-h-screen p-8 bg-gray-50 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: direction === 'ltr' ? (isSidebarCollapsed ? '5rem' : '16rem') : '0',
          marginRight: direction === 'rtl' ? (isSidebarCollapsed ? '5rem' : '16rem') : '0'
        }}
      >
        {children}
      </main>
    </>
  );
}

