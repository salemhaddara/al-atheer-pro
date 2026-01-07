'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateSlug } from '@/utils/slug';
import type { Role } from '@/lib/roles-api';
import type { RoleFormData } from './types';

interface RoleFormDialogProps {
  mode: 'create' | 'edit';
  role?: Role | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RoleFormData;
  onFormDataChange: (data: RoleFormData) => void;
  onSubmit: () => Promise<void>;
  loading?: boolean;
  triggerButton?: React.ReactNode;
}

export function RoleFormDialog({
  mode,
  role,
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  loading = false,
  triggerButton,
}: RoleFormDialogProps) {
  const { t, direction } = useLanguage();

  const isCreate = mode === 'create';

  const handleNameChange = (name: string) => {
    // Auto-generate slug if slug is empty or matches the previous auto-generated slug
    const newSlug =
      formData.slug === generateSlug(formData.name) ? generateSlug(name) : formData.slug;
    onFormDataChange({ ...formData, name, slug: newSlug });
  };

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={direction}>
      <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
        <DialogTitle>
          {isCreate ? t('permissions.roles.createTitle') : t('permissions.roles.editTitle')}
        </DialogTitle>
        <DialogDescription>
          {isCreate
            ? t('permissions.roles.createDescription')
            : t('permissions.roles.editDescription')}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>
            {t('permissions.roles.name')} {!isCreate && '*'}
          </Label>
          <Input
            placeholder={t('permissions.roles.namePlaceholder')}
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            disabled={!isCreate && role?.is_system}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('permissions.roles.slug')}</Label>
          <Input
            placeholder={t('permissions.roles.slugPlaceholder') || 'Auto-generated if empty'}
            value={formData.slug}
            onChange={(e) => onFormDataChange({ ...formData, slug: e.target.value })}
            disabled={!isCreate && role?.is_system}
          />
          <p className="text-xs text-gray-500">
            {t('permissions.roles.slugHint') || 'Leave empty to auto-generate from name'}
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t('permissions.roles.description')}</Label>
          <Textarea
            placeholder={t('permissions.roles.descriptionPlaceholder')}
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id={isCreate ? 'is_active' : 'edit_is_active'}
            checked={formData.is_active}
            onCheckedChange={(checked) => onFormDataChange({ ...formData, is_active: checked })}
            disabled={!isCreate && role?.is_system}
          />
          <Label htmlFor={isCreate ? 'is_active' : 'edit_is_active'} className="cursor-pointer">
            {t('permissions.roles.isActive')}
          </Label>
        </div>

        <div className="flex gap-2">
          <Button
            className={isCreate ? 'w-full' : 'flex-1'}
            onClick={onSubmit}
            disabled={!formData.name.trim() || loading}
          >
            {loading
              ? t('common.loading')
              : isCreate
                ? t('permissions.roles.saveRole')
                : t('common.save')}
          </Button>
          {!isCreate && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  );

  if (isCreate) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
}

