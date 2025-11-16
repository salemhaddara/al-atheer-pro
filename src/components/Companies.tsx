import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Building2, Plus, MapPin, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Companies() {
  const [companies, setCompanies] = useState([
    {
      id: '1',
      name: 'شركة الأمل للتجارة',
      crNumber: '1010123456',
      vatNumber: '300123456700003',
      address: 'الرياض، طريق الملك فهد',
      phone: '0112345678',
      email: 'info@alamal.com',
      branches: 5,
      employees: 45,
      revenue: 2500000,
      status: 'نشط'
    },
    {
      id: '2',
      name: 'شركة النجاح التقنية',
      crNumber: '1010234567',
      vatNumber: '300234567800003',
      address: 'جدة، حي الروضة',
      phone: '0122345678',
      email: 'contact@alnajah.com',
      branches: 3,
      employees: 28,
      revenue: 1800000,
      status: 'نشط'
    },
    {
      id: '3',
      name: 'مؤسسة الريادة للخدمات',
      crNumber: '1010345678',
      vatNumber: '300345678900003',
      address: 'الدمام، حي الفيصلية',
      phone: '0132345678',
      email: 'info@alriyada.com',
      branches: 2,
      employees: 18,
      revenue: 1200000,
      status: 'نشط'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>إدارة الشركات</h1>
          <p className="text-gray-600">نظام متعدد الشركات - إدارة جميع الشركات</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              شركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>إضافة شركة جديدة</DialogTitle>
              <DialogDescription>قم بإدخال بيانات الشركة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الشركة</Label>
                <Input placeholder="شركة التميز للاستثمار" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم السجل التجاري</Label>
                  <Input placeholder="1010456789" />
                </div>
                <div className="space-y-2">
                  <Label>الرقم الضريبي</Label>
                  <Input placeholder="300456789000003" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input placeholder="المدينة، الحي، الشارع" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input placeholder="0112345678" />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input type="email" placeholder="info@company.com" />
                </div>
              </div>
              <Button className="w-full" onClick={() => toast.success('تم إضافة الشركة بنجاح')}>
                حفظ الشركة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">إجمالي الشركات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">12</div>
            <p className="text-xs text-gray-600 mt-1">شركة نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">إجمالي الفروع</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">45</div>
            <p className="text-xs text-gray-600 mt-1">فرع في جميع المناطق</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">إجمالي الموظفين</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">287</div>
            <p className="text-xs text-gray-600 mt-1">موظف في جميع الشركات</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(8500000)}</div>
            <p className="text-xs text-gray-600 mt-1">هذا الشهر</p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle>قائمة الشركات</CardTitle>
          <CardDescription>عرض وإدارة جميع الشركات في المنصة</CardDescription>
        </CardHeader>
        <CardContent>
          <div dir="rtl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الشركة</TableHead>
                  <TableHead className="text-right">السجل التجاري</TableHead>
                  <TableHead className="text-right">الرقم الضريبي</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الفروع</TableHead>
                  <TableHead className="text-right">الموظفين</TableHead>
                  <TableHead className="text-right">الإيرادات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="text-right">{company.name}</TableCell>
                    <TableCell className="text-right">{company.crNumber}</TableCell>
                    <TableCell className="text-right">{company.vatNumber}</TableCell>
                    <TableCell className="max-w-xs truncate text-right">{company.address}</TableCell>
                    <TableCell className="text-right">{company.phone}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{company.branches}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{company.employees}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(company.revenue)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default">{company.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">تعديل</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
