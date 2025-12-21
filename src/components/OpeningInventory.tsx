import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Search, X, Plus, Minus, Trash2, Package, User, ChevronsUpDown, Edit2, Check, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { getStock, initializeInventoryItem } from '../data/inventory';
import { useUser } from '../contexts/UserContext';
import { addJournalEntry, createOpeningInventoryEntry } from '../data/journalEntries';
import { useLanguage } from '../contexts/LanguageContext';

interface OpeningItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR'
  }).format(amount);
};

export function OpeningInventory() {
  const { currentUser, isAdmin } = useUser();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('1');
  const [systemType, setSystemType] = useState<'restaurant' | 'retail'>('retail');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState<string>('');
  const [items, setItems] = useState<OpeningItem[]>([]);
  const [openingDate, setOpeningDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);

  // Warehouses list
  const warehouses = useMemo(() => [
    { id: '1', name: t('openingInventory.warehouses.main') },
    { id: '2', name: t('openingInventory.warehouses.north') },
    { id: '3', name: t('openingInventory.warehouses.south') }
  ], [t]);

  // Filter warehouses based on permissions
  const availableWarehouses = useMemo(() => {
    if (isAdmin()) {
      return warehouses;
    }
    if (currentUser?.assignedWarehouseId) {
      return warehouses.filter(w => w.id === currentUser.assignedWarehouseId);
    }
    return [];
  }, [isAdmin, currentUser?.assignedWarehouseId, warehouses]);

  // Set default warehouse for employee
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
    window.addEventListener('systemTypeChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('systemTypeChanged', handleStorageChange);
    };
  }, []);

  // Products list
  const products = useMemo(() => [
    { id: '1', name: 'كمبيوتر محمول HP', price: 3000, costPrice: 2500, barcode: '1234567890', category: 'إلكترونيات', stock: 15, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '2', name: 'طابعة Canon', price: 2000, costPrice: 1500, barcode: '1234567891', category: 'إلكترونيات', stock: 8, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '3', name: 'شاشة Samsung 27"', price: 1500, costPrice: 1000, barcode: '1234567892', category: 'إلكترونيات', stock: 12, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '4', name: 'لوحة مفاتيح Logitech', price: 300, costPrice: 200, barcode: '1234567893', category: 'ملحقات', stock: 25, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '5', name: 'ماوس Logitech', price: 150, costPrice: 100, barcode: '1234567894', category: 'ملحقات', stock: 30, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined },
    { id: '6', name: 'كاميرا ويب HD', price: 500, costPrice: 350, barcode: '1234567895', category: 'ملحقات', stock: 10, pricingTiers: undefined, minQuantity: 1, maxQuantity: undefined }
  ], []);

  // Filtered products with stock info
  const filteredProducts = useMemo(() => {
    return products
      .map(product => ({
        ...product,
        stock: getStock(product.id, selectedWarehouse)
      }))
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm)
      );
  }, [products, selectedWarehouse, searchTerm]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
  }, [items]);

  // Calculate total quantity
  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Calculate average cost price
  const averageCostPrice = useMemo(() => {
    return totalQuantity > 0 ? totalAmount / totalQuantity : 0;
  }, [totalAmount, totalQuantity]);

  // Add product to cart
  const addProductToCart = useCallback((product: typeof products[0]) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        costPrice: product.costPrice || product.price
      }];
    });
    toast.success(t('openingInventory.messages.added').replace('{name}', product.name));
  }, [products, t]);

  // Update quantity
  const updateQuantity = useCallback((productId: string, change: number) => {
    setItems(prevItems =>
      prevItems
        .map(item => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + change;
            return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is OpeningItem => item !== null)
    );
  }, []);

  // Start editing quantity
  const startEditingQuantity = useCallback((item: OpeningItem) => {
    setEditingQuantityId(item.productId);
    setEditingQuantityValue(item.quantity.toString());
  }, []);

  // Save quantity edit
  const saveQuantityEdit = useCallback((productId: string) => {
    const quantityValue = parseInt(editingQuantityValue);
    if (isNaN(quantityValue) || quantityValue < 1) {
      toast.error(t('openingInventory.messages.invalidQuantity'));
      return;
    }
    setItems(prevItems =>
      prevItems.map(i =>
        i.productId === productId ? { ...i, quantity: quantityValue } : i
      )
    );
    setEditingQuantityId(null);
    setEditingQuantityValue('');
  }, [editingQuantityValue, t]);

  // Cancel quantity edit
  const cancelQuantityEdit = useCallback(() => {
    setEditingQuantityId(null);
    setEditingQuantityValue('');
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  }, []);

  // Start editing price
  const startEditingPrice = useCallback((item: OpeningItem) => {
    setEditingPriceId(item.productId);
    setEditingPriceValue(item.costPrice.toString());
  }, []);

  // Save price edit
  const savePriceEdit = useCallback((productId: string) => {
    const priceValue = parseFloat(editingPriceValue);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error(t('openingInventory.messages.invalidPrice'));
      return;
    }
    setItems(prevItems =>
      prevItems.map(i =>
        i.productId === productId ? { ...i, costPrice: priceValue } : i
      )
    );
    setEditingPriceId(null);
    setEditingPriceValue('');
  }, [editingPriceValue, t]);

  // Cancel price edit
  const cancelPriceEdit = useCallback(() => {
    setEditingPriceId(null);
    setEditingPriceValue('');
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Handle search by barcode on Enter key press
  const handleSearchEnter = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      const searchValue = searchTerm.trim();
      const productByBarcode = products.find(product => product.barcode === searchValue);

      if (productByBarcode) {
        const currentStock = getStock(productByBarcode.id, selectedWarehouse);
        if (currentStock <= 0) {
          toast.error('المنتج غير متوفر في المخزون');
          setSearchTerm('');
          return;
        }
        addProductToCart(productByBarcode);
        setSearchTerm('');
        toast.success(`تم إضافة ${productByBarcode.name} للمخزون`);
      } else {
        toast.error('لم يتم العثور على منتج بهذا الباركود');
      }
    }
  }, [searchTerm, products, selectedWarehouse, addProductToCart]);

  // Handle print
  const handlePrint = useCallback(() => {
    if (items.length === 0) {
      toast.error(t('openingInventory.messages.noItemsToPrint'));
      return;
    }
    // Print logic here
  }, [items.length, t]);

  // Handle save opening inventory
  const handleSaveOpeningInventory = useCallback(() => {
    if (!openingDate) {
      toast.error(t('openingInventory.messages.selectDate'));
      return;
    }
    if (items.length === 0) {
      toast.error(t('openingInventory.messages.addItems'));
      return;
    }
    if (totalAmount <= 0) {
      toast.error(t('openingInventory.messages.invalidTotal'));
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
    entry.date = openingDate;
    addJournalEntry(entry);

    setItems([]);
    toast.success(t('openingInventory.messages.saved').replace('{entryNumber}', entryNumber));
  }, [openingDate, items, totalAmount, selectedWarehouse, warehouses, t]);

  // Render product item in cart
  const renderCartItem = useCallback((item: OpeningItem) => (
    <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        <Package className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <div className="flex items-center gap-2">
          {editingPriceId === item.productId ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={editingPriceValue}
                onChange={(e) => setEditingPriceValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    savePriceEdit(item.productId);
                  } else if (e.key === 'Escape') {
                    cancelPriceEdit();
                  }
                }}
                className="h-7 w-20 text-sm"
                autoFocus
                min={0}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => savePriceEdit(item.productId)}
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
              <p className="text-sm text-gray-600">{t('openingInventory.cart.unitCost')}: {formatCurrency(item.costPrice)}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => startEditingPrice(item)}
                title={t('openingInventory.cart.editCost')}
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
          onClick={() => updateQuantity(item.productId, -1)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        {editingQuantityId === item.productId ? (
          <Input
            type="number"
            value={editingQuantityValue}
            onChange={(e) => setEditingQuantityValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveQuantityEdit(item.productId);
              } else if (e.key === 'Escape') {
                cancelQuantityEdit();
              }
            }}
            onBlur={() => saveQuantityEdit(item.productId)}
            className="h-8 w-12 text-center text-sm"
            autoFocus
            min={1}
          />
        ) : (
          <span
            className="w-8 text-center font-medium cursor-pointer hover:bg-gray-100 rounded px-1"
            onClick={() => startEditingQuantity(item)}
            title={t('openingInventory.cart.editQuantity')}
          >
            {item.quantity}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => updateQuantity(item.productId, 1)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => removeFromCart(item.productId)}
      >
        <X className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  ), [editingPriceId, editingPriceValue, editingQuantityId, editingQuantityValue, savePriceEdit, cancelPriceEdit, startEditingPrice, updateQuantity, saveQuantityEdit, cancelQuantityEdit, startEditingQuantity, removeFromCart, t]);

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
            <div className="space-y-1">
              <label className="text-sm text-gray-600">الكاشير المسؤول</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {currentUser?.name || 'غير محدد'}
                </span>
              </div>
            </div>
            {availableWarehouses.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm text-gray-600">{t('openingInventory.warehouse')}</label>
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
      </div>

      {systemType === 'restaurant' ? (
        <div className="space-y-6">
          <div className="flex lg:flex-row gap-6">
            {/* Products Section - Restaurant Mode (75% width) */}
            <div className="space-y-4 flex-shrink-0" style={{ width: '75%', maxWidth: '75%' }}>
              <Card>
                <CardContent className="pt-6">
                  <Label className="mb-2 block">بحث المنتجات</Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="بحث بالاسم أو الباركود... (اضغط Enter للبحث بالباركود)"
                      className="pr-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchEnter}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">المنتجات ({filteredProducts.length})</h3>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-shadow aspect-square flex flex-col"
                      onClick={() => addProductToCart(product)}
                    >
                      <CardContent className="p-3 flex flex-col flex-1 justify-between h-full">
                        <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg mb-2">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="flex flex-col gap-1 min-h-0">
                          <h4 className="text-xs font-medium line-clamp-2 leading-tight mb-1">{product.name}</h4>
                          <div className="flex flex-col gap-1">
                            <span className="text-blue-600 font-semibold text-xs">{formatCurrency(product.price)}</span>
                            <Badge variant="outline" className="text-xs w-fit py-0.5">
                              {product.stock}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>{t('openingInventory.noProducts')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Summary (25% width) */}
            <div className="flex-shrink-0" style={{ width: '25%', maxWidth: '25%', minWidth: '250px' }}>
              <Card className="sticky top-6 w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t('openingInventory.summary.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="flex flex-col gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">{t('openingInventory.summary.itemsCount')}</p>
                        <p className="text-lg font-bold text-blue-600">{items.length}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">{t('openingInventory.summary.totalQuantity')}</p>
                        <p className="text-lg font-bold text-green-600">{totalQuantity}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">{t('openingInventory.summary.totalValue')}</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
                      </div>
                      {items.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">{t('openingInventory.summary.averageCost')}</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {formatCurrency(averageCostPrice)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cart Section - Restaurant Mode (Full width below) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  مخزون أول المدة
                </CardTitle>
                {items.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد أصناف في المخزون</p>
                  <p className="text-sm mt-2">قم بإضافة منتجات للبدء</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {items.map(renderCartItem)}
                    </div>
                  </ScrollArea>
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
      ) : (
        <div className="flex flex-row gap-4 mb-6">
          {/* Left Column - Search and Cart (75% width) */}
          <div className="flex flex-col gap-4 mb-6" style={{ width: '75%' }}>
            {/* Search Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label className="mb-2 block">{t('openingInventory.searchProducts')}</Label>
                      <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={searchPopoverOpen}
                            className="w-full justify-between"
                          >
                            <span className="text-muted-foreground">
                              {t('openingInventory.search.placeholder')}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" dir="rtl">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder={t('openingInventory.search.placeholder')}
                              value={searchTerm}
                              onValueChange={(value) => {
                                setSearchTerm(value);
                                setSearchPopoverOpen(true);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchTerm.trim()) {
                                  e.preventDefault();
                                  const searchValue = searchTerm.trim();
                                  const productByBarcode = products.find(product =>
                                    product.barcode === searchValue
                                  );
                                  if (productByBarcode) {
                                    addProductToCart(productByBarcode);
                                    setSearchTerm('');
                                    setSearchPopoverOpen(false);
                                    toast.success(t('openingInventory.messages.added').replace('{name}', productByBarcode.name));
                                  } else {
                                    toast.error(t('openingInventory.search.notFound'));
                                  }
                                }
                              }}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>{t('openingInventory.search.noResults')}</CommandEmpty>
                              <CommandGroup>
                                {filteredProducts.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={() => {
                                      addProductToCart(product);
                                      setSearchTerm('');
                                      setSearchPopoverOpen(false);
                                      toast.success(t('openingInventory.messages.added').replace('{name}', product.name));
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

            {/* Cart Section */}
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t('openingInventory.cart.title')}
                  </CardTitle>
                  {items.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCart}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('openingInventory.cart.empty')}</p>
                    <p className="text-sm mt-2">{t('openingInventory.cart.emptySubtext')}</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {items.map(renderCartItem)}
                      </div>
                    </ScrollArea>
                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                      <p className="text-xs text-gray-500 leading-relaxed text-right md:max-w-xs">
                        {t('openingInventory.cart.note')}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button variant="outline" className="gap-2" onClick={handlePrint}>
                          <Printer className="w-4 h-4" />
                          {t('openingInventory.cart.print')}
                        </Button>
                        <Button className="gap-2" onClick={handleSaveOpeningInventory}>
                          <Download className="w-4 h-4" />
                          {t('openingInventory.cart.save')}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary Section (25% width) */}
          <div className="flex flex-col gap-6" style={{ width: '25%' }}>
            <Card className="sticky top-6 w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('openingInventory.summary.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{t('openingInventory.summary.itemsCount')}</p>
                      <p className="text-lg font-bold text-blue-600">{items.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{t('openingInventory.summary.totalQuantity')}</p>
                      <p className="text-lg font-bold text-green-600">{totalQuantity}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{t('openingInventory.summary.totalValue')}</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
                    </div>
                    {items.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">{t('openingInventory.summary.averageCost')}</p>
                        <p className="text-lg font-semibold text-gray-700">
                          {formatCurrency(averageCostPrice)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
