
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
import { Search, ShoppingCart, CreditCard, Banknote, X, Plus, Minus, Trash2, Package, Briefcase, AlertTriangle, RotateCcw, User, Wallet, Lock as LockIcon, ChevronsUpDown, Edit2, Check, Printer, Download } from 'lucide-react';
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
interface OpeningItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
}

export function OpeningInventory({
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
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());  const [systemType, setSystemType] = useState<'restaurant' | 'retail'>('retail');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState<string>('');
  const [priceModificationIncludesTax, setPriceModificationIncludesTax] = useState(true);

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
  const [items, setItems] = useState<OpeningItem[]>([]);
  const [openingDate, setOpeningDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
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

  // Mixed payment breakdown state
  const [paymentBreakdown, setPaymentBreakdown] = useState<{ cash: number; card: number; credit: number; selectedBankId?: string }>({
    cash: 0,
    card: 0,
    credit: 0
  });

  // Bank selection for card payments
  const [banks, setBanks] = useState<Array<{ id: string; name: string; balance: number }>>([]);
  const [showCardPaymentDialog, setShowCardPaymentDialog] = useState(false);
  const [cardPaymentAmount, setCardPaymentAmount] = useState(0);
  const [cardPaymentStatus, setCardPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // Load banks on mount
  useEffect(() => {
    const loadedBanks = loadBanks();
    const banksArray = Object.values(loadedBanks);
    setBanks(banksArray);
    if (banksArray.length > 0 && !paymentBreakdown.selectedBankId) {
      setPaymentBreakdown(prev => ({ ...prev, selectedBankId: banksArray[0].id }));
    }
  }, []);

  // Load default payment preferences from localStorage
  const loadDefaultPaymentPreferences = (): { cash: number; card: number; credit: number; selectedBankId?: string } => {
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
  const saveDefaultPaymentPreferences = (preferences: { cash: number; card: number; credit: number; selectedBankId?: string }) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pos_payment_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving payment preferences:', error);
    }
  };

  const products = [
    { id: '1', name: 'كمبيوتر محمول HP', price: 3000, costPrice: 2500, barcode: '1234567890', category: 'إلكترونيات', stock: 15, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '2', name: 'طابعة Canon', price: 2000, costPrice: 1500, barcode: '1234567891', category: 'إلكترونيات', stock: 8, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '3', name: 'شاشة Samsung 27"', price: 1500, costPrice: 1000, barcode: '1234567892', category: 'إلكترونيات', stock: 12, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '4', name: 'لوحة مفاتيح Logitech', price: 300, costPrice: 200, barcode: '1234567893', category: 'ملحقات', stock: 25, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '5', name: 'ماوس Logitech', price: 150, costPrice: 100, barcode: '1234567894', category: 'ملحقات', stock: 30, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '6', name: 'كاميرا ويب HD', price: 500, costPrice: 350, barcode: '1234567895', category: 'ملحقات', stock: 10, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined }
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

    // Check min quantity
    if (product.minQuantity && product.minQuantity > 1) {
      toast.error(`الحد الأدنى للكمية: ${product.minQuantity}`);
      return;
    }
    //test

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
      setPaymentBreakdown({ cash: 0, card: 0, credit: 0, selectedBankId: banks.length > 0 ? banks[0].id : undefined });
    }
  }, [cart.length, banks]);

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
            credit: (preferences.credit / prefTotal) * total,
            selectedBankId: paymentBreakdown.selectedBankId || (banks.length > 0 ? banks[0].id : undefined)
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



      // Generate invoice number
      const invoiceNumber = `OPEN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

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
    toast.success(`تمت عملية المخزون أول المدة بنجاح - ${invoiceNumber}`);
    clearCart();
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

  // Item type selector for non-restaurant mode
  const [itemType, setItemType] = useState<'product' | 'service' | 'return'>('product');
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);

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
      status: 'ممتاز',
      accountNumber: `ACC-${id.slice(-6)}`
    };
    setCreditCustomers(prev => [...prev, newCustomer]);
    setSelectedCustomerId(id);
    setIsAddCustomerDialogOpen(false);
    setNewCustomerData({ name: '', phone: '', address: '' });
    toast.success('تم إضافة العميل بسرعة');
  };
  
  const handlePrint = () => {
    if (items.length === 0) {
        alert('لا توجد أصناف للطباعة');
      return;
    }
  }
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
          toast.success(`تم حفظ مخزون أول المدة بنجاح - ${entryNumber}`);
        }; 

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>مخزون أول المدة</h1>
            <p className="text-gray-600">نظام المخزون الأولي</p>
          </div>
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
         <CardContent className="pt-6">
           <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
             <div className="flex-1 w-full md:w-auto">
               {/* Pass the label and date logic to the custom component */}
               <CustomDatePicker
                  label="اختر تاريخ الفاتورة"
                  date={invoiceDate}
                  onChange={setInvoiceDate}
                  placeholder="اختر تاريخ المخزون"
                   />
             </div>
           </div>
         </CardContent>
       </Card>
        )}
      </div>

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

                            // Deduct from drawer if cash refund
                            if (returnPaymentMethod === 'cash' && currentDrawer) {
                              const success = deductFromDrawer(
                                currentDrawer.posId,
                                returnTotal,
                                'return',
                                currentUser?.id || 'unknown',
                                currentUser?.name || 'غير محدد',
                                `مرتجع نقدي - ${returnNumber}`,
                                returnNumber
                              );
                              if (!success) {
                                toast.error('رصيد الدرج غير كافي');
                                return;
                              }
                              // Refresh drawer state
                              const updatedDrawer = getDrawer(currentDrawer.posId);
                              setCurrentDrawer(updatedDrawer);
                            } else if (returnPaymentMethod === 'cash') {
                              // Fallback to main safe if no drawer
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
                        ملاحظة: يمكن استخدام هذه الواجهة مرة واحدة عند بداية استخدام النظام، ولا تنشئ فواتير مشتريات.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button variant="outline" className="gap-2" onClick={handlePrint}>
                          <Printer className="w-4 h-4" />
                          طباعة
                        </Button>
                        <Button className="gap-2" onClick={handleSaveOpeningInventory}>
                          <Download className="w-4 h-4" />
                          حفظ مخزون أول المدة
                        </Button>
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
                          <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={paymentBreakdown.card > 0 ? paymentBreakdown.card : ''}
                              onChange={(e) => {
                                const amount = parseFloat(e.target.value) || 0;
                                updatePaymentBreakdown('card', amount);
                                if (amount > 0) {
                                  setCardPaymentAmount(amount);
                                }
                              }}
                              className="text-right flex-1"
                            min="0"
                            step="0.01"
                          />
                            {paymentBreakdown.card > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCardPaymentAmount(paymentBreakdown.card);
                                  setShowCardPaymentDialog(true);
                                  setCardPaymentStatus('idle');
                                }}
                                className="gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                محاكاة الدفع
                              </Button>
                            )}
                          </div>
                          {paymentBreakdown.card > 0 && banks.length > 0 && (
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600">اختر البنك</Label>
                              <Select
                                value={paymentBreakdown.selectedBankId || banks[0].id}
                                onValueChange={(bankId) => {
                                  setPaymentBreakdown(prev => ({ ...prev, selectedBankId: bankId }));
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {banks.map((bank) => (
                                    <SelectItem key={bank.id} value={bank.id}>
                                      {bank.name} - الرصيد: {formatCurrency(bank.balance)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
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
        </div>
      )}

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

