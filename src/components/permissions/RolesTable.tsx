'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Shield, Eye, Edit, Trash2, Plus, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Role } from '@/lib/roles-api';

interface RolesTableProps {
  roles: Role[];
  onCreateClick: () => void;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
  onAssignUsers: (role: Role) => void;
}

export function RolesTable({
  roles,
  onCreateClick,
  onView,
  onEdit,
  onDelete,
  onManagePermissions,
  onAssignUsers,
}: RolesTableProps) {
  const { t, direction } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('permissions.roles.title')}</CardTitle>
            <CardDescription>{t('permissions.roles.subtitle')}</CardDescription>
          </div>
          <Button className="gap-2" onClick={onCreateClick}>
            <Plus className="w-4 h-4" />
            {t('permissions.roles.addNew')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('permissions.roles.tableHeaders.roleName')}</TableHead>
              <TableHead>{t('permissions.roles.tableHeaders.description')}</TableHead>
              <TableHead>{t('permissions.roles.tableHeaders.status')}</TableHead>
              <TableHead>{t('permissions.roles.tableHeaders.permissionCount')}</TableHead>
              <TableHead>{t('permissions.roles.tableHeaders.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {t('permissions.roles.noRoles') || 'No roles found'}
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div
                      className={`flex items-center gap-2 ${
                        direction === 'rtl'
                          ? 'flex-row-reverse justify-start'
                          : 'justify-start'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{role.name}</span>
                      {role.is_system && (
                        <Badge variant="secondary" className="text-xs">
                          {t('permissions.roles.systemRole') || 'System'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_active ? 'default' : 'secondary'}>
                      {role.is_active
                        ? t('permissions.roles.active') || 'Active'
                        : t('permissions.roles.inactive') || 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {role.permissions.length} {t('permissions.roles.permissionCount')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`flex gap-2 ${
                        direction === 'rtl' ? 'flex-row-reverse justify-start' : 'justify-start'
                      }`}
                    >
                      <Button variant="ghost" size="sm" onClick={() => onView(role)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onManagePermissions(role)}>
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onAssignUsers(role)}>
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      {!role.is_system && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(role)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

