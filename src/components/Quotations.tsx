import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, ShoppingCart, CreditCard, Banknote, X, Plus, Minus, Trash2, Package, Briefcase, AlertTriangle, RotateCcw, User, Wallet, Lock as LockIcon, ChevronsUpDown, Edit2, Check, Printer, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { createSalesReturnJournalEntries, createMixedPaymentSalesJournalEntries, addJournalEntries } from '../data/journalEntries';
import { reduceStock, increaseStock, getStock, } from '../data/inventory';
import { addToSafe, deductFromSafe, } from '../data/safes';
import { addToMainBank, addToBank, loadBanks } from '../data/banks';
import { useUser } from '../contexts/UserContext';
import { SearchableSelect } from './ui/searchable-select';
import { getPriceForQuantity, PricingTier } from '../utils/pricing';
import { initializeInventoryItem } from '../data/inventory';
import { addJournalEntry, createOpeningInventoryEntry } from '../data/journalEntries';
import CustomDatePicker from "@/components/CustomDatePicker";
import { getTranslation, Language, Direction } from '../lib/translations';

import {
  getDrawer,
  checkAndOpenDrawer,
  addToDrawer,
  deductFromDrawer,
  closeDrawer,
  getDrawerTransactions,
  createOrUpdateDrawer,
  getDrawersByEmployee,
  type CashDrawer
} from '../data/cashDrawers';

interface CartItem {
  id: string;
  name: string;
  price: number; // Current price per unit (may change based on quantity)
  quantity: number;
  barcode?: string;
  type: 'product' | 'service'; // نوع العنصر: منتج أو خدمة
  stock?: number; // المخزون (للمنتجات فقط)
  costPrice?: number; // تكلفة الشراء (للمنتجات فقط)
  basePrice?: number; // Base/default price
  minSellPrice?: number; // Minimum allowed selling price
  expiryDate?: string; // تاريخ انتهاء الصلاحية
  pricingTiers?: PricingTier[]; // Quantity-based pricing tiers
  minQuantity?: number; // Minimum quantity per client
  maxQuantity?: number; // Maximum quantity per client
}


interface Quotations {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'مسودة' | 'مرسل';
  items?: CartItem[];
}

