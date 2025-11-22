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
import { Search, ShoppingCart, CreditCard, Banknote, X, Plus, Minus, Trash2, Package, Briefcase, AlertTriangle, RotateCcw, User } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { createCompleteSalesJournalEntries, createSalesReturnJournalEntries, createMixedPaymentSalesJournalEntries, addJournalEntries } from '../data/journalEntries';
import { reduceStock, increaseStock, getStock, getCostPrice } from '../data/inventory';
import { addToSafe, deductFromSafe, getSafeBalance } from '../data/safes';
import { useUser } from '../contexts/UserContext';
import { SearchableSelect } from './ui/searchable-select';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  type: 'product' | 'service'; // نوع العنصر: منتج أو خدمة
  stock?: number; // المخزون (للمنتجات فقط)
  costPrice?: number; // تكلفة الشراء (للمنتجات فقط)
}

export function POS() {
  const { currentUser, isAdmin, hasAccessToWarehouse } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('1');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [systemType, setSystemType] = useState<'restaurant' | 'retail'>('retail');

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

  // Load system type from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('system_type') as 'restaurant' | 'retail' | null;
      if (savedType) {
        setSystemType(savedType);
      }
    }
  }, []);

  // Listen for storage changes to update system type
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const savedType = localStorage.getItem('system_type') as 'restaurant' | 'retail' | null;
        if (savedType) {
          setSystemType(savedType);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event for same-window updates
    window.addEventListener('systemTypeChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('systemTypeChanged', handleStorageChange);
    };
  }, []);
  
  // Mixed payment breakdown state
  const [paymentBreakdown, setPaymentBreakdown] = useState<{ cash: number; card: number; credit: number }>({
    cash: 0,
    card: 0,
    credit: 0
  });
  
  // Load default payment preferences from localStorage
  const loadDefaultPaymentPreferences = (): { cash: number; card: number; credit: number } => {
    if (typeof window === 'undefined') return { cash: 0, card: 0, credit: 0 };
    try {
      const stored = localStorage.getItem('pos_payment_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading payment preferences:', error);
    }
    return { cash: 0, card: 0, credit: 0 };
  };
  
  // Save default payment preferences to localStorage
  const saveDefaultPaymentPreferences = (preferences: { cash: number; card: number; credit: number }) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pos_payment_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving payment preferences:', error);
    }
  };

  const products = [
    { id: '1', name: 'كمبيوتر محمول HP', price: 3000, costPrice: 2500, barcode: '1234567890', category: 'إلكترونيات', stock: 15 },
    { id: '2', name: 'طابعة Canon', price: 2000, costPrice: 1500, barcode: '1234567891', category: 'إلكترونيات', stock: 8 },
    { id: '3', name: 'شاشة Samsung 27"', price: 1500, costPrice: 1000, barcode: '1234567892', category: 'إلكترونيات', stock: 12 },
    { id: '4', name: 'لوحة مفاتيح Logitech', price: 300, costPrice: 200, barcode: '1234567893', category: 'ملحقات', stock: 25 },
    { id: '5', name: 'ماوس Logitech', price: 150, costPrice: 100, barcode: '1234567894', category: 'ملحقات', stock: 30 },
    { id: '6', name: 'كاميرا ويب HD', price: 500, costPrice: 350, barcode: '1234567895', category: 'ملحقات', stock: 10 }
  ];

  // قائمة الخدمات (بدون مخزون أو باركود)
  const services = [
    { id: 's1', name: 'صيانة كمبيوتر محمول', price: 200, code: 'SRV-001', category: 'خدمات تقنية', description: 'صيانة شاملة' },
    { id: 's2', name: 'استشارة تقنية', price: 300, code: 'SRV-002', category: 'استشارات', description: 'ساعة استشارة' },
    { id: 's3', name: 'توصيل طلب', price: 50, code: 'SRV-003', category: 'توصيل', description: 'داخل المدينة' },
    { id: 's4', name: 'تثبيت برامج', price: 150, code: 'SRV-004', category: 'خدمات تقنية', description: 'تثبيت وإعداد' },
    { id: 's5', name: 'تدريب على برنامج', price: 500, code: 'SRV-005', category: 'تدريب', description: 'جلسة تدريبية' }
  ];

  // إضافة منتج للسلة
  const addProductToCart = (product: typeof products[0]) => {
    // Check stock availability
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
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        barcode: product.barcode,
        type: 'product',
        stock: currentStock,
        costPrice: product.costPrice
      }]);
    }
  };

  // إضافة خدمة للسلة
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
        quantity: 1,
        type: 'service'
      }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;

        // Check stock for products
        if (item.type === 'product' && item.stock !== undefined) {
          if (newQuantity > item.stock) {
            toast.error(`الكمية المتاحة: ${item.stock} فقط`);
            return item;
          }
        }

        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.15;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  // Calculate payment breakdown total
  const paymentTotal = paymentBreakdown.cash + paymentBreakdown.card + paymentBreakdown.credit;
  const paymentRemaining = total - paymentTotal;
  
  // Auto-fill payment breakdown when total changes (only if all are zero)
  const updatePaymentBreakdown = (field: 'cash' | 'card' | 'credit', value: number) => {
    const newBreakdown = { ...paymentBreakdown, [field]: Math.max(0, value) };
    setPaymentBreakdown(newBreakdown);
  };
  
  // Auto-fill remaining amount to a specific payment method
  const fillRemaining = (method: 'cash' | 'card' | 'credit') => {
    if (paymentRemaining > 0) {
      updatePaymentBreakdown(method, paymentBreakdown[method] + paymentRemaining);
    }
  };
  
  // Reset payment breakdown when cart is cleared
  useEffect(() => {
    if (cart.length === 0) {
      setPaymentBreakdown({ cash: 0, card: 0, credit: 0 });
    }
  }, [cart.length]);
  
  // Apply saved preferences when total changes and breakdown is empty
  useEffect(() => {
    if (cart.length > 0 && total > 0) {
      const currentTotal = paymentBreakdown.cash + paymentBreakdown.card + paymentBreakdown.credit;
      if (Math.abs(currentTotal) < 0.01) {
        const preferences = loadDefaultPaymentPreferences();
        const prefTotal = preferences.cash + preferences.card + preferences.credit;
        if (prefTotal > 0) {
          // Apply preferences proportionally
          setPaymentBreakdown({
            cash: (preferences.cash / prefTotal) * total,
            card: (preferences.card / prefTotal) * total,
            credit: (preferences.credit / prefTotal) * total
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    if (!selectedCustomer) {
      toast.error('يرجى اختيار العميل قبل إتمام البيع');
      return;
    }

    // Validate stock availability for all products
    for (const item of cart) {
      if (item.type === 'product') {
        const currentStock = getStock(item.id, selectedWarehouse);
        if (currentStock < item.quantity) {
          toast.error(`الكمية المتاحة من ${item.name}: ${currentStock} فقط`);
          return;
        }
      }
    }

    // Validate payment breakdown matches total
    const paymentTotal = paymentBreakdown.cash + paymentBreakdown.card + paymentBreakdown.credit;
    if (Math.abs(paymentTotal - total) > 0.01) {
      toast.error(`المبلغ المدخل (${formatCurrency(paymentTotal)}) لا يساوي الإجمالي (${formatCurrency(total)})`);
      return;
    }

    // Validate credit limit if there's credit payment
    if (paymentBreakdown.credit > 0) {
      if (selectedCustomer.currentBalance + paymentBreakdown.credit > selectedCustomer.creditLimit) {
        toast.error('لا يمكن إتمام البيع: تم تجاوز حد الائتمان');
        return;
      }
    }

    // Generate invoice number
    const invoiceNumber = `POS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Get cashier name (current user)
    const cashierName = currentUser?.name || 'غير محدد';

    // Calculate COGS (Cost of Goods Sold) for products only
    let totalCOGS = 0;
    for (const item of cart) {
      if (item.type === 'product' && item.costPrice) {
        totalCOGS += item.costPrice * item.quantity;
      }
    }

    // Reduce stock for products
    for (const item of cart) {
      if (item.type === 'product') {
        const success = reduceStock(item.id, selectedWarehouse, item.quantity);
        if (!success) {
          toast.error(`فشل خصم المخزون لـ ${item.name}`);
          return;
        }
      }
    }

    // Add to safe if cash payment exists
    if (paymentBreakdown.cash > 0) {
      const success = addToSafe('main', paymentBreakdown.cash);
      if (!success) {
        toast.error('فشل تحديث الخزينة');
        return;
      }
    }

    // Create journal entries for mixed payments
    const journalEntries = createMixedPaymentSalesJournalEntries(
      invoiceNumber,
      total,
      totalCOGS,
      paymentBreakdown,
      selectedCustomer.id,
      selectedCustomer.name,
      cashierName
    );

    // Add journal entries
    addJournalEntries(journalEntries);

    // Update customer balance if credit payment exists
    if (paymentBreakdown.credit > 0) {
      setCreditCustomers(prev =>
        prev.map(c =>
          c.id === selectedCustomer.id
            ? { ...c, currentBalance: c.currentBalance + paymentBreakdown.credit }
            : c
        )
      );
    }

    // Save payment preferences for next time
    saveDefaultPaymentPreferences(paymentBreakdown);

    // Create payment summary message
    const paymentSummary = [];
    if (paymentBreakdown.cash > 0) paymentSummary.push(`نقدي: ${formatCurrency(paymentBreakdown.cash)}`);
    if (paymentBreakdown.card > 0) paymentSummary.push(`بطاقة: ${formatCurrency(paymentBreakdown.card)}`);
    if (paymentBreakdown.credit > 0) paymentSummary.push(`آجل: ${formatCurrency(paymentBreakdown.credit)}`);
    
    toast.success(`تمت عملية البيع بنجاح - ${invoiceNumber}\n${paymentSummary.join(' | ')}\nتم خصم ${cart.filter(i => i.type === 'product').reduce((sum, i) => sum + i.quantity, 0)} منتج من المخزون`);
    clearCart();
    setPaymentBreakdown({ cash: 0, card: 0, credit: 0 });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const filteredProducts = products.map(product => ({
    ...product,
    stock: getStock(product.id, selectedWarehouse)
  })).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search by barcode on Enter key press
  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      
      const searchValue = searchTerm.trim();
      
      // Search for exact barcode match in products
      const productByBarcode = products.find(product => 
        product.barcode === searchValue
      );
      
      // Search for exact code match in services
      const serviceByCode = services.find(service => 
        service.code.toLowerCase() === searchValue.toLowerCase()
      );
      
      if (productByBarcode) {
        // Check stock availability
        const currentStock = getStock(productByBarcode.id, selectedWarehouse);
        if (currentStock <= 0) {
          toast.error('المنتج غير متوفر في المخزون');
          setSearchTerm('');
          return;
        }
        
        // Add product to cart
        addProductToCart(productByBarcode);
        setSearchTerm('');
        toast.success(`تم إضافة ${productByBarcode.name} للسلة`);
      } else if (serviceByCode) {
        // Add service to cart
        addServiceToCart(serviceByCode);
        setSearchTerm('');
        toast.success(`تم إضافة ${serviceByCode.name} للسلة`);
      } else {
        toast.error('لم يتم العثور على منتج أو خدمة بهذا الباركود');
      }
    }
  };

  const [creditCustomers, setCreditCustomers] = useState([
    { id: '1', name: 'شركة النجاح التقنية', phone: '0501234567', address: 'الرياض', creditLimit: 50000, currentBalance: 32000, graceDays: 30, status: 'ممتاز', accountNumber: 'ACC-001' },
    { id: '2', name: 'مؤسسة الريادة للخدمات', phone: '0502222222', address: 'جدة', creditLimit: 30000, currentBalance: 28500, graceDays: 20, status: 'تحذير', accountNumber: 'ACC-002' },
    { id: '3', name: 'شركة التميز للاستثمار', phone: '0503333333', address: 'الدمام', creditLimit: 80000, currentBalance: 12000, graceDays: 35, status: 'ممتاز', accountNumber: 'ACC-003' },
  ]);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Returns state
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'returns'>('products');
  const [returnItems, setReturnItems] = useState<CartItem[]>([]);
  const [returnInvoiceNumber, setReturnInvoiceNumber] = useState('');
  const [returnPaymentMethod, setReturnPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  const selectedCustomer = useMemo(
    () => (selectedCustomerId ? creditCustomers.find(c => c.id === selectedCustomerId) : undefined),
    [selectedCustomerId, creditCustomers]
  );
  const totalWithTax = total;

  const handleQuickAddCustomer = () => {
    if (!newCustomerData.name.trim()) {
      toast.error('يرجى إدخال اسم العميل');
      return;
    }
    if (!newCustomerData.phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }

    const id = Date.now().toString();
    const newCustomer = {
      id,
      name: newCustomerData.name.trim(),
      phone: newCustomerData.phone.trim(),
      address: newCustomerData.address.trim(),
      creditLimit: 0,
      currentBalance: 0,
      graceDays: 0,
      status: 'ممتاز'
    };
    setCreditCustomers(prev => [...prev, newCustomer]);
    setSelectedCustomerId(id);
    setIsAddCustomerDialogOpen(false);
    setNewCustomerData({ name: '', phone: '', address: '' });
    toast.success('تم إضافة العميل بسرعة');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>نقطة البيع (POS)</h1>
          <p className="text-gray-600">نظام البيع السريع</p>
        </div>
        <div className="flex gap-4 items-center">
            {/* Cashier Info */}
            <div className="space-y-1">
              <label className="text-sm text-gray-600">الكاشير المسؤول</label>
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
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">العميل:</label>
                  <Button variant="link" className="text-sm p-0 h-auto" onClick={() => setIsAddCustomerDialogOpen(true)}>
                    إضافة عميل سريع
                  </Button>
                </div>
                <SearchableSelect
                  options={creditCustomers}
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  placeholder="ابحث عن العميل بالاسم أو رقم الحساب..."
                  searchPlaceholder="ابحث بالاسم أو رقم الحساب أو الهاتف..."
                  emptyMessage="لا يوجد عملاء"
                  className="w-full md:w-64"
                  displayKey="name"
                  searchKeys={['name', 'accountNumber', 'phone']}
                />
              </div>

              {selectedCustomer ? (
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">{selectedCustomer.name}</span>
                        <Badge variant="outline" className="text-xs">{selectedCustomer.status}</Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span>الهاتف: {selectedCustomer.phone || 'غير متوفر'}</span>
                        {selectedCustomer.address && <span className="mr-2"> | العنوان: {selectedCustomer.address}</span>}
                      </div>
                    </div>
                    <div className="space-y-1 min-w-[200px]">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>الرصيد:</span>
                        <span className="font-semibold">{formatCurrency(selectedCustomer.currentBalance)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>الحد الائتماني:</span>
                        <span className="font-semibold">{formatCurrency(selectedCustomer.creditLimit)}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                        <div
                          className="h-1.5 bg-blue-500 rounded-full"
                          style={{ width: `${selectedCustomer.creditLimit > 0 ? Math.min(100, (selectedCustomer.currentBalance / selectedCustomer.creditLimit) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  لا يمكن إتمام أي عملية بيع بدون تحديد العميل
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products & Services Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="بحث بالاسم، الباركود، أو كود الخدمة... (اضغط Enter للبحث بالباركود/الكود)"
                  className="pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchEnter}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Products, Services, and Returns */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'products' | 'services' | 'returns')} className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-3" dir="rtl">
              <TabsTrigger value="products" className="gap-2">
                <Package className="w-4 h-4" />
                المنتجات ({filteredProducts.length})
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2">
                <Briefcase className="w-4 h-4" />
                الخدمات ({filteredServices.length})
              </TabsTrigger>
              <TabsTrigger value="returns" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                مرتجعات المبيعات
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-4">
              {systemType === 'restaurant' ? (
                // Grid view for restaurants
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
              ) : (
                // Table view for retail stores
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
              )}
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="mt-4">
              {systemType === 'restaurant' ? (
                // Grid view for restaurants
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
              ) : (
                // Table view for retail stores
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
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {service.code}
                            </code>
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
              )}
            </TabsContent>

            {/* Returns Tab */}
            <TabsContent value="returns" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>مرتجعات المبيعات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>رقم الفاتورة الأصلية</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="POS-2025-123456"
                        value={returnInvoiceNumber}
                        onChange={(e) => setReturnInvoiceNumber(e.target.value)}
                      />
                      <Button onClick={() => setIsReturnDialogOpen(true)}>
                        <Search className="w-4 h-4 ml-2" />
                        البحث
                      </Button>
                    </div>
                  </div>

                  {returnItems.length > 0 && (
                    <div className="space-y-2">
                      <Label>المنتجات المراد إرجاعها</Label>
                      <div className="space-y-2 border rounded-lg p-3">
                        {returnItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">الكمية: {item.quantity} × {formatCurrency(item.price)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>المجموع:</span>
                          <span>{formatCurrency(returnItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>طريقة استرداد المبلغ</Label>
                        <Select value={returnPaymentMethod} onValueChange={(v) => setReturnPaymentMethod(v as 'cash' | 'card' | 'credit')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">نقدي</SelectItem>
                            <SelectItem value="card">بطاقة</SelectItem>
                            <SelectItem value="credit">خصم من الحساب</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => {
                          if (!selectedCustomer) {
                            toast.error('يرجى اختيار العميل');
                            return;
                          }

                          const returnTotal = returnItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                          const returnNumber = `RET-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

                          // Calculate COGS for returned products
                          let returnCOGS = 0;
                          for (const item of returnItems) {
                            if (item.type === 'product' && item.costPrice) {
                              returnCOGS += item.costPrice * item.quantity;
                            }
                          }

                          // Increase stock for returned products
                          for (const item of returnItems) {
                            if (item.type === 'product') {
                              increaseStock(item.id, selectedWarehouse, item.quantity, item.costPrice);
                            }
                          }

                          // Deduct from safe if cash refund
                          if (returnPaymentMethod === 'cash') {
                            const success = deductFromSafe('main', returnTotal);
                            if (!success) {
                              toast.error('رصيد الخزينة غير كافي');
                              return;
                            }
                          }

                          // Create return journal entries
                          const journalEntries = createSalesReturnJournalEntries(
                            returnNumber,
                            returnInvoiceNumber,
                            returnTotal,
                            returnCOGS,
                            returnPaymentMethod,
                            selectedCustomer.id,
                            selectedCustomer.name
                          );

                          addJournalEntries(journalEntries);

                          // Update customer balance if credit
                          if (returnPaymentMethod === 'credit') {
                            setCreditCustomers(prev =>
                              prev.map(c =>
                                c.id === selectedCustomer.id
                                  ? { ...c, currentBalance: Math.max(0, c.currentBalance - returnTotal) }
                                  : c
                              )
                            );
                          }

                          toast.success(`تم إرجاع المنتجات بنجاح - ${returnNumber}\nتم إضافة ${returnItems.filter(i => i.type === 'product').reduce((sum, i) => sum + i.quantity, 0)} منتج للمخزون`);
                          setReturnItems([]);
                          setReturnInvoiceNumber('');
                        }}
                      >
                        <RotateCcw className="w-4 h-4 ml-2" />
                        إتمام عملية الإرجاع
                      </Button>
                    </div>
                  )}

                  {returnItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <RotateCcw className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>أدخل رقم الفاتورة للبحث عن المنتجات المراد إرجاعها</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  السلة
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>السلة فارغة</p>
                  <p className="text-sm mt-2">قم بإضافة منتجات للبدء</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <ScrollArea className="h-64">
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
                              <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                              {item.type === 'service' && (
                                <Badge variant="secondary" className="text-xs">خدمة</Badge>
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
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
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

                  {/* Mixed Payment Methods */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold">طرق الدفع المختلطة</label>
                      {paymentTotal > 0 && Math.abs(paymentTotal - total) < 0.01 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            saveDefaultPaymentPreferences(paymentBreakdown);
                            toast.success('تم حفظ التفضيلات الافتراضية');
                          }}
                          title="حفظ هذا التوزيع كافتراضي"
                        >
                          حفظ كافتراضي
                        </Button>
                      )}
                    </div>
                    
                    {/* Cash Payment */}
                  <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-green-600" />
                          نقدي
                        </label>
                        {paymentRemaining > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => fillRemaining('cash')}
                          >
                            تعبئة المتبقي
                          </Button>
                        )}
                          </div>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={paymentBreakdown.cash > 0 ? paymentBreakdown.cash : ''}
                        onChange={(e) => updatePaymentBreakdown('cash', parseFloat(e.target.value) || 0)}
                        className="text-right"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Card Payment */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                            بطاقة ائتمان
                        </label>
                        {paymentRemaining > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => fillRemaining('card')}
                          >
                            تعبئة المتبقي
                          </Button>
                        )}
                          </div>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={paymentBreakdown.card > 0 ? paymentBreakdown.card : ''}
                        onChange={(e) => updatePaymentBreakdown('card', parseFloat(e.target.value) || 0)}
                        className="text-right"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Credit Payment */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-orange-600" />
                            بيع آجل (على الحساب)
                        </label>
                        {paymentRemaining > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => fillRemaining('credit')}
                          >
                            تعبئة المتبقي
                          </Button>
                        )}
                          </div>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={paymentBreakdown.credit > 0 ? paymentBreakdown.credit : ''}
                        onChange={(e) => updatePaymentBreakdown('credit', parseFloat(e.target.value) || 0)}
                        className="text-right"
                        min="0"
                        step="0.01"
                      />
                  </div>

                    {/* Payment Summary */}
                    <div className="space-y-2 rounded-lg border p-3 bg-gray-50 text-sm">
                      <div className="flex justify-between">
                        <span>المبلغ المدخل:</span>
                        <span className={Math.abs(paymentTotal - total) < 0.01 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {formatCurrency(paymentTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>الإجمالي المطلوب:</span>
                        <span className="font-semibold">{formatCurrency(total)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>المتبقي:</span>
                        <span className={paymentRemaining > 0 ? 'text-orange-600 font-semibold' : paymentRemaining < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                          {formatCurrency(Math.abs(paymentRemaining))} {paymentRemaining > 0 ? '(ناقص)' : paymentRemaining < 0 ? '(زائد)' : '(مكتمل)'}
                        </span>
                      </div>
                    </div>

                    {/* Credit Limit Warning */}
                    {paymentBreakdown.credit > 0 && (
                    <div className="space-y-2 rounded-lg border p-3 bg-yellow-50 text-sm text-gray-700">
                      {!selectedCustomer && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          يجب اختيار عميل للمتابعة بالبيع الآجل
                        </div>
                      )}
                      {selectedCustomer && (
                        <>
                          <div className="flex items-center justify-between">
                            <span>المتاح بعد هذا الطلب:</span>
                            <span className="font-semibold">
                                {formatCurrency(selectedCustomer.creditLimit - (selectedCustomer.currentBalance + paymentBreakdown.credit))}
                            </span>
                          </div>
                            {selectedCustomer.currentBalance + paymentBreakdown.credit > selectedCustomer.creditLimit && (
                            <div className="flex items-center gap-2 text-red-600 text-xs">
                              <AlertTriangle className="w-4 h-4" />
                              هذا الطلب يتجاوز الحد الائتماني للعميل
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    <CreditCard className="w-5 h-5 ml-2" />
                    إتمام عملية البيع
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة عميل سريع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اسم العميل</Label>
              <Input
                placeholder="اسم العميل"
                value={newCustomerData.name}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  placeholder="05xxxxxxxx"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  placeholder="عنوان العميل"
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddCustomerDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleQuickAddCustomer}>حفظ العميل</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Items Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة منتجات للإرجاع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">اختر المنتجات المراد إرجاعها من الفاتورة {returnInvoiceNumber}</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">السعر: {formatCurrency(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const existing = returnItems.find(i => i.id === product.id);
                        if (existing) {
                          setReturnItems(returnItems.map(i =>
                            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                          ));
                        } else {
                          setReturnItems([...returnItems, {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            type: 'product',
                            costPrice: product.costPrice
                          }]);
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>إلغاء</Button>
              <Button onClick={() => {
                if (returnItems.length === 0) {
                  toast.error('يرجى إضافة منتجات للإرجاع');
                  return;
                }
                setIsReturnDialogOpen(false);
              }}>تم</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
