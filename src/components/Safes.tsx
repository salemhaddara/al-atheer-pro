import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Vault, Plus, DollarSign, TrendingUp, Users, Edit, HistoryIcon } from 'lucide-react';
import { toast } from 'sonner';

export function Safes() {
  const [safes, setSafes] = useState([
    {
      id: '1',
      name: 'الخزينة الرئيسية',
      nameEn: 'Main Safe',
      branch: 'الفرع الرئيسي',
      balance: 45000,
      employee: 'أحمد محمد',
      status: 'نشط',
      notes: 'الخزينة الرئيسية للفرع'
    },
    {
      id: '2',
      name: 'خزينة نقاط البيع',
      nameEn: 'POS Safe',
      branch: 'الفرع الرئيسي',
      balance: 12000,
      employee: 'فاطمة علي',
      status: 'نشط',
      notes: 'خزينة خاصة بنقاط البيع'
    },
    {
      id: '3',
      name: 'خزينة فرع الشمال',
      nameEn: 'North Branch Safe',
      branch: 'فرع الشمال',
      balance: 28000,
      employee: 'سعيد خالد',
      status: 'نشط',
      notes: ''
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const totalBalance = safes.reduce((sum, safe) => sum + safe.balance, 0);
  const activeSafes = safes.filter(s => s.status === 'نشط').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>إدارة الخزائن</h1>
          <p className="text-gray-600">إدارة الخزائن والأرصدة النقدية</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              خزينة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>إضافة خزينة جديدة</DialogTitle>
              <DialogDescription>قم بإدخال بيانات الخزينة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الخزينة (عربي)</Label>
                  <Input placeholder="خزينة الفرع الشرقي" />
                </div>
                <div className="space-y-2">
                  <Label>Safe Name (English)</Label>
                  <Input placeholder="East Branch Safe" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الفرع المرتبط</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">الفرع الرئيسي</SelectItem>
                      <SelectItem value="2">فرع الشمال</SelectItem>
                      <SelectItem value="3">فرع جدة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الموظف المسؤول</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">أحمد محمد</SelectItem>
                      <SelectItem value="2">فاطمة علي</SelectItem>
                      <SelectItem value="3">سعيد خالد</SelectItem>
                      <SelectItem value="4">نورة عبدالله</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>الرصيد الافتتاحي (ر.س)</Label>
                <Input type="number" placeholder="0.00" defaultValue="0" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>حالة الخزينة</Label>
                  <p className="text-sm text-gray-600">تفعيل أو تعطيل الخزينة</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  placeholder="أدخل أي ملاحظات إضافية..."
                  rows={3}
                />
              </div>

              <Button className="w-full" onClick={() => toast.success('تم إضافة الخزينة بنجاح')}>
                حفظ الخزينة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Vault className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">إجمالي الخزائن</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{safes.length}</div>
            <p className="text-xs text-gray-600 mt-1">خزينة مسجلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">الخزائن النشطة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{activeSafes}</div>
            <p className="text-xs text-gray-600 mt-1">خزينة نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">إجمالي الأرصدة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-gray-600 mt-1">الرصيد الإجمالي</p>
          </CardContent>
        </Card>
      </div>

      {/* Safes Table */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle>قائمة الخزائن</CardTitle>
          <CardDescription>عرض وإدارة جميع الخزائن </CardDescription>
        </CardHeader>
        <CardContent>
          <div dir="rtl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الخزينة (عربي)</TableHead>
                  <TableHead className="text-right">الفرع المرتبط</TableHead>
                  <TableHead className="text-right">الموظف المسؤول</TableHead>
                  <TableHead className="text-right">الرصيد الحالي</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">ملاحظات</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safes.map((safe) => (
                  <TableRow key={safe.id}>
                    <TableCell className="text-right">{safe.name}</TableCell>
                    <TableCell className="text-right">{safe.branch}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-start">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{safe.employee}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600">{formatCurrency(safe.balance)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={safe.status === 'نشط' ? 'default' : 'secondary'}>
                        {safe.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right max-w-xs truncate">
                      {safe.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-start">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="w-4 h-4" />
                          تعديل
                        </Button>
                        <Button variant="outline" size="sm"><HistoryIcon className="w-4 h-4" />سجل الحركات</Button>
                      </div>
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