export function Quotations({
  language,
  direction,
  translations
}: {
  language: string;
  direction: 'ltr' | 'rtl';
  translations: Record<string, string>;
}) {
  const { currentUser, isAdmin, hasAccessToWarehouse, hasPermission } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('1');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState<string>('');
  const [priceModificationIncludesTax, setPriceModificationIncludesTax] = useState(true);
  const [systemType, setSystemType] = useState<'restaurant' | 'retail'>('retail');
  const [customerName, setCustomerName] = useState(''); 
   // POS Terminal and Drawer Management
  const [selectedPosId, setSelectedPosId] = useState<string>('pos-1');
  const [currentDrawer, setCurrentDrawer] = useState<CashDrawer | null>(null);
  const [showDrawerDialog, setShowDrawerDialog] = useState(false);
  const [showCloseDrawerDialog, setShowCloseDrawerDialog] = useState(false);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [actualCounted, setActualCounted] = useState('');
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyNotes, setAddMoneyNotes] = useState('');
  const [items, setItems] = useState<CartItem[]>([]);
  const [quotations, setQuotations] = useState<Quotations[]>([]);
  const [error, setError] = useState<string | null>(null);
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
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  // Item type selector for non-restaurant mode
  const [itemType, setItemType] = useState<'product' | 'service' | 'return'>('product');
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);

  // Main view tab state
  const [mainTab, setMainTab] = useState<'new' | 'list'>('new');

  const t = (key: string) => getTranslation(language as Language, key);
  
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

  // Initialize POS terminal and drawer
  useEffect(() => {
    if (!currentUser) return;

    // Determine POS ID based on user
    let posId = 'pos-1';

    if (!isAdmin() && currentUser.id) {
      // Employee sees their assigned POS
      const employeeDrawers = getDrawersByEmployee(currentUser.id);
      if (employeeDrawers.length > 0) {
        posId = employeeDrawers[0].posId;
      } else {
        // Create drawer for employee if doesn't exist
        const warehouse = warehouses.find(w => w.id === selectedWarehouse);
        posId = `pos-${currentUser.id}`;
        createOrUpdateDrawer(
          posId,
          selectedWarehouse,
          warehouse?.name || 'الفرع الرئيسي',
          currentUser.id,
          currentUser.name
        );
      }
    } else {
      // Admin can select any POS, default to pos-1
      posId = selectedPosId;
    }

    setSelectedPosId(posId);

    // Check and auto-open drawer if needed (new day)
    const drawer = checkAndOpenDrawer(posId);
    setCurrentDrawer(drawer);
  }, [currentUser, isAdmin, selectedWarehouse]);

  // Load drawer when POS changes
  useEffect(() => {
    const drawer = getDrawer(selectedPosId);
    if (drawer) {
      // Auto-open if needed
      const updatedDrawer = checkAndOpenDrawer(selectedPosId);
      setCurrentDrawer(updatedDrawer);
    }
  }, [selectedPosId]);

  // Load system type from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('system_type') as 'restaurant' | 'retail' | null;
      if (savedType) {
        setSystemType(savedType);
      }

      const savedPriceModificationIncludesTax = localStorage.getItem('price_modification_includes_tax');
      if (savedPriceModificationIncludesTax !== null) {
        setPriceModificationIncludesTax(savedPriceModificationIncludesTax === 'true');
      } else {
        // Default to true
        setPriceModificationIncludesTax(true);
      }
    }
  }, []);

  // Listen for storage changes to update system type and price modification setting
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const savedType = localStorage.getItem('system_type') as 'restaurant' | 'retail' | null;
        if (savedType) {
          setSystemType(savedType);
        }

        const savedPriceModificationIncludesTax = localStorage.getItem('price_modification_includes_tax');
        if (savedPriceModificationIncludesTax !== null) {
          setPriceModificationIncludesTax(savedPriceModificationIncludesTax === 'true');
        }
      }
    };
   

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events for same-window updates
    window.addEventListener('systemTypeChanged', handleStorageChange);
    window.addEventListener('priceModificationSettingChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('systemTypeChanged', handleStorageChange);
      window.removeEventListener('priceModificationSettingChanged', handleStorageChange);
    };
  }, []);

  // Computed values
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.15;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const selectedCustomer = useMemo(
    () => (selectedCustomerId ? creditCustomers.find(c => c.id === selectedCustomerId) : undefined),
    [selectedCustomerId, creditCustomers]
  );

  const totalWithTax = total;
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const saveQuotation = () => {
    if (!customerName.trim()) {
      toast.error('يرجى إدخال اسم العميل');
      return;
    }

    if (cart.length === 0) {
      toast.error('السلة فارغة');
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

    // Get cashier name (current user)
    const cashierName = currentUser?.name || 'غير محدد';

    // Calculate COGS (Cost of Goods Sold) for products only
    let totalCOGS = 0;
    for (const item of cart) {
      if (item.type === 'product' && item.costPrice) {
        totalCOGS += item.costPrice * item.quantity;
      }
    }

    // Save quotation
    const newQuotation: Quotations = {
      id: Date.now().toString(),
      customerName: customerName,
      date: new Date().toISOString(),
      total: total,
      status: 'مسودة',
      items: [...cart]
    };
    
    setQuotations([...quotations, newQuotation]);
    toast.success('تم حفظ عرض السعر بنجاح');
    
    // Clear cart and customer name
    setCart([]);
    setCustomerName('');
    
    // Switch to list tab to show the saved quotation
    setMainTab('list');
  };

  const products = [
    { id: '1', name: 'كمبيوتر محمول HP', price: 3000, costPrice: 2500, barcode: '1234567890', category: 'إلكترونيات', stock: 15, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '2', name: 'طابعة Canon', price: 2000, costPrice: 1500, barcode: '1234567891', category: 'إلكترونيات', stock: 8, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '3', name: 'شاشة Samsung 27"', price: 1500, costPrice: 1000, barcode: '1234567892', category: 'إلكترونيات', stock: 12, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '4', name: 'لوحة مفاتيح Logitech', price: 300, costPrice: 200, barcode: '1234567893', category: 'ملحقات', stock: 25, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '5', name: 'ماوس Logitech', price: 150, costPrice: 100, barcode: '1234567894', category: 'ملحقات', stock: 30, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '6', name: 'كاميرا ويب HD', price: 500, costPrice: 350, barcode: '1234567895', category: 'ملحقات', stock: 10, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined }
  ];
  console.log(products);

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

    // Check min quantity
    if (product.minQuantity && product.minQuantity > 1) {
      toast.error(`الحد الأدنى للكمية: ${product.minQuantity}`);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;

      // Check stock
      if (newQuantity > currentStock) {
        toast.error(`الكمية المتاحة: ${currentStock} فقط`);
        return;
      }

      // Check max quantity per client
      if (product.maxQuantity && newQuantity > product.maxQuantity) {
        toast.error(`الحد الأعلى للكمية: ${product.maxQuantity}`);
        return;
      }

      // Recalculate price based on new quantity and pricing tiers
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
      // Calculate initial price based on quantity 1 and pricing tiers
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
        minSellPrice: (product as any).minSellPrice || (product.costPrice ? product.costPrice * 1.1 : product.price * 0.9), // Default to 10% above cost or 10% below price
        pricingTiers: product.pricingTiers,
        minQuantity: product.minQuantity,
        maxQuantity: product.maxQuantity
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
        basePrice: service.price,
        quantity: 1,
        type: 'service',
        minSellPrice: (service as any).minSellPrice || service.price * 0.8 // Default to 80% of price for services
      }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    console.log(cart);
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

        // Check min quantity
        if (item.minQuantity && newQuantity < item.minQuantity) {
          toast.error(`الحد الأدنى للكمية: ${item.minQuantity}`);
          return item;
        }

        // Check max quantity per client
        if (item.maxQuantity && newQuantity > item.maxQuantity) {
          toast.error(`الحد الأعلى للكمية: ${item.maxQuantity}`);
          return item;
        }

        // Recalculate price based on new quantity and pricing tiers
        const basePrice = item.basePrice || item.price;
        const newPrice = getPriceForQuantity(
          basePrice,
          newQuantity,
          item.pricingTiers
        );

        return { ...item, quantity: newQuantity, price: newPrice };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const setQuantityDirect = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(cart.map(item => {
      if (item.id === id) {
        // Check stock for products
        if (item.type === 'product' && item.stock !== undefined) {
          if (quantity > item.stock) {
            toast.error(`الكمية المتاحة: ${item.stock} فقط`);
            return item;
          }
        }

        // Check min quantity
        if (item.minQuantity && quantity < item.minQuantity) {
          toast.error(`الحد الأدنى للكمية: ${item.minQuantity}`);
          return item;
        }

        // Check max quantity per client
        if (item.maxQuantity && quantity > item.maxQuantity) {
          toast.error(`الحد الأعلى للكمية: ${item.maxQuantity}`);
          return item;
        }

        // Recalculate price based on new quantity and pricing tiers
        const basePrice = item.basePrice || item.price;
        const newPrice = getPriceForQuantity(
          basePrice,
          quantity,
          item.pricingTiers
        );

        return { ...item, quantity, price: newPrice };
      }
      return item;
    }));
  };

  const startEditingQuantity = (item: CartItem) => {
    setEditingQuantityId(item.id);
    setEditingQuantityValue(item.quantity.toString());
  };

  const saveQuantityEdit = (id: string) => {
    const quantityValue = parseInt(editingQuantityValue);
    if (isNaN(quantityValue) || quantityValue < 1) {
      toast.error('يرجى إدخال كمية صحيحة');
      return;
    }
    setQuantityDirect(id, quantityValue);
    setEditingQuantityId(null);
    setEditingQuantityValue('');
  };

  const cancelQuantityEdit = () => {
    setEditingQuantityId(null);
    setEditingQuantityValue('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        // Validate minimum selling price
        if (item.minSellPrice !== undefined && newPrice < item.minSellPrice) {
          toast.error(`السعر الأدنى المسموح: ${formatCurrency(item.minSellPrice)}`);
          return item;
        }
        return { ...item, price: newPrice };
      }
      return item;
    }));
  };

  const startEditingPrice = (item: CartItem) => {
    setEditingPriceId(item.id);
    // If price modification includes tax, show price with tax, otherwise show price without tax
    const taxRate = 0.15; // 15% VAT
    const displayPrice = priceModificationIncludesTax
      ? item.price * (1 + taxRate)
      : item.price;
    setEditingPriceValue(displayPrice.toFixed(2));
  };

  const savePriceEdit = (id: string) => {
    const priceValue = parseFloat(editingPriceValue);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('يرجى إدخال سعر صحيح');
      return;
    }

    // If price modification includes tax, extract tax from the entered price
    const taxRate = 0.15; // 15% VAT
    const finalPrice = priceModificationIncludesTax
      ? priceValue / (1 + taxRate)
      : priceValue;

    updateItemPrice(id, finalPrice);
    setEditingPriceId(null);
    setEditingPriceValue('');
  };

  const cancelPriceEdit = () => {
    setEditingPriceId(null);
    setEditingPriceValue('');
  };

  const clearCart = () => {
    setCart([]);
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
  console.log(filteredProducts);

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
      status: 'ممتاز',
      accountNumber: `ACC-${id.slice(-6)}`
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
            <h1>عروض الأسعار</h1>
            <p className="text-gray-600">نظام عروض الأسعار</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            إجمالي العروض: {quotations.length}
          </Badge>
          <div className="flex gap-4 items-center">
            {/* Cash Drawer Status */}
         
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

        {/* Date Section (replaces customer header in restaurant mode) */}
        {systemType === 'restaurant' && (
            <Card>
              <CardHeader className="text-right">
                <CardTitle>بيانات العميل</CardTitle>
                <CardDescription>أدخل اسم العميل الذي طلب عرض السعر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>اسم العميل</Label>
                  <Input
                    placeholder="مثال: شركة النجاح التقنية"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'new' | 'list')} className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-2 mb-6" dir="rtl">
          <TabsTrigger value="new" className="gap-2">
            <Plus className="w-4 h-4" />
            عرض سعر جديد
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Package className="w-4 h-4" />
            قائمة العروض ({quotations.length})
          </TabsTrigger>
        </TabsList>

        {/* New Quotation Tab */}
        <TabsContent value="new" className="mt-0">
          {systemType === 'restaurant' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products & Services Section - Restaurant Mode */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <Label className="mb-2 block">بحث المنتجات والخدمات</Label>
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
              <TabsList className="grid w-full grid-cols-1" dir="rtl">
                <TabsTrigger value="products" className="gap-2">
                  <Package />
                  المنتجات ({filteredProducts.length})
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
            </Tabs>
          </div>


          {/* Cart Section - Restaurant Mode */}
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
                                    {item.minSellPrice !== undefined && (
                                      <span className="text-xs text-gray-500">الحد الأدنى: {formatCurrency(item.minSellPrice)}</span>
                                    )}
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
                                {item.type === 'service' && (
                                  <Badge variant="secondary" className="text-xs">خدمة</Badge>
                                )}
                              </div>
                              {item.expiryDate && (
                                <p className="text-xs text-gray-500 mt-1">تاريخ الانتهاء: {new Date(item.expiryDate).toLocaleDateString('ar-SA')}</p>
                              )}
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

                    {/* Opening inventory actions instead of mixed payment methods */}
                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                      <p className="text-xs text-gray-500 leading-relaxed text-right md:max-w-xs">

                      </p>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                          className="w-full"
                          onClick={saveQuotation}
                          disabled={!customerName.trim() || cart.length === 0}
                        >
                          حفظ عرض السعر
                        </Button>

                        <div className="flex gap-2 justify-between">
                          <Button variant="outline" className="flex-1 gap-2">
                            <Printer className="w-4 h-4" />
                            طباعة
                          </Button>
                          <Button variant="outline" className="flex-1 gap-2">
                            <Download className="w-4 h-4" />
                            تصدير PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-4 mb-6" style={{ display: 'flex', width: '100%' }}>
          {/* Top Row: Customer & Add Item Section - Non-Restaurant Mode */}
          <div className="flex flex-column gap-4 mb-6" style={{ display: 'flex', flexDirection: 'column', width: '75%' }}>


            {/* Add Item Section - Takes 4/5 (80%) */}
            <div >
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Type Selector and Search Field on Same Line */}
                    <div className="flex items-end gap-3">

                      {/* Type Selector */}
                      <div className="w-32 flex-shrink-0">
                        <Label className="mb-2 block">نوع العنصر</Label>

                        <Select value={itemType} onValueChange={(v) => setItemType(v as 'product' | 'service' | 'return')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                منتج
                              </div>
                            </SelectItem>
                            <SelectItem value="service">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                خدمة
                              </div>
                            </SelectItem>
                            <SelectItem value="return">
                              <div className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" />
                                مرتجع
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Search Field with Dropdown */}
                      <div className="flex-1">
                        <Label className="mb-2 block">بحث</Label>
                        <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={searchPopoverOpen}
                              className="w-full justify-between"
                            >
                              <span className="text-muted-foreground">
                                {itemType === 'product' ? 'ابحث بالاسم أو أدخل الباركود...' : itemType === 'service' ? 'ابحث بالاسم أو الكود...' : 'ابحث عن فاتورة...'}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" dir="rtl">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder={itemType === 'product' ? 'ابحث بالاسم أو أدخل الباركود...' : itemType === 'service' ? 'ابحث بالاسم أو الكود...' : 'ابحث عن فاتورة...'}
                                value={searchTerm}
                                onValueChange={(value) => {
                                  setSearchTerm(value);
                                  setSearchPopoverOpen(true);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && searchTerm.trim()) {
                                    e.preventDefault();
                                    const searchValue = searchTerm.trim();
                                    // Search for exact barcode match in products
                                    const productByBarcode = itemType === 'product' && products.find(product =>
                                      product.barcode === searchValue
                                    );
                                    // Search for exact code match in services
                                    const serviceByCode = itemType === 'service' && services.find(service =>
                                      service.code.toLowerCase() === searchValue.toLowerCase()
                                    );
                                    if (productByBarcode) {
                                      const currentStock = getStock(productByBarcode.id, selectedWarehouse);
                                      if (currentStock <= 0) {
                                        toast.error('المنتج غير متوفر في المخزون');
                                        setSearchTerm('');
                                        return;
                                      }
                                      addProductToCart(productByBarcode);
                                      setSearchTerm('');
                                      setSearchPopoverOpen(false);
                                      toast.success(`تم إضافة ${productByBarcode.name} للسلة`);
                                    } else if (serviceByCode) {
                                      addServiceToCart(serviceByCode);
                                      setSearchTerm('');
                                      setSearchPopoverOpen(false);
                                      toast.success(`تم إضافة ${serviceByCode.name} للسلة`);
                                    }
                                  }
                                }}
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {itemType === 'product' && 'لا توجد منتجات'}
                                  {itemType === 'service' && 'لا توجد خدمات'}
                                  {itemType === 'return' && 'أدخل رقم الفاتورة'}
                                </CommandEmpty>
                                <CommandGroup>
                                  {itemType === 'product' && filteredProducts.map((product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={product.name}
                                      onSelect={() => {
                                        addProductToCart(product);
                                        setSearchTerm('');
                                        setSearchPopoverOpen(false);
                                        toast.success(`تم إضافة ${product.name} للسلة`);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{product.name}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-600">{formatCurrency(product.price)}</span>
                                            <Badge variant={product.stock > 0 ? 'outline' : 'destructive'} className="text-xs">
                                              {product.stock > 0 ? `متوفر: ${product.stock}` : 'غير متوفر'}
                                            </Badge>
                                          </div>
                                          {product.barcode && (
                                            <p className="text-xs text-gray-500 mt-1">باركود: {product.barcode}</p>
                                          )}
                                        </div>
                                        <Plus className="w-4 h-4 text-blue-600 mr-2" />
                                      </div>
                                    </CommandItem>
                                  ))}
                                 
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Cart Section - Takes 4/5 (80%) */}
            <div >
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
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>السلة فارغة</p>
                      <p className="text-sm mt-2">قم بإضافة منتجات للبدء</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
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
                                    {item.minSellPrice !== undefined && (
                                      <span className="text-xs text-gray-500">الحد الأدنى: {formatCurrency(item.minSellPrice)}</span>
                                    )}
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
                                {item.type === 'service' && (
                                  <Badge variant="secondary" className="text-xs">خدمة</Badge>
                                )}
                              </div>
                              {item.expiryDate && (
                                <p className="text-xs text-gray-500 mt-1">تاريخ الانتهاء: {new Date(item.expiryDate).toLocaleDateString('ar-SA')}</p>
                              )}
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
                  )}
                </CardContent>
              </Card>
            </div>


          </div>

          {/* Bottom Row: Payment & Cart Section - Non-Restaurant Mode */}
          <div className="flex flex-column gap-6" style={{ display: 'flex', flexDirection: 'column', width: '25%' }}>

            {/* Customer Section - Takes 1/5 (20%) */}
            <div>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">العميل:</label>
                      <Button variant="link" className="text-sm p-0 h-auto" onClick={() => setIsAddCustomerDialogOpen(true)}>
                        إضافة عميل سريع
                      </Button>
                    </div>
                    <SearchableSelect
                      options={creditCustomers}
                      value={selectedCustomerId}
                      onValueChange={setSelectedCustomerId}
                      placeholder="ابحث عن العميل..."
                      searchPlaceholder="ابحث بالاسم أو رقم الحساب..."
                      emptyMessage="لا يوجد عملاء"
                      className="w-full"
                      displayKey="name"
                      searchKeys={['name', 'accountNumber', 'phone']}
                    />
                    {selectedCustomer && (
                      <div className="pt-2 space-y-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{selectedCustomer.name}</span>
                          <Badge variant="outline" className="text-xs">{selectedCustomer.status}</Badge>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>الرصيد:</span>
                          <span className="font-semibold">{formatCurrency(selectedCustomer.currentBalance)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>الحد الائتماني:</span>
                          <span className="font-semibold">{formatCurrency(selectedCustomer.creditLimit)}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full">
                          <div
                            className="h-1.5 bg-blue-500 rounded-full"
                            style={{ width: `${selectedCustomer.creditLimit > 0 ? Math.min(100, (selectedCustomer.currentBalance / selectedCustomer.creditLimit) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Payment Section - Takes 1/5 (20%) */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>الدفع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">أضف عناصر للسلة للبدء</p>
                    </div>
                  ) : (
                    <>
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


                    
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>قائمة عروض الأسعار</CardTitle>
              <CardDescription>أحدث عروض الأسعار التي تم إنشاؤها</CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>لا توجد عروض أسعار مسجلة حتى الآن</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setMainTab('new')}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء عرض سعر جديد
                  </Button>
                </div>
              ) : (
                <div dir="rtl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم العرض</TableHead>
                        <TableHead className="text-right">العميل</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="text-right font-mono">#{q.id.slice(-6)}</TableCell>
                          <TableCell className="text-right font-medium">{q.customerName}</TableCell>
                          <TableCell className="text-right">
                            {new Date(q.date).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {formatCurrency(q.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={q.status === 'مسودة' ? 'secondary' : 'default'}>
                              {q.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm">
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
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

      {/* Add Customer Dialog */}
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
            <p className="text-sm text-gray-600">اختر المنتجات المراد إرجاعها</p>
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

      {/* Cash Drawer Management Dialog */}
      <Dialog open={showDrawerDialog} onOpenChange={setShowDrawerDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إدارة درج النقدية</DialogTitle>
          </DialogHeader>
          {currentDrawer && (
            <div className="space-y-6">
              {/* Drawer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm text-gray-600">الفرع</label>
                  <p className="font-semibold">{currentDrawer.branchName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">الموظف المسؤول</label>
                  <p className="font-semibold">{currentDrawer.employeeName || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">رصيد الافتتاح</label>
                  <p className="font-semibold text-blue-600">{formatCurrency(currentDrawer.openingBalance)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">الرصيد الحالي</label>
                  <p className="font-semibold text-green-600">{formatCurrency(currentDrawer.currentBalance)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">نقد المبيعات</label>
                  <p className="font-semibold">
                    {formatCurrency(currentDrawer.currentBalance - currentDrawer.openingBalance)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">الحالة</label>
                  <Badge variant={currentDrawer.status === 'open' ? 'default' : 'secondary'}>
                    {currentDrawer.status === 'open' ? 'مفتوح' : 'مغلق'}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddMoneyDialog(true);
                    setShowDrawerDialog(false);
                  }}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة نقد
                </Button>
                {currentDrawer.status === 'open' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCloseDrawerDialog(true);
                      setShowDrawerDialog(false);
                    }}
                    className="flex-1"
                  >
                    <LockIcon className="w-4 h-4 ml-2" />
                    إغلاق الدرج
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={showAddMoneyDialog} onOpenChange={setShowAddMoneyDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة نقد للدرج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input
                type="number"
                value={addMoneyAmount}
                onChange={(e) => setAddMoneyAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Input
                value={addMoneyNotes}
                onChange={(e) => setAddMoneyNotes(e.target.value)}
                placeholder="مثال: نقد للصرف..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowAddMoneyDialog(false);
                setAddMoneyAmount('');
                setAddMoneyNotes('');
              }}>
                إلغاء
              </Button>
              <Button onClick={() => {
                const amount = parseFloat(addMoneyAmount);
                if (!amount || amount <= 0) {
                  toast.error('يرجى إدخال مبلغ صحيح');
                  return;
                }
                if (!currentDrawer) {
                  toast.error('الدرج غير متاح');
                  return;
                }
                const success = addToDrawer(
                  currentDrawer.posId,
                  amount,
                  'manual_add',
                  currentUser?.id || 'unknown',
                  currentUser?.name || 'غير محدد',
                  addMoneyNotes || 'إضافة يدوية',
                  undefined
                );
                if (success) {
                  toast.success(`تم إضافة ${formatCurrency(amount)} للدرج`);
                  const updatedDrawer = getDrawer(currentDrawer.posId);
                  setCurrentDrawer(updatedDrawer);
                  setShowAddMoneyDialog(false);
                  setAddMoneyAmount('');
                  setAddMoneyNotes('');
                } else {
                  toast.error('فشل إضافة المبلغ');
                }
              }}>
                إضافة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Drawer Dialog */}
      <Dialog open={showCloseDrawerDialog} onOpenChange={setShowCloseDrawerDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إغلاق درج النقدية</DialogTitle>
          </DialogHeader>
          {currentDrawer && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>رصيد الافتتاح:</span>
                  <span className="font-semibold">{formatCurrency(currentDrawer.openingBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>نقد المبيعات:</span>
                  <span className="font-semibold">
                    {formatCurrency(currentDrawer.currentBalance - currentDrawer.openingBalance)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">المتوقع في الدرج:</span>
                  <span className="font-bold text-green-600">{formatCurrency(currentDrawer.currentBalance)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>المبلغ الفعلي الموجود في الدرج *</Label>
                <Input
                  type="number"
                  value={actualCounted}
                  onChange={(e) => setActualCounted(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="text-lg"
                />
              </div>
              {actualCounted && parseFloat(actualCounted) !== currentDrawer.currentBalance && (
                <div className="space-y-2">
                  <Label>سبب الفارق (مطلوب)</Label>
                  <Input
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    placeholder="مثال: خطأ في العد، نقص نقد..."
                  />
                  <div className="text-sm text-red-600">
                    الفارق: {formatCurrency(parseFloat(actualCounted) - currentDrawer.currentBalance)}
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowCloseDrawerDialog(false);
                  setActualCounted('');
                  setDiscrepancyReason('');
                }}>
                  إلغاء
                </Button>
                <Button onClick={() => {
                  const counted = parseFloat(actualCounted);
                  if (!counted || counted < 0) {
                    toast.error('يرجى إدخال المبلغ الفعلي');
                    return;
                  }
                  const discrepancy = counted - currentDrawer.currentBalance;
                  if (discrepancy !== 0 && !discrepancyReason.trim()) {
                    toast.error('يرجى إدخال سبب الفارق');
                    return;
                  }
                  const result = closeDrawer(
                    currentDrawer.posId,
                    counted,
                    currentUser?.id || 'unknown',
                    currentUser?.name || 'غير محدد',
                    discrepancy !== 0 ? discrepancyReason : undefined
                  );
                  if (result.success) {
                    toast.success('تم إغلاق الدرج بنجاح');
                    const updatedDrawer = getDrawer(currentDrawer.posId);
                    setCurrentDrawer(updatedDrawer);
                    setShowCloseDrawerDialog(false);
                    setActualCounted('');
                    setDiscrepancyReason('');
                  } else {
                    toast.error(result.error || 'فشل إغلاق الدرج');
                  }
                }}>
                  <LockIcon className="w-4 h-4 ml-2" />
                  إغلاق الدرج
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
// import { Badge } from './ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Search, FileText, Users, Package, Download, Printer } from 'lucide-react';

// interface Product {
//   id: string;
//   name: string;
//   price: number;
// }

// interface QuotationItem {
//   id: string;
//   name: string;
//   quantity: number;
//   price: number;
// }

// interface Quotation {
//   id: string;
//   customerName: string;
//   date: string;
//   total: number;
//   status: 'مسودة' | 'مرسل';
// }

// export function Quotations() {
//   const [customerName, setCustomerName] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [items, setItems] = useState<QuotationItem[]>([]);
//   const [quotations, setQuotations] = useState<Quotation[]>([]);

//   const products: Product[] = [
//     { id: '1', name: 'كمبيوتر محمول HP', price: 3000 },
//     { id: '2', name: 'طابعة Canon', price: 2000 },
//     { id: '3', name: 'شاشة Samsung 27\"', price: 1500 },
//     { id: '4', name: 'لوحة مفاتيح Logitech', price: 300 },
//     { id: '5', name: 'ماوس Logitech', price: 150 },
//   ];

//   const filteredProducts = products.filter(p =>
//     p.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const taxRate = 0.15;
//   const tax = subtotal * taxRate;
//   const total = subtotal + tax;

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('ar-SA', {
//       style: 'currency',
//       currency: 'SAR'
//     }).format(amount);
//   };

//   const addProductToQuotation = (product: Product) => {
//     const existing = items.find(i => i.id === product.id);
//     if (existing) {
//       setItems(items.map(i =>
//         i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
//       ));
//     } else {
//       setItems([...items, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
//     }
//   };


//     if (items.length === 0) {
//       return;
//     }

//     const id = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
//     const today = new Date().toISOString().split('T')[0];

//     const q: Quotation = {
//       id,
//       customerName: customerName.trim(),
//       date: today,
//       total,
//       status: 'مسودة'
//     };

//     setQuotations([q, ...quotations]);
//     setItems([]);
//     setCustomerName('');
//   };

//   return (
//     <div className="space-y-6" dir="rtl">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="text-right flex-1">
//           <h1>عروض الأسعار</h1>
//           <p className="text-gray-600">إنشاء وعرض عروض أسعار للعملاء بدون تنفيذ عملية بيع</p>
//         </div>
//       </div>

//       <Tabs defaultValue="create" className="space-y-6" dir="rtl">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="create">إنشاء عرض سعر</TabsTrigger>
//           <TabsTrigger value="list">قائمة عروض الأسعار</TabsTrigger>
//         </TabsList>

//         <TabsContent value="create" className="space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Customer & Items */}
//             <div className="lg:col-span-2 space-y-4">
//               {/* Customer Info */}
//               <Card>
//                 <CardHeader className="text-right">
//                   <CardTitle>بيانات العميل</CardTitle>
//                   <CardDescription>أدخل اسم العميل الذي طلب عرض السعر</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     <Label>اسم العميل</Label>
//                     <Input
//                       placeholder="مثال: شركة النجاح التقنية"
//                       value={customerName}
//                       onChange={(e) => setCustomerName(e.target.value)}
//                     />
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Product Search */}
//               <Card>
//                 <CardHeader className="text-right">
//                   <CardTitle>المنتجات</CardTitle>
//                   <CardDescription>أضف المنتجات إلى عرض السعر</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                       <Input
//                         placeholder="بحث عن منتج..."
//                         className="pl-10 text-right"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                       {filteredProducts.map((product) => (
//                         <Card
//                           key={product.id}
//                           className="cursor-pointer hover:shadow-md transition-shadow"
//                           onClick={() => addProductToQuotation(product)}
//                         >
//                           <CardContent className="p-4">
//                             <div className="aspect-square bg-gray-100 rounded-lg.mb-3 flex items-center justify-center">
//                               <Package className="w-8 h-8 text-gray-400" />
//                             </div>
//                             <h4 className="text-sm mb-2 text-right">{product.name}</h4>
//                             <div className="text-right text-blue-600 font-medium">
//                               {formatCurrency(product.price)}
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ))}
//                       {filteredProducts.length === 0 && (
//                         <div className="col-span-full text-center.text-gray-500 py-6">
//                           لا توجد منتجات مطابقة للبحث
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Quotation Summary */}
//             <div className="lg:col-span-1">
//               <Card className="sticky top-6">
//                 <CardHeader className="text-right">
//                   <CardTitle className="flex items-center justify-between">
//                     <span>ملخص عرض السعر</span>
//                     <FileText className="w-5 h-5" />
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {items.length === 0 ? (
//                     <div className="text-center text-gray-500 py-10">
//                       <FileText className="w-10 h-10 mx-auto mb-3.opacity-40" />
//                       <p>لم تقم بإضافة أي منتجات بعد</p>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="border rounded-lg.max-h-52 overflow-auto">
//                         <Table>
//                           <TableHeader>
//                             <TableRow>
//                               <TableHead className="text-right">الصنف</TableHead>
//                               <TableHead className="text-right">الكمية</TableHead>
//                               <TableHead className="text-right">السعر</TableHead>
//                               <TableHead className="text-right">الإجمالي</TableHead>
//                             </TableRow>
//                           </TableHeader>
//                           <TableBody>
//                             {items.map((item) => (
//                               <TableRow key={item.id}>
//                                 <TableCell className="text-right">{item.name}</TableCell>
//                                 <TableCell className="text-right">{item.quantity}</TableCell>
//                                 <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
//                                 <TableCell className="text-right">
//                                   {formatCurrency(item.price * item.quantity)}
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </div>

//                       <div className="space-y-2 text-sm">
//                         <div className="flex justify-between">
//                           <span>المجموع الفرعي:</span>
//                           <span>{formatCurrency(subtotal)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>الضريبة (15%):</span>
//                           <span>{formatCurrency(tax)}</span>
//                         </div>
//                         <div className="border-t pt-2 flex justify-between font-semibold">
//                           <span>الإجمالي:</span>
//                           <span className="text-blue-600">{formatCurrency(total)}</span>
//                         </div>
//                       </div>

                
//                       </div>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="list" className="space-y-6">
//           <Card>
//             <CardHeader className="text-right">
//               <CardTitle>قائمة عروض الأسعار</CardTitle>
//               <CardDescription>أحدث عروض الأسعار التي تم إنشاؤها</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {quotations.length === 0 ? (
//                 <div className="text-center text-gray-500 py-6">
//                   <Users className="w-10 h-10 mx-auto mb-3.opacity-40" />
//                   <p>لا توجد عروض أسعار مسجلة حتى الآن</p>
//                 </div>
//               ) : (
//                 <div dir="rtl">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="text-right">رقم العرض</TableHead>
//                         <TableHead className="text-right">العميل</TableHead>
//                         <TableHead className="text-right">التاريخ</TableHead>
//                         <TableHead className="text-right">الإجمالي</TableHead>
//                         <TableHead className="text-right">الحالة</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {quotations.map((q) => (
//                         <TableRow key={q.id}>
//                           <TableCell className="text-right">{q.id}</TableCell>
//                           <TableCell className="text-right">{q.customerName}</TableCell>
//                           <TableCell className="text-right">{q.date}</TableCell>
//                           <TableCell className="text-right">{formatCurrency(q.total)}</TableCell>
//                           <TableCell className="text-right">
//                             <Badge variant="outline">{q.status}</Badge>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }


