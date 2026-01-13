'use client';

// React & Hooks
import { useState, useEffect, useMemo } from 'react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// Icons
import { Building2, Bell, Lock, Palette, DollarSign, Percent, Plus, FileText, Edit, Trash2, Search, Loader2 } from 'lucide-react';

// Utilities
import { toast } from 'sonner';
import { compressAndConvertToBase64 } from '@/lib/image-utils';

// Contexts
import { useLanguage } from '../contexts/LanguageContext';

// Data Management
import {
  loadOtherSources,
  addOtherSource,
  updateOtherSource,
  deleteOtherSource,
  loadOtherRecipients,
  addOtherRecipient,
  updateOtherRecipient,
  deleteOtherRecipient,
  type OtherSource,
  type OtherRecipient
} from '../data/vouchers';

import { getSettingByKey, createSetting, updateSetting, getSettings, batchUpdateSettings, getInstitution, updateInstitution, type Setting, type Institution } from '../lib/api';

export function Settings() {
  const { t, direction, language, setLanguage } = useLanguage();
  const [systemType, setSystemType] = useState<'restaurant' | 'retail'>('retail');
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);
  const [priceModificationIncludesTax, setPriceModificationIncludesTax] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Cache existing settings to avoid checking existence on save
  const [existingSettingsMap, setExistingSettingsMap] = useState<Map<string, Setting>>(new Map());

  // Company settings state
  const [companySettings, setCompanySettings] = useState({
    name_ar: '',
    name_en: '',
    activity_ar: '',
    activity_en: '',
    phone_number: '',
    secondary_phone_number: '',
    email: '',
    website: '',
    address: '',
    tax_number: '',
    business_registry: '',
    default_currency: 'SAR',
    notes: '',
    logo: null as string | null,
  });
  // Financial settings state
  const [financialSettings, setFinancialSettings] = useState({
    fiscal_year: 'gregorian',
    costing_method: 'fifo',
    auto_entries: true,
    approve_entries: false,
  });

  // Tax settings state
  const [taxSettings, setTaxSettings] = useState({
    default_vat_rate: '15',
    institution_tax_number: '300123456700003',
    enable_vat: true,
    show_prices_with_vat: false,
    show_vat_details: true,
    discount_timing: 'before-tax',
    tobacco_tax: false,
    e_invoicing: true,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    low_stock: true,
    payments: true,
    daily_reports: false,
    email_notifications: true,
    sms_notifications: false,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    two_factor: false,
    auto_logout: true,
  });

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    font_size: 'medium',
    date_format: 'dd-mm-yyyy',
  });

  // Vouchers management state
  const [otherSources, setOtherSources] = useState<OtherSource[]>([]);
  const [otherRecipients, setOtherRecipients] = useState<OtherRecipient[]>([]);
  const [sourceSearchTerm, setSourceSearchTerm] = useState('');
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<OtherSource | null>(null);
  const [editingRecipient, setEditingRecipient] = useState<OtherRecipient | null>(null);
  const [sourceFormData, setSourceFormData] = useState({ name: '', description: '' });
  const [recipientFormData, setRecipientFormData] = useState({ name: '', description: '' });

  // Helper function to ensure value is always a string (never null/undefined)
  const ensureString = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  // Helper function to get setting value from API (legacy - kept for backward compatibility)
  const getSettingValue = async (key: string, defaultValue: any, scope: 'system' | 'institution' | 'branch' | 'user' = 'system') => {
    try {
      const result = await getSettingByKey(key, { scope });
      if (result.success && result.data?.setting) {
        return result.data.setting.value;
      }
      return defaultValue;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error fetching setting ${key}:`, error);
      }
      return defaultValue;
    }
  };

  // Helper function to save setting to API (optimized - uses cache instead of checking existence)
  const saveSettingValue = async (
    key: string,
    value: any,
    type: 'string' | 'integer' | 'boolean' | 'json' | 'text' = 'string',
    group: string = 'general',
    scope: 'system' | 'institution' | 'branch' | 'user' = 'system',
    label_en?: string,
    label_ar?: string
  ) => {
    try {
      // Use cached existing settings to avoid extra API call
      const existingSetting = existingSettingsMap.get(key);

      if (existingSetting) {
        // Update existing setting
        const updateResult = await updateSetting(existingSetting.id, { value });
        if (updateResult.success) {
          // Update cache
          setExistingSettingsMap(prev => {
            const newMap = new Map(prev);
            if (updateResult.data?.setting) {
              newMap.set(key, updateResult.data.setting);
            }
            return newMap;
          });
        }
        return updateResult.success;
      } else {
        // Create new setting
        const createResult = await createSetting({
          key,
          value,
          type,
          group,
          scope,
          label_en,
          label_ar,
        });
        if (createResult.success && createResult.data?.setting) {
          // Update cache
          setExistingSettingsMap(prev => {
            const newMap = new Map(prev);
            newMap.set(key, createResult.data.setting);
            return newMap;
          });
        }
        return createResult.success;
      }
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      return false;
    }
  };

  // Function to fetch institution data and populate company settings
  const loadInstitutionData = async (institutionId: number | null) => {
    if (!institutionId) return;

    try {
      const result = await getInstitution(institutionId);
      if (result.success && result.data?.institution) {
        const institution = result.data.institution;

        // Populate company settings from institution data
        // Use institution values if they exist, otherwise keep previous values
        setCompanySettings(prev => ({
          name_ar: institution.name_ar ? String(institution.name_ar) : prev.name_ar,
          name_en: institution.name_en ? String(institution.name_en) : prev.name_en,
          activity_ar: institution.activity_ar ? String(institution.activity_ar) : prev.activity_ar,
          activity_en: institution.activity_en ? String(institution.activity_en) : prev.activity_en,
          phone_number: institution.phone_number ? String(institution.phone_number) : prev.phone_number,
          secondary_phone_number: institution.secondary_phone_number ? String(institution.secondary_phone_number) : prev.secondary_phone_number,
          email: institution.email ? String(institution.email) : prev.email,
          website: institution.website ? String(institution.website) : prev.website,
          address: institution.address ? String(institution.address) : prev.address,
          tax_number: institution.tax_number ? String(institution.tax_number) : prev.tax_number,
          business_registry: institution.business_registry ? String(institution.business_registry) : prev.business_registry,
          default_currency: institution.default_currency ? String(institution.default_currency) : (prev.default_currency || 'SAR'),
          notes: institution.notes ? String(institution.notes) : prev.notes,
          logo: institution.logo_url || null,
        }));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading institution data:', error);
      }
    }
  };

  useEffect(() => {
    const loadSettings = async (skipInstitutionLoad: boolean = false) => {
      setIsLoadingSettings(true);
      try {
        // Get current institution from localStorage
        const selectedInstitutionId = typeof window !== 'undefined'
          ? localStorage.getItem('selected_institution_id')
          : null;

        // Fetch institution data first to populate company settings (unless skipped)
        if (selectedInstitutionId && !skipInstitutionLoad) {
          await loadInstitutionData(Number(selectedInstitutionId));
        }

        // Fetch settings based on institution
        const params: any = { per_page: 100 };
        if (selectedInstitutionId) {
          params.scope = 'institution';
          params.institution_id = Number(selectedInstitutionId);
        } else {
          params.scope = 'system';
        }

        // Fetch all settings in ONE API call instead of 30+ sequential calls
        const result = await getSettings(params);

        // Handle empty settings (valid case - no settings created yet)
        let settingsData: Setting[] = [];

        if (result.success && 'data' in result) {
          settingsData = result.data?.settings?.data || [];
        } else {
          // Don't throw - just use defaults, settings might not exist yet
          // This is normal for new institutions
        }

        // Create a map of settings by key for fast lookup
        const settingsMap = new Map<string, any>();
        const existingSettings = new Map<string, Setting>();
        settingsData.forEach((setting: Setting) => {
          settingsMap.set(setting.key, setting.value);
          existingSettings.set(setting.key, setting);
        });

        // Cache existing settings for save optimization
        setExistingSettingsMap(existingSettings);

        // Helper to get setting value with default
        const getValue = (key: string, defaultValue: any) => {
          const value = settingsMap.get(key);
          if (value === undefined) {
            return defaultValue;
          }
          // Convert null to empty string for string inputs, or return the value
          if (value === null && typeof defaultValue === 'string') {
            return '';
          }
          return value;
        };
        // Helper to parse boolean values
        const getBoolean = (key: string, defaultValue: boolean) => {
          const value = getValue(key, defaultValue);
          return value === true || value === 'true' || value === '1';
        };

        // Load system_type setting
        const savedType = getValue('system_type', 'retail');
        if (savedType) {
          setSystemType(savedType as 'restaurant' | 'retail');
        }

        // Load prices_include_tax setting
        setPricesIncludeTax(getBoolean('prices_include_tax', true));

        // Load price_modification_includes_tax setting
        setPriceModificationIncludesTax(getBoolean('price_modification_includes_tax', true));

        // Load company settings from settings (will override institution data if settings exist)
        // Only update if settings have values, otherwise keep institution data
        setCompanySettings(prev => ({
          name_ar: String(getValue('company_name_ar', prev.name_ar) || prev.name_ar),
          name_en: String(getValue('company_name_en', prev.name_en) || prev.name_en),
          activity_ar: String(getValue('company_activity_ar', prev.activity_ar) || prev.activity_ar),
          activity_en: String(getValue('company_activity_en', prev.activity_en) || prev.activity_en),
          phone_number: String(getValue('company_phone_number', prev.phone_number) || prev.phone_number),
          secondary_phone_number: String(getValue('company_secondary_phone_number', prev.secondary_phone_number) || prev.secondary_phone_number),
          email: String(getValue('company_email', prev.email) || prev.email),
          website: String(getValue('company_website', prev.website) || prev.website),
          address: String(getValue('company_address', prev.address) || prev.address),
          tax_number: String(getValue('company_tax_number', prev.tax_number) || prev.tax_number),
          business_registry: String(getValue('company_business_registry', prev.business_registry) || prev.business_registry),
          default_currency: String(getValue('company_default_currency', prev.default_currency) || prev.default_currency || 'SAR'),
          notes: String(getValue('company_notes', prev.notes) || prev.notes),
          logo: prev.logo, // Logo is not stored in settings, only in institution
        }));

        // Load financial settings - ensure string values are never null
        setFinancialSettings({
          fiscal_year: String(getValue('financial_fiscal_year', 'gregorian') || 'gregorian'),
          costing_method: String(getValue('financial_costing_method', 'fifo') || 'fifo'),
          auto_entries: getBoolean('financial_auto_entries', true),
          approve_entries: getBoolean('financial_approve_entries', false),
        });

        // Load tax settings - ensure string values are never null
        setTaxSettings({
          default_vat_rate: String(getValue('tax_default_vat_rate', '15') || '15'),
          institution_tax_number: String(getValue('tax_institution_tax_number', '300123456700003') || '300123456700003'),
          enable_vat: getBoolean('tax_enable_vat', true),
          show_prices_with_vat: getBoolean('tax_show_prices_with_vat', false),
          show_vat_details: getBoolean('tax_show_vat_details', true),
          discount_timing: String(getValue('tax_discount_timing', 'before-tax') || 'before-tax'),
          tobacco_tax: getBoolean('tax_tobacco_tax', false),
          e_invoicing: getBoolean('tax_e_invoicing', true),
        });

        // Load notification settings
        setNotificationSettings({
          low_stock: getBoolean('notification_low_stock', true),
          payments: getBoolean('notification_payments', true),
          daily_reports: getBoolean('notification_daily_reports', false),
          email_notifications: getBoolean('notification_email_notifications', true),
          sms_notifications: getBoolean('notification_sms_notifications', false),
        });

        // Load security settings
        setSecuritySettings({
          two_factor: getBoolean('security_two_factor', false),
          auto_logout: getBoolean('security_auto_logout', true),
        });

        // Load appearance settings - ensure string values are never null
        setAppearanceSettings({
          theme: String(getValue('appearance_theme', 'light') || 'light'),
          font_size: String(getValue('appearance_font_size', 'medium') || 'medium'),
          date_format: String(getValue('appearance_date_format', 'dd-mm-yyyy') || 'dd-mm-yyyy'),
        });
      } catch (error) {
        // Log error but don't show toast - settings might not exist yet for new institutions
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading settings:', error);
        }
        // Fallback to localStorage if API fails (legacy support)
        if (typeof window !== 'undefined') {
          const savedType = localStorage.getItem('system_type') as 'restaurant' | 'retail' | null;
          if (savedType) {
            setSystemType(savedType);
          }
          const savedPricesIncludeTax = localStorage.getItem('prices_include_tax');
          if (savedPricesIncludeTax !== null) {
            setPricesIncludeTax(savedPricesIncludeTax === 'true');
          }
          const savedPriceModificationIncludesTax = localStorage.getItem('price_modification_includes_tax');
          if (savedPriceModificationIncludesTax !== null) {
            setPriceModificationIncludesTax(savedPriceModificationIncludesTax === 'true');
          }
        }
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();

    // Load other sources and recipients
    setOtherSources(loadOtherSources());
    setOtherRecipients(loadOtherRecipients());

    // Listen for institution changes
    const handleInstitutionChange = async (event?: Event) => {
      const customEvent = event as CustomEvent<{ institutionId: number | null }> | undefined;
      const institutionId = customEvent?.detail?.institutionId
        ? customEvent.detail.institutionId
        : (typeof window !== 'undefined' ? localStorage.getItem('selected_institution_id') : null);

      // Load institution data first, then load settings (skip institution load in loadSettings)
      if (institutionId) {
        await loadInstitutionData(Number(institutionId));
      }
      await loadSettings(true); // Skip institution load since we just loaded it
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('institutionChanged', handleInstitutionChange);
      return () => {
        window.removeEventListener('institutionChanged', handleInstitutionChange);
      };
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get current institution from localStorage
      const selectedInstitutionId = typeof window !== 'undefined'
        ? localStorage.getItem('selected_institution_id')
        : null;

      // Determine scope and institution_id
      const scope = selectedInstitutionId ? ('institution' as const) : ('system' as const);
      const institutionId = selectedInstitutionId ? Number(selectedInstitutionId) : undefined;

      // Prepare all settings for batch update in ONE API call
      const settingsToSave: Array<{
        id?: number;
        key: string;
        value: any;
        type: 'string' | 'integer' | 'boolean' | 'json' | 'text';
        group: string;
        scope: 'system' | 'institution';
        institution_id?: number;
        label_en: string;
        label_ar: string;
      }> = [
          { key: 'system_type', value: systemType, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'System Type', label_ar: 'نوع النظام' },
          { key: 'prices_include_tax', value: pricesIncludeTax, type: 'boolean' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Prices Include Tax', label_ar: 'الأسعار شاملة الضريبة' },
          { key: 'price_modification_includes_tax', value: priceModificationIncludesTax, type: 'boolean' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Price Modification Includes Tax', label_ar: 'تعديل السعر يشمل الضريبة' },
          // Company settings
          { key: 'company_name_ar', value: companySettings.name_ar, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Name (Arabic)', label_ar: 'اسم الشركة (عربي)' },
          { key: 'company_name_en', value: companySettings.name_en, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Name (English)', label_ar: 'اسم الشركة (إنجليزي)' },
          { key: 'company_activity_ar', value: companySettings.activity_ar, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Activity (Arabic)', label_ar: 'نشاط الشركة (عربي)' },
          { key: 'company_activity_en', value: companySettings.activity_en, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Activity (English)', label_ar: 'نشاط الشركة (إنجليزي)' },
          { key: 'company_phone_number', value: companySettings.phone_number, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Phone Number', label_ar: 'رقم هاتف الشركة' },
          { key: 'company_secondary_phone_number', value: companySettings.secondary_phone_number, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Secondary Phone', label_ar: 'رقم هاتف الشركة الثانوي' },
          { key: 'company_email', value: companySettings.email, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Email', label_ar: 'بريد الشركة الإلكتروني' },
          { key: 'company_website', value: companySettings.website, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Website', label_ar: 'موقع الشركة الإلكتروني' },
          { key: 'company_address', value: companySettings.address, type: 'text' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Address', label_ar: 'عنوان الشركة' },
          { key: 'company_tax_number', value: companySettings.tax_number, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Tax Number', label_ar: 'الرقم الضريبي للشركة' },
          { key: 'company_business_registry', value: companySettings.business_registry, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Business Registry', label_ar: 'السجل التجاري للشركة' },
          { key: 'company_default_currency', value: companySettings.default_currency, type: 'string' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Default Currency', label_ar: 'العملة الافتراضية للشركة' },
          { key: 'company_notes', value: companySettings.notes, type: 'text' as const, group: 'company', scope, institution_id: institutionId, label_en: 'Company Notes', label_ar: 'ملاحظات الشركة' },

          // Financial settings
          { key: 'financial_fiscal_year', value: financialSettings.fiscal_year, type: 'string' as const, group: 'financial', scope, institution_id: institutionId, label_en: 'Fiscal Year', label_ar: 'السنة المالية' },
          { key: 'financial_costing_method', value: financialSettings.costing_method, type: 'string' as const, group: 'financial', scope, institution_id: institutionId, label_en: 'Costing Method', label_ar: 'طريقة التكلفة' },
          { key: 'financial_auto_entries', value: financialSettings.auto_entries, type: 'boolean' as const, group: 'financial', scope, institution_id: institutionId, label_en: 'Auto Entries', label_ar: 'القيد التلقائي' },
          { key: 'financial_approve_entries', value: financialSettings.approve_entries, type: 'boolean' as const, group: 'financial', scope, institution_id: institutionId, label_en: 'Approve Entries', label_ar: 'اعتماد القيود' },
          // Tax settings
          { key: 'tax_default_vat_rate', value: taxSettings.default_vat_rate, type: 'string' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Default VAT Rate', label_ar: 'نسبة ضريبة القيمة المضافة الافتراضية' },
          { key: 'tax_institution_tax_number', value: taxSettings.institution_tax_number, type: 'string' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Institution Tax Number', label_ar: 'الرقم الضريبي للمؤسسة' },
          { key: 'tax_enable_vat', value: taxSettings.enable_vat, type: 'boolean' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Enable VAT', label_ar: 'تفعيل ضريبة القيمة المضافة' },
          { key: 'tax_show_prices_with_vat', value: taxSettings.show_prices_with_vat, type: 'boolean' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Show Prices With VAT', label_ar: 'عرض الأسعار مع الضريبة' },
          { key: 'tax_show_vat_details', value: taxSettings.show_vat_details, type: 'boolean' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Show VAT Details', label_ar: 'عرض تفاصيل الضريبة' },
          { key: 'tax_discount_timing', value: taxSettings.discount_timing, type: 'string' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Discount Timing', label_ar: 'توقيت الخصم' },
          { key: 'tax_tobacco_tax', value: taxSettings.tobacco_tax, type: 'boolean' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'Tobacco Tax', label_ar: 'ضريبة التبغ' },
          { key: 'tax_e_invoicing', value: taxSettings.e_invoicing, type: 'boolean' as const, group: 'taxes', scope, institution_id: institutionId, label_en: 'E-Invoicing', label_ar: 'الفواتير الإلكترونية' },
          // Notification settings
          { key: 'notification_low_stock', value: notificationSettings.low_stock, type: 'boolean' as const, group: 'notifications', scope, institution_id: institutionId, label_en: 'Low Stock Notifications', label_ar: 'إشعارات المخزون المنخفض' },
          { key: 'notification_payments', value: notificationSettings.payments, type: 'boolean' as const, group: 'notifications', scope, institution_id: institutionId, label_en: 'Payment Notifications', label_ar: 'إشعارات المدفوعات' },
          { key: 'notification_daily_reports', value: notificationSettings.daily_reports, type: 'boolean' as const, group: 'notifications', scope, institution_id: institutionId, label_en: 'Daily Reports', label_ar: 'التقارير اليومية' },
          { key: 'notification_email_notifications', value: notificationSettings.email_notifications, type: 'boolean' as const, group: 'notifications', scope, institution_id: institutionId, label_en: 'Email Notifications', label_ar: 'الإشعارات البريدية' },
          { key: 'notification_sms_notifications', value: notificationSettings.sms_notifications, type: 'boolean' as const, group: 'notifications', scope, institution_id: institutionId, label_en: 'SMS Notifications', label_ar: 'إشعارات الرسائل النصية' },
          // Security settings
          { key: 'security_two_factor', value: securitySettings.two_factor, type: 'boolean' as const, group: 'security', scope, institution_id: institutionId, label_en: 'Two Factor Authentication', label_ar: 'المصادقة الثنائية' },
          { key: 'security_auto_logout', value: securitySettings.auto_logout, type: 'boolean' as const, group: 'security', scope, institution_id: institutionId, label_en: 'Auto Logout', label_ar: 'تسجيل الخروج التلقائي' },
          // Appearance settings
          { key: 'appearance_theme', value: appearanceSettings.theme, type: 'string' as const, group: 'appearance', scope, institution_id: institutionId, label_en: 'Theme', label_ar: 'المظهر' },
          { key: 'appearance_font_size', value: appearanceSettings.font_size, type: 'string' as const, group: 'appearance', scope, institution_id: institutionId, label_en: 'Font Size', label_ar: 'حجم الخط' },
          { key: 'appearance_date_format', value: appearanceSettings.date_format, type: 'string' as const, group: 'appearance', scope, institution_id: institutionId, label_en: 'Date Format', label_ar: 'تنسيق التاريخ' },
        ];

      // Save all settings in ONE batch API call
      const result = await batchUpdateSettings({ settings: settingsToSave });

      if (result.success && result.data?.settings) {
        // Update cache with saved settings
        const updatedMap = new Map<string, Setting>();
        result.data.settings.forEach((setting: Setting) => {
          updatedMap.set(setting.key, setting);
        });
        setExistingSettingsMap(updatedMap);

        // Also update the Institution table if we have an institution ID
        if (institutionId) {
          try {
            // Fetch current institution to get required fields (country)
            const institutionResult = await getInstitution(institutionId);
            if (institutionResult.success && institutionResult.data?.institution) {
              const currentInstitution = institutionResult.data.institution;

              // Update institution with company settings
              // For required fields: use company settings if not empty, otherwise keep current
              // For optional fields: use company settings (can be empty to clear)
              const institutionUpdateData: Partial<{
                name_ar: string;
                name_en: string;
                activity_ar: string;
                activity_en: string;
                phone_number: string;
                secondary_phone_number?: string;
                email: string;
                website?: string;
                address?: string;
                country: string;
                tax_number?: string;
                business_registry?: string;
                system_type: 'restaurant' | 'retail';
                default_currency?: string;
                notes?: string;
                logo?: string;
              }> = {
                name_ar: companySettings.name_ar.trim() || currentInstitution.name_ar,
                name_en: companySettings.name_en.trim() || currentInstitution.name_en,
                activity_ar: companySettings.activity_ar.trim() || currentInstitution.activity_ar,
                activity_en: companySettings.activity_en.trim() || currentInstitution.activity_en,
                phone_number: companySettings.phone_number.trim() || currentInstitution.phone_number,
                email: companySettings.email.trim() || currentInstitution.email,
                country: currentInstitution.country, // Keep existing country
                system_type: systemType || currentInstitution.system_type,
              };

              // Optional fields - always include them (empty string to clear, or the value)
              institutionUpdateData.secondary_phone_number = companySettings.secondary_phone_number.trim();
              institutionUpdateData.website = companySettings.website.trim();
              institutionUpdateData.address = companySettings.address.trim();
              institutionUpdateData.tax_number = companySettings.tax_number.trim();
              institutionUpdateData.business_registry = companySettings.business_registry.trim();
              institutionUpdateData.default_currency = companySettings.default_currency.trim();
              institutionUpdateData.default_currency = companySettings.default_currency.trim();
              institutionUpdateData.notes = companySettings.notes.trim();

              if (companySettings.logo) {
                institutionUpdateData.logo = companySettings.logo;
              }

              // Update the institution
              const updateResult = await updateInstitution(institutionId, institutionUpdateData);
              if (!updateResult.success) {
                console.error('Failed to update institution:', updateResult.message);
                // Don't throw - settings were saved successfully, just log the error
              }
            }
          } catch (error) {
            console.error('Error updating institution:', error);
            // Don't throw - settings were saved successfully, just log the error
          }
        }

        // Dispatch event to update company name in navbar
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('settingsUpdated'));
        }

        toast.success(t('settings.saveSuccess') || 'Settings saved successfully');
      } else {
        const errorMessage = result.message || t('settings.saveError') || 'Failed to save settings';
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (t('settings.saveError') || 'Failed to save settings');
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Other Sources handlers
  const filteredSources = useMemo(() => {
    if (!sourceSearchTerm.trim()) return otherSources;
    const searchLower = sourceSearchTerm.toLowerCase();
    return otherSources.filter(s =>
      s.name.toLowerCase().includes(searchLower) ||
      (s.description && s.description.toLowerCase().includes(searchLower))
    );
  }, [otherSources, sourceSearchTerm]);

  const handleAddSource = () => {
    setEditingSource(null);
    setSourceFormData({ name: '', description: '' });
    setIsSourceDialogOpen(true);
  };

  const handleEditSource = (source: OtherSource) => {
    setEditingSource(source);
    setSourceFormData({ name: source.name, description: source.description || '' });
    setIsSourceDialogOpen(true);
  };

  const handleDeleteSource = (id: string) => {
    if (!confirm(t('settings.vouchers.deleteSourceConfirm'))) return;
    if (deleteOtherSource(id)) {
      setOtherSources(loadOtherSources());
      toast.success(t('settings.vouchers.deleteSourceSuccess'));
    } else {
      toast.error(t('settings.vouchers.deleteSourceError'));
    }
  };

  const handleSaveSource = () => {
    if (!sourceFormData.name.trim()) {
      toast.error(t('settings.vouchers.sourceNameRequired'));
      return;
    }

    if (editingSource) {
      if (updateOtherSource(editingSource.id, sourceFormData)) {
        setOtherSources(loadOtherSources());
        toast.success(t('settings.vouchers.updateSourceSuccess'));
      } else {
        toast.error(t('settings.vouchers.updateSourceError'));
      }
    } else {
      addOtherSource(sourceFormData);
      setOtherSources(loadOtherSources());
      toast.success(t('settings.vouchers.addSourceSuccess'));
    }

    setIsSourceDialogOpen(false);
    setEditingSource(null);
    setSourceFormData({ name: '', description: '' });
  };

  // Other Recipients handlers
  const filteredRecipients = useMemo(() => {
    if (!recipientSearchTerm.trim()) return otherRecipients;
    const searchLower = recipientSearchTerm.toLowerCase();
    return otherRecipients.filter(r =>
      r.name.toLowerCase().includes(searchLower) ||
      (r.description && r.description.toLowerCase().includes(searchLower))
    );
  }, [otherRecipients, recipientSearchTerm]);

  const handleAddRecipient = () => {
    setEditingRecipient(null);
    setRecipientFormData({ name: '', description: '' });
    setIsRecipientDialogOpen(true);
  };

  const handleEditRecipient = (recipient: OtherRecipient) => {
    setEditingRecipient(recipient);
    setRecipientFormData({ name: recipient.name, description: recipient.description || '' });
    setIsRecipientDialogOpen(true);
  };

  const handleDeleteRecipient = (id: string) => {
    if (!confirm(t('settings.vouchers.deleteRecipientConfirm'))) return;
    if (deleteOtherRecipient(id)) {
      setOtherRecipients(loadOtherRecipients());
      toast.success(t('settings.vouchers.deleteRecipientSuccess'));
    } else {
      toast.error(t('settings.vouchers.deleteRecipientError'));
    }
  };

  const handleSaveRecipient = () => {
    if (!recipientFormData.name.trim()) {
      toast.error(t('settings.vouchers.recipientNameRequired'));
      return;
    }

    if (editingRecipient) {
      if (updateOtherRecipient(editingRecipient.id, recipientFormData)) {
        setOtherRecipients(loadOtherRecipients());
        toast.success(t('settings.vouchers.updateRecipientSuccess'));
      } else {
        toast.error(t('settings.vouchers.updateRecipientError'));
      }
    } else {
      addOtherRecipient(recipientFormData);
      setOtherRecipients(loadOtherRecipients());
      toast.success(t('settings.vouchers.addRecipientSuccess'));
    }

    setIsRecipientDialogOpen(false);
    setEditingRecipient(null);
    setRecipientFormData({ name: '', description: '' });
  };

  if (isLoadingSettings) {
    return (
      <div dir={direction} className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={direction}>
      <div className={`mb-8 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
        <h1 className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('settings.title')}</h1>
        <p className={`text-gray-600 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{t('settings.subtitle')}</p>
      </div>

      {!localStorage.getItem('selected_institution_id') && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 text-amber-800">
            <Building2 className="w-5 h-5 text-amber-600" />
            <div className="font-medium">
              {t('settings.noInstitutionWarning.title')}
            </div>
          </div>
          <p className={`mt-1 text-sm text-amber-700 ${direction === 'rtl' ? 'mr-8' : 'ml-8'}`}>
            {t('settings.noInstitutionWarning.description')}
          </p>
        </div>
      )}

      <Tabs defaultValue="company" className="space-y-6" dir={direction}>
        <TabsList className="flex w-full flex-nowrap overflow-x-auto" dir={direction}>
          <TabsTrigger value="company" className="gap-1.5 flex-shrink-0 text-xs sm:text-sm">
            <Building2 className="w-4 h-4" />
            {t('settings.tabs.company')}
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-1.5 flex-shrink-0 text-xs sm:text-sm">
            <DollarSign className="w-4 h-4" />
            {t('settings.tabs.financial')}
          </TabsTrigger>
          <TabsTrigger value="taxes" className="gap-1.5 flex-shrink-0 text-xs sm:text-sm">
            <Percent className="w-4 h-4" />
            {t('settings.tabs.taxes')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 flex-shrink-0 text-xs sm:text-sm">
            <Bell className="w-4 h-4" />
            {t('settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 flex-shrink-0 text-xs sm:text-sm">
            <Lock className="w-4 h-4" />
            {t('settings.tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 flex-shrink-0 text-xs sm:text-sm">
            <Palette className="w-4 h-4" />
            {t('settings.tabs.appearance')}
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="gap-1.5 flex-shrink-0 text-xs sm:text-sm">
            <FileText className="w-4 h-4" />
            {t('settings.tabs.vouchers')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.company.title')}</CardTitle>
              <CardDescription>
                {t('settings.company.subtitle')}
                {!localStorage.getItem('selected_institution_id') && (
                  <span className="text-amber-600 font-medium block mt-1">
                    ({t('sidebar.noCompany')})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.nameAr')}</Label>
                  <Input
                    placeholder={t('settings.company.nameArPlaceholder')}
                    value={ensureString(companySettings.name_ar)}
                    onChange={(e) => setCompanySettings({ ...companySettings, name_ar: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('settings.company.nameEn')}</Label>
                  <Input
                    placeholder={t('settings.company.nameEnPlaceholder')}
                    value={ensureString(companySettings.name_en)}
                    onChange={(e) => setCompanySettings({ ...companySettings, name_en: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.activityAr')}</Label>
                  <Input
                    placeholder={t('settings.company.activityArPlaceholder')}
                    value={ensureString(companySettings.activity_ar)}
                    onChange={(e) => setCompanySettings({ ...companySettings, activity_ar: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('settings.company.activityEn')}</Label>
                  <Input
                    placeholder={t('settings.company.activityEnPlaceholder')}
                    value={ensureString(companySettings.activity_en)}
                    onChange={(e) => setCompanySettings({ ...companySettings, activity_en: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.mobile')}</Label>
                  <Input
                    placeholder={t('settings.company.mobilePlaceholder')}
                    value={ensureString(companySettings.phone_number)}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone_number: e.target.value })}
                    dir="ltr"
                    type="tel"
                  />
                </div>
                <div>
                  <Label>{t('settings.company.phone')}</Label>
                  <Input
                    placeholder={t('settings.company.phonePlaceholder')}
                    value={ensureString(companySettings.secondary_phone_number)}
                    onChange={(e) => setCompanySettings({ ...companySettings, secondary_phone_number: e.target.value })}
                    dir="ltr"
                    type="tel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.email')}</Label>
                  <Input
                    type="email"
                    placeholder={t('settings.company.emailPlaceholder')}
                    value={ensureString(companySettings.email)}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>{t('settings.company.website')}</Label>
                  <Input
                    placeholder={t('settings.company.websitePlaceholder')}
                    value={ensureString(companySettings.website)}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <Label>{t('settings.company.address')}</Label>
                <Input
                  placeholder={t('settings.company.addressPlaceholder')}
                  value={ensureString(companySettings.address)}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.commercialReg')}</Label>
                  <Input
                    placeholder={t('settings.company.commercialRegPlaceholder')}
                    value={ensureString(companySettings.business_registry)}
                    onChange={(e) => setCompanySettings({ ...companySettings, business_registry: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>{t('settings.company.vatNumber')}</Label>
                  <Input
                    placeholder={t('settings.company.vatNumberPlaceholder')}
                    value={ensureString(companySettings.tax_number)}
                    onChange={(e) => setCompanySettings({ ...companySettings, tax_number: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <Label>{t('settings.company.notes')}</Label>
                <textarea
                  className={`w-full border rounded-lg p-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                  rows={3}
                  placeholder={t('settings.company.notesPlaceholder')}
                  value={ensureString(companySettings.notes)}
                  onChange={(e) => setCompanySettings({ ...companySettings, notes: e.target.value })}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>{t('settings.company.logo') || 'Company Logo'}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="logo"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await compressAndConvertToBase64(file);
                          setCompanySettings({ ...companySettings, logo: base64 });
                        } catch (error) {
                          console.error('Image processing error:', error);
                          toast.error('Error processing image. Please try another file.');
                        }
                      }
                    }}
                  />
                  <label htmlFor="logo" className="cursor-pointer relative block">
                    {companySettings.logo ? (
                      <div className="relative inline-block">
                        <img
                          src={companySettings.logo}
                          alt="Company Logo"
                          className="cursor-pointer relative block w-full h-full"
                        />
                      </div>
                    ) : (
                      <>
                        <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">{t('settings.company.logoUpload')}</p>
                        <p className="text-xs text-gray-400 mt-1">{t('settings.company.logoFormat')}</p>
                      </>
                    )}
                  </label>
                </div>
              </div>


              <div>
                <Label>{t('settings.company.currency')}</Label>
                <Select
                  value={companySettings.default_currency}
                  onValueChange={(value) => setCompanySettings({ ...companySettings, default_currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">{t('settings.company.currencyOptions.SAR')}</SelectItem>
                    <SelectItem value="USD">{t('settings.company.currencyOptions.USD')}</SelectItem>
                    <SelectItem value="EUR">{t('settings.company.currencyOptions.EUR')}</SelectItem>
                    <SelectItem value="AED">{t('settings.company.currencyOptions.AED')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('settings.company.systemType')}</Label>
                <Select
                  value={systemType}
                  onValueChange={async (value: 'restaurant' | 'retail') => {
                    setSystemType(value);
                    const success = await saveSettingValue('system_type', value, 'string', 'company', 'system', 'System Type', 'نوع النظام');
                    if (success) {
                      if (typeof window !== 'undefined') {
                        // Keep localStorage as backup
                        localStorage.setItem('system_type', value);
                        // Dispatch custom event to update POS page immediately
                        window.dispatchEvent(new Event('systemTypeChanged'));
                        toast.success(t('settings.company.systemTypeSaved'));
                      }
                    } else {
                      toast.error('Failed to save system type');
                    }
                  }}
                  disabled={isLoadingSettings}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">{t('settings.company.systemTypeOptions.restaurant')}</SelectItem>
                    <SelectItem value="retail">{t('settings.company.systemTypeOptions.retail')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {t('settings.company.systemTypeDescription')}
                </p>
              </div>

              <Button onClick={handleSave} disabled={isSaving || isLoadingSettings}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  t('settings.saveChanges')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.financial.title')}</CardTitle>
              <CardDescription>{t('settings.financial.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('settings.financial.fiscalYear')}</Label>
                <Select
                  value={financialSettings.fiscal_year}
                  onValueChange={(value) => setFinancialSettings({ ...financialSettings, fiscal_year: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gregorian">{t('settings.financial.fiscalYearOptions.gregorian')}</SelectItem>
                    <SelectItem value="hijri">{t('settings.financial.fiscalYearOptions.hijri')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('settings.financial.costingMethod')}</Label>
                <Select
                  value={financialSettings.costing_method}
                  onValueChange={(value) => setFinancialSettings({ ...financialSettings, costing_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fifo">{t('settings.financial.costingMethodOptions.fifo')}</SelectItem>
                    <SelectItem value="lifo">{t('settings.financial.costingMethodOptions.lifo')}</SelectItem>
                    <SelectItem value="average">{t('settings.financial.costingMethodOptions.average')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <Label>{t('settings.financial.autoEntries')}</Label>
                  <p className="text-sm text-gray-600">{t('settings.financial.autoEntriesDesc')}</p>
                </div>
                <Switch
                  checked={financialSettings.auto_entries}
                  onCheckedChange={(checked) => setFinancialSettings({ ...financialSettings, auto_entries: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <Label>{t('settings.financial.approveEntries')}</Label>
                  <p className="text-sm text-gray-600">{t('settings.financial.approveEntriesDesc')}</p>
                </div>
                <Switch
                  checked={financialSettings.approve_entries}
                  onCheckedChange={(checked) => setFinancialSettings({ ...financialSettings, approve_entries: checked })}
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving || isLoadingSettings}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  t('settings.saveChanges')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <div className="space-y-4">
            {/* Tax Definitions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.taxes.title')} / {t('settings.taxes.titleEn')}</CardTitle>
                <CardDescription>{t('settings.taxes.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex-1">
                        <Label>{t('settings.taxes.taxName')}</Label>
                        <Input defaultValue="ضريبة القيمة المضافة - VAT" />
                      </div>
                      <div className="w-32">
                        <Label>{t('settings.taxes.taxRate')}</Label>
                        <Input type="number" defaultValue="15" dir="ltr" />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className={direction === 'rtl' ? 'ml-2' : 'mr-2'}>{t('settings.taxes.delete')}</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex-1">
                        <Label>{t('settings.taxes.taxName')}</Label>
                        <Input placeholder={t('settings.taxes.taxNamePlaceholder')} />
                      </div>
                      <div className="w-32">
                        <Label>{t('settings.taxes.taxRate')}</Label>
                        <Input type="number" placeholder={t('settings.taxes.taxRatePlaceholder')} dir="ltr" />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className={direction === 'rtl' ? 'ml-2' : 'mr-2'}>{t('settings.taxes.delete')}</Button>
                  </div>
                </div>

                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('settings.taxes.addNew')}
                </Button>
              </CardContent>
            </Card>

            {/* Default VAT Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.taxes.vatSettings')}</CardTitle>
                <CardDescription>{t('settings.taxes.vatSettingsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('settings.taxes.defaultVatRate')}</Label>
                  <Input
                    type="number"
                    value={ensureString(taxSettings.default_vat_rate)}
                    onChange={(e) => setTaxSettings({ ...taxSettings, default_vat_rate: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.taxes.institutionTaxNumber')}</Label>
                  <Input
                    value={ensureString(taxSettings.institution_tax_number)}
                    onChange={(e) => setTaxSettings({ ...taxSettings, institution_tax_number: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.enableVat')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.enableVatDesc')}</p>
                  </div>
                  <Switch
                    checked={taxSettings.enable_vat}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, enable_vat: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.pricesIncludeTax')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.pricesIncludeTaxDesc')}</p>
                  </div>
                  <Switch
                    checked={pricesIncludeTax}
                    onCheckedChange={async (checked) => {
                      setPricesIncludeTax(checked);
                      const success = await saveSettingValue('prices_include_tax', checked, 'boolean', 'taxes', 'system', 'Prices Include Tax', 'الأسعار شاملة الضريبة');
                      if (success) {
                        if (typeof window !== 'undefined') {
                          // Keep localStorage as backup
                          localStorage.setItem('prices_include_tax', String(checked));
                        }
                        toast.success(checked ? 'تم تفعيل: الأسعار شاملة الضريبة' : 'تم إلغاء: الأسعار غير شاملة للضريبة');
                      } else {
                        toast.error('Failed to save setting');
                      }
                    }}
                    disabled={isLoadingSettings}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.priceModificationIncludesTax')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.priceModificationIncludesTaxDesc')}</p>
                  </div>
                  <Switch
                    checked={priceModificationIncludesTax}
                    onCheckedChange={async (checked) => {
                      setPriceModificationIncludesTax(checked);
                      const success = await saveSettingValue('price_modification_includes_tax', checked, 'boolean', 'taxes', 'system', 'Price Modification Includes Tax', 'تعديل السعر يشمل الضريبة');
                      if (success) {
                        if (typeof window !== 'undefined') {
                          // Keep localStorage as backup
                          localStorage.setItem('price_modification_includes_tax', String(checked));
                          // Dispatch custom event to update POS page immediately
                          window.dispatchEvent(new Event('priceModificationSettingChanged'));
                        }
                        toast.success(checked ? t('settings.taxes.priceModificationIncludesTaxEnabled') : t('settings.taxes.priceModificationIncludesTaxDisabled'));
                      } else {
                        toast.error('Failed to save setting');
                      }
                    }}
                    disabled={isLoadingSettings}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.showPricesWithVat')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.showPricesWithVatDesc')}</p>
                  </div>
                  <Switch
                    checked={taxSettings.show_prices_with_vat}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, show_prices_with_vat: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.showVatDetails')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.showVatDetailsDesc')}</p>
                  </div>
                  <Switch
                    checked={taxSettings.show_vat_details}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, show_vat_details: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.taxes.discountTiming')}</Label>
                  <Select
                    value={taxSettings.discount_timing}
                    onValueChange={(value) => setTaxSettings({ ...taxSettings, discount_timing: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before-tax">{t('settings.taxes.discountOptions.before')} / {t('settings.taxes.discountOptions.beforeEn')}</SelectItem>
                      <SelectItem value="after-tax">{t('settings.taxes.discountOptions.after')} / {t('settings.taxes.discountOptions.afterEn')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.tobaccoTax')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.tobaccoTaxDesc')}</p>
                  </div>
                  <Switch
                    checked={taxSettings.tobacco_tax}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, tobacco_tax: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.eInvoicing')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.eInvoicingDesc')}</p>
                  </div>
                  <Switch
                    checked={taxSettings.e_invoicing}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, e_invoicing: checked })}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving || isLoadingSettings}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    t('settings.saveChanges')
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications.title')}</CardTitle>
              <CardDescription>{t('settings.notifications.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.lowStock')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.lowStockDesc')}</p>
                </div>
                <Switch
                  checked={notificationSettings.low_stock}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, low_stock: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.payments')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.paymentsDesc')}</p>
                </div>
                <Switch
                  checked={notificationSettings.payments}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, payments: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.dailyReports')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.dailyReportsDesc')}</p>
                </div>
                <Switch
                  checked={notificationSettings.daily_reports}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, daily_reports: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.emailNotifications')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.emailNotificationsDesc')}</p>
                </div>
                <Switch
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email_notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.smsNotifications')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.smsNotificationsDesc')}</p>
                </div>
                <Switch
                  checked={notificationSettings.sms_notifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, sms_notifications: checked })}
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving || isLoadingSettings}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  t('settings.saveChanges')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.security.title')}</CardTitle>
              <CardDescription>{t('settings.security.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('settings.security.currentPassword')}</Label>
                <Input type="password" placeholder={t('settings.security.currentPasswordPlaceholder')} dir="ltr" />
              </div>
              <div>
                <Label>{t('settings.security.newPassword')}</Label>
                <Input type="password" placeholder={t('settings.security.newPasswordPlaceholder')} dir="ltr" />
              </div>
              <div>
                <Label>{t('settings.security.confirmPassword')}</Label>
                <Input type="password" placeholder={t('settings.security.confirmPasswordPlaceholder')} dir="ltr" />
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <p className="mb-1">{t('settings.security.twoFactor')}</p>
                    <p className="text-sm text-gray-600">{t('settings.security.twoFactorDesc')}</p>
                  </div>
                  <Switch
                    checked={securitySettings.two_factor}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, two_factor: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <p className="mb-1">{t('settings.security.autoLogout')}</p>
                    <p className="text-sm text-gray-600">{t('settings.security.autoLogoutDesc')}</p>
                  </div>
                  <Switch
                    checked={securitySettings.auto_logout}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, auto_logout: checked })}
                  />
                </div>
              </div>
              <Button onClick={handleSave}>{t('settings.security.updatePassword')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance.title')}</CardTitle>
              <CardDescription>{t('settings.appearance.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('settings.appearance.theme')}</Label>
                <Select
                  value={appearanceSettings.theme}
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('settings.appearance.themeOptions.light')}</SelectItem>
                    <SelectItem value="dark">{t('settings.appearance.themeOptions.dark')}</SelectItem>
                    <SelectItem value="auto">{t('settings.appearance.themeOptions.auto')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('settings.appearance.language')}</Label>
                <Select value={language} onValueChange={(value: 'ar' | 'en') => setLanguage(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">{t('settings.appearance.languageOptions.ar')}</SelectItem>
                    <SelectItem value="en">{t('settings.appearance.languageOptions.en')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('settings.appearance.fontSize')}</Label>
                <Select
                  value={appearanceSettings.font_size}
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, font_size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{t('settings.appearance.fontSizeOptions.small')}</SelectItem>
                    <SelectItem value="medium">{t('settings.appearance.fontSizeOptions.medium')}</SelectItem>
                    <SelectItem value="large">{t('settings.appearance.fontSizeOptions.large')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('settings.appearance.dateFormat')}</Label>
                <Select
                  value={appearanceSettings.date_format}
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, date_format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">{t('settings.appearance.dateFormatOptions.ddmmyyyy')}</SelectItem>
                    <SelectItem value="mm-dd-yyyy">{t('settings.appearance.dateFormatOptions.mmddyyyy')}</SelectItem>
                    <SelectItem value="yyyy-mm-dd">{t('settings.appearance.dateFormatOptions.yyyymmdd')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={isSaving || isLoadingSettings}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  t('settings.saveChanges')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers">
          <div className="space-y-6">
            {/* Other Sources Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('settings.vouchers.otherSources')}</CardTitle>
                    <CardDescription>{t('settings.vouchers.otherSourcesDesc')}</CardDescription>
                  </div>
                  <Button onClick={handleAddSource} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('settings.vouchers.addSource')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                  <Input
                    placeholder={t('settings.vouchers.searchSource')}
                    value={sourceSearchTerm}
                    onChange={(e) => setSourceSearchTerm(e.target.value)}
                    className={direction === 'rtl' ? 'pr-10' : 'pl-10'}
                    dir={direction}
                  />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('settings.vouchers.name')}</TableHead>
                        <TableHead className="text-right">{t('settings.vouchers.description')}</TableHead>
                        <TableHead className="text-right w-24">{t('settings.vouchers.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSources.length > 0 ? (
                        filteredSources.map((source) => (
                          <TableRow key={source.id}>
                            <TableCell className="font-medium">{source.name}</TableCell>
                            <TableCell className="text-gray-600">{source.description || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSource(source)}
                                  title={t('settings.vouchers.edit')}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSource(source.id)}
                                  title={t('settings.vouchers.delete')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            {sourceSearchTerm ? t('settings.vouchers.noResults') : t('settings.vouchers.noSources')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Other Recipients Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('settings.vouchers.otherRecipients')}</CardTitle>
                    <CardDescription>{t('settings.vouchers.otherRecipientsDesc')}</CardDescription>
                  </div>
                  <Button onClick={handleAddRecipient} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('settings.vouchers.addRecipient')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                  <Input
                    placeholder={t('settings.vouchers.searchRecipient')}
                    value={recipientSearchTerm}
                    onChange={(e) => setRecipientSearchTerm(e.target.value)}
                    className={direction === 'rtl' ? 'pr-10' : 'pl-10'}
                    dir={direction}
                  />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('settings.vouchers.name')}</TableHead>
                        <TableHead className="text-right">{t('settings.vouchers.description')}</TableHead>
                        <TableHead className="text-right w-24">{t('settings.vouchers.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecipients.length > 0 ? (
                        filteredRecipients.map((recipient) => (
                          <TableRow key={recipient.id}>
                            <TableCell className="font-medium">{recipient.name}</TableCell>
                            <TableCell className="text-gray-600">{recipient.description || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRecipient(recipient)}
                                  title={t('settings.vouchers.edit')}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRecipient(recipient.id)}
                                  title={t('settings.vouchers.delete')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            {recipientSearchTerm ? t('settings.vouchers.noResults') : t('settings.vouchers.noRecipients')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Source Dialog */}
          <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingSource ? t('settings.vouchers.editSource') : t('settings.vouchers.addSource')}</DialogTitle>
                <DialogDescription>
                  {editingSource ? t('settings.vouchers.editSourceDesc') : t('settings.vouchers.addSourceDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.vouchers.sourceName')}</Label>
                  <Input
                    value={sourceFormData.name}
                    onChange={(e) => setSourceFormData({ ...sourceFormData, name: e.target.value })}
                    placeholder={t('settings.vouchers.sourceNamePlaceholder')}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.vouchers.sourceDescription')}</Label>
                  <Input
                    value={sourceFormData.description}
                    onChange={(e) => setSourceFormData({ ...sourceFormData, description: e.target.value })}
                    placeholder={t('settings.vouchers.sourceDescriptionPlaceholder')}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setIsSourceDialogOpen(false)} variant="outline" className="flex-1">
                  {t('settings.vouchers.cancel')}
                </Button>
                <Button onClick={handleSaveSource} className="flex-1">
                  {editingSource ? t('settings.vouchers.saveChanges') : t('settings.vouchers.addSource')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Recipient Dialog */}
          <Dialog open={isRecipientDialogOpen} onOpenChange={setIsRecipientDialogOpen}>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingRecipient ? t('settings.vouchers.editRecipient') : t('settings.vouchers.addRecipient')}</DialogTitle>
                <DialogDescription>
                  {editingRecipient ? t('settings.vouchers.editRecipientDesc') : t('settings.vouchers.addRecipientDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.vouchers.recipientName')}</Label>
                  <Input
                    value={recipientFormData.name}
                    onChange={(e) => setRecipientFormData({ ...recipientFormData, name: e.target.value })}
                    placeholder={t('settings.vouchers.recipientNamePlaceholder')}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.vouchers.recipientDescription')}</Label>
                  <Input
                    value={recipientFormData.description}
                    onChange={(e) => setRecipientFormData({ ...recipientFormData, description: e.target.value })}
                    placeholder={t('settings.vouchers.recipientDescriptionPlaceholder')}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setIsRecipientDialogOpen(false)} variant="outline" className="flex-1">
                  {t('settings.vouchers.cancel')}
                </Button>
                <Button onClick={handleSaveRecipient} className="flex-1">
                  {editingRecipient ? t('settings.vouchers.saveChanges') : t('settings.vouchers.addRecipient')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
