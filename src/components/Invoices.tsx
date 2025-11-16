import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Search, Download, Eye, Printer, Send, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function Invoices() {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2025-001',
      date: '2025-01-15',
      customer: 'شركة النجاح التقنية',
      type: 'مبيعات',
      amount: 45000,
      tax: 6750,
      total: 51750,
      status: 'مدفوعة',
      dueDate: '2025-02-15'
    },
    {
      id: 'INV-2025-002',
      date: '2025-01-20',
      customer: 'مؤسسة الريادة للخدمات',
      type: 'مبيعات',
      amount: 28000,
      tax: 4200,
      total: 32200,
      status: 'معلقة',
      dueDate: '2025-02-20'
    },
    {
      id: 'PUR-2025-001',
      date: '2025-01-18',
      customer: 'مورد المعدات المكتبية',
      type: 'مشتريات',
      amount: 15000,
      tax: 2250,
      total: 17250,
      status: 'مدفوعة',
      dueDate: '2025-02-18'
    },
    {
      id: 'INV-2025-003',
      date: '2025-01-25',
      customer: 'شركة التميز للاستثمار',
      type: 'مبيعات',
      amount: 67000,
      tax: 10050,
      total: 77050,
      status: 'متأخرة',
      dueDate: '2025-01-31'
    }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: '1', name: 'مورد المعدات المكتبية', vat: '300123456700003' },
    { id: '2', name: 'مورد الأثاث', vat: '300234567800003' },
    { id: '3', name: 'مورد الأجهزة الإلكترونية', vat: '300345678900003' }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مدفوعة':
        return 'default';
      case 'معلقة':
        return 'secondary';
      case 'متأخرة':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleCreateInvoice = () => {
    toast.success('تم إنشاء الفاتورة بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>إدارة الفواتير</h1>
          <p className="text-gray-600">إنشاء وإدارة فواتير المبيعات والمشتريات</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
              <DialogDescription>
                قم بإدخال تفاصيل الفاتورة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>نوع الفاتورة</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">فاتورة مبيعات</SelectItem>
                      <SelectItem value="purchase">فاتورة مشتريات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input type="date" defaultValue="2025-01-30" />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الاستحقاق</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>العميل / المورد</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل أو المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer1">شركة النجاح التقنية</SelectItem>
                    <SelectItem value="customer2">مؤسسة الريادة للخدمات</SelectItem>
                    <SelectItem value="supplier1">مورد المعدات المكتبية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="text-right">بنود الفاتورة</h4>
                <div className="grid grid-cols-5 gap-2 text-sm text-right">
                  <div>المنتج/الخدمة</div>
                  <div>الكمية</div>
                  <div>السعر</div>
                  <div>الضريبة</div>
                  <div>المجموع</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <Input placeholder="اسم المنتج" />
                  <Input type="number" placeholder="1" />
                  <Input type="number" placeholder="0.00" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="15%" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="0">معفى</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="0.00" disabled />
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة بند
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
                <div className="flex justify-between">
                  <span>0.00 ر.س</span>
                  <span>المجموع الفرعي:</span>
                </div>
                <div className="flex justify-between">
                  <span>0.00 ر.س</span>
                  <span>الضريبة (15%):</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>0.00 ر.س</span>
                  <span>المجموع الكلي:</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input placeholder="ملاحظات إضافية (اختياري)" />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateInvoice} className="flex-1 gap-2">
                  <FileText className="w-4 h-4" />
                  حفظ الفاتورة
                </Button>
                <Button variant="outline" className="flex-1">إلغاء</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 text-right">
            <CardTitle className="text-sm">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(140000)}</div>
            <p className="text-xs text-gray-600 mt-1">هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-right">
            <CardTitle className="text-sm">الفواتير المدفوعة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">12</div>
            <p className="text-xs text-gray-600 mt-1">من أصل 15 فاتورة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-right">
            <CardTitle className="text-sm">الفواتير المعلقة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(32200)}</div>
            <p className="text-xs text-gray-600 mt-1">2 فاتورة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-right">
            <CardTitle className="text-sm">الفواتير المتأخرة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl text-red-600">{formatCurrency(77050)}</div>
            <p className="text-xs text-gray-600 mt-1">1 فاتورة</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Tabs defaultValue="all" className="w-full" dir="rtl">
        <TabsList>
          <TabsTrigger value="all">جميع الفواتير</TabsTrigger>
          <TabsTrigger value="sales">فواتير المبيعات</TabsTrigger>
          <TabsTrigger value="purchases">فواتير المشتريات</TabsTrigger>
          <TabsTrigger value="overdue">المتأخرة</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4" dir="rtl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <CardTitle>جميع الفواتير</CardTitle>
                  <CardDescription>عرض وإدارة جميع الفواتير</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  تصدير
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="بحث في الفواتير..."
                    className="pl-10 text-right"
                    dir="rtl"
                  />
                </div>
              </div>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الفاتورة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">العميل/المورد</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الضريبة</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-right">{invoice.id}</TableCell>
                        <TableCell className="text-right">{invoice.date}</TableCell>
                        <TableCell className="text-right">{invoice.customer}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{invoice.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.tax)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
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

        <TabsContent value="sales">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">فواتير المبيعات فقط</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">فواتير المشتريات فقط</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">الفواتير المتأخرة</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
