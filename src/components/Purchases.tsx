import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Plus, Search, ShoppingBag, Package, TrendingDown, Users2, Eye, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { CreatePurchaseOrder } from './CreatePurchaseOrder';

export function Purchases() {
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 'PO-2025-001',
      date: '2025-01-10',
      supplier: 'مورد المعدات المكتبية',
      items: 25,
      amount: 35000,
      tax: 5250,
      total: 40250,
      status: 'مستلم',
      dueDate: '2025-02-10'
    },
    {
      id: 'PO-2025-002',
      date: '2025-01-18',
      supplier: 'مورد الأثاث',
      items: 12,
      amount: 18000,
      tax: 2700,
      total: 20700,
      status: 'قيد الانتظار',
      dueDate: '2025-02-18'
    },
    {
      id: 'PO-2025-003',
      date: '2025-01-25',
      supplier: 'مورد الأجهزة الإلكترونية',
      items: 30,
      amount: 52000,
      tax: 7800,
      total: 59800,
      status: 'مستلم جزئياً',
      dueDate: '2025-02-25'
    }
  ]);

  const [suppliers, setSuppliers] = useState([
    {
      id: '1',
      name: 'مورد المعدات المكتبية',
      contact: 'أحمد محمد',
      phone: '0501234567',
      email: 'info@supplier1.com',
      totalPurchases: 125000,
      rating: 4.5,
      accountNumber: 'SUP-001'
    },
    {
      id: '2',
      name: 'مورد الأثاث',
      contact: 'سعيد علي',
      phone: '0507654321',
      email: 'contact@supplier2.com',
      totalPurchases: 89000,
      rating: 4.2,
      accountNumber: 'SUP-002'
    },
    {
      id: '3',
      name: 'مورد الأجهزة الإلكترونية',
      contact: 'خالد عبدالله',
      phone: '0509876543',
      email: 'sales@supplier3.com',
      totalPurchases: 210000,
      rating: 4.8,
      accountNumber: 'SUP-003'
    }
  ]);

  // Sample products for purchase
  const products = [
    { id: '1', name: 'كمبيوتر محمول HP', price: 3000, costPrice: 2500, barcode: '1234567890', category: 'إلكترونيات', stock: 15 },
    { id: '2', name: 'طابعة Canon', price: 2000, costPrice: 1500, barcode: '1234567891', category: 'إلكترونيات', stock: 8 },
    { id: '3', name: 'شاشة Samsung 27"', price: 1500, costPrice: 1000, barcode: '1234567892', category: 'إلكترونيات', stock: 12 },
    { id: '4', name: 'لوحة مفاتيح Logitech', price: 300, costPrice: 200, barcode: '1234567893', category: 'ملحقات', stock: 25 },
    { id: '5', name: 'ماوس Logitech', price: 150, costPrice: 100, barcode: '1234567894', category: 'ملحقات', stock: 30 },
    { id: '6', name: 'كاميرا ويب HD', price: 500, costPrice: 350, barcode: '1234567895', category: 'ملحقات', stock: 10 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const handleCreatePurchase = (order: any) => {
    // Generate purchase order ID
    const orderId = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const newOrder = {
      id: orderId,
      date: order.date,
      supplier: order.supplierName,
      items: order.items.length,
      amount: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: 'قيد الانتظار',
      dueDate: order.dueDate || order.date
    };

    setPurchaseOrders([newOrder, ...purchaseOrders]);
    toast.success(`تم إنشاء طلب الشراء ${orderId} بنجاح`);
  };

  // Show create order screen
  if (showCreateOrder) {
    return (
      <CreatePurchaseOrder
        suppliers={suppliers}
        products={products}
        onBack={() => setShowCreateOrder(false)}
        onSave={handleCreatePurchase}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>إدارة المشتريات</h1>
          <p className="text-gray-600">متابعة وإدارة طلبات الشراء والموردين</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setShowCreateOrder(true)}>
          <Plus className="w-4 h-4" />
          طلب شراء جديد
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">إجمالي المشتريات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(120750)}</div>
            <p className="text-xs text-gray-600 mt-1">هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">عدد الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">18</div>
            <p className="text-xs text-gray-600 mt-1">طلب نشط</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Package className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm">قيد الانتظار</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(20700)}</div>
            <p className="text-xs text-gray-600 mt-1">1 طلب</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Users2 className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">عدد الموردين</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">12</div>
            <p className="text-xs text-gray-600 mt-1">مورد نشط</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">طلبات الشراء</TabsTrigger>
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
          <TabsTrigger value="received">المستلمات</TabsTrigger>
        </TabsList>

        {/* Purchase Orders */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  تصدير
                </Button>
                <div className="text-right">
                  <CardTitle>طلبات الشراء</CardTitle>
                  <CardDescription>عرض وإدارة جميع طلبات الشراء</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="بحث في الطلبات..." className="pl-10 text-right" dir="rtl" />
                </div>
              </div>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الطلب</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">المورد</TableHead>
                      <TableHead className="text-right">العناصر</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-right">{order.id}</TableCell>
                        <TableCell className="text-right">{order.date}</TableCell>
                        <TableCell className="text-right">{order.supplier}</TableCell>
                        <TableCell className="text-right">{order.items}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                        <TableCell className="text-right">{order.dueDate}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={
                              order.status === 'مستلم' ? 'default' : 
                              order.status === 'قيد الانتظار' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  مورد جديد
                </Button>
                <div className="text-right">
                  <CardTitle>إدارة الموردين</CardTitle>
                  <CardDescription>عرض ومتابعة بيانات الموردين</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المورد</TableHead>
                      <TableHead className="text-right">جهة الاتصال</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">إجمالي المشتريات</TableHead>
                      <TableHead className="text-right">التق��يم</TableHead>
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
                        <TableCell className="text-right">{formatCurrency(supplier.totalPurchases)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <span>{supplier.rating}</span>
                            <span>⭐</span>
                          </div>
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

        {/* Received Items */}
        <TabsContent value="received">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>المستلمات</CardTitle>
              <CardDescription>سجل استلام المشتريات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد مستلمات جديدة</p>
                <p className="text-sm mt-2">سيتم عرض المستلمات هنا عند توفرها</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
