import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, X, Plus, Minus, Trash2, Package, Briefcase, User, Warehouse, Edit2, Check, Printer, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { useUser } from '../contexts/UserContext';
import { SearchableSelect } from './ui/searchable-select';
import { getPriceForQuantity, PricingTier } from '../utils/pricing';
import { getStock } from '../data/inventory';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  type: 'product' | 'service';
  stock?: number;
  costPrice?: number;
  basePrice?: number;
  minSellPrice?: number;
  expiryDate?: string;
  pricingTiers?: PricingTier[];
  minQuantity?: number;
  maxQuantity?: number;
}

export function PriceQuotation() {
  const { currentUser, isAdmin } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('1');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [systemType, setSystemType] = useState<'restaurant' | 'retail'>('retail');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState<string>('');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [quotationNotes, setQuotationNotes] = useState('');

  // قائمة المستودعات
  const warehouses = [
    { id: '1', name: 'المستودع الرئيسي' },
    { id: '2', name: 'مستودع الفرع الشمالي' },
    { id: '3', name: 'مستودع الفرع الجنوبي' }
  ];

  // تصفية المستودعات حسب الصلاحيات
  const availableWarehouses = useMemo(() => {
    if (isAdmin()) {
      return warehouses;
    }
    if (currentUser?.assignedWarehouseId) {
      return warehouses.filter(w => w.id === currentUser.assignedWarehouseId);
    }
    return [];
  }, [isAdmin, currentUser?.assignedWarehouseId]);

  // تعيين المستودع الافتراضي للموظف
  useEffect(() => {
    if (!isAdmin() && currentUser?.assignedWarehouseId) {
      setSelectedWarehouse(currentUser.assignedWarehouseId);
    }
  }, [isAdmin, currentUser?.assignedWarehouseId]);

  // Load system type from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('system_type') as 'restaurant' | 'retail' | null;
      if (savedType) {
        setSystemType(savedType);
      }
    }
  }, []);

  // Generate quotation number on mount
  useEffect(() => {
    const number = `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    setQuotationNumber(number);
  }, []);

  const products = [
    { id: '1', name: 'كمبيوتر محمول HP', price: 3000, costPrice: 2500, barcode: '1234567890', category: 'إلكترونيات', stock: 15, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '2', name: 'طابعة Canon', price: 2000, costPrice: 1500, barcode: '1234567891', category: 'إلكترونيات', stock: 8, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '3', name: 'شاشة Samsung 27"', price: 1500, costPrice: 1000, barcode: '1234567892', category: 'إلكترونيات', stock: 12, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '4', name: 'لوحة مفاتيح Logitech', price: 300, costPrice: 200, barcode: '1234567893', category: 'ملحقات', stock: 25, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '5', name: 'ماوس Logitech', price: 150, costPrice: 100, barcode: '1234567894', category: 'ملحقات', stock: 30, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '6', name: 'كاميرا ويب HD', price: 500, costPrice: 350, barcode: '1234567895', category: 'ملحقات', stock: 10, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined }
  ];

  const services = [
    { id: 's1', name: 'صيانة كمبيوتر محمول', price: 200, code: 'SRV-001', category: 'خدمات تقنية', description: 'صيانة شاملة' },
    { id: 's2', name: 'استشارة تقنية', price: 300, code: 'SRV-002', category: 'استشارات', description: 'ساعة استشارة' },
    { id: 's3', name: 'توصيل طلب', price: 50, code: 'SRV-003', category: 'توصيل', description: 'داخل المدينة' },
    { id: 's4', name: 'تثبيت برامج', price: 150, code: 'SRV-004', category: 'خدمات تقنية', description: 'تثبيت وإعداد' },
    { id: 's5', name: 'تدريب على برنامج', price: 500, code: 'SRV-005', category: 'تدريب', description: 'جلسة تدريبية' }
  ];

  const creditCustomers = [
    { id: '1', name: 'أحمد محمد', phone: '0501234567', accountNumber: 'ACC-001', currentBalance: 5000, creditLimit: 10000, status: 'ممتاز', address: 'الرياض' },
    { id: '2', name: 'سارة علي', phone: '0502345678', accountNumber: 'ACC-002', currentBalance: 2000, creditLimit: 15000, status: 'جيد', address: 'جدة' }
  ];

  const selectedCustomer = useMemo(
    () => (selectedCustomerId ? creditCustomers.find(c => c.id === selectedCustomerId) : undefined),
    [selectedCustomerId]
  );

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.barcode?.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    const term = searchTerm.toLowerCase();
    return services.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const addProductToCart = (product: typeof products[0]) => {
    const currentStock = getStock(product.id, selectedWarehouse);
    if (currentStock <= 0) {
      toast.error('المنتج غير متوفر في المخزون');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > currentStock) {
        toast.error(`الكمية المتاحة: ${currentStock} فقط`);
        return;
      }

      const newPrice = getPriceForQuantity(
        product.price,
        newQuantity,
        product.pricingTiers
      );

      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: newQuantity, price: newPrice }
          : item
      ));
    } else {
      const initialPrice = getPriceForQuantity(
        product.price,
        1,
        product.pricingTiers
      );

      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: initialPrice,
        basePrice: product.price,
        quantity: 1,
        barcode: product.barcode,
        type: 'product',
        stock: currentStock,
        costPrice: product.costPrice,
        minSellPrice: product.costPrice ? product.costPrice * 1.1 : product.price * 0.9,
        pricingTiers: product.pricingTiers,
        minQuantity: product.minQuantity,
        maxQuantity: product.maxQuantity
      }]);
    }
  };

  const addServiceToCart = (service: typeof services[0]) => {
    const existingItem = cart.find(item => item.id === service.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === service.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: service.id,
        name: service.name,
        price: service.price,
        basePrice: service.price,
        quantity: 1,
        type: 'service',
        minSellPrice: service.price * 0.8
      }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id !== id) return item;
      const newQuantity = Math.max(1, item.quantity + delta);
      if (item.stock && newQuantity > item.stock) {
        toast.error(`الكمية المتاحة: ${item.stock} فقط`);
        return item;
      }
      const newPrice = item.pricingTiers
        ? getPriceForQuantity(item.basePrice || item.price, newQuantity, item.pricingTiers)
        : item.price;
      return { ...item, quantity: newQuantity, price: newPrice };
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const startEditingPrice = (item: CartItem) => {
    setEditingPriceId(item.id);
    setEditingPriceValue(item.price.toString());
  };

  const savePriceEdit = (id: string) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const newPrice = parseFloat(editingPriceValue);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('يرجى إدخال سعر صحيح');
      return;
    }

    if (item.minSellPrice && newPrice < item.minSellPrice) {
      toast.error(`الحد الأدنى للسعر: ${formatCurrency(item.minSellPrice)}`);
      return;
    }

    setCart(cart.map(i =>
      i.id === id ? { ...i, price: newPrice } : i
    ));
    setEditingPriceId(null);
    setEditingPriceValue('');
  };

  const cancelPriceEdit = () => {
    setEditingPriceId(null);
    setEditingPriceValue('');
  };

  const startEditingQuantity = (item: CartItem) => {
    setEditingQuantityId(item.id);
    setEditingQuantityValue(item.quantity.toString());
  };

  const saveQuantityEdit = (id: string) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const newQuantity = parseInt(editingQuantityValue);
    if (isNaN(newQuantity) || newQuantity < 1) {
      toast.error('يرجى إدخال كمية صحيحة');
      return;
    }

    if (item.stock && newQuantity > item.stock) {
      toast.error(`الكمية المتاحة: ${item.stock} فقط`);
      return;
    }

    const newPrice = item.pricingTiers
      ? getPriceForQuantity(item.basePrice || item.price, newQuantity, item.pricingTiers)
      : item.price;

    setCart(cart.map(i =>
      i.id === id ? { ...i, quantity: newQuantity, price: newPrice } : i
    ));
    setEditingQuantityId(null);
    setEditingQuantityValue('');
  };

  const cancelQuantityEdit = () => {
    setEditingQuantityId(null);
    setEditingQuantityValue('');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handlePrint = () => {
    if (cart.length === 0) {
      toast.error('لا توجد عناصر للطباعة');
      return;
    }

    const warehouseName = warehouses.find(w => w.id === selectedWarehouse)?.name || 'غير محدد';
    const customerName = selectedCustomer?.name || 'عميل عام';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>عرض سعر - ${quotationNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Tajawal', ui-sans-serif, system-ui, sans-serif;
            padding: 20px;
            direction: rtl;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .total-row {
            background-color: #f9f9f9;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .notes {
            margin-top: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border-right: 3px solid #333;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>عرض سعر</h1>
          <p>رقم العرض: ${quotationNumber}</p>
          <p>التاريخ: ${new Date(quotationDate).toLocaleDateString('ar-SA')}</p>
        </div>
        <div class="info">
          <div>
            <p><strong>العميل:</strong> ${customerName}</p>
            <p><strong>المستودع:</strong> ${warehouseName}</p>
          </div>
          <div>
            <p><strong>المستخدم:</strong> ${currentUser?.name || 'غير محدد'}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map(item => `
              <tr>
                <td>${item.name} ${item.type === 'service' ? '<span style="color: #666;">(خدمة)</span>' : ''}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" class="total-row">المجموع الفرعي</td>
              <td class="total-row">${formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td colspan="3" class="total-row">الضريبة (15%)</td>
              <td class="total-row">${formatCurrency(tax)}</td>
            </tr>
            <tr>
              <td colspan="3" class="total-row">الإجمالي الكلي</td>
              <td class="total-row">${formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
        ${quotationNotes ? `<div class="notes"><strong>ملاحظات:</strong> ${quotationNotes}</div>` : ''}
        <div class="footer">
          <p>تم الطباعة في: ${new Date().toLocaleString('ar-SA')}</p>
          <p>هذا عرض سعر وليس فاتورة بيع</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleSave = () => {
    if (cart.length === 0) {
      toast.error('يرجى إضافة عناصر لعرض السعر');
      return;
    }

    // Save quotation to localStorage or send to backend
    const quotation = {
      number: quotationNumber,
      date: quotationDate,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || 'عميل عام',
      warehouse: selectedWarehouse,
      warehouseName: warehouses.find(w => w.id === selectedWarehouse)?.name,
      items: cart,
      subtotal,
      tax,
      total,
      notes: quotationNotes,
      createdBy: currentUser?.name || 'غير محدد',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const savedQuotations = JSON.parse(localStorage.getItem('quotations') || '[]');
    savedQuotations.push(quotation);
    localStorage.setItem('quotations', JSON.stringify(savedQuotations));

    toast.success(`تم حفظ عرض السعر ${quotationNumber} بنجاح`);

    // Reset form
    setCart([]);
    setQuotationNumber(`QT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`);
    setQuotationDate(new Date().toISOString().split('T')[0]);
    setQuotationNotes('');
    setSelectedCustomerId(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>عرض سعر</h1>
            <p className="text-gray-600">إنشاء عرض سعر للعملاء</p>
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
          </div>
        </div>

        {/* Customer Info Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">العميل:</Label>
                <SearchableSelect
                  options={creditCustomers}
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  placeholder="ابحث عن العميل..."
                  searchPlaceholder="ابحث بالاسم أو رقم الحساب..."
                  emptyMessage="لا يوجد عملاء"
                  className="w-full md:w-64"
                  displayKey="name"
                  searchKeys={['name', 'accountNumber', 'phone']}
                />
              </div>

              {selectedCustomer && (
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">{selectedCustomer.name}</span>
                        <Badge variant="outline" className="text-xs">{selectedCustomer.status}</Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span>الهاتف: {selectedCustomer.phone || 'غير متوفر'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {systemType === 'restaurant' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products & Services Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <Label className="mb-2 block">بحث المنتجات والخدمات</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="بحث بالاسم، الباركود، أو كود الخدمة..."
                    className="pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="products" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-2" dir="rtl">
                <TabsTrigger value="products" className="gap-2">
                  <Package className="w-4 h-4" />
                  المنتجات ({filteredProducts.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  الخدمات ({filteredServices.length})
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addProductToCart(product)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <h4 className="text-sm mb-2">{product.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 font-medium">{formatCurrency(product.price)}</span>
                          <Badge variant="outline" className="text-xs">
                            متوفر: {product.stock}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>لا توجد منتجات</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <Card
                      key={service.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addServiceToCart(service)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-blue-50 rounded-lg mb-3 flex items-center justify-center">
                          <Briefcase className="w-12 h-12 text-blue-500" />
                        </div>
                        <div className="space-y-1 mb-2">
                          <h4 className="text-sm font-medium">{service.name}</h4>
                          <p className="text-xs text-gray-500">{service.code}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 font-medium">{formatCurrency(service.price)}</span>
                          <Badge variant="secondary" className="text-xs">
                            خدمة
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredServices.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>لا توجد خدمات</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Price Quotation Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-right">ملخص عرض السعر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quotation Info */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">رقم العرض:</span>
                    <span className="font-semibold">{quotationNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">التاريخ:</span>
                    <Input
                      type="date"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                      className="h-7 text-xs w-32"
                    />
                  </div>
                </div>

                {/* Items List */}
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">أضف عناصر لعرض السعر</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              {item.type === 'product' ? (
                                <Package className="w-5 h-5 text-gray-600" />
                              ) : (
                                <Briefcase className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-2">
                                {editingPriceId === item.id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={editingPriceValue}
                                      onChange={(e) => setEditingPriceValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          savePriceEdit(item.id);
                                        } else if (e.key === 'Escape') {
                                          cancelPriceEdit();
                                        }
                                      }}
                                      className="h-7 w-20 text-sm"
                                      autoFocus
                                      min={item.minSellPrice || 0}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => savePriceEdit(item.id)}
                                    >
                                      <Check className="w-3 h-3 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={cancelPriceEdit}
                                    >
                                      <X className="w-3 h-3 text-red-500" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => startEditingPrice(item)}
                                      title="تعديل السعر"
                                    >
                                      <Edit2 className="w-3 h-3 text-blue-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              {editingQuantityId === item.id ? (
                                <Input
                                  type="number"
                                  value={editingQuantityValue}
                                  onChange={(e) => setEditingQuantityValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      saveQuantityEdit(item.id);
                                    } else if (e.key === 'Escape') {
                                      cancelQuantityEdit();
                                    }
                                  }}
                                  onBlur={() => saveQuantityEdit(item.id)}
                                  className="h-8 w-12 text-center text-sm"
                                  autoFocus
                                  min={1}
                                />
                              ) : (
                                <span
                                  className="w-8 text-center font-medium cursor-pointer hover:bg-gray-100 rounded px-1"
                                  onClick={() => startEditingQuantity(item)}
                                  title="انقر لتعديل الكمية"
                                >
                                  {item.quantity}
                                </span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المجموع الفرعي:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>الضريبة (15%):</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>المجموع الكلي:</span>
                        <span className="text-xl text-blue-600">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm">ملاحظات (اختياري)</Label>
                      <Input
                        placeholder="أضف ملاحظات لعرض السعر..."
                        value={quotationNotes}
                        onChange={(e) => setQuotationNotes(e.target.value)}
                        className="text-right"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={handlePrint}
                      >
                        <Printer className="w-4 h-4" />
                        طباعة
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        onClick={handleSave}
                      >
                        <FileText className="w-4 h-4" />
                        حفظ
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-4 mb-6" style={{ display: 'flex', width: '100%' }}>
          {/* Products & Services Section - Non-Restaurant Mode */}
          <div className="flex flex-column gap-4 mb-6" style={{ display: 'flex', flexDirection: 'column', width: '75%' }}>
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <Label className="mb-2 block">بحث المنتجات والخدمات</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="بحث بالاسم، الباركود، أو كود الخدمة..."
                    className="pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="products" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-2" dir="rtl">
                <TabsTrigger value="products" className="gap-2">
                  <Package className="w-4 h-4" />
                  المنتجات ({filteredProducts.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  الخدمات ({filteredServices.length})
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">المخزون</TableHead>
                        <TableHead className="text-right w-24">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <Package className="w-5 h-5 text-gray-400" />
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-blue-600">
                            {formatCurrency(product.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={product.stock > 0 ? 'outline' : 'destructive'} className="text-xs">
                              {product.stock > 0 ? `متوفر: ${product.stock}` : 'غير متوفر'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addProductToCart(product)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 ml-1" />
                              إضافة
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>لا توجد منتجات</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right">الخدمة</TableHead>
                        <TableHead className="text-right">الكود</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right w-24">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service) => (
                        <TableRow
                          key={service.id}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-blue-500" />
                              <span className="font-medium">{service.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{service.code}</code>
                          </TableCell>
                          <TableCell className="text-right font-medium text-blue-600">
                            {formatCurrency(service.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addServiceToCart(service)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 ml-1" />
                              إضافة
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredServices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>لا توجد خدمات</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Price Quotation Summary - Non-Restaurant Mode */}
          <div className="w-1/4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-right">ملخص عرض السعر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quotation Info */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">رقم العرض:</span>
                    <span className="font-semibold">{quotationNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">التاريخ:</span>
                    <Input
                      type="date"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                      className="h-7 text-xs w-32"
                    />
                  </div>
                </div>

                {/* Items List */}
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">أضف عناصر لعرض السعر</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              {item.type === 'product' ? (
                                <Package className="w-5 h-5 text-gray-600" />
                              ) : (
                                <Briefcase className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-2">
                                {editingPriceId === item.id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={editingPriceValue}
                                      onChange={(e) => setEditingPriceValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          savePriceEdit(item.id);
                                        } else if (e.key === 'Escape') {
                                          cancelPriceEdit();
                                        }
                                      }}
                                      className="h-7 w-20 text-sm"
                                      autoFocus
                                      min={item.minSellPrice || 0}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => savePriceEdit(item.id)}
                                    >
                                      <Check className="w-3 h-3 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={cancelPriceEdit}
                                    >
                                      <X className="w-3 h-3 text-red-500" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => startEditingPrice(item)}
                                      title="تعديل السعر"
                                    >
                                      <Edit2 className="w-3 h-3 text-blue-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              {editingQuantityId === item.id ? (
                                <Input
                                  type="number"
                                  value={editingQuantityValue}
                                  onChange={(e) => setEditingQuantityValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      saveQuantityEdit(item.id);
                                    } else if (e.key === 'Escape') {
                                      cancelQuantityEdit();
                                    }
                                  }}
                                  onBlur={() => saveQuantityEdit(item.id)}
                                  className="h-8 w-12 text-center text-sm"
                                  autoFocus
                                  min={1}
                                />
                              ) : (
                                <span
                                  className="w-8 text-center font-medium cursor-pointer hover:bg-gray-100 rounded px-1"
                                  onClick={() => startEditingQuantity(item)}
                                  title="انقر لتعديل الكمية"
                                >
                                  {item.quantity}
                                </span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المجموع الفرعي:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>الضريبة (15%):</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>المجموع الكلي:</span>
                        <span className="text-xl text-blue-600">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm">ملاحظات (اختياري)</Label>
                      <Input
                        placeholder="أضف ملاحظات لعرض السعر..."
                        value={quotationNotes}
                        onChange={(e) => setQuotationNotes(e.target.value)}
                        className="text-right"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={handlePrint}
                      >
                        <Printer className="w-4 h-4" />
                        طباعة
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        onClick={handleSave}
                      >
                        <FileText className="w-4 h-4" />
                        حفظ
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}





