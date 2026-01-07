'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Shield, UserCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PermissionsStats as Stats } from './types';

interface PermissionsStatsProps {
  stats: Stats;
}

export function PermissionsStats({ stats }: PermissionsStatsProps) {
  const { t, direction } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader
          className={`flex flex-row items-center justify-between pb-2 ${
            direction === 'rtl' ? 'text-right' : 'text-left'
          }`}
        >
          <CardTitle className="text-sm">{t('permissions.stats.totalUsers')}</CardTitle>
          <Users className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.totalUsers}</div>
          <p className="text-xs text-gray-600 mt-1">{t('permissions.stats.activeUsers')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          className={`flex flex-row items-center justify-between pb-2 ${
            direction === 'rtl' ? 'text-right' : 'text-left'
          }`}
        >
          <CardTitle className="text-sm">{t('permissions.stats.definedRoles')}</CardTitle>
          <Shield className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.definedRoles}</div>
          <p className="text-xs text-gray-600 mt-1">
            {stats.activeRoles} {t('permissions.stats.active')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          className={`flex flex-row items-center justify-between pb-2 ${
            direction === 'rtl' ? 'text-right' : 'text-left'
          }`}
        >
          <CardTitle className="text-sm">{t('permissions.stats.suspendedUsers')}</CardTitle>
          <UserCircle className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.suspendedUsers}</div>
          <p className="text-xs text-gray-600 mt-1">{t('permissions.stats.pendingActivation')}</p>
        </CardContent>
      </Card>
    </div>
  );
}





