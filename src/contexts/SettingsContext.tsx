'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { getSettings, batchUpdateSettings, getInstitution, updateInstitution, type Setting, type Institution } from '../lib/api';

// Types
export type SystemType = 'restaurant' | 'retail';

export interface CompanySettings {
  name_ar: string;
  name_en: string;
  activity_ar: string;
  activity_en: string;
  phone_number: string;
  secondary_phone_number: string;
  email: string;
  website: string;
  address: string;
  tax_number: string;
  business_registry: string;
  default_currency: string;
  notes: string;
  logo: string | null;
}

export interface FinancialSettings {
  fiscal_year: string;
  costing_method: string;
  auto_entries: boolean;
  approve_entries: boolean;
}

export interface TaxSettings {
  default_vat_rate: string;
  institution_tax_number: string;
  enable_vat: boolean;
  show_prices_with_vat: boolean;
  show_vat_details: boolean;
  discount_timing: string;
  tobacco_tax: boolean;
  e_invoicing: boolean;
}

export interface NotificationSettings {
  low_stock: boolean;
  payments: boolean;
  daily_reports: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export interface SecuritySettings {
  two_factor: boolean;
  auto_logout: boolean;
}

export interface AppearanceSettings {
  theme: string;
  font_size: string;
  date_format: string;
}

interface SettingsContextType {
  // Settings state
  systemType: SystemType;
  pricesIncludeTax: boolean;
  priceModificationIncludesTax: boolean;
  companySettings: CompanySettings;
  financialSettings: FinancialSettings;
  taxSettings: TaxSettings;
  notificationSettings: NotificationSettings;
  securitySettings: SecuritySettings;
  appearanceSettings: AppearanceSettings;
  
  // Loading states
  isLoadingSettings: boolean;
  isSaving: boolean;
  
  // Actions
  setSystemType: (type: SystemType) => void;
  setPricesIncludeTax: (value: boolean) => void;
  setPriceModificationIncludesTax: (value: boolean) => void;
  setCompanySettings: (settings: CompanySettings | ((prev: CompanySettings) => CompanySettings)) => void;
  setFinancialSettings: (settings: FinancialSettings | ((prev: FinancialSettings) => FinancialSettings)) => void;
  setTaxSettings: (settings: TaxSettings | ((prev: TaxSettings) => TaxSettings)) => void;
  setNotificationSettings: (settings: NotificationSettings | ((prev: NotificationSettings) => NotificationSettings)) => void;
  setSecuritySettings: (settings: SecuritySettings | ((prev: SecuritySettings) => SecuritySettings)) => void;
  setAppearanceSettings: (settings: AppearanceSettings | ((prev: AppearanceSettings) => AppearanceSettings)) => void;
  
