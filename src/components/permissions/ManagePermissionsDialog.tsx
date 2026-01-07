'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Shield, Save, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Loading } from '../Loading';
import { PermissionGroup } from './PermissionGroup';
import type { Role, Permission } from '@/lib/roles-api';

interface ManagePermissionsDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleId: number, permissionIds: number[]) => Promise<void>;
  loading?: boolean;
}

export function ManagePermissionsDialog({
  role,
  isOpen,
  onClose,
  onSave,
  loading = false,
}: ManagePermissionsDialogProps) {
  const { t, direction } = useLanguage();
  const {
    permissions,
    groupedPermissions,
    loading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = usePermissions(100);

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  // Initialize selected permissions when role changes
  useEffect(() => {
    if (role && isOpen) {
      setSelectedPermissionIds(role.permissions.map((p) => p.id));
    }
  }, [role, isOpen]);

  const togglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleGroup = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedPermissionIds((prev) => {
        const newIds = [...prev];
        groupIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  const handleSave = async () => {
    if (!role) return;
    await onSave(role.id, selectedPermissionIds);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={direction}>
        <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <DialogTitle>
            {direction === 'rtl'
              ? `${role?.name} - ${t('permissions.permissions.manageTitle')}`
              : `${t('permissions.permissions.manageTitle')} - ${role?.name}`}
          </DialogTitle>
          <DialogDescription>{t('permissions.permissions.manageDescription')}</DialogDescription>
        </DialogHeader>

        {role && (
          <div className="space-y-4">
            {permissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loading />
              </div>
            ) : permissionsError ? (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2 text-red-600">{permissionsError}</p>
                <Button variant="outline" size="sm" onClick={() => refetchPermissions()}>
                  {t('common.retry') || 'Retry'}
                </Button>
              </div>
            ) : Object.keys(groupedPermissions).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2">
                  {t('permissions.permissions.noPermissions') || 'No permissions available'}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {permissions.length === 0
                    ? 'No permissions found in the system'
                    : `${permissions.length} permissions found but not grouped properly`}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetchPermissions()}>
                  {t('common.retry') || 'Retry'}
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t('permissions.permissions.noPermissions') || 'No permissions found'}</p>
                  </div>
                ) : (
                  Object.entries(groupedPermissions).map(([group, groupPermissions]) => (
                    <PermissionGroup
                      key={group}
                      group={group}
                      permissions={groupPermissions as Permission[]}
                      selectedPermissionIds={selectedPermissionIds}
                      onTogglePermission={togglePermission}
                      onToggleGroup={toggleGroup}
                      direction={direction}
                    />
                  ))
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSave} disabled={loading}>
                {loading ? (
                  t('common.loading')
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('common.save')}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}





