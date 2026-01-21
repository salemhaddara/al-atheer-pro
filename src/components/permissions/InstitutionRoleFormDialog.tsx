'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface InstitutionRoleFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (name_en: string, name_ar: string) => Promise<void>;
    loading?: boolean;
}

export function InstitutionRoleFormDialog({
    isOpen,
    onOpenChange,
    onSubmit,
    loading = false,
}: InstitutionRoleFormDialogProps) {
    const { t, direction } = useLanguage();
    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');

    const handleSubmit = async () => {
        await onSubmit(nameEn, nameAr);
        // Reset form
        setNameEn('');
        setNameAr('');
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setNameEn('');
            setNameAr('');
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl" dir={direction}>
                <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <DialogTitle>{t('permissions.roles.createTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('permissions.roles.createDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>
                            {t('permissions.roles.name')} (English) *
                        </Label>
                        <Input
                            placeholder="e.g., Branch Manager"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            {t('permissions.roles.name')} (العربية) *
                        </Label>
                        <Input
                            placeholder="مثال: مدير فرع"
                            value={nameAr}
                            onChange={(e) => setNameAr(e.target.value)}
                            dir="rtl"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="flex-1"
                            onClick={handleSubmit}
                            disabled={!nameEn.trim() || !nameAr.trim() || loading}
                        >
                            {loading ? t('common.loading') : t('permissions.roles.saveRole')}
                        </Button>
                        <Button variant="outline" onClick={() => handleClose(false)}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
