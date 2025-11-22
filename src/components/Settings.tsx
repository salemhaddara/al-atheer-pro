import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building2, Bell, Lock, Palette, DollarSign, Percent, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';

export function Settings() {
  const { t, direction, language, setLanguage } = useLanguage();
  const [systemType, setSystemType] = useState<'restaurant' | 'retail'>('retail');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('system_type') as 'restaurant' | 'retail' | null;
      if (savedType) {
        setSystemType(savedType);
      }
    }
  }, []);

  const handleSave = () => {
    toast.success(t('settings.saveSuccess'));
  };

  return (
    <div dir={direction}>
      <div className={`mb-8 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
        <h1 className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('settings.title')}</h1>
        <p className={`text-gray-600 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6" dir={direction}>
        <TabsList className="grid w-full grid-cols-6" dir={direction}>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            {t('settings.tabs.company')}
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="w-4 h-4" />
            {t('settings.tabs.financial')}
          </TabsTrigger>
          <TabsTrigger value="taxes" className="gap-2">
            <Percent className="w-4 h-4" />
            {t('settings.tabs.taxes')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            {t('settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            {t('settings.tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            {t('settings.tabs.appearance')}
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
      </Tabs>
    </div>
  );
}
