import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Settings, Database, Zap, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function SystemSetup() {
  const { t, direction } = useLanguage();

  const [features, setFeatures] = useState({
    pos: true,
    inventory: true,
    hr: true,
    accounting: true,
    multiCurrency: false,
    barcode: true,
    reports: true,
    zatca: false
  });

  const handleFeatureToggle = (feature: string) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature as keyof typeof prev] }));
    toast.success(t('systemSetup.settingsUpdated'));
  };

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div>
        <h1>{t('systemSetup.title')}</h1>
        <p className="text-gray-600">{t('systemSetup.subtitle')}</p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="features" className="w-full" dir={direction}>
        <TabsList dir={direction}>
          <TabsTrigger value="features">{t('systemSetup.tabs.features')}</TabsTrigger>
          <TabsTrigger value="general">{t('systemSetup.tabs.general')}</TabsTrigger>
          <TabsTrigger value="integrations">{t('systemSetup.tabs.integrations')}</TabsTrigger>
          <TabsTrigger value="backup">{t('systemSetup.tabs.backup')}</TabsTrigger>
        </TabsList>

        {/* Features */}
        <TabsContent value="features" className="space-y-4" >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {t('systemSetup.features.title')}
              </CardTitle>
              <CardDescription>{t('systemSetup.features.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.features.pos.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.features.pos.description')}</p>
                </div>
                <Switch
                  checked={features.pos}
                  onCheckedChange={() => handleFeatureToggle('pos')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.features.inventory.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.features.inventory.description')}</p>
                </div>
                <Switch
                  checked={features.inventory}
                  onCheckedChange={() => handleFeatureToggle('inventory')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.features.hr.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.features.hr.description')}</p>
                </div>
                <Switch
                  checked={features.hr}
                  onCheckedChange={() => handleFeatureToggle('hr')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.features.accounting.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.features.accounting.description')}</p>
                </div>
                <Switch
                  checked={features.accounting}
                  onCheckedChange={() => handleFeatureToggle('accounting')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.features.multiCurrency.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.features.multiCurrency.description')}</p>
                </div>
                <Switch
                  checked={features.multiCurrency}
                  onCheckedChange={() => handleFeatureToggle('multiCurrency')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.features.barcode.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.features.barcode.description')}</p>
                </div>
                <Switch
                  checked={features.barcode}
                  onCheckedChange={() => handleFeatureToggle('barcode')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.features.reports.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.features.reports.description')}</p>
                </div>
                <Switch
                  checked={features.reports}
                  onCheckedChange={() => handleFeatureToggle('reports')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('systemSetup.general.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('systemSetup.general.systemName')}</Label>
                  <Input placeholder={t('systemSetup.general.systemNamePlaceholder')} defaultValue={t('systemSetup.general.systemNamePlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('systemSetup.general.defaultCurrency')}</Label>
                  <Select defaultValue="SAR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">{t('systemSetup.general.currencies.SAR')}</SelectItem>
                      <SelectItem value="USD">{t('systemSetup.general.currencies.USD')}</SelectItem>
                      <SelectItem value="EUR">{t('systemSetup.general.currencies.EUR')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('systemSetup.general.defaultTaxRate')}</Label>
                  <Input type="number" defaultValue="15" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>{t('systemSetup.general.timezone')}</Label>
                  <Select defaultValue="riyadh">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="riyadh">{t('systemSetup.general.timezones.riyadh')}</SelectItem>
                      <SelectItem value="dubai">{t('systemSetup.general.timezones.dubai')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('systemSetup.general.dateFormat')}</Label>
                <Select defaultValue="dd-mm-yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">{t('systemSetup.general.dateFormats.ddmmyyyy')}</SelectItem>
                    <SelectItem value="mm-dd-yyyy">{t('systemSetup.general.dateFormats.mmddyyyy')}</SelectItem>
                    <SelectItem value="yyyy-mm-dd">{t('systemSetup.general.dateFormats.yyyymmdd')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => toast.success(t('systemSetup.settingsSaved'))}>
                {t('systemSetup.general.saveChanges')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('systemSetup.integrations.title')}
              </CardTitle>
              <CardDescription>{t('systemSetup.integrations.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.integrations.zatca.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.integrations.zatca.description')}</p>
                </div>
                <Switch
                  checked={features.zatca}
                  onCheckedChange={() => handleFeatureToggle('zatca')}
                />
              </div>

              {features.zatca && (
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <h4>{t('systemSetup.integrations.zatca.settingsTitle')}</h4>
                  <div className="space-y-2">
                    <Label>{t('systemSetup.integrations.zatca.apiKey')}</Label>
                    <Input placeholder={t('systemSetup.integrations.zatca.apiKeyPlaceholder')} type="password" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('systemSetup.integrations.zatca.environment')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('systemSetup.integrations.zatca.environmentPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">{t('systemSetup.integrations.zatca.sandbox')}</SelectItem>
                        <SelectItem value="production">{t('systemSetup.integrations.zatca.production')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm">{t('systemSetup.integrations.zatca.testConnection')}</Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.integrations.paymentGateways.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.integrations.paymentGateways.description')}</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.integrations.emailNotifications.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.integrations.emailNotifications.description')}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label>{t('systemSetup.integrations.sms.name')}</Label>
                  <p className="text-sm text-gray-600">{t('systemSetup.integrations.sms.description')}</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                {t('systemSetup.backup.title')}
              </CardTitle>
              <CardDescription>{t('systemSetup.backup.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('systemSetup.backup.autoBackup')}</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled">{t('systemSetup.backup.autoBackupOptions.disabled')}</SelectItem>
                    <SelectItem value="daily">{t('systemSetup.backup.autoBackupOptions.daily')}</SelectItem>
                    <SelectItem value="weekly">{t('systemSetup.backup.autoBackupOptions.weekly')}</SelectItem>
                    <SelectItem value="monthly">{t('systemSetup.backup.autoBackupOptions.monthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('systemSetup.backup.backupTime')}</Label>
                <Input type="time" defaultValue="02:00" dir="ltr" />
              </div>

              <div className="flex gap-2">
                <Button className="gap-2">
                  <Database className="w-4 h-4" />
                  {t('systemSetup.backup.createBackup')}
                </Button>
                <Button variant="outline">
                  {t('systemSetup.backup.restoreBackup')}
                </Button>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="mb-3">{t('systemSetup.backup.purgeData.title')}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {t('systemSetup.backup.purgeData.warning')}
                </p>
                <Button variant="destructive">
                  {t('systemSetup.backup.purgeData.button')}
                </Button>
              </div>

              <div className="border-t pt-4 mt-6 border-red-200 bg-red-50 p-4 rounded-lg">
                <h4 className="mb-3 text-red-700">
                  {t('systemSetup.backup.systemReset.title')} / {t('systemSetup.backup.systemReset.titleEn')}
                </h4>
                <p className="text-sm text-red-600 mb-4">
                  {t('systemSetup.backup.systemReset.warning')}
                  <br />
                  <strong>{t('systemSetup.backup.systemReset.warningEn')}</strong>
                </p>
                <ul className="text-sm text-red-600 mb-4 list-disc list-inside space-y-1">
                  <li>{t('systemSetup.backup.systemReset.keepItems.mainBranch')} / {t('systemSetup.backup.systemReset.keepItems.mainBranchEn')}</li>
                  <li>{t('systemSetup.backup.systemReset.keepItems.mainWarehouse')} / {t('systemSetup.backup.systemReset.keepItems.mainWarehouseEn')}</li>
                  <li>{t('systemSetup.backup.systemReset.keepItems.mainSafe')} / {t('systemSetup.backup.systemReset.keepItems.mainSafeEn')}</li>
                  <li>{t('systemSetup.backup.systemReset.keepItems.defaultVat')} / {t('systemSetup.backup.systemReset.keepItems.defaultVatEn')}</li>
                  <li>{t('systemSetup.backup.systemReset.keepItems.basicData')} / {t('systemSetup.backup.systemReset.keepItems.basicDataEn')}</li>
                </ul>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Database className="w-4 h-4" />
                      {t('systemSetup.backup.systemReset.button')} / {t('systemSetup.backup.systemReset.buttonEn')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir={direction}>
                    <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      <DialogTitle className="text-red-600">
                        {t('systemSetup.backup.systemReset.dialogTitle')} / {t('systemSetup.backup.systemReset.dialogTitleEn')}
                      </DialogTitle>
                      <DialogDescription className="text-red-600">
                        {t('systemSetup.backup.systemReset.dialogWarning')}
                        <br />
                        {t('systemSetup.backup.systemReset.dialogWarningEn')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>
                          {t('systemSetup.backup.systemReset.confirmLabel')} / {t('systemSetup.backup.systemReset.confirmLabelEn')}
                        </Label>
                        <Input placeholder={t('systemSetup.backup.systemReset.confirmPlaceholder')} dir="ltr" />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            toast.error(`${t('systemSetup.backup.systemReset.successMessage')} / ${t('systemSetup.backup.systemReset.successMessageEn')}`);
                          }}
                        >
                          {t('systemSetup.backup.systemReset.confirmButton')} / {t('systemSetup.backup.systemReset.confirmButtonEn')}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          {t('systemSetup.backup.systemReset.cancelButton')} / {t('systemSetup.backup.systemReset.cancelButtonEn')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
