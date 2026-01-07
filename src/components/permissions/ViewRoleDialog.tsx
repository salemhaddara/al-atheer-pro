'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Role, Permission } from '@/lib/roles-api';

interface ViewRoleDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewRoleDialog({ role, isOpen, onClose }: ViewRoleDialogProps) {
  const { t, direction } = useLanguage();

  if (!role) return null;

  const groupedPermissions = role.permissions.reduce((acc, perm) => {
    const group = perm.group || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={direction}>
        <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <DialogTitle>{role.name}</DialogTitle>
          <DialogDescription>{role.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">{t('permissions.roles.slug')}</Label>
              <p className="text-sm text-gray-600">{role.slug}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">{t('permissions.roles.status')}</Label>
              <Badge variant={role.is_active ? 'default' : 'secondary'}>
                {role.is_active ? t('permissions.roles.active') : t('permissions.roles.inactive')}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t('permissions.roles.permissions')} ({role.permissions.length})
            </Label>
            <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
              {role.permissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    {t('permissions.roles.noPermissionsAssigned') ||
                      'No permissions assigned to this role'}
                  </p>
                </div>
              ) : (
                Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className="border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2 capitalize">{group}</h4>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <Badge key={perm.id} variant="outline">
                          {perm.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}