  // Methods
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<boolean>;
  saveSettingValue: (
    key: string,
    value: any,
    type?: 'string' | 'integer' | 'boolean' | 'json' | 'text',
    group?: string,
    scope?: 'system' | 'institution' | 'branch' | 'user',
    label_en?: string,
    label_ar?: string
  ) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultCompanySettings: CompanySettings = {
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
  logo: null,
};

const defaultFinancialSettings: FinancialSettings = {
  fiscal_year: 'gregorian',
  costing_method: 'fifo',
  auto_entries: true,
  approve_entries: false,
};

const defaultTaxSettings: TaxSettings = {
  default_vat_rate: '15',
  institution_tax_number: '300123456700003',
  enable_vat: true,
  show_prices_with_vat: false,
  show_vat_details: true,
  discount_timing: 'before-tax',
  tobacco_tax: false,
  e_invoicing: true,
};

const defaultNotificationSettings: NotificationSettings = {
  low_stock: true,
  payments: true,
  daily_reports: false,
  email_notifications: true,
  sms_notifications: false,
};

const defaultSecuritySettings: SecuritySettings = {
  two_factor: false,
  auto_logout: true,
};

const defaultAppearanceSettings: AppearanceSettings = {
  theme: 'light',
  font_size: 'medium',
  date_format: 'dd-mm-yyyy',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [systemType, setSystemTypeState] = useState<SystemType>('retail');
  const [pricesIncludeTax, setPricesIncludeTaxState] = useState(true);
  const [priceModificationIncludesTax, setPriceModificationIncludesTaxState] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [companySettings, setCompanySettingsState] = useState<CompanySettings>(defaultCompanySettings);
  const [financialSettings, setFinancialSettingsState] = useState<FinancialSettings>(defaultFinancialSettings);
  const [taxSettings, setTaxSettingsState] = useState<TaxSettings>(defaultTaxSettings);
  const [notificationSettings, setNotificationSettingsState] = useState<NotificationSettings>(defaultNotificationSettings);
  const [securitySettings, setSecuritySettingsState] = useState<SecuritySettings>(defaultSecuritySettings);
  const [appearanceSettings, setAppearanceSettingsState] = useState<AppearanceSettings>(defaultAppearanceSettings);
  
  // Cache existing settings to avoid checking existence on save
  const [existingSettingsMap, setExistingSettingsMap] = useState<Map<string, Setting>>(new Map());

  // Helper function to ensure value is always a string (never null/undefined)
  const ensureString = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  // Function to fetch institution data and populate company settings
  const loadInstitutionData = useCallback(async (institutionId: number | null) => {
    if (!institutionId) return;

    try {
      const result = await getInstitution(institutionId);
      if (result.success && result.data?.institution) {
        const institution = result.data.institution;

        // Populate company settings from institution data
        setCompanySettingsState(prev => ({
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
  }, []);

  // Load settings from API
  const loadSettings = useCallback(async (skipInstitutionLoad: boolean = false) => {
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
        setSystemTypeState(savedType as SystemType);
      }

      // Load prices_include_tax setting
      setPricesIncludeTaxState(getBoolean('prices_include_tax', true));

      // Load price_modification_includes_tax setting
      setPriceModificationIncludesTaxState(getBoolean('price_modification_includes_tax', true));

      // Load company settings from settings (will override institution data if settings exist)
      setCompanySettingsState(prev => ({
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
      setFinancialSettingsState({
        fiscal_year: String(getValue('financial_fiscal_year', 'gregorian') || 'gregorian'),
        costing_method: String(getValue('financial_costing_method', 'fifo') || 'fifo'),
        auto_entries: getBoolean('financial_auto_entries', true),
        approve_entries: getBoolean('financial_approve_entries', false),
      });

      // Load tax settings - ensure string values are never null
      setTaxSettingsState({
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
      setNotificationSettingsState({
        low_stock: getBoolean('notification_low_stock', true),
        payments: getBoolean('notification_payments', true),
        daily_reports: getBoolean('notification_daily_reports', false),
        email_notifications: getBoolean('notification_email_notifications', true),
        sms_notifications: getBoolean('notification_sms_notifications', false),
      });

      // Load security settings
      setSecuritySettingsState({
        two_factor: getBoolean('security_two_factor', false),
        auto_logout: getBoolean('security_auto_logout', true),
      });

      // Load appearance settings - ensure string values are never null
      setAppearanceSettingsState({
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
        const savedType = localStorage.getItem('system_type') as SystemType | null;
        if (savedType) {
          setSystemTypeState(savedType);
        }
        const savedPricesIncludeTax = localStorage.getItem('prices_include_tax');
        if (savedPricesIncludeTax !== null) {
          setPricesIncludeTaxState(savedPricesIncludeTax === 'true');
        }
        const savedPriceModificationIncludesTax = localStorage.getItem('price_modification_includes_tax');
        if (savedPriceModificationIncludesTax !== null) {
          setPriceModificationIncludesTaxState(savedPriceModificationIncludesTax === 'true');
        }
      }
    } finally {
      setIsLoadingSettings(false);
    }
  }, [loadInstitutionData]);

  // Save a single setting value
  const saveSettingValue = useCallback(async (
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

      // Get current institution from localStorage
      const selectedInstitutionId = typeof window !== 'undefined'
        ? localStorage.getItem('selected_institution_id')
        : null;

      const actualScope = selectedInstitutionId ? ('institution' as const) : ('system' as const);
      const institutionId = selectedInstitutionId ? Number(selectedInstitutionId) : undefined;

      if (existingSetting) {
        // Update existing setting
        const { updateSetting } = await import('../lib/api');
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
        const { createSetting } = await import('../lib/api');
        const createResult = await createSetting({
          key,
          value,
          type,
          group,
          scope: actualScope,
          institution_id: institutionId,
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
  }, [existingSettingsMap]);

  // Save all settings
  const saveSettings = useCallback(async () => {
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
              institutionUpdateData.notes = companySettings.notes.trim();

              if (companySettings.logo) {
                institutionUpdateData.logo = companySettings.logo;
              }

              // Update the institution
              const updateResult = await updateInstitution(institutionId, institutionUpdateData);
              if (!updateResult.success) {
                console.error('Failed to update institution:', updateResult.message);
              }
            }
          } catch (error) {
            console.error('Error updating institution:', error);
          }
        }

        // Dispatch event to update company name in navbar
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('settingsUpdated'));
        }

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    systemType,
    pricesIncludeTax,
    priceModificationIncludesTax,
    companySettings,
    financialSettings,
    taxSettings,
    notificationSettings,
    securitySettings,
    appearanceSettings,
  ]);

  // Refresh settings (reload from API)
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Load settings on mount and when institution changes
  useEffect(() => {
    loadSettings();

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
  }, [loadSettings, loadInstitutionData]);

  // Wrapper functions for state setters
  const setSystemType = useCallback((type: SystemType) => {
    setSystemTypeState(type);
  }, []);

  const setPricesIncludeTax = useCallback((value: boolean) => {
    setPricesIncludeTaxState(value);
  }, []);

  const setPriceModificationIncludesTax = useCallback((value: boolean) => {
    setPriceModificationIncludesTaxState(value);
  }, []);

  const setCompanySettings = useCallback((settings: CompanySettings | ((prev: CompanySettings) => CompanySettings)) => {
    setCompanySettingsState(settings);
  }, []);

  const setFinancialSettings = useCallback((settings: FinancialSettings | ((prev: FinancialSettings) => FinancialSettings)) => {
    setFinancialSettingsState(settings);
  }, []);

  const setTaxSettings = useCallback((settings: TaxSettings | ((prev: TaxSettings) => TaxSettings)) => {
    setTaxSettingsState(settings);
  }, []);

  const setNotificationSettings = useCallback((settings: NotificationSettings | ((prev: NotificationSettings) => NotificationSettings)) => {
    setNotificationSettingsState(settings);
  }, []);

  const setSecuritySettings = useCallback((settings: SecuritySettings | ((prev: SecuritySettings) => SecuritySettings)) => {
    setSecuritySettingsState(settings);
  }, []);

  const setAppearanceSettings = useCallback((settings: AppearanceSettings | ((prev: AppearanceSettings) => AppearanceSettings)) => {
    setAppearanceSettingsState(settings);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    systemType,
    pricesIncludeTax,
    priceModificationIncludesTax,
    companySettings,
    financialSettings,
    taxSettings,
    notificationSettings,
    securitySettings,
    appearanceSettings,
    isLoadingSettings,
    isSaving,
    setSystemType,
    setPricesIncludeTax,
    setPriceModificationIncludesTax,
    setCompanySettings,
    setFinancialSettings,
    setTaxSettings,
    setNotificationSettings,
    setSecuritySettings,
    setAppearanceSettings,
    loadSettings,
    saveSettings,
    saveSettingValue,
    refreshSettings,
  }), [
    systemType,
    pricesIncludeTax,
    priceModificationIncludesTax,
    companySettings,
    financialSettings,
    taxSettings,
    notificationSettings,
    securitySettings,
    appearanceSettings,
    isLoadingSettings,
    isSaving,
    setSystemType,
    setPricesIncludeTax,
    setPriceModificationIncludesTax,
    setCompanySettings,
    setFinancialSettings,
    setTaxSettings,
    setNotificationSettings,
    setSecuritySettings,
    setAppearanceSettings,
    loadSettings,
    saveSettings,
    saveSettingValue,
    refreshSettings,
  ]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook for using the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

