'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers, createInstitution, batchUpdateSettings, type CreateInstitutionRequest, type User } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface InstitutionFormData {
    name_ar: string;
    name_en: string;
    activity_ar: string;
    activity_en: string;
    phone_number: string;
    secondary_phone_number: string;
    email: string;
    website: string;
    address: string;
    country: string;
    tax_number: string;
    business_registry: string;
    system_type: 'restaurant' | 'retail';
    default_currency: string;
    notes: string;
}

const COUNTRIES = [
    'Saudi Arabia',
    'United Arab Emirates',
    'Qatar',
    'Kuwait',
    'Bahrain',
    'Oman',
    'Jordan',
    'Lebanon',
    'Egypt',
    'Iraq',
    'Morocco',
    'Tunisia',
    'Algeria',
    'Palestine',
    'Sudan',
    'Yemen',
];

const isValidPhone = (value: string) => {
    const digits = (value.match(/\d/g) || []).length;
    if (digits < 7 || digits > 15) return false;
    return /^\+?[0-9\s\-()]+$/.test(value);
};

const isValidUrl = (value: string) => {
    try {
        const withScheme = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
        const u = new URL(withScheme);
        return !!u.hostname;
    } catch {
        return false;
    }
};

export default function NewCompanyPage() {
    const { t, direction } = useLanguage();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [selectedAdminUserId, setSelectedAdminUserId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState<InstitutionFormData>({
        name_ar: '',
        name_en: '',
        activity_ar: '',
        activity_en: '',
        phone_number: '',
        secondary_phone_number: '',
        email: '',
        website: '',
        address: '',
        country: 'Saudi Arabia',
        tax_number: '',
        business_registry: '',
        system_type: 'retail',
        default_currency: 'SAR',
        notes: '',
    });

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const result = await getUsers({ per_page: 100 });
                if (result.success && result.data) {
                    const usersData = result.data.users;
                    const usersList = Array.isArray(usersData) ? usersData : [];
                    setUsers(usersList);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setIsLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    const syncSettingsToInstitution = async (institutionId: number, data: InstitutionFormData) => {
        try {
            const settingsToSave = [
                { key: 'company_name_ar', value: data.name_ar, type: 'string' as const, group: 'company', label_en: 'Company Name (Arabic)', label_ar: 'اسم الشركة (عربي)' },
                { key: 'company_name_en', value: data.name_en, type: 'string' as const, group: 'company', label_en: 'Company Name (English)', label_ar: 'اسم الشركة (إنجليزي)' },
                { key: 'company_activity_ar', value: data.activity_ar, type: 'string' as const, group: 'company', label_en: 'Company Activity (Arabic)', label_ar: 'نشاط الشركة (عربي)' },
                { key: 'company_activity_en', value: data.activity_en, type: 'string' as const, group: 'company', label_en: 'Company Activity (English)', label_ar: 'نشاط الشركة (إنجليزي)' },
                { key: 'company_phone_number', value: data.phone_number, type: 'string' as const, group: 'company', label_en: 'Company Phone Number', label_ar: 'رقم هاتف الشركة' },
                { key: 'company_secondary_phone_number', value: data.secondary_phone_number, type: 'string' as const, group: 'company', label_en: 'Company Secondary Phone', label_ar: 'رقم هاتف الشركة الثانوي' },
                { key: 'company_email', value: data.email, type: 'string' as const, group: 'company', label_en: 'Company Email', label_ar: 'بريد الشركة الإلكتروني' },
                { key: 'company_website', value: data.website, type: 'string' as const, group: 'company', label_en: 'Company Website', label_ar: 'موقع الشركة الإلكتروني' },
                { key: 'company_address', value: data.address, type: 'text' as const, group: 'company', label_en: 'Company Address', label_ar: 'عنوان الشركة' },
                { key: 'company_tax_number', value: data.tax_number, type: 'string' as const, group: 'company', label_en: 'Company Tax Number', label_ar: 'الرقم الضريبي للشركة' },
                { key: 'company_business_registry', value: data.business_registry, type: 'string' as const, group: 'company', label_en: 'Company Business Registry', label_ar: 'السجل التجاري للشركة' },
                { key: 'company_default_currency', value: data.default_currency, type: 'string' as const, group: 'company', label_en: 'Company Default Currency', label_ar: 'العملة الافتراضية للشركة' },
                { key: 'company_notes', value: data.notes, type: 'text' as const, group: 'company', label_en: 'Company Notes', label_ar: 'ملاحظات الشركة' },
                { key: 'system_type', value: data.system_type, type: 'string' as const, group: 'company', label_en: 'System Type', label_ar: 'نوع النظام' },
            ].map(setting => ({
                ...setting,
                scope: 'institution' as const,
                institution_id: institutionId,
            }));

            await batchUpdateSettings({ settings: settingsToSave });
            if (typeof window !== 'undefined') {
                const currentInstId = localStorage.getItem('selected_institution_id');
                if (currentInstId && Number(currentInstId) === institutionId) {
                    window.dispatchEvent(new Event('settingsUpdated'));
                    window.dispatchEvent(new CustomEvent('institutionChanged', { detail: { institutionId } }));
                }
            }
        } catch (error) {
            console.error('Error syncing settings to institution:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name_ar.trim() || !formData.name_en.trim()) {
            toast.error(t('institutions.messages.validation.nameArRequired'));
            return;
        }
        if (!formData.activity_ar.trim() || !formData.activity_en.trim()) {
            toast.error(t('institutions.messages.validation.activityRequired'));
            return;
        }
        if (!formData.phone_number.trim()) {
            toast.error(t('institutions.messages.validation.phoneRequired'));
            return;
        }
        if (!isValidPhone(formData.phone_number.trim())) {
            toast.error(t('institutions.messages.validation.phoneInvalid') || 'رقم الهاتف غير صالح');
            return;
        }
        if (formData.secondary_phone_number.trim() && !isValidPhone(formData.secondary_phone_number.trim())) {
            toast.error(t('institutions.messages.validation.secondaryPhoneInvalid') || 'رقم الهاتف الثانوي غير صالح');
            return;
        }
        if (!formData.email.trim()) {
            toast.error(t('institutions.messages.validation.emailRequired'));
            return;
        }
        if (formData.website.trim() && !isValidUrl(formData.website.trim())) {
            toast.error(t('institutions.messages.validation.websiteInvalid') || 'الموقع الإلكتروني غير صالح');
            return;
        }
        if (!formData.country.trim()) {
            toast.error(t('institutions.messages.validation.countryRequired'));
            return;
        }
        if (!selectedAdminUserId) {
            toast.error(t('institutions.messages.validation.adminUserRequired'));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreateInstitutionRequest = {
                name_ar: formData.name_ar.trim(),
                name_en: formData.name_en.trim(),
                activity_ar: formData.activity_ar.trim(),
                activity_en: formData.activity_en.trim(),
                phone_number: formData.phone_number.trim(),
                email: formData.email.trim(),
                country: formData.country.trim(),
                system_type: formData.system_type,
                admin_user_id: parseInt(selectedAdminUserId, 10),
            };
            if (formData.secondary_phone_number.trim()) payload.secondary_phone_number = formData.secondary_phone_number.trim();
            if (formData.website.trim()) payload.website = formData.website.trim();
            if (formData.address.trim()) payload.address = formData.address.trim();
            if (formData.tax_number.trim()) payload.tax_number = formData.tax_number.trim();
            if (formData.business_registry.trim()) payload.business_registry = formData.business_registry.trim();
            if (formData.default_currency.trim()) payload.default_currency = formData.default_currency.trim();
            if (formData.notes.trim()) payload.notes = formData.notes.trim();

            const result = await createInstitution(payload, logoFile || undefined);
            if (result.success) {
                toast.success(t('institutions.messages.createSuccess'));
                if (result.data?.institution) {
                    await syncSettingsToInstitution(result.data.institution.id, formData);
                }
                router.push('/companies');
            } else {
                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat();
                    toast.error(errorMessages[0] || result.message);
                } else {
                    toast.error(result.message || t('institutions.messages.createFailed'));
                }
            }
        } catch (error) {
            console.error('Error creating institution:', error);
            toast.error(t('institutions.messages.createFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className={`${direction === 'rtl' ? 'text-right' : 'text-left'} flex-1`}>
                    <h1>{t('institutions.addTitle')}</h1>
                    <p className="text-gray-600">{t('institutions.addDescription')}</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => router.push('/companies')}>
                    {direction === 'rtl' ? <ArrowRight className="w-4 h-4" /> : null}
                    {t('institutions.messages.back') || 'رجوع'}
                </Button>
            </div>


            <div className="space-y-4 py-12" dir={direction}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('institutions.form.nameAr')}</Label>
                        <Input
                            placeholder={t('institutions.form.nameArPlaceholder')}
                            value={formData.name_ar}
                            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('institutions.form.nameEn')}</Label>
                        <Input
                            placeholder={t('institutions.form.nameEnPlaceholder')}
                            value={formData.name_en}
                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('institutions.form.activityAr')}</Label>
                        <Input
                            placeholder={t('institutions.form.activityArPlaceholder')}
                            value={formData.activity_ar}
                            onChange={(e) => setFormData({ ...formData, activity_ar: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('institutions.form.activityEn')}</Label>
                        <Input
                            placeholder={t('institutions.form.activityEnPlaceholder')}
                            value={formData.activity_en}
                            onChange={(e) => setFormData({ ...formData, activity_en: e.target.value })}
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('institutions.form.phoneNumber')}</Label>
                        <Input
                            placeholder={t('institutions.form.phoneNumberPlaceholder')}
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('institutions.form.secondaryPhoneNumber')}</Label>
                        <Input
                            placeholder={t('institutions.form.secondaryPhoneNumberPlaceholder')}
                            value={formData.secondary_phone_number}
                            onChange={(e) => setFormData({ ...formData, secondary_phone_number: e.target.value })}
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('institutions.form.email')}</Label>
                        <Input
                            type="email"
                            placeholder={t('institutions.form.emailPlaceholder')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('institutions.form.website')}</Label>
                        <Input
                            placeholder={t('institutions.form.websitePlaceholder')}
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{t('institutions.form.address')}</Label>
                    <Input
                        placeholder={t('institutions.form.addressPlaceholder')}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('institutions.form.country')}</Label>
                        <Select
                            value={formData.country}
                            onValueChange={(value) => setFormData({ ...formData, country: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('institutions.form.countryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('institutions.form.systemType')}</Label>
                        <Select
                            value={formData.system_type}
                            onValueChange={(value: 'restaurant' | 'retail') => setFormData({ ...formData, system_type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="retail">{t('institutions.form.systemTypeRetail')}</SelectItem>
                                <SelectItem value="restaurant">{t('institutions.form.systemTypeRestaurant')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('institutions.form.taxNumber')}</Label>
                        <Input
                            placeholder={t('institutions.form.taxNumberPlaceholder')}
                            value={formData.tax_number}
                            onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('institutions.form.businessRegistry')}</Label>
                        <Input
                            placeholder={t('institutions.form.businessRegistryPlaceholder')}
                            value={formData.business_registry}
                            onChange={(e) => setFormData({ ...formData, business_registry: e.target.value })}
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('institutions.form.defaultCurrency')}</Label>
                        <Input
                            placeholder={t('institutions.form.defaultCurrencyPlaceholder')}
                            value={formData.default_currency}
                            onChange={(e) => setFormData({ ...formData, default_currency: e.target.value })}
                            maxLength={3}
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{t('institutions.form.notes')}</Label>
                    <Input
                        placeholder={t('institutions.form.notesPlaceholder')}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label>{t('institutions.form.logo') || 'Logo'}</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const sizeMb = file.size / (1024 * 1024);
                                    if (sizeMb > 5) {
                                        toast.error(t('institutions.messages.imageTooLarge'));
                                        return;
                                    }
                                    if (!file.type.startsWith('image/')) {
                                        toast.error(t('institutions.messages.invalidImageType'));
                                        return;
                                    }
                                    setLogoFile(file);
                                    const url = URL.createObjectURL(file);
                                    setLogoPreviewUrl(url);
                                }
                            }}
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer relative block user-select-none">
                            {logoPreviewUrl ? (
                                <div className="relative inline-block w-40 h-40">
                                    <img
                                        src={logoPreviewUrl}
                                        alt="Institution Logo"
                                        className="w-full h-full object-contain rounded-md"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-md text-white font-medium">
                                        {t('institutions.form.changeLogo') || 'Change Logo'}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">{t('institutions.form.uploadLogo') || 'Click to upload logo'}</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{t('institutions.form.adminUser')} *</Label>
                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className={`${direction === 'rtl' ? 'mr-2' : 'ml-2'} text-sm text-gray-500`}>
                                {t('institutions.form.loadingUsers')}
                            </span>
                        </div>
                    ) : (
                        <SearchableSelect
                            options={users.map(user => ({
                                id: String(user.id),
                                name: user.full_name,
                                phone: user.phone_number || undefined,
                                email: user.email
                            }))}
                            value={selectedAdminUserId}
                            onValueChange={setSelectedAdminUserId}
                            placeholder={t('institutions.form.adminUserPlaceholder')}
                            searchPlaceholder={t('institutions.form.adminUserSearchPlaceholder')}
                            emptyMessage={t('institutions.form.noUsersFound')}
                            searchKeys={['name', 'email', 'phone']}
                            dir={direction}
                        />
                    )}
                </div>

                <div className="flex gap-2 pt-4">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push('/companies')}
                        disabled={isSubmitting}
                    >
                        {t('institutions.messages.cancel')}
                    </Button>
                    <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'} animate-spin`} />
                                {t('institutions.messages.saving')}
                            </>
                        ) : (
                            t('institutions.messages.save')
                        )}
                    </Button>
                </div>
            </div>

        </div>
    );
}
