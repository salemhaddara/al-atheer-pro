import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Building2, Plus, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function Banks() {
  const { t, direction } = useLanguage();
  const [banks, setBanks] = useState([
    {
      id: '1',
      name: 'البنك الأهلي السعودي',
      nameEn: 'Al Ahli Bank',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      region: 'حي الملز',
      accountNumber: '1234567890',
      iban: 'SA1234567890123456789012',
      mobile: '0501234567',
      balance: 450000
    },
    {
      id: '2',
      name: 'بنك الراجحي',
      nameEn: 'Al Rajhi Bank',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      region: 'حي العليا',
      accountNumber: '0987654321',
      iban: 'SA0987654321098765432109',
      mobile: '0507654321',
      balance: 320000
    },
    {
      id: '3',
      name: 'البنك السعودي الفرنسي',
      nameEn: 'Banque Saudi Fransi',
      country: 'المملكة العربية السعودية',
      city: 'جدة',
      region: 'حي الروضة',
      accountNumber: '5555666677',
      iban: 'SA5555666677778888999900',
      mobile: '0505556666',
      balance: 180000
    }
  ]);

  const [atms, setAtms] = useState([
    {
      id: '1',
      name: 'جهاز الصراف - الفرع الرئيسي',
      nameEn: 'ATM - Main Branch',
      deviceNumber: 'ATM-001',
      bankId: '1',
      bankName: 'البنك الأهلي السعودي',
      location: 'الفرع الرئيسي - الرياض',
      status: 'نشط'
    },
    {
      id: '2',
      name: 'نقطة بيع POS - الكاشير 1',
      nameEn: 'POS - Cashier 1',
      deviceNumber: 'POS-001',
      bankId: '2',
      bankName: 'بنك الراجحي',
      location: 'الفرع الرئيسي - الرياض',
      status: 'نشط'
    },
    {
      id: '3',
      name: 'نقطة بيع POS - الكاشير 2',
      nameEn: 'POS - Cashier 2',
      deviceNumber: 'POS-002',
      bankId: '2',
      bankName: 'بنك الراجحي',
      location: 'فرع جدة',
      status: 'نشط'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className={`flex flex-col gap-2 ${direction === 'rtl' ? 'items-end text-right' : 'items-start text-left'}`}>
        <h1 className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('banks.title')}</h1>
        <p className={`text-gray-600 max-w-2xl ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{t('banks.subtitle')}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">إجمالي البنوك</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{banks.length}</div>
            <p className="text-xs text-gray-600 mt-1">بنك مسجل</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">أجهزة ATM/POS</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{atms.length}</div>
            <p className="text-xs text-gray-600 mt-1">جهاز نشط</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">إجمالي الأرصدة البنكية</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-gray-600 mt-1">في جميع البنوك</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="banks" className="w-full">
        <TabsList>
          <TabsTrigger value="banks">البنوك</TabsTrigger>
          <TabsTrigger value="atms">أجهزة الصراف الآلي / POS</TabsTrigger>
        </TabsList>

        {/* Banks Tab */}
        <TabsContent value="banks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      بنك جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                    <DialogHeader className="text-right">
                      <DialogTitle>إضافة بنك جديد</DialogTitle>
                      <DialogDescription>قم بإدخال بيانات الحساب البنكي (Banks Table)</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>اسم البنك (عربي)</Label>
                          <Input placeholder="بنك الإنماء" />
                        </div>
                        <div className="space-y-2">
                          <Label>Bank Name (English)</Label>
                          <Input placeholder="Alinma Bank" dir="ltr" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>الدولة / Country</Label>
                          <Input placeholder="المملكة العربية السعودية" />
                        </div>
                        <div className="space-y-2">
                          <Label>المدينة / City</Label>
                          <Input placeholder="الرياض" />
                        </div>
                        <div className="space-y-2">
                          <Label>المنطقة / Region</Label>
                          <Input placeholder="حي العليا" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>رقم الحساب / Account Number</Label>
                          <Input placeholder="1234567890" dir="ltr" />
                        </div>
                        <div className="space-y-2">
                          <Label>رقم الآيبان / IBAN</Label>
                          <Input placeholder="SA1234567890123456789012" dir="ltr" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>رقم الجوال المسجل / Registered Mobile Number</Label>
                        <Input placeholder="05xxxxxxxx" dir="ltr" />
                      </div>

                      <div className="space-y-2">
                        <Label>الرصيد الافتتاحي (ر.س)</Label>
                        <Input type="number" placeholder="0.00" defaultValue="0" />
                      </div>

                      <Button className="w-full" onClick={() => toast.success('تم إضافة البنك بنجاح')}>
                        حفظ البنك
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="text-right">
                  <CardTitle>قائمة البنوك</CardTitle>
                  <CardDescription>عرض وإدارة جميع الحسابات البنكية</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم البنك (عربي)</TableHead>
                      <TableHead className="text-right">Bank Name (English)</TableHead>
                      <TableHead className="text-right">الدولة</TableHead>
                      <TableHead className="text-right">المدينة</TableHead>
                      <TableHead className="text-right">المنطقة</TableHead>
                      <TableHead className="text-right">رقم الحساب</TableHead>
                      <TableHead className="text-right">الآيبان (IBAN)</TableHead>
                      <TableHead className="text-right">رقم الجوال</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banks.map((bank) => (
                      <TableRow key={bank.id}>
                        <TableCell className="text-right">{bank.name}</TableCell>
                        <TableCell className="text-right" dir="ltr">{bank.nameEn}</TableCell>
                        <TableCell className="text-right">{bank.country}</TableCell>
                        <TableCell className="text-right">{bank.city}</TableCell>
                        <TableCell className="text-right">{bank.region}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{bank.accountNumber}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{bank.iban}</TableCell>
                        <TableCell className="text-right">{bank.mobile}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600">{formatCurrency(bank.balance)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm">تعديل</Button>
                            <Button variant="ghost" size="sm">سجل الحركات</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ATMs/POS Tab */}
        <TabsContent value="atms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      جهاز ATM/POS جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" dir="rtl">
                    <DialogHeader className="text-right">
                      <DialogTitle>إضافة جهاز ATM أو نقطة بيع POS</DialogTitle>
                      <DialogDescription>قم بإدخال بيانات الجهاز (ATM Table)</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>اسم الجهاز (عربي)</Label>
                          <Input placeholder="جهاز الصراف - الفرع الشرقي" />
                        </div>
                        <div className="space-y-2">
                          <Label>Device Name (English)</Label>
                          <Input placeholder="ATM - East Branch" dir="ltr" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>رقم الجهاز / Device Number</Label>
                        <Input placeholder="ATM-004 أو POS-005" dir="ltr" />
                      </div>

                      <div className="space-y-2">
                        <Label>البنك المرتبط / Linked Bank</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر البنك" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map((bank) => (
                              <SelectItem key={bank.id} value={bank.id}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>موقع الجهاز / Device Location</Label>
                        <Input placeholder="الفرع الرئيسي - الرياض" />
                      </div>

                      <Button className="w-full" onClick={() => toast.success('تم إضافة الجهاز بنجاح')}>
                        حفظ الجهاز
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="text-right">
                  <CardTitle>أجهزة الصراف الآلي ونقاط البيع</CardTitle>
                  <CardDescription>ربط أجهزة ATM/POS بالحسابات البنكية</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الجهاز (عربي)</TableHead>
                      <TableHead className="text-right">Device Name (English)</TableHead>
                      <TableHead className="text-right">رقم الجهاز</TableHead>
                      <TableHead className="text-right">البنك المرتبط</TableHead>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atms.map((atm) => (
                      <TableRow key={atm.id}>
                        <TableCell className="text-right">{atm.name}</TableCell>
                        <TableCell className="text-right" dir="ltr">{atm.nameEn}</TableCell>
                        <TableCell className="text-right font-mono">{atm.deviceNumber}</TableCell>
                        <TableCell className="text-right">{atm.bankName}</TableCell>
                        <TableCell className="text-right">{atm.location}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default">{atm.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm">تعديل</Button>
                            <Button variant="ghost" size="sm">عرض</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
