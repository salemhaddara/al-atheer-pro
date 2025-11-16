import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Warehouse, Package, TrendingDown, AlertTriangle, Plus, Search, ArrowRightLeft, Settings, Grid3x3, Edit, Trash2, Boxes, Calculator, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getStock, adjustStock, getCostPrice, getWarehouseProducts, increaseStock, reduceStock } from '../data/inventory';
import { createInventoryAdjustmentEntry, createInventoryReceiptFromAccountEntry, createInventoryIssueToAccountEntry, addJournalEntry } from '../data/journalEntries';

export function Warehouses() {

  const [warehouses, setWarehouses] = useState([
    { id: '1', name: 'المستودع الرئيسي', location: 'الرياض - حي الصناعية', capacity: 5000, used: 3200, manager: 'أحمد محمد', status: 'نشط' },
    { id: '2', name: 'مستودع الفرع الشمالي', location: 'الرياض - حي النرجس', capacity: 3000, used: 1800, manager: 'فاطمة علي', status: 'نشط' },
    { id: '3', name: 'مستودع الفرع الجنوبي', location: 'الرياض - حي العليا', capacity: 2000, used: 1500, manager: 'سعيد خالد', status: 'نشط' }
  ]);

  const [shelves, setShelves] = useState([
    { id: '1', code: 'A-01', warehouse: 'المستودع الرئيسي', warehouseId: '1', section: 'قسم A', level: 1, capacity: 200, used: 145, status: 'نشط', products: 12 },
    { id: '2', code: 'A-02', warehouse: 'المستودع الرئيسي', warehouseId: '1', section: 'قسم A', level: 2, capacity: 200, used: 180, status: 'نشط', products: 15 },
    { id: '3', code: 'A-03', warehouse: 'المستودع الرئيسي', warehouseId: '1', section: 'قسم A', level: 3, capacity: 200, used: 95, status: 'نشط', products: 8 },
    { id: '4', code: 'B-01', warehouse: 'المستودع الرئيسي', warehouseId: '1', section: 'قسم B', level: 1, capacity: 150, used: 120, status: 'نشط', products: 10 },
    { id: '5', code: 'B-02', warehouse: 'المستودع الرئيسي', warehouseId: '1', section: 'قسم B', level: 2, capacity: 150, used: 75, status: 'نشط', products: 6 },
    { id: '6', code: 'C-01', warehouse: 'مستودع الفرع الشمالي', warehouseId: '2', section: 'قسم C', level: 1, capacity: 180, used: 160, status: 'نشط', products: 14 },
    { id: '7', code: 'C-02', warehouse: 'مستودع الفرع الشمالي', warehouseId: '2', section: 'قسم C', level: 2, capacity: 180, used: 90, status: 'نشط', products: 7 },
    { id: '8', code: 'D-01', warehouse: 'مستودع الفرع الجنوبي', warehouseId: '3', section: 'قسم D', level: 1, capacity: 120, used: 100, status: 'نشط', products: 9 }
  ]);

  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false);
  const [editingShelf, setEditingShelf] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inventory Adjustment State
  const [adjustmentWarehouse, setAdjustmentWarehouse] = useState<string>('1');
  const [adjustmentProducts, setAdjustmentProducts] = useState<Array<{
    productId: string;
    productName: string;
    recordedQty: number;
    actualQty: number;
    difference: number;
    costPrice: number;
    reason: string;
  }>>([]);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Inventory Receipt State
  const [receiptWarehouse, setReceiptWarehouse] = useState<string>('1');
  const [receiptItems, setReceiptItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
  }>>([]);
  const [receiptCreditAccount, setReceiptCreditAccount] = useState<string>('الصندوق');
  const [receiptCustomAccount, setReceiptCustomAccount] = useState<string>('');
  const [receiptIncludeTax, setReceiptIncludeTax] = useState<boolean>(false);
  const [receiptDescription, setReceiptDescription] = useState<string>('');

  // Inventory Issue State
  const [issueWarehouse, setIssueWarehouse] = useState<string>('1');
  const [issueItems, setIssueItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    totalAmount: number;
  }>>([]);
  const [issueDebitAccount, setIssueDebitAccount] = useState<string>('مصروفات والخسائر');
  const [issueCustomAccount, setIssueCustomAccount] = useState<string>('');
  const [issueReason, setIssueReason] = useState<string>('');
  const [issueDescription, setIssueDescription] = useState<string>('');

  const [inventory, setInventory] = useState([
    { id: '1', product: 'كمبيوتر محمول HP', barcode: '1234567890', warehouse: 'المستودع الرئيسي', shelf: 'A-01', quantity: 45, minStock: 10, status: 'متوفر' },
    { id: '2', product: 'طابعة Canon', barcode: '1234567891', warehouse: 'المستودع الرئيسي', shelf: 'A-02', quantity: 8, minStock: 15, status: 'منخفض' },
    { id: '3', product: 'شاشة Samsung 27"', barcode: '1234567892', warehouse: 'مستودع الفرع الشمالي', shelf: 'B-01', quantity: 32, minStock: 10, status: 'متوفر' },
    { id: '4', product: 'لوحة مفاتيح Logitech', barcode: '1234567893', warehouse: 'المستودع الرئيسي', shelf: 'A-03', quantity: 2, minStock: 20, status: 'نفد' }
  ]);

  const [transfers, setTransfers] = useState([
    { id: 'TR-001', date: '2025-01-25', from: 'المستودع الرئيسي', to: 'مستودع الفرع الشمالي', product: 'كمبيوتر محمول HP', quantity: 10, status: 'مكتمل' },
    { id: 'TR-002', date: '2025-01-28', from: 'مستودع الفرع الشمالي', to: 'مستودع الفرع الجنوبي', product: 'طابعة Canon', quantity: 5, status: 'قيد النقل' },
    { id: 'TR-003', date: '2025-01-29', from: 'المستودع الرئيسي', to: 'مستودع الفرع الجنوبي', product: 'شاشة Samsung', quantity: 8, status: 'معلق' }
  ]);

  // Products list for adjustment
  const products = [
    { id: '1', name: 'كمبيوتر محمول HP' },
    { id: '2', name: 'طابعة Canon' },
    { id: '3', name: 'شاشة Samsung 27"' },
    { id: '4', name: 'لوحة مفاتيح Logitech' },
    { id: '5', name: 'ماوس Logitech' },
    { id: '6', name: 'كاميرا ويب HD' }
  ];

  const handleAddShelf = () => {
    setEditingShelf(null);
    setIsShelfDialogOpen(true);
  };

  const handleEditShelf = (shelf: any) => {
    setEditingShelf(shelf);
    setIsShelfDialogOpen(true);
  };

  const handleDeleteShelf = (shelfId: string) => {
    const shelf = shelves.find(s => s.id === shelfId);
    if (shelf && shelf.used > 0) {
      toast.error('لا يمكن حذف رف يحتوي على منتجات. قم بنقل المنتجات أولاً.');
      return;
    }
    setShelves(shelves.filter(s => s.id !== shelfId));
    toast.success('تم حذف الرف بنجاح');
  };

  const handleSaveShelf = () => {
    toast.success(editingShelf ? 'تم تحديث الرف بنجاح' : 'تم إضافة الرف بنجاح');
    setIsShelfDialogOpen(false);
    setEditingShelf(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA').format(amount);
  };

  const getStockStatus = (status: string) => {
    switch (status) {
      case 'متوفر': return 'default';
      case 'منخفض': return 'secondary';
      case 'نفد': return 'destructive';
      default: return 'outline';
    }
  };

  const getShelfFillColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredShelves = shelves
    .filter(s => selectedWarehouse === 'all' || s.warehouseId === selectedWarehouse)
    .filter(s =>
      searchQuery === '' ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.warehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.section.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>إدارة المستودعات</h1>
          <p className="text-gray-600">متابعة المخزون والمستودعات</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              مستودع جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>إضافة مستودع جديد</DialogTitle>
              <DialogDescription>قم بإدخال بيانات المستودع</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم المستودع / Warehouse Name</Label>
                <Input placeholder="مستودع الفرع الغربي" />
              </div>

              <div className="space-y-2">
                <Label>الفرع المخصص / Assigned Branch</Label>
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
                <Label>الموقع / Location</Label>
                <Input placeholder="الرياض - حي السليمانية" />
              </div>

              <div className="space-y-2">
                <Label>السعة الكلية / Total Capacity</Label>
                <Input type="number" placeholder="5000" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="text-right">
                  <Label>حالة المستودع / Warehouse Status</Label>
                  <p className="text-sm text-gray-600">تفعيل أو تعطيل المستودع</p>
                </div>
                <select className="border rounded px-3 py-1">
                  <option value="active">نشط / Active</option>
                  <option value="inactive">غير نشط / Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div className="text-right">
                  <Label>مستودع افتراضي / Default Warehouse</Label>
                  <p className="text-sm text-gray-600">تعيين كمستودع رئيسي افتراضي</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <Label>الموظف المسؤول / Responsible Employee (Stock_Emps Relation)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف المسؤول" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">أحمد محمد - مدير</SelectItem>
                    <SelectItem value="2">فاطمة علي - مشرف</SelectItem>
                    <SelectItem value="3">سعيد خالد - أمين مستودع</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">سيتم إنشاء علاقة في جدول Stock_Emps</p>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات / Notes</Label>
                <textarea
                  className="w-full border rounded-lg p-2 text-right"
                  rows={3}
                  placeholder="أدخل أي ملاحظات..."
                />
              </div>

              <Button className="w-full" onClick={() => toast.success('تم إضافة المستودع بنجاح')}>
                حفظ المستودع
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Warehouse className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">عدد المستودعات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">8</div>
            <p className="text-xs text-gray-600 mt-1">مستودع نشط</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Package className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">إجمالي المنتجات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(6500)}</div>
            <p className="text-xs text-gray-600 mt-1">وحدة مخزنة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm">مخزون منخفض</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">12</div>
            <p className="text-xs text-gray-600 mt-1">منتج يحتاج إعادة طلب</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <CardTitle className="text-sm">نفد المخزون</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">3</div>
            <p className="text-xs text-gray-600 mt-1">منتج نفد من المخزون</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="warehouses" className="w-full">
        <TabsList>
          <TabsTrigger value="warehouses">المستودعات</TabsTrigger>
          <TabsTrigger value="inventory">المخزون</TabsTrigger>
          <TabsTrigger value="transfers">نقل المنتجات</TabsTrigger>
          <TabsTrigger value="receipt">توريد مخزني</TabsTrigger>
          <TabsTrigger value="issue">صرف مخزني</TabsTrigger>
          <TabsTrigger value="adjustment">تسوية المخزون</TabsTrigger>
          <TabsTrigger value="shelves">الرفوف</TabsTrigger>
        </TabsList>

        {/* Warehouses */}
        <TabsContent value="warehouses" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>قائمة المستودعات</CardTitle>
              <CardDescription>عرض وإدارة جميع المستودعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المستودع</TableHead>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">السعة</TableHead>
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">نسبة الامتلاء</TableHead>
                      <TableHead className="text-right">المدير</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.map((warehouse) => {
                      const fillPercentage = (warehouse.used / warehouse.capacity) * 100;
                      return (
                        <TableRow key={warehouse.id}>
                          <TableCell className="text-right">{warehouse.name}</TableCell>
                          <TableCell className="text-right">{warehouse.location}</TableCell>
                          <TableCell className="text-right">{formatCurrency(warehouse.capacity)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(warehouse.used)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm">{fillPercentage.toFixed(0)}%</span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600"
                                  style={{ width: `${fillPercentage}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{warehouse.manager}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="default">{warehouse.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="gap-2">
                  <Search className="w-4 h-4" />
                  بحث متقدم
                </Button>
                <div className="text-right">
                  <CardTitle>حالة المخزون</CardTitle>
                  <CardDescription>متابعة المنتجات في المستودعات</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input placeholder="بحث عن منتج أو باركود..." className="text-right" dir="rtl" />
              </div>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">الباركود</TableHead>
                      <TableHead className="text-right">المستودع</TableHead>
                      <TableHead className="text-right">الرف</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">الحد الأدنى</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-right">{item.product}</TableCell>
                        <TableCell className="text-right">{item.barcode}</TableCell>
                        <TableCell className="text-right">{item.warehouse}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.shelf}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.minStock}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getStockStatus(item.status)}>
                            {item.status}
                          </Badge>
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

        {/* Transfers */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      نقل جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader className="text-right">
                      <DialogTitle>نقل منتجات بين المستودعات</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>من المستودع</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((w) => (
                              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>إلى المستودع</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((w) => (
                              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>المنتج</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المنتج" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">كمبيوتر محمول HP</SelectItem>
                            <SelectItem value="2">طابعة Canon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>الكمية</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <Button className="w-full" onClick={() => toast.success('تم إنشاء طلب النقل')}>
                        تنفيذ النقل
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="text-right">
                  <CardTitle>نقل المنتجات بين المستودعات</CardTitle>
                  <CardDescription>متابعة عمليات النقل</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم النقل</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">من</TableHead>
                      <TableHead className="text-right">إلى</TableHead>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="text-right">{transfer.id}</TableCell>
                        <TableCell className="text-right">{transfer.date}</TableCell>
                        <TableCell className="text-right">{transfer.from}</TableCell>
                        <TableCell className="text-right">{transfer.to}</TableCell>
                        <TableCell className="text-right">{transfer.product}</TableCell>
                        <TableCell className="text-right">{transfer.quantity}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={transfer.status === 'مكتمل' ? 'default' : 'secondary'}>
                            {transfer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Receipt */}
        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-green-600" />
                توريد مخزني
              </CardTitle>
              <CardDescription>توريد بضاعة للمخزن من مورد أو حساب آخر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warehouse Selection */}
              <div className="space-y-2">
                <Label>المستودع الهدف</Label>
                <Select value={receiptWarehouse} onValueChange={setReceiptWarehouse}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Products */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">المنتجات</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReceiptItems([...receiptItems, {
                        productId: '',
                        productName: '',
                        quantity: 1,
                        costPrice: 0,
                        taxRate: 0,
                        taxAmount: 0,
                        totalAmount: 0
                      }]);
                    }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة منتج
                  </Button>
                </div>

                {receiptItems.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div dir="rtl">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المنتج</TableHead>
                            <TableHead className="text-right">الكمية</TableHead>
                            <TableHead className="text-right">سعر الشراء</TableHead>
                            <TableHead className="text-right">الضريبة</TableHead>
                            <TableHead className="text-right">المجموع</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receiptItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-right">
                                <Select
                                  value={item.productId}
                                  onValueChange={(value) => {
                                    const product = products.find(p => p.id === value);
                                    const costPrice = getCostPrice(value, receiptWarehouse) || 0;
                                    const updated = [...receiptItems];
                                    updated[index] = {
                                      ...item,
                                      productId: value,
                                      productName: product?.name || '',
                                      costPrice,
                                      taxAmount: receiptIncludeTax ? costPrice * item.quantity * (item.taxRate / 100) : 0,
                                      totalAmount: costPrice * item.quantity + (receiptIncludeTax ? costPrice * item.quantity * (item.taxRate / 100) : 0)
                                    };
                                    setReceiptItems(updated);
                                  }}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="اختر المنتج" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-20"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const qty = Number(e.target.value);
                                    const updated = [...receiptItems];
                                    updated[index] = {
                                      ...item,
                                      quantity: qty,
                                      taxAmount: receiptIncludeTax ? item.costPrice * qty * (item.taxRate / 100) : 0,
                                      totalAmount: item.costPrice * qty + (receiptIncludeTax ? item.costPrice * qty * (item.taxRate / 100) : 0)
                                    };
                                    setReceiptItems(updated);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-24"
                                  value={item.costPrice}
                                  onChange={(e) => {
                                    const price = Number(e.target.value);
                                    const updated = [...receiptItems];
                                    updated[index] = {
                                      ...item,
                                      costPrice: price,
                                      taxAmount: receiptIncludeTax ? price * item.quantity * (item.taxRate / 100) : 0,
                                      totalAmount: price * item.quantity + (receiptIncludeTax ? price * item.quantity * (item.taxRate / 100) : 0)
                                    };
                                    setReceiptItems(updated);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                {receiptIncludeTax ? (
                                  <Select
                                    value={item.taxRate.toString()}
                                    onValueChange={(value) => {
                                      const rate = Number(value);
                                      const updated = [...receiptItems];
                                      updated[index] = {
                                        ...item,
                                        taxRate: rate,
                                        taxAmount: item.costPrice * item.quantity * (rate / 100),
                                        totalAmount: item.costPrice * item.quantity + (item.costPrice * item.quantity * (rate / 100))
                                      };
                                      setReceiptItems(updated);
                                    }}
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">0%</SelectItem>
                                      <SelectItem value="15">15%</SelectItem>
                                      <SelectItem value="5">5%</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-gray-400">بدون ضريبة</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(item.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReceiptItems(receiptItems.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Tax Option */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeTax"
                    checked={receiptIncludeTax}
                    onChange={(e) => {
                      setReceiptIncludeTax(e.target.checked);
                      setReceiptItems(receiptItems.map(item => ({
                        ...item,
                        taxRate: e.target.checked ? 15 : 0,
                        taxAmount: e.target.checked ? item.costPrice * item.quantity * 0.15 : 0,
                        totalAmount: item.costPrice * item.quantity + (e.target.checked ? item.costPrice * item.quantity * 0.15 : 0)
                      })));
                    }}
                  />
                  <Label htmlFor="includeTax">إدخال مع الضريبة</Label>
                </div>
              </div>

              {/* Credit Account Selection */}
              <div className="space-y-2">
                <Label>الحساب الدائن (مصدر التوريد)</Label>
                <Select value={receiptCreditAccount} onValueChange={(value) => {
                  setReceiptCreditAccount(value);
                  if (value !== 'حساب مخصص') {
                    setReceiptCustomAccount('');
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الصندوق">الصندوق</SelectItem>
                    <SelectItem value="البنك">البنك</SelectItem>
                    <SelectItem value="الموردين">الموردين</SelectItem>
                    <SelectItem value="حساب الشركة">حساب الشركة</SelectItem>
                    <SelectItem value="حساب مخصص">حساب مخصص</SelectItem>
                  </SelectContent>
                </Select>
                {receiptCreditAccount === 'حساب مخصص' && (
                  <Input
                    placeholder="أدخل اسم الحساب"
                    value={receiptCustomAccount}
                    onChange={(e) => setReceiptCustomAccount(e.target.value)}
                  />
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>الوصف (اختياري)</Label>
                <Input
                  placeholder="مثال: توريد بضاعة بدون ضريبة من مورد"
                  value={receiptDescription}
                  onChange={(e) => setReceiptDescription(e.target.value)}
                />
              </div>

              {/* Summary */}
              {receiptItems.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">المجموع الفرعي:</span>
                    <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                      receiptItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)
                    )}</span>
                  </div>
                  {receiptIncludeTax && (
                    <div className="flex justify-between">
                      <span className="font-semibold">الضريبة:</span>
                      <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                        receiptItems.reduce((sum, item) => sum + item.taxAmount, 0)
                      )}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">الإجمالي:</span>
                    <span className="text-lg font-bold text-green-600">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                      receiptItems.reduce((sum, item) => sum + item.totalAmount, 0)
                    )}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReceiptItems([]);
                    setReceiptCreditAccount('الصندوق');
                    setReceiptCustomAccount('');
                    setReceiptIncludeTax(false);
                    setReceiptDescription('');
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => {
                    if (receiptItems.length === 0) {
                      toast.error('يرجى إضافة منتجات للتوريد');
                      return;
                    }

                    const emptyProducts = receiptItems.filter(item => !item.productId || item.quantity <= 0 || item.costPrice <= 0);
                    if (emptyProducts.length > 0) {
                      toast.error('يرجى إكمال بيانات جميع المنتجات');
                      return;
                    }

                    if (receiptCreditAccount === 'حساب مخصص' && !receiptCustomAccount.trim()) {
                      toast.error('يرجى إدخال اسم الحساب المخصص');
                      return;
                    }

                    const receiptNumber = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
                    const warehouseName = warehouses.find(w => w.id === receiptWarehouse)?.name || '';
                    const totalAmount = receiptItems.reduce((sum, item) => sum + item.totalAmount, 0);
                    const totalTax = receiptItems.reduce((sum, item) => sum + item.taxAmount, 0);

                    // Increase stock for each product
                    receiptItems.forEach((item) => {
                      increaseStock(item.productId, receiptWarehouse, item.quantity, item.costPrice);
                    });

                    // Create journal entry
                    const creditAccount = receiptCreditAccount === 'حساب مخصص' ? receiptCustomAccount : receiptCreditAccount;
                    const journalEntry = createInventoryReceiptFromAccountEntry(
                      receiptNumber,
                      totalAmount - totalTax, // Amount without tax
                      creditAccount,
                      warehouseName,
                      receiptDescription || undefined,
                      receiptIncludeTax,
                      totalTax
                    );

                    addJournalEntry(journalEntry);

                    toast.success(`تم توريد المخزون بنجاح - ${receiptNumber}`);
                    setReceiptItems([]);
                    setReceiptCreditAccount('الصندوق');
                    setReceiptCustomAccount('');
                    setReceiptIncludeTax(false);
                    setReceiptDescription('');
                  }}
                >
                  <ArrowDownCircle className="w-4 h-4 ml-2" />
                  حفظ التوريد
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Issue */}
        <TabsContent value="issue" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-red-600" />
                صرف مخزني
              </CardTitle>
              <CardDescription>صرف بضاعة من المخزن إلى حساب آخر (مصروفات، خسائر، شركة)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warehouse Selection */}
              <div className="space-y-2">
                <Label>المستودع المصدر</Label>
                <Select value={issueWarehouse} onValueChange={setIssueWarehouse}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Products */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">المنتجات</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIssueItems([...issueItems, {
                        productId: '',
                        productName: '',
                        quantity: 1,
                        costPrice: 0,
                        totalAmount: 0
                      }]);
                    }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة منتج
                  </Button>
                </div>

                {issueItems.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div dir="rtl">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المنتج</TableHead>
                            <TableHead className="text-right">الكمية المتاحة</TableHead>
                            <TableHead className="text-right">الكمية المراد صرفها</TableHead>
                            <TableHead className="text-right">سعر التكلفة</TableHead>
                            <TableHead className="text-right">المجموع</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {issueItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-right">
                                <Select
                                  value={item.productId}
                                  onValueChange={(value) => {
                                    const product = products.find(p => p.id === value);
                                    const costPrice = getCostPrice(value, issueWarehouse) || 0;
                                    const stock = getStock(value, issueWarehouse);
                                    const updated = [...issueItems];
                                    updated[index] = {
                                      ...item,
                                      productId: value,
                                      productName: product?.name || '',
                                      costPrice,
                                      totalAmount: costPrice * item.quantity
                                    };
                                    setIssueItems(updated);
                                  }}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="اختر المنتج" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={getStock(item.productId, issueWarehouse) <= 0 ? 'text-red-600' : ''}>
                                  {item.productId ? getStock(item.productId, issueWarehouse) : '-'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-20"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const qty = Number(e.target.value);
                                    const updated = [...issueItems];
                                    updated[index] = {
                                      ...item,
                                      quantity: qty,
                                      totalAmount: item.costPrice * qty
                                    };
                                    setIssueItems(updated);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(item.costPrice)}</span>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(item.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setIssueItems(issueItems.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>

              {/* Debit Account Selection */}
              <div className="space-y-2">
                <Label>الحساب المدين (وجهة الصرف)</Label>
                <Select value={issueDebitAccount} onValueChange={(value) => {
                  setIssueDebitAccount(value);
                  if (value !== 'حساب مخصص') {
                    setIssueCustomAccount('');
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مصروفات والخسائر">مصروفات والخسائر</SelectItem>
                    <SelectItem value="مصروفات الاستهلاك">مصروفات الاستهلاك</SelectItem>
                    <SelectItem value="حساب الشركة">حساب الشركة</SelectItem>
                    <SelectItem value="حساب مخصص">حساب مخصص</SelectItem>
                  </SelectContent>
                </Select>
                {issueDebitAccount === 'حساب مخصص' && (
                  <Input
                    placeholder="أدخل اسم الحساب"
                    value={issueCustomAccount}
                    onChange={(e) => setIssueCustomAccount(e.target.value)}
                  />
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>سبب الصرف</Label>
                <Input
                  placeholder="مثال: بضاعة منتهية الصلاحية"
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>الوصف (اختياري)</Label>
                <Input
                  placeholder="مثال: صرف بضاعة منتهية للشركة المصنعة"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>

              {/* Summary */}
              {issueItems.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-semibold">الإجمالي:</span>
                    <span className="text-lg font-bold text-red-600">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                      issueItems.reduce((sum, item) => sum + item.totalAmount, 0)
                    )}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIssueItems([]);
                    setIssueDebitAccount('مصروفات والخسائر');
                    setIssueCustomAccount('');
                    setIssueReason('');
                    setIssueDescription('');
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => {
                    if (issueItems.length === 0) {
                      toast.error('يرجى إضافة منتجات للصرف');
                      return;
                    }

                    const emptyProducts = issueItems.filter(item => !item.productId || item.quantity <= 0);
                    if (emptyProducts.length > 0) {
                      toast.error('يرجى إكمال بيانات جميع المنتجات');
                      return;
                    }

                    // Validate stock availability
                    for (const item of issueItems) {
                      const availableStock = getStock(item.productId, issueWarehouse);
                      if (availableStock < item.quantity) {
                        toast.error(`الكمية المتاحة من ${item.productName}: ${availableStock} فقط`);
                        return;
                      }
                    }

                    if (issueDebitAccount === 'حساب مخصص' && !issueCustomAccount.trim()) {
                      toast.error('يرجى إدخال اسم الحساب المخصص');
                      return;
                    }

                    if (!issueReason.trim()) {
                      toast.error('يرجى إدخال سبب الصرف');
                      return;
                    }

                    const issueNumber = `ISS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
                    const warehouseName = warehouses.find(w => w.id === issueWarehouse)?.name || '';
                    const totalAmount = issueItems.reduce((sum, item) => sum + item.totalAmount, 0);

                    // Reduce stock for each product
                    issueItems.forEach((item) => {
                      const success = reduceStock(item.productId, issueWarehouse, item.quantity);
                      if (!success) {
                        toast.error(`فشل صرف المخزون لـ ${item.productName}`);
                        return;
                      }
                    });

                    // Create journal entry
                    const debitAccount = issueDebitAccount === 'حساب مخصص' ? issueCustomAccount : issueDebitAccount;
                    const journalEntry = createInventoryIssueToAccountEntry(
                      issueNumber,
                      totalAmount,
                      debitAccount,
                      warehouseName,
                      issueDescription || undefined,
                      issueReason
                    );

                    addJournalEntry(journalEntry);

                    toast.success(`تم صرف المخزون بنجاح - ${issueNumber}`);
                    setIssueItems([]);
                    setIssueDebitAccount('مصروفات والخسائر');
                    setIssueCustomAccount('');
                    setIssueReason('');
                    setIssueDescription('');
                  }}
                >
                  <ArrowUpCircle className="w-4 h-4 ml-2" />
                  حفظ الصرف
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Adjustment */}
        <TabsContent value="adjustment" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                تسوية المخزون
              </CardTitle>
              <CardDescription>تسوية الكميات الفعلية مع الكميات المسجلة في النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warehouse Selection */}
              <div className="space-y-2">
                <Label>اختر المستودع</Label>
                <Select value={adjustmentWarehouse} onValueChange={(value) => {
                  setAdjustmentWarehouse(value);
                  // Load products for selected warehouse
                  const warehouseProducts = getWarehouseProducts(value);
                  setAdjustmentProducts(warehouseProducts.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return {
                      productId: item.productId,
                      productName: product?.name || 'منتج غير معروف',
                      recordedQty: item.quantity,
                      actualQty: item.quantity,
                      difference: 0,
                      costPrice: item.costPrice,
                      reason: ''
                    };
                  }));
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Products Adjustment Table */}
              {adjustmentProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">المنتجات</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const warehouseProducts = getWarehouseProducts(adjustmentWarehouse);
                        setAdjustmentProducts(warehouseProducts.map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return {
                            productId: item.productId,
                            productName: product?.name || 'منتج غير معروف',
                            recordedQty: item.quantity,
                            actualQty: item.quantity,
                            difference: 0,
                            costPrice: item.costPrice,
                            reason: ''
                          };
                        }));
                      }}
                    >
                      تحديث القائمة
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div dir="rtl">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المنتج</TableHead>
                            <TableHead className="text-right">الكمية المسجلة</TableHead>
                            <TableHead className="text-right">الكمية الفعلية</TableHead>
                            <TableHead className="text-right">الفرق</TableHead>
                            <TableHead className="text-right">سبب التسوية</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adjustmentProducts.map((item, index) => (
                            <TableRow key={item.productId}>
                              <TableCell className="text-right font-medium">{item.productName}</TableCell>
                              <TableCell className="text-right">{item.recordedQty}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-24"
                                  value={item.actualQty}
                                  onChange={(e) => {
                                    const newActualQty = Number(e.target.value);
                                    const newDifference = newActualQty - item.recordedQty;
                                    const updated = [...adjustmentProducts];
                                    updated[index] = {
                                      ...item,
                                      actualQty: newActualQty,
                                      difference: newDifference
                                    };
                                    setAdjustmentProducts(updated);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {item.difference > 0 ? '+' : ''}{item.difference}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  placeholder="سبب التسوية"
                                  className="w-48"
                                  value={item.reason}
                                  onChange={(e) => {
                                    const updated = [...adjustmentProducts];
                                    updated[index] = { ...item, reason: e.target.value };
                                    setAdjustmentProducts(updated);
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">إجمالي الزيادة:</span>
                      <span className="text-green-600 font-semibold">
                        {adjustmentProducts.filter(p => p.difference > 0).reduce((sum, p) => sum + p.difference, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">إجمالي النقص:</span>
                      <span className="text-red-600 font-semibold">
                        {Math.abs(adjustmentProducts.filter(p => p.difference < 0).reduce((sum, p) => sum + p.difference, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">القيمة المالية للفرق:</span>
                      <span className={`font-semibold ${adjustmentProducts.reduce((sum, p) => sum + (p.difference * p.costPrice), 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                          adjustmentProducts.reduce((sum, p) => sum + (p.difference * p.costPrice), 0)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* General Reason */}
                  <div className="space-y-2">
                    <Label>سبب عام للتسوية (اختياري)</Label>
                    <Input
                      placeholder="مثال: جرد دوري - يناير 2025"
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAdjustmentProducts([]);
                        setAdjustmentReason('');
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={() => {
                        // Validate
                        const hasChanges = adjustmentProducts.some(p => p.difference !== 0);
                        if (!hasChanges) {
                          toast.error('لا توجد تغييرات في الكميات');
                          return;
                        }

                        const productsWithChanges = adjustmentProducts.filter(p => p.difference !== 0);
                        const missingReasons = productsWithChanges.filter(p => !p.reason.trim());
                        if (missingReasons.length > 0) {
                          toast.error('يرجى إدخال سبب التسوية لجميع المنتجات المتغيرة');
                          return;
                        }

                        // Apply adjustments
                        const adjustmentNumber = `ADJ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
                        const warehouseName = warehouses.find(w => w.id === adjustmentWarehouse)?.name || '';

                        productsWithChanges.forEach((item) => {
                          // Adjust stock
                          adjustStock(item.productId, adjustmentWarehouse, item.actualQty);

                          // Create journal entry
                          const adjustmentAmount = Math.abs(item.difference * item.costPrice);
                          const adjustmentType = item.difference > 0 ? 'increase' : 'decrease';
                          const reason = item.reason || adjustmentReason || 'تسوية مخزون';
                          
                          const journalEntry = createInventoryAdjustmentEntry(
                            `${adjustmentNumber}-${item.productId}`,
                            adjustmentAmount,
                            adjustmentType,
                            reason,
                            warehouseName
                          );
                          
                          addJournalEntry(journalEntry);
                        });

                        toast.success(`تمت تسوية المخزون بنجاح - ${adjustmentNumber}`);
                        setAdjustmentProducts([]);
                        setAdjustmentReason('');
                      }}
                    >
                      <Calculator className="w-4 h-4 ml-2" />
                      حفظ التسوية
                    </Button>
                  </div>
                </div>
              )}

              {adjustmentProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>اختر مستودعاً لعرض المنتجات وتنفيذ التسوية</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shelves */}
        <TabsContent value="shelves" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dialog open={isShelfDialogOpen} onOpenChange={setIsShelfDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddShelf} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة رف
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader className="text-right">
                      <DialogTitle>
                        {editingShelf ? 'تعديل الرف' : 'إضافة رف جديد'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingShelf ? 'قم بتحديث بيانات الرف' : 'أدخل معلومات الرف الجديد'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>كود الرف *</Label>
                          <Input
                            defaultValue={editingShelf?.code}
                            placeholder="A-01"
                            className="font-mono"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>المستودع *</Label>
                          <Select defaultValue={editingShelf?.warehouseId}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المستودع" />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map(w => (
                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>القسم</Label>
                          <Input
                            defaultValue={editingShelf?.section}
                            placeholder="قسم A"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>المستوى</Label>
                          <Select defaultValue={editingShelf?.level?.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المستوى" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">المستوى 1 (أرضي)</SelectItem>
                              <SelectItem value="2">المستوى 2</SelectItem>
                              <SelectItem value="3">المستوى 3</SelectItem>
                              <SelectItem value="4">المستوى 4</SelectItem>
                              <SelectItem value="5">المستوى 5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>السعة (عدد الوحدات)</Label>
                        <Input
                          type="number"
                          defaultValue={editingShelf?.capacity}
                          placeholder="200"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Select defaultValue={editingShelf?.status || 'نشط'}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="نشط">نشط</SelectItem>
                            <SelectItem value="معطل">معطل</SelectItem>
                            <SelectItem value="صيانة">صيانة</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-right">
                          <Label>حالة الرف</Label>
                          <p className="text-sm text-gray-600">تفعيل أو تعطيل</p>
                        </div>
                      </div>

                      <Button className="w-full" onClick={handleSaveShelf}>
                        {editingShelf ? 'حفظ التغييرات' : 'إضافة الرف'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="text-right">
                  <CardTitle>إدارة الرفوف</CardTitle>
                  <CardDescription>تنظيم وإدارة رفوف المستودعات</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="ابحث عن رف بالكود، المستودع، أو القسم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                      dir="rtl"
                    />
                  </div>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستودعات</SelectItem>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Count */}
                <div className="text-right text-sm text-gray-600">
                  عرض <span className="font-bold text-blue-600">{filteredShelves.length}</span> من {shelves.length} رف
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-right">
              <CardTitle>قائمة الرفوف</CardTitle>
              <CardDescription>عرض وإدارة جميع الرفوف</CardDescription>
            </CardHeader>
            <CardContent>
              {/* View Toggle */}
              <Tabs defaultValue="grid" className="w-full" dir="rtl">
                <TabsList className="mb-4">
                  <TabsTrigger value="grid" className="gap-2">
                    <Grid3x3 className="w-4 h-4" />
                    عرض شبكي
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2">
                    <Package className="w-4 h-4" />
                    عرض قائمة
                  </TabsTrigger>
                </TabsList>

                {/* Grid View */}
                <TabsContent value="grid">
                  {filteredShelves.length === 0 ? (
                    <div className="text-center py-12" dir="rtl">
                      <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 text-lg">لا توجد رفوف متطابقة مع البحث</p>
                      <p className="text-gray-400 text-sm mt-2">جرب تعديل معايير البحث</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" dir="rtl">
                      {filteredShelves.map((shelf) => {
                        const fillPercentage = (shelf.used / shelf.capacity) * 100;
                        const isAlmostFull = fillPercentage >= 90;
                        const isNearFull = fillPercentage >= 70 && fillPercentage < 90;

                        return (
                          <Card
                            key={shelf.id}
                            className={`hover:shadow-lg transition-all ${isAlmostFull ? 'border-red-200 bg-red-50/30' :
                              isNearFull ? 'border-yellow-200 bg-yellow-50/30' :
                                'border-gray-200'
                              }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Header with Code */}
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditShelf(shelf)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteShelf(shelf.id)}
                                      className="h-8 w-8 p-0"
                                      disabled={shelf.used > 0}
                                    >
                                      <Trash2 className={`w-4 h-4 ${shelf.used > 0 ? 'text-gray-300' : 'text-red-600'}`} />
                                    </Button>
                                  </div>
                                  <Badge variant="outline" className="font-mono text-base px-3 py-1 font-bold">
                                    {shelf.code}
                                  </Badge>
                                </div>

                                {/* Warehouse Info */}
                                <div className="text-right space-y-1">
                                  <p className="text-sm font-medium text-gray-900">{shelf.warehouse}</p>
                                  <div className="flex items-center gap-1 justify-end flex-wrap">
                                    <Badge variant="secondary" className="text-xs">
                                      المستوى {shelf.level}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {shelf.section}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Capacity Visualization */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className={`font-medium ${isAlmostFull ? 'text-red-600' :
                                      isNearFull ? 'text-yellow-600' :
                                        'text-green-600'
                                      }`}>
                                      {fillPercentage.toFixed(0)}%
                                    </span>
                                    <span className="text-gray-600">{shelf.used} / {shelf.capacity}</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${getShelfFillColor(fillPercentage)} transition-all`}
                                      style={{ width: `${fillPercentage}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Products & Status */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <Badge
                                    variant={shelf.status === 'نشط' ? 'default' : shelf.status === 'صيانة' ? 'destructive' : 'secondary'}
                                  >
                                    {shelf.status}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Boxes className="w-3 h-3" />
                                    <span>{shelf.products} منتج</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* List View */}
                <TabsContent value="list">
                  {filteredShelves.length === 0 ? (
                    <div className="text-center py-12" dir="rtl">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 text-lg">لا توجد رفوف متطابقة مع البحث</p>
                      <p className="text-gray-400 text-sm mt-2">جرب تعديل معايير البحث</p>
                    </div>
                  ) : (
                    <div dir="rtl" className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">كود الرف</TableHead>
                            <TableHead className="text-right">المستودع</TableHead>
                            <TableHead className="text-right">القسم</TableHead>
                            <TableHead className="text-right">المستوى</TableHead>
                            <TableHead className="text-right">السعة</TableHead>
                            <TableHead className="text-right">المستخدم</TableHead>
                            <TableHead className="text-right">نسبة الامتلاء</TableHead>
                            <TableHead className="text-right">المنتجات</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredShelves.map((shelf) => {
                            const fillPercentage = (shelf.used / shelf.capacity) * 100;
                            const isAlmostFull = fillPercentage >= 90;
                            const isNearFull = fillPercentage >= 70 && fillPercentage < 90;

                            return (
                              <TableRow
                                key={shelf.id}
                                className={isAlmostFull ? 'bg-red-50/50' : ''}
                              >
                                <TableCell className="text-right">
                                  <Badge variant="outline" className="font-mono font-bold text-base px-3 py-1">
                                    {shelf.code}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">{shelf.warehouse}</TableCell>
                                <TableCell className="text-right">{shelf.section}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="secondary">المستوى {shelf.level}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">{shelf.capacity}</TableCell>
                                <TableCell className="text-right font-bold text-blue-600">{shelf.used}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-2 justify-start">
                                    <span className={`text-sm font-bold ${isAlmostFull ? 'text-red-600' :
                                      isNearFull ? 'text-yellow-600' :
                                        'text-green-600'
                                      }`}>
                                      {fillPercentage.toFixed(0)}%
                                    </span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${getShelfFillColor(fillPercentage)} transition-all`}
                                        style={{ width: `${fillPercentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Boxes className="w-3 h-3" />
                                    <span>{shelf.products} منتج</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant={shelf.status === 'نشط' ? 'default' : shelf.status === 'صيانة' ? 'destructive' : 'secondary'}
                                  >
                                    {shelf.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditShelf(shelf)}
                                      className="gap-1"
                                    >
                                      <Edit className="w-4 h-4" />
                                      تعديل
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteShelf(shelf.id)}
                                      className="gap-1"
                                      disabled={shelf.used > 0}
                                      title={shelf.used > 0 ? 'لا يمكن حذف رف يحتوي على منتجات' : ''}
                                    >
                                      <Trash2 className={`w-4 h-4 ${shelf.used > 0 ? 'text-gray-400' : 'text-red-600'}`} />
                                      حذف
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
