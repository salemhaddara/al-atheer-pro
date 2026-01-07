'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function PermissionsHeader() {
  const { t, direction } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
        <h1 className="text-2xl font-bold">{t('permissions.title')}</h1>
        <p className="text-gray-600">{t('permissions.subtitle')}</p>
      </div>
    </div>
  );
}




