import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Plus, Search, ShoppingBag, Package, Users2, Eye, Download, FileText, User, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { CreatePurchaseOrder } from './CreatePurchaseOrder';
import { reduceStock } from '../data/inventory';
import { addJournalEntries, createPurchaseReturnJournalEntries } from '../data/journalEntries';
import { useUser } from '../contexts/UserContext';

export function Purchases() {
  const { currentUser, isAdmin, hasAccessToWarehouse } = useUser();
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('1');

  // قائمة المستودعات
  const warehouses = [
    { id: '1', name: 'المستودع الرئيسي' },
    { id: '2', name: 'مستودع الفرع الشمالي' },
    { id: '3', name: 'مستودع الفرع الجنوبي' }
  ];

  // تصفية المستودعات حسب الصلاحيات
  const availableWarehouses = useMemo(() => {
    if (isAdmin()) {
      return warehouses; // الإدارة ترى كل المستودعات
    }
    // الموظف يرى فقط المستودع المخصص له
    if (currentUser?.assignedWarehouseId) {
      return warehouses.filter(w => w.id === currentUser.assignedWarehouseId);
    }
    return []; // لا يوجد مستودع مخصص
  }, [isAdmin, currentUser?.assignedWarehouseId]);

  // تعيين المستودع الافتراضي للموظف
  useEffect(() => {
    if (!isAdmin() && currentUser?.assignedWarehouseId) {
      setSelectedWarehouse(currentUser.assignedWarehouseId);
    }
  }, [isAdmin, currentUser?.assignedWarehouseId]);
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 'PO-2025-001',
      date: '2025-01-10',
      supplier: 'مورد المعدات المكتبية',
      supplierId: '1',
      itemsCount: 2,
      items: [
        { id: '1', name: 'كمبيوتر محمول HP', quantity: 5, price: 2500 },
        { id: '2', name: 'طابعة Canon', quantity: 3, price: 1500 }
      ],
      amount: 17000,
      tax: 2550,
      total: 19550,
      status: 'مستلم',
      dueDate: '2025-02-10',
      warehouse: '1',
      paymentBreakdown: { cash: 19550, credit: 0 }
    },
    {
      id: 'PO-2025-002',
      date: '2025-01-18',
      supplier: 'مورد الأثاث',
      supplierId: '2',
      itemsCount: 1,
      items: [
        { id: '4', name: 'لوحة مفاتيح Logitech', quantity: 10, price: 200 }
      ],
      amount: 2000,
      tax: 300,
      total: 2300,
      status: 'قيد الانتظار',
      dueDate: '2025-02-18',
      warehouse: '1',
      paymentBreakdown: { cash: 0, credit: 2300 }
    },
    {
      id: 'PO-2025-003',
      date: '2025-01-25',
      supplier: 'مورد الأجهزة الإلكترونية',
      supplierId: '3',
      itemsCount: 2,
      items: [
        { id: '3', name: 'شاشة Samsung 27\"', quantity: 4, price: 1000 },
        { id: '6', name: 'كاميرا ويب HD', quantity: 6, price: 350 }
      ],
      amount: 1000 * 4 + 350 * 6,
      tax: Math.round((1000 * 4 + 350 * 6) * 0.15),
      total: Math.round((1000 * 4 + 350 * 6) * 1.15),
      status: 'مستلم جزئياً',
      dueDate: '2025-02-25',
      warehouse: '1',
      paymentBreakdown: { cash: 0, credit: Math.round((1000 * 4 + 350 * 6) * 1.15) }
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

  // Purchase returns state
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnSupplierId, setReturnSupplierId] = useState<string | undefined>(undefined);
  const [returnItems, setReturnItems] = useState<
    Array<{ id: string; name: string; quantity: number; unitCost: number; returnQuantity: number }>
  >([]);
  const [refundMethod, setRefundMethod] = useState<'cash' | 'credit'>('cash');
  const [purchaseReturns, setPurchaseReturns] = useState<
    Array<{ id: string; date: string; supplier: string; orderId: string; total: number; method: string }>
  >([]);
  const [returnError, setReturnError] = useState<string | null>(null);

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
      supplierId: order.supplierId,
      itemsCount: order.items.length,
      items: order.items,
      amount: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: 'قيد الانتظار',
      dueDate: order.dueDate || order.date,
      warehouse: order.warehouse,
      paymentBreakdown: order.paymentBreakdown
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
      <div className="space-y-4">
      <div className="flex items-center justify-between">
          <div>
            <h1>المشتريات</h1>
            <p className="text-gray-600">نظام إدارة المشتريات والموردين</p>
          </div>
          <div className="flex gap-4 items-center">
            {/* User Info */}
            <div className="space-y-1">
              <label className="text-sm text-gray-600">المستخدم المسؤول</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {currentUser?.name || 'غير محدد'}
                </span>
              </div>
            </div>
            {/* Warehouse Selection */}
            {availableWarehouses.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm text-gray-600">المستودع</label>
                <Select
                  value={selectedWarehouse}
                  onValueChange={setSelectedWarehouse}
                  disabled={!isAdmin() && availableWarehouses.length === 1}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
        </div>
            )}
        <Button className="gap-2 shrink-0" onClick={() => setShowCreateOrder(true)}>
          <Plus className="w-4 h-4" />
          طلب شراء جديد
        </Button>
          </div>
        </div>
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
          <TabsTrigger value="returns">مرتجع المشتريات</TabsTrigger>
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
                        <TableCell className="text-right">{(order as any).itemsCount ?? order.items}</TableCell>
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

        {/* Purchase Returns */}
        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>مرتجع المشتريات</CardTitle>
              <CardDescription>إدارة مرتجعات المشتريات وإرجاع البضاعة للموردين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" dir="rtl">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>رقم أمر الشراء الأصلي</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="PO-2025-001"
                        value={returnOrderId}
                        onChange={(e) => setReturnOrderId(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          const order = purchaseOrders.find((o: any) => o.id === returnOrderId.trim());
                          if (!order) {
                            setReturnError('لم يتم العثور على أمر شراء بهذا الرقم');
                            setReturnItems([]);
                            return;
                          }
                          if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
                            setReturnError('أمر الشراء لا يحتوي على تفاصيل عناصر لعمل مرتجع');
                            setReturnItems([]);
                            return;
                          }

                          setReturnSupplierId((order as any).supplierId);
                          const mappedItems = order.items.map((item: any) => ({
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            unitCost: item.price,
                            returnQuantity: 0,
                            expiryDate: item.expiryDate
                          }));
                          setReturnItems(mappedItems);
                          setReturnError(null);
                        }}
                      >
                        <Search className="w-4 h-4" />
                        بحث
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>المورد</Label>
                    <Select
                      value={returnSupplierId}
                      onValueChange={(v) => setReturnSupplierId(v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>سبب الإرجاع</Label>
                    <Input
                      placeholder="مثال: بضائع تالفة، كمية زائدة..."
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                    />
                  </div>
                </div>

                {/* Inline validation error */}
                {returnError && (
                  <div className="rounded-md border border-red-200 bg-red-50 text-red-700 text-sm p-3 text-right">
                    {returnError}
                  </div>
                )}

                {/* Return Items Table */}
                {returnItems.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الصنف</TableHead>
                          <TableHead className="text-right">الكمية المشتراة</TableHead>
                          <TableHead className="text-right">سعر التكلفة</TableHead>
                          <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                          <TableHead className="text-right">الكمية المرتجعة</TableHead>
                          <TableHead className="text-right">قيمة المرتجع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnItems.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-right">{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                            <TableCell className="text-right">
                              {(item as any).expiryDate ? new Date((item as any).expiryDate).toLocaleDateString('ar-SA') : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                max={item.quantity}
                                value={item.returnQuantity}
                                onChange={(e) => {
                                  const value = Number(e.target.value) || 0;
                                  const safeValue = Math.max(0, Math.min(value, item.quantity));
                                  const updated = [...returnItems];
                                  updated[index] = { ...item, returnQuantity: safeValue };
                                  setReturnItems(updated);
                                }}
                                className="w-24 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unitCost * item.returnQuantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-gray-50 font-bold">
                          <TableCell colSpan={4} className="text-right">
                            إجمالي قيمة المرتجع
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              returnItems.reduce(
                                (sum, item) => sum + item.unitCost * item.returnQuantity,
                                0
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="border rounded-lg p-6 text-center text-gray-500 space-y-2">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>أدخل رقم أمر الشراء الأصلي ثم اضغط على زر البحث لعرض العناصر.</p>
                    <p className="text-xs">بعد ذلك يمكنك تحديد الكميات المراد إرجاعها لكل صنف.</p>
                  </div>
                )}

                {/* Refund Method & Submit */}
                {returnItems.some((i) => i.returnQuantity > 0) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>طريقة التسوية مع المورد</Label>
                        <Select
                          value={refundMethod}
                          onValueChange={(v) => setRefundMethod(v as 'cash' | 'credit')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">استرداد نقدي من المورد</SelectItem>
                            <SelectItem value="credit">تخفيض من رصيد المورد (على الحساب)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>إجمالي قيمة المرتجع</Label>
                        <div className="text-xl text-blue-600">
                          {formatCurrency(
                            returnItems.reduce(
                              (sum, item) => sum + item.unitCost * item.returnQuantity,
                              0
                            )
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => {
                            const order = purchaseOrders.find((o: any) => o.id === returnOrderId.trim());
                            if (!order) {
                              setReturnError('لم يتم العثور على أمر الشراء');
                              return;
                            }

                            const totalReturn = returnItems.reduce(
                              (sum, item) => sum + item.unitCost * item.returnQuantity,
                              0
                            );
                            if (totalReturn <= 0) {
                              setReturnError('يرجى إدخال كميات مرتجعة');
                              return;
                            }

                            const warehouse = (order as any).warehouse || '1';

                            // Reduce stock for returned quantities
                            for (const item of returnItems) {
                              if (item.returnQuantity > 0) {
                                const ok = reduceStock(item.id, warehouse, item.returnQuantity);
                                if (!ok) {
                                  setReturnError(`لا يمكن خصم الكمية من المخزون للصنف: ${item.name}`);
                                  return;
                                }
                              }
                            }

                            const supplier = suppliers.find((s) => s.id === returnSupplierId);
                            const supplierName = supplier?.name || order.supplier;

                            const returnNumber = `PRET-${new Date().getFullYear()}-${String(
                              Date.now()
                            ).slice(-6)}`;

                            // Create journal entries
                            const entries = createPurchaseReturnJournalEntries(
                              returnNumber,
                              order.id,
                              totalReturn,
                              refundMethod,
                              supplier?.id,
                              supplierName
                            );
                            addJournalEntries(entries);

                            // Save in local history
                            setPurchaseReturns((prev) => [
                              {
                                id: returnNumber,
                                date: new Date().toISOString().split('T')[0],
                                supplier: supplierName,
                                orderId: order.id,
                                total: totalReturn,
                                method: refundMethod === 'cash' ? 'استرداد نقدي' : 'تخفيض من الحساب'
                              },
                              ...prev
                            ]);

                            toast.success(`تم إنشاء مرتجع المشتريات بنجاح - ${returnNumber}`);
                            setReturnItems([]);
                            setReturnOrderId('');
                            setReturnReason('');
                            setReturnError(null);
                          }}
                        >
                          إتمام عملية مرتجع المشتريات
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Purchase Returns History */}
          <Card>
            <CardHeader className="text-right">
              <CardTitle>سجل مرتجعات المشتريات</CardTitle>
              <CardDescription>عرض آخر عمليات مرتجع المشتريات</CardDescription>
            </CardHeader>
            <CardContent>
              {purchaseReturns.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <p>لا توجد عمليات مرتجع مشتريات مسجلة حتى الآن.</p>
                </div>
              ) : (
                <div dir="rtl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم المرتجع</TableHead>
                        <TableHead className="text-right">تاريخ المرتجع</TableHead>
                        <TableHead className="text-right">المورد</TableHead>
                        <TableHead className="text-right">أمر الشراء</TableHead>
                        <TableHead className="text-right">إجمالي المرتجع</TableHead>
                        <TableHead className="text-right">طريقة التسوية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseReturns.map((ret) => (
                        <TableRow key={ret.id}>
                          <TableCell className="text-right">{ret.id}</TableCell>
                          <TableCell className="text-right">{ret.date}</TableCell>
                          <TableCell className="text-right">{ret.supplier}</TableCell>
                          <TableCell className="text-right">{ret.orderId}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(ret.total)}
                          </TableCell>
                          <TableCell className="text-right">{ret.method}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
