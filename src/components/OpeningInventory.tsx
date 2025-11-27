import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Package, Warehouse, Download } from 'lucide-react';
import { initializeInventoryItem } from '../data/inventory';
import { addJournalEntry, createOpeningInventoryEntry } from '../data/journalEntries';

interface Product {
  id: string;
  name: string;
  defaultCost: number;
  barcode: string;
}

interface OpeningItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
}

export function OpeningInventory() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('1');
  const [openingDate, setOpeningDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<OpeningItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const warehouses = [
    { id: '1', name: 'المستودع الرئيسي' },
    { id: '2', name: 'مستودع الفرع الشمالي' },
    { id: '3', name: 'مستودع الفرع الجنوبي' }
  ];

  const products: Product[] = [
    { id: '1', name: 'كمبيوتر محمول HP', defaultCost: 2500, barcode: '1234567890' },
    { id: '2', name: 'طابعة Canon', defaultCost: 1500, barcode: '1234567891' },
    { id: '3', name: 'شاشة Samsung 27\"', defaultCost: 1000, barcode: '1234567892' },
    { id: '4', name: 'لوحة مفاتيح Logitech', defaultCost: 200, barcode: '1234567893' },
    { id: '5', name: 'ماوس Logitech', defaultCost: 100, barcode: '1234567894' },
    { id: '6', name: 'كاميرا ويب HD', defaultCost: 350, barcode: '1234567895' }
  ];

  const filteredProducts = products.filter((product) => {
    if (!productSearch.trim()) return true;
    const term = productSearch.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.id.toLowerCase().includes(term) ||
      product.barcode.toLowerCase().includes(term)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const addProduct = (product: Product) => {
    setError(null);
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          costPrice: product.defaultCost
        }
      ]);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);

  const handleSaveOpeningInventory = () => {
    if (!openingDate) {
      setError('يرجى اختيار تاريخ مخزون أول المدة');
      return;
    }
    if (items.length === 0) {
      setError('يرجى إضافة أصناف إلى مخزون أول المدة');
      return;
    }
    if (totalAmount <= 0) {
      setError('إجمالي قيمة المخزون يجب أن يكون أكبر من صفر');
      return;
    }

    // Initialize inventory for each item
    items.forEach(item => {
      if (item.quantity > 0 && item.costPrice >= 0) {
        initializeInventoryItem(item.productId, selectedWarehouse, item.quantity, item.costPrice);
      }
    });

    const entryNumber = `OPEN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const warehouseName = warehouses.find(w => w.id === selectedWarehouse)?.name;

    const entry = createOpeningInventoryEntry(entryNumber, totalAmount, warehouseName);
    // override date with selected opening date
    entry.date = openingDate;
    addJournalEntry(entry);

    setItems([]);
    setError(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>مخزون أول المدة</h1>
          <p className="text-gray-600">
            استخدام هذه الواجهة لإدخال البضاعة الموجودة عند بدء استخدام النظام بدلاً من فواتير المشتريات
          </p>
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle>إعدادات مخزون أول المدة</CardTitle>
          <CardDescription>اختر المستودع وتاريخ بداية التعامل بالنظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>المستودع</Label>
              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تاريخ مخزون أول المدة</Label>
              <Input
                type="date"
                value={openingDate}
                onChange={(e) => setOpeningDate(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 text-red-700 text-sm p-3 text-right">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products & Opening Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products to choose from */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>الأصناف المتاحة</CardTitle>
              <CardDescription>اختر الأصناف التي ترغب في إضافتها كمخزون أول المدة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="بحث بالاسم، الكود، أو الباركود..."
                  className="pr-3 pl-3 text-right"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addProduct(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium">{product.name}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        تكلفة افتراضية: {formatCurrency(product.defaultCost)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        باركود: {product.barcode}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-6 text-sm">
                    لا توجد أصناف مطابقة لنتيجة البحث
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opening items table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>تفاصيل مخزون أول المدة</CardTitle>
              <CardDescription>حدد الكمية وتكلفة كل صنف موجود في المستودع</CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <Warehouse className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>لم تقم بإضافة أي أصناف إلى مخزون أول المدة بعد</p>
                  <p className="text-xs mt-2">اضغط على الأصناف في القائمة اليسرى لإضافتها هنا</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الصنف</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">تكلفة الوحدة</TableHead>
                          <TableHead className="text-right">الإجمالي</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={item.productId}>
                            <TableCell className="text-right">{item.name}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                value={item.quantity}
                                onChange={(e) => {
                                  const qty = Number(e.target.value) || 0;
                                  const updated = [...items];
                                  updated[index] = { ...item, quantity: Math.max(0, qty) };
                                  setItems(updated);
                                }}
                                className="w-24 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                value={item.costPrice}
                                onChange={(e) => {
                                  const cost = Number(e.target.value) || 0;
                                  const updated = [...items];
                                  updated[index] = { ...item, costPrice: Math.max(0, cost) };
                                  setItems(updated);
                                }}
                                className="w-28.text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.quantity * item.costPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-gray-50 font-bold">
                          <TableCell colSpan={3} className="text-right">
                            إجمالي قيمة مخزون أول المدة
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(totalAmount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      ملاحظة: يمكن استخدام هذه الواجهة مرة واحدة عند بداية استخدام النظام، ولا تنشئ فواتير مشتريات.
                    </p>
                    <Button className="gap-2" onClick={handleSaveOpeningInventory}>
                      <Download className="w-4 h-4" />
                      حفظ مخزون أول المدة
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


