import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users2, Plus, Search, DollarSign, Package, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([
    {
      id: '1',
      name: 'مورد المعدات المكتبية',
      contact: 'أحمد محمد',
      phone: '0501234567',
      email: 'info@supplier1.com',
      vatNumber: '300123456700003',
      address: 'الرياض، حي الصناعية',
      category: 'معدات مكتبية',
      totalPurchases: 125000,
      outstandingBalance: 15000,
      rating: 4.5,
      status: 'نشط'
    },
    {
      id: '2',
      name: 'مورد الأثاث',
      contact: 'سعيد علي',
      phone: '0507654321',
      email: 'contact@supplier2.com',
      vatNumber: '300234567800003',
      address: 'جدة، حي الروضة',
      category: 'أثاث',
      totalPurchases: 89000,
      outstandingBalance: 8000,
      rating: 4.2,
      status: 'نشط'
    },
    {
      id: '3',
      name: 'مورد الأجهزة الإلكترونية',
      contact: 'خالد عبدالله',
      phone: '0509876543',
      email: 'sales@supplier3.com',
      vatNumber: '300345678900003',
      address: 'الدمام، حي الفيصلية',
      category: 'إلكترونيات',
      totalPurchases: 210000,
      outstandingBalance: 25000,
      rating: 4.8,
      status: 'نشط'
    }
  ]);

  const [supplierProducts, setSupplierProducts] = useState([
    { id: '1', supplier: 'مورد المعدات المكتبية', product: 'كمبيوتر محمول HP', sku: 'SKU-001', price: 2800, leadTime: '3-5 أيام' },
    { id: '2', supplier: 'مورد المعدات المكتبية', product: 'طابعة Canon', sku: 'SKU-002', price: 1900, leadTime: '2-3 أيام' },
    { id: '3', supplier: 'مورد الأجهزة الإلكترونية', product: 'شاشة Samsung 27"', sku: 'SKU-003', price: 1400, leadTime: '5-7 أيام' }
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
          <h1>إدارة الموردين</h1>
          <p className="text-gray-600">متابعة وإدارة الموردين والمنتجات</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              مورد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>إضافة مورد جديد</DialogTitle>
              <DialogDescription>قم بإدخال بيانات المورد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم المورد</Label>
                <Input placeholder="اسم الشركة الموردة" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>جهة الاتصال</Label>
                  <Input placeholder="الاسم الكامل" />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input placeholder="05xxxxxxxx" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>الرقم الضريبي</Label>
                <Input placeholder="300xxxxxx00003" />
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input placeholder="المدينة، الحي، الشارع" />
              </div>
              <div className="space-y-2">
                <Label>الفئة</Label>
                <Input placeholder="نوع المنتجات المقدمة" />
              </div>
              <Button className="w-full" onClick={() => toast.success('تم إضافة المورد بنجاح')}>
                حفظ المورد
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Users2 className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">إجمالي الموردين</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">24</div>
            <p className="text-xs text-gray-600 mt-1">مورد نشط</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">إجمالي المشتريات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(424000)}</div>
            <p className="text-xs text-gray-600 mt-1">هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm">الأرصدة المستحقة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(48000)}</div>
            <p className="text-xs text-gray-600 mt-1">مستحق الدفع</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Package className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">المنتجات المتاحة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">156</div>
            <p className="text-xs text-gray-600 mt-1">منتج من الموردين</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList>
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
          <TabsTrigger value="products">منتجات الموردين</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        </TabsList>

        {/* Suppliers */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>قائمة الموردين</CardTitle>
              <CardDescription>عرض ومتابعة بيانات الموردين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="بحث عن مورد..." className="pl-10 text-right" dir="rtl" />
                </div>
              </div>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المورد</TableHead>
                      <TableHead className="text-right">جهة الاتصال</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">البريد</TableHead>
                      <TableHead className="text-right">الفئة</TableHead>
                      <TableHead className="text-right">إجمالي المشتريات</TableHead>
                      <TableHead className="text-right">الرصيد المستحق</TableHead>
                      <TableHead className="text-right">التقييم</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="text-right">{supplier.name}</TableCell>
                        <TableCell className="text-right">{supplier.contact}</TableCell>
                        <TableCell className="text-right">{supplier.phone}</TableCell>
                        <TableCell className="text-right">{supplier.email}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{supplier.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(supplier.totalPurchases)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(supplier.outstandingBalance)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <span>{supplier.rating}</span>
                            <span>⭐</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default">{supplier.status}</Badge>
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
        </TabsContent>

        {/* Supplier Products */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  ربط منتج بمورد
                </Button>
                <div className="text-right">
                  <CardTitle>منتجات الموردين</CardTitle>
                  <CardDescription>ربط المنتجات بالموردين</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المورد</TableHead>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">رمز SKU</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">مدة التوريد</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierProducts.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-right">{item.supplier}</TableCell>
                        <TableCell className="text-right">{item.product}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.sku}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">{item.leadTime}</TableCell>
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
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>المدفوعات للموردين</CardTitle>
              <CardDescription>متابعة المدفوعات والأرصدة المستحقة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>سجل المدفوعات</p>
                <p className="text-sm mt-2">سيتم عرض جميع المدفوعات للموردين هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
