import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building2, Bell, Lock, Palette, DollarSign, Percent, Plus, FileText, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
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

export function Settings() {
  const { t, direction, language, setLanguage } = useLanguage();
  const [systemType, setSystemType] = useState<'restaurant' | 'retail'>('retail');
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);
  const [priceModificationIncludesTax, setPriceModificationIncludesTax] = useState(true);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('system_type') as 'restaurant' | 'retail' | null;
      if (savedType) {
        setSystemType(savedType);
      }

      const savedPricesIncludeTax = localStorage.getItem('prices_include_tax');
      if (savedPricesIncludeTax !== null) {
        setPricesIncludeTax(savedPricesIncludeTax === 'true');
      } else {
        // Default to true (prices include tax)
        localStorage.setItem('prices_include_tax', 'true');
      }

      const savedPriceModificationIncludesTax = localStorage.getItem('price_modification_includes_tax');
      if (savedPriceModificationIncludesTax !== null) {
        setPriceModificationIncludesTax(savedPriceModificationIncludesTax === 'true');
      } else {
        // Default to true (price modification includes tax)
        localStorage.setItem('price_modification_includes_tax', 'true');
      }
    }

    // Load other sources and recipients
    setOtherSources(loadOtherSources());
    setOtherRecipients(loadOtherRecipients());
  }, []);

  const handleSave = () => {
    toast.success(t('settings.saveSuccess'));
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
    if (!confirm('هل أنت متأكد من حذف هذا المصدر؟')) return;
    if (deleteOtherSource(id)) {
      setOtherSources(loadOtherSources());
      toast.success('تم حذف المصدر بنجاح');
    } else {
      toast.error('فشل حذف المصدر');
    }
  };

  const handleSaveSource = () => {
    if (!sourceFormData.name.trim()) {
      toast.error('يرجى إدخال اسم المصدر');
      return;
    }

    if (editingSource) {
      if (updateOtherSource(editingSource.id, sourceFormData)) {
        setOtherSources(loadOtherSources());
        toast.success('تم تحديث المصدر بنجاح');
      } else {
        toast.error('فشل تحديث المصدر');
      }
    } else {
      addOtherSource(sourceFormData);
      setOtherSources(loadOtherSources());
      toast.success('تم إضافة المصدر بنجاح');
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
    if (!confirm('هل أنت متأكد من حذف هذا المستفيد؟')) return;
    if (deleteOtherRecipient(id)) {
      setOtherRecipients(loadOtherRecipients());
      toast.success('تم حذف المستفيد بنجاح');
    } else {
      toast.error('فشل حذف المستفيد');
    }
  };

  const handleSaveRecipient = () => {
    if (!recipientFormData.name.trim()) {
      toast.error('يرجى إدخال اسم المستفيد');
      return;
    }

    if (editingRecipient) {
      if (updateOtherRecipient(editingRecipient.id, recipientFormData)) {
        setOtherRecipients(loadOtherRecipients());
        toast.success('تم تحديث المستفيد بنجاح');
      } else {
        toast.error('فشل تحديث المستفيد');
      }
    } else {
      addOtherRecipient(recipientFormData);
      setOtherRecipients(loadOtherRecipients());
      toast.success('تم إضافة المستفيد بنجاح');
    }

    setIsRecipientDialogOpen(false);
    setEditingRecipient(null);
    setRecipientFormData({ name: '', description: '' });
  };

  return (
    <div dir={direction}>
      <div className={`mb-8 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
        <h1 className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('settings.title')}</h1>
        <p className={`text-gray-600 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{t('settings.subtitle')}</p>
      </div>

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
            سندات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.company.title')} / {t('settings.company.titleEn')}</CardTitle>
              <CardDescription>{t('settings.company.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.nameAr')}</Label>
                  <Input placeholder={t('settings.company.nameArPlaceholder')} defaultValue="شركة الأمل للتجارة" />
                </div>
                <div>
                  <Label>{t('settings.company.nameEn')}</Label>
                  <Input placeholder={t('settings.company.nameEnPlaceholder')} defaultValue="Al-Amal Trading Company" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.activityAr')}</Label>
                  <Input placeholder={t('settings.company.activityArPlaceholder')} defaultValue="تجارة عامة واستيراد وتصدير" />
                </div>
                <div>
                  <Label>{t('settings.company.activityEn')}</Label>
                  <Input placeholder={t('settings.company.activityEnPlaceholder')} defaultValue="General Trading, Import & Export" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.mobile')}</Label>
                  <Input placeholder={t('settings.company.mobilePlaceholder')} defaultValue="0501234567" dir="ltr" type="tel" />
                </div>
                <div>
                  <Label>{t('settings.company.phone')}</Label>
                  <Input placeholder={t('settings.company.phonePlaceholder')} defaultValue="011 234 5678" dir="ltr" type="tel" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.email')}</Label>
                  <Input type="email" placeholder={t('settings.company.emailPlaceholder')} defaultValue="info@alamal.com" dir="ltr" />
                </div>
                <div>
                  <Label>{t('settings.company.website')}</Label>
                  <Input placeholder={t('settings.company.websitePlaceholder')} defaultValue="www.alamal.com" dir="ltr" />
                </div>
              </div>

              <div>
                <Label>{t('settings.company.address')}</Label>
                <Input placeholder={t('settings.company.addressPlaceholder')} defaultValue="الرياض، طريق الملك فهد، حي العليا" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.company.commercialReg')}</Label>
                  <Input placeholder={t('settings.company.commercialRegPlaceholder')} defaultValue="1010123456" dir="ltr" />
                </div>
                <div>
                  <Label>{t('settings.company.vatNumber')}</Label>
                  <Input placeholder={t('settings.company.vatNumberPlaceholder')} defaultValue="300123456700003" dir="ltr" />
                </div>
              </div>

              <div>
                <Label>{t('settings.company.notes')}</Label>
                <textarea
                  className={`w-full border rounded-lg p-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                  rows={3}
                  placeholder={t('settings.company.notesPlaceholder')}
                  defaultValue=""
                />
              </div>

              <div>
                <Label>{t('settings.company.logo')}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input type="file" id="logo" className="hidden" accept="image/*" />
                  <label htmlFor="logo" className="cursor-pointer">
                    <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">{t('settings.company.logoUpload')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('settings.company.logoFormat')}</p>
                  </label>
                </div>
              </div>

              <div>
                <Label>{t('settings.company.currency')}</Label>
                <Select defaultValue="SAR">
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
                <Label>نوع النظام</Label>
                <Select
                  value={systemType}
                  onValueChange={(value: 'restaurant' | 'retail') => {
                    setSystemType(value);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('system_type', value);
                      // Dispatch custom event to update POS page immediately
                      window.dispatchEvent(new Event('systemTypeChanged'));
                      toast.success('تم حفظ نوع النظام بنجاح');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">مطعم</SelectItem>
                    <SelectItem value="retail">محل تجاري</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  المطاعم: المنتجات تظهر في شكل مربعات في صفحة POS | المحلات التجارية: المنتجات تظهر في جدول في صفحة POS
                </p>
              </div>

              <Button onClick={handleSave}>{t('settings.saveChanges')}</Button>
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
                <Select defaultValue="gregorian">
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
                <Select defaultValue="fifo">
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
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <Label>{t('settings.financial.approveEntries')}</Label>
                  <p className="text-sm text-gray-600">{t('settings.financial.approveEntriesDesc')}</p>
                </div>
                <Switch />
              </div>

              <Button onClick={handleSave}>{t('settings.saveChanges')}</Button>
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
                  <Input type="number" defaultValue="15" dir="ltr" />
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.taxes.institutionTaxNumber')}</Label>
                  <Input defaultValue="300123456700003" dir="ltr" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.enableVat')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.enableVatDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>الأسعار شاملة الضريبة</Label>
                    <p className="text-sm text-gray-600">عند التفعيل، ستكون جميع الأسعار المدخلة في النظام شاملة للضريبة</p>
                  </div>
                  <Switch
                    checked={pricesIncludeTax}
                    onCheckedChange={(checked) => {
                      setPricesIncludeTax(checked);
                      localStorage.setItem('prices_include_tax', String(checked));
                      toast.success(checked ? 'تم تفعيل: الأسعار شاملة الضريبة' : 'تم إلغاء: الأسعار غير شاملة للضريبة');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.priceModificationIncludesTax')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.priceModificationIncludesTaxDesc')}</p>
                  </div>
                  <Switch
                    checked={priceModificationIncludesTax}
                    onCheckedChange={(checked) => {
                      setPriceModificationIncludesTax(checked);
                      localStorage.setItem('price_modification_includes_tax', String(checked));
                      // Dispatch custom event to update POS page immediately
                      window.dispatchEvent(new Event('priceModificationSettingChanged'));
                      toast.success(checked ? t('settings.taxes.priceModificationIncludesTaxEnabled') : t('settings.taxes.priceModificationIncludesTaxDisabled'));
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.showPricesWithVat')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.showPricesWithVatDesc')}</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.showVatDetails')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.showVatDetailsDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.taxes.discountTiming')}</Label>
                  <Select defaultValue="before-tax">
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
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label>{t('settings.taxes.eInvoicing')}</Label>
                    <p className="text-sm text-gray-600">{t('settings.taxes.eInvoicingDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button onClick={handleSave}>{t('settings.saveChanges')}</Button>
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
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.payments')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.paymentsDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.dailyReports')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.dailyReportsDesc')}</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.emailNotifications')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.emailNotificationsDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="mb-1">{t('settings.notifications.smsNotifications')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.smsNotificationsDesc')}</p>
                </div>
                <Switch />
              </div>
              <Button onClick={handleSave}>{t('settings.saveChanges')}</Button>
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
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <p className="mb-1">{t('settings.security.autoLogout')}</p>
                    <p className="text-sm text-gray-600">{t('settings.security.autoLogoutDesc')}</p>
                  </div>
                  <Switch defaultChecked />
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
                <Select defaultValue="light">
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
                <Select defaultValue="medium">
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
                <Select defaultValue="dd-mm-yyyy">
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
              <Button onClick={handleSave}>{t('settings.saveChanges')}</Button>
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
                    <CardTitle>المصادر الأخرى</CardTitle>
                    <CardDescription>إدارة المصادر الأخرى المستخدمة في سندات القبض</CardDescription>
                  </div>
                  <Button onClick={handleAddSource} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة مصدر
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن المصدر..."
                    value={sourceSearchTerm}
                    onChange={(e) => setSourceSearchTerm(e.target.value)}
                    className="pr-10"
                    dir="rtl"
                  />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right w-24">إجراءات</TableHead>
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
                                  title="تعديل"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSource(source.id)}
                                  title="حذف"
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
                            {sourceSearchTerm ? 'لا توجد نتائج' : 'لا توجد مصادر أخرى'}
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
                    <CardTitle>المستفيدون الآخرون</CardTitle>
                    <CardDescription>إدارة المستفيدين الآخرين المستخدمين في سندات الصرف</CardDescription>
                  </div>
                  <Button onClick={handleAddRecipient} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة مستفيد
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن المستفيد..."
                    value={recipientSearchTerm}
                    onChange={(e) => setRecipientSearchTerm(e.target.value)}
                    className="pr-10"
                    dir="rtl"
                  />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right w-24">إجراءات</TableHead>
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
                                  title="تعديل"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRecipient(recipient.id)}
                                  title="حذف"
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
                            {recipientSearchTerm ? 'لا توجد نتائج' : 'لا توجد مستفيدين آخرين'}
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
                <DialogTitle>{editingSource ? 'تعديل المصدر' : 'إضافة مصدر جديد'}</DialogTitle>
                <DialogDescription>
                  {editingSource ? 'تعديل بيانات المصدر' : 'إضافة مصدر جديد لسندات القبض'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم المصدر *</Label>
                  <Input
                    value={sourceFormData.name}
                    onChange={(e) => setSourceFormData({ ...sourceFormData, name: e.target.value })}
                    placeholder="أدخل اسم المصدر"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (اختياري)</Label>
                  <Input
                    value={sourceFormData.description}
                    onChange={(e) => setSourceFormData({ ...sourceFormData, description: e.target.value })}
                    placeholder="أدخل وصف المصدر"
                    className="text-right"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setIsSourceDialogOpen(false)} variant="outline" className="flex-1">
                  إلغاء
                </Button>
                <Button onClick={handleSaveSource} className="flex-1">
                  {editingSource ? 'حفظ التعديلات' : 'إضافة'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Recipient Dialog */}
          <Dialog open={isRecipientDialogOpen} onOpenChange={setIsRecipientDialogOpen}>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingRecipient ? 'تعديل المستفيد' : 'إضافة مستفيد جديد'}</DialogTitle>
                <DialogDescription>
                  {editingRecipient ? 'تعديل بيانات المستفيد' : 'إضافة مستفيد جديد لسندات الصرف'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم المستفيد *</Label>
                  <Input
                    value={recipientFormData.name}
                    onChange={(e) => setRecipientFormData({ ...recipientFormData, name: e.target.value })}
                    placeholder="أدخل اسم المستفيد"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (اختياري)</Label>
                  <Input
                    value={recipientFormData.description}
                    onChange={(e) => setRecipientFormData({ ...recipientFormData, description: e.target.value })}
                    placeholder="أدخل وصف المستفيد"
                    className="text-right"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setIsRecipientDialogOpen(false)} variant="outline" className="flex-1">
                  إلغاء
                </Button>
                <Button onClick={handleSaveRecipient} className="flex-1">
                  {editingRecipient ? 'حفظ التعديلات' : 'إضافة'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
