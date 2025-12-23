import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Search, ShoppingCart, CreditCard, Banknote, X, Plus, Minus, Trash2, Package, ArrowRight, AlertTriangle, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { useUser } from '../contexts/UserContext';
import { SearchableSelect } from './ui/searchable-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { loadBanks } from '../data/banks';
import CustomDatePicker from './CustomDatePicker';
import { useLanguage } from '../contexts/LanguageContext';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    barcode?: string;
    costPrice?: number;
    expiryDate?: string; // تاريخ انتهاء الصلاحية
}

interface CreatePurchaseOrderProps {
    suppliers: Array<{
        id: string;
        name: string;
        contact: string;
        phone: string;
        email: string;
        totalPurchases: number;
        rating: number;
        accountNumber?: string;
    }>;
    products: Array<{
        id: string;
        name: string;
        price: number;
        costPrice: number;
        barcode: string;
        category: string;
        stock: number;
    }>;
    onBack: () => void;
    onSave: (order: any) => void;
}

export function CreatePurchaseOrder({ suppliers, products, onBack, onSave }: CreatePurchaseOrderProps) {
    const { t, direction } = useLanguage();
    const { isAdmin, currentUser } = useUser();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('1');
    const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [notes, setNotes] = useState('');
    const [showExpiryDialog, setShowExpiryDialog] = useState(false);
    const [pendingProduct, setPendingProduct] = useState<typeof products[0] | null>(null);
    const [expiryDate, setExpiryDate] = useState('');

    // قائمة المستودعات
    const warehouses = useMemo(() => [
        { id: '1', name: t('purchases.mainWarehouse') },
        { id: '2', name: t('purchases.northBranchWarehouse') },
        { id: '3', name: t('purchases.southBranchWarehouse') }
    ], [t]);

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

    // Mixed payment breakdown state
    const [paymentBreakdown, setPaymentBreakdown] = useState<{
        cash: number;
        credit: number;
        bankWithdrawal: number;
    }>({
        cash: 0,
        credit: 0,
        bankWithdrawal: 0
    });

    // Bank selection for bank withdrawal
    const [selectedBankId, setSelectedBankId] = useState<string>('');
    const [banks, setBanks] = useState<Array<{ id: string; name: string; balance: number }>>([]);

    // Load banks on mount
    useEffect(() => {
        const loadedBanks = loadBanks();
        const banksArray = Object.values(loadedBanks);
        setBanks(banksArray);
        if (banksArray.length > 0) {
            setSelectedBankId(banksArray[0].id);
        }
    }, []);

    const selectedSupplier = useMemo(
        () => suppliers.find(s => s.id === selectedSupplierId),
        [suppliers, selectedSupplierId]
    );

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.15;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Calculate payment breakdown total
    const paymentTotal = paymentBreakdown.cash + paymentBreakdown.credit + paymentBreakdown.bankWithdrawal;
    const paymentRemaining = total - paymentTotal;

    // Filter products by search term (name or barcode)
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;
        const searchLower = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.barcode.includes(searchTerm)
        );
    }, [products, searchTerm]);

    // Add product to cart
    const addProductToCart = (product: typeof products[0], expiry?: string) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1, expiryDate: expiry || item.expiryDate }
                    : item
            ));
        } else {
            setCart([...cart, {
                id: product.id,
                name: product.name,
                price: product.costPrice || product.price,
                quantity: 1,
                barcode: product.barcode,
                costPrice: product.costPrice,
                expiryDate: expiry
            }]);
        }
    };

    const handleProductClick = (product: typeof products[0]) => {
        setPendingProduct(product);
        setShowExpiryDialog(true);
        setExpiryDate('');
    };

    const confirmAddProduct = () => {
        if (pendingProduct) {
            addProductToCart(pendingProduct, expiryDate || undefined);
            setShowExpiryDialog(false);
            setPendingProduct(null);
            setExpiryDate('');
            toast.success(t('purchases.createOrder.productAdded').replace('{name}', pendingProduct.name));
        }
    };

    const updateQuantity = (id: string, change: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQuantity = item.quantity + change;
                if (newQuantity <= 0) return item;
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
        setPaymentBreakdown({ cash: 0, credit: 0, bankWithdrawal: 0 });
    };

    // Update payment breakdown
    const updatePaymentBreakdown = (field: 'cash' | 'credit' | 'bankWithdrawal', value: number) => {
        const newBreakdown = { ...paymentBreakdown, [field]: Math.max(0, value) };
        setPaymentBreakdown(newBreakdown);
    };

    // Auto-fill remaining amount
    const fillRemaining = (method: 'cash' | 'credit' | 'bankWithdrawal') => {
        if (paymentRemaining > 0) {
            updatePaymentBreakdown(method, paymentBreakdown[method] + paymentRemaining);
        }
    };

    // Handle search by barcode on Enter key press
    const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            e.preventDefault();

            const searchValue = searchTerm.trim();
            const productByBarcode = products.find(product =>
                product.barcode === searchValue
            );

            if (productByBarcode) {
                handleProductClick(productByBarcode);
                setSearchTerm('');
            } else {
                toast.error(t('purchases.createOrder.productNotFound'));
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(amount);
    };

    const handleSaveOrder = () => {
        if (!selectedSupplier) {
            toast.error(t('purchases.createOrder.selectSupplierError'));
            return;
        }

        if (cart.length === 0) {
            toast.error(t('purchases.createOrder.cartEmptyError'));
            return;
        }

        // Validate payment breakdown matches total
        if (Math.abs(paymentTotal - total) > 0.01) {
            toast.error(t('purchases.createOrder.amountMismatch')
                .replace('{entered}', formatCurrency(paymentTotal))
                .replace('{total}', formatCurrency(total)));
            return;
        }

        // Validate bank selection if bank withdrawal is used
        if (paymentBreakdown.bankWithdrawal > 0 && !selectedBankId) {
            toast.error(t('purchases.createOrder.selectBankError'));
            return;
        }

        const order = {
            supplierId: selectedSupplierId,
            supplierName: selectedSupplier.name,
            date: purchaseDate ? purchaseDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dueDate: dueDate ? dueDate.toISOString().split('T')[0] : (purchaseDate ? purchaseDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
            items: cart,
            subtotal,
            tax,
            total,
            paymentBreakdown: {
                ...paymentBreakdown,
                selectedBankId: paymentBreakdown.bankWithdrawal > 0 ? selectedBankId : undefined
            },
            warehouse: selectedWarehouse,
            notes
        };

        onSave(order);
        toast.success(t('purchases.createOrder.orderCreated'));
        onBack();
    };

    return (
        <div className="space-y-6" dir={direction}>
            {/* Header */}
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <Button variant="ghost" onClick={onBack} className="gap-2">
                        {direction === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 rotate-180" />}
                        {t('purchases.createOrder.back')}
                    </Button>
                    <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        <h1>{t('purchases.createOrder.title')}</h1>
                        <p className="text-gray-600">{t('purchases.createOrder.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Supplier Info Section */}
            <Card>
                <CardContent className="pt-6" dir={direction}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>{t('purchases.createOrder.supplierRequired')}</Label>
                            <SearchableSelect
                                options={suppliers.map(s => ({
                                    id: s.id,
                                    name: s.name,
                                    accountNumber: s.accountNumber || `SUP-${s.id.padStart(3, '0')}`,
                                    phone: s.phone,
                                    contact: s.contact,
                                    email: s.email
                                }))}
                                value={selectedSupplierId}
                                onValueChange={setSelectedSupplierId}
                                placeholder={t('purchases.createOrder.supplierPlaceholder')}
                                searchPlaceholder={t('purchases.createOrder.supplierSearchPlaceholder')}
                                emptyMessage={t('purchases.createOrder.noSuppliers')}
                                displayKey="name"
                                searchKeys={['name', 'accountNumber', 'phone', 'contact']}
                                dir={direction}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('purchases.warehouse')}</Label>
                            <Select
                                value={selectedWarehouse}
                                onValueChange={setSelectedWarehouse}
                                disabled={!isAdmin() && availableWarehouses.length === 1}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent dir={direction}>
                                    {availableWarehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <CustomDatePicker
                                label={t('purchases.createOrder.purchaseDate')}
                                date={purchaseDate}
                                onChange={(date) => setPurchaseDate(date)}
                                placeholder={t('purchases.createOrder.purchaseDatePlaceholder')}
                            />
                        </div>
                    </div>
                    {selectedSupplier && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                                    <p className="font-semibold">{selectedSupplier.name}</p>
                                    <p className="text-sm text-gray-600">{t('purchases.createOrder.phone')}: {selectedSupplier.phone}</p>
                                </div>
                                <Badge variant="outline">{t('purchases.createOrder.supplier')}</Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Products Section */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search */}
                    <Card>
                        <CardContent className="pt-6" dir={direction}>
                            <div className="relative">
                                <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                                <Input
                                    placeholder={t('purchases.createOrder.searchPlaceholder')}
                                    className={direction === 'rtl' ? 'pr-10' : 'pl-10'}
                                    dir={direction}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearchEnter}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                 {filteredProducts.map((product) => (
                   <Card
                     key={product.id}
                     className="cursor-pointer hover:shadow-md transition-shadow aspect-square flex flex-col"
                     onClick={() => handleProductClick(product)}
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
                     <p>{t('purchases.createOrder.noProducts')}</p>
                   </div>
                 )}
               </div>
                </div>

                {/* Cart Section */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6" dir={direction}>
                        <CardHeader dir={direction}>
                            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                <CardTitle className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                    <ShoppingCart className="w-5 h-5" />
                                    {t('purchases.createOrder.cart')}
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
                        <CardContent className="space-y-4" dir={direction}>
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('purchases.createOrder.cartEmpty')}</p>
                                    <p className="text-sm mt-2">{t('purchases.createOrder.cartEmptySubtext')}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <ScrollArea className="h-64">
                                        <div className="space-y-3">
                                            {cart.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <Package className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                                        <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                                                        {item.expiryDate && (
                                                            <p className="text-xs text-gray-500 mt-1">{t('purchases.createOrder.expiryDate')}: {new Date(item.expiryDate).toLocaleDateString(direction === 'rtl' ? 'ar-SA' : 'en-US')}</p>
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
                                        <div className={`flex justify-between text-sm ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                            <span>{t('purchases.createOrder.subtotal')}:</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className={`flex justify-between text-sm ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                            <span>{t('purchases.createOrder.tax')}:</span>
                                            <span>{formatCurrency(tax)}</span>
                                        </div>
                                        <Separator />
                                        <div className={`flex justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                            <span>{t('purchases.createOrder.total')}:</span>
                                            <span className="text-xl text-blue-600">{formatCurrency(total)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Mixed Payment Methods */}
                                    <div className="space-y-3">
                                        <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                            <label className="text-sm font-semibold">{t('purchases.createOrder.mixedPaymentMethods')}</label>
                                        </div>

                                        {/* Cash Payment */}
                                        <div className="space-y-2">
                                            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                <label className={`text-sm flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                    <Banknote className="w-4 h-4 text-green-600" />
                                                    {t('purchases.createOrder.cash')}
                                                </label>
                                                {paymentRemaining > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs"
                                                        onClick={() => fillRemaining('cash')}
                                                    >
                                                        {t('purchases.createOrder.fillRemaining')}
                                                    </Button>
                                                )}
                                            </div>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={paymentBreakdown.cash > 0 ? paymentBreakdown.cash : ''}
                                                onChange={(e) => updatePaymentBreakdown('cash', parseFloat(e.target.value) || 0)}
                                                className={direction === 'rtl' ? 'text-right' : 'text-left'}
                                                dir="ltr"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        {/* Credit Payment */}
                                        <div className="space-y-2">
                                            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                <label className={`text-sm flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                                    {t('purchases.createOrder.credit')}
                                                </label>
                                                {paymentRemaining > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs"
                                                        onClick={() => fillRemaining('credit')}
                                                    >
                                                        {t('purchases.createOrder.fillRemaining')}
                                                    </Button>
                                                )}
                                            </div>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={paymentBreakdown.credit > 0 ? paymentBreakdown.credit : ''}
                                                onChange={(e) => updatePaymentBreakdown('credit', parseFloat(e.target.value) || 0)}
                                                className={direction === 'rtl' ? 'text-right' : 'text-left'}
                                                dir="ltr"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        {/* Bank Withdrawal Payment */}
                                        <div className="space-y-2">
                                            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                <label className={`text-sm flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                    <Wallet className="w-4 h-4 text-purple-600" />
                                                    {t('purchases.createOrder.bankWithdrawal')}
                                                </label>
                                                {paymentRemaining > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs"
                                                        onClick={() => fillRemaining('bankWithdrawal')}
                                                    >
                                                        {t('purchases.createOrder.fillRemaining')}
                                                    </Button>
                                                )}
                                            </div>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={paymentBreakdown.bankWithdrawal > 0 ? paymentBreakdown.bankWithdrawal : ''}
                                                onChange={(e) => updatePaymentBreakdown('bankWithdrawal', parseFloat(e.target.value) || 0)}
                                                className={`${direction === 'rtl' ? 'text-right' : 'text-left'} mb-2`}
                                                dir="ltr"
                                                min="0"
                                                step="0.01"
                                            />
                                            {paymentBreakdown.bankWithdrawal > 0 && (
                                                <Select
                                                    value={selectedBankId}
                                                    onValueChange={setSelectedBankId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('purchases.createOrder.selectBank')} />
                                                    </SelectTrigger>
                                                    <SelectContent dir={direction}>
                                                        {banks.map((bank) => (
                                                            <SelectItem key={bank.id} value={bank.id}>
                                                                {bank.name} - {t('purchases.createOrder.bankBalance')}: {formatCurrency(bank.balance)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>

                                        {/* Payment Summary */}
                                        <div className="space-y-2 rounded-lg border p-3 bg-gray-50 text-sm">
                                            <div className={`flex justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                <span>{t('purchases.createOrder.enteredAmount')}:</span>
                                                <span className={Math.abs(paymentTotal - total) < 0.01 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                                    {formatCurrency(paymentTotal)}
                                                </span>
                                            </div>
                                            <div className={`flex justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                <span>{t('purchases.createOrder.requiredTotal')}:</span>
                                                <span className="font-semibold">{formatCurrency(total)}</span>
                                            </div>
                                            <Separator />
                                            <div className={`flex justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                <span>{t('purchases.createOrder.remaining')}:</span>
                                                <span className={paymentRemaining > 0 ? 'text-orange-600 font-semibold' : paymentRemaining < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                                                    {formatCurrency(Math.abs(paymentRemaining))} {paymentRemaining > 0 ? `(${t('purchases.createOrder.minus')})` : paymentRemaining < 0 ? `(${t('purchases.createOrder.plus')})` : `(${t('purchases.createOrder.complete')})`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Fields */}
                                    <div className="space-y-2">
                                        <CustomDatePicker
                                            label={t('purchases.createOrder.dueDate')}
                                            date={dueDate}
                                            onChange={setDueDate}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t('purchases.createOrder.notes')}</Label>
                                        <Input placeholder={t('purchases.createOrder.notesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} dir={direction} />
                                    </div>

                                    {/* Save Button */}
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleSaveOrder}
                                        disabled={!selectedSupplier || cart.length === 0}
                                    >
                                        <ShoppingCart className={`w-5 h-5 ${direction === 'rtl' ? 'mr-2' : 'ml-2'}`} />
                                        {t('purchases.createOrder.saveOrder')}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Expiry Date Dialog */}
            <Dialog open={showExpiryDialog} onOpenChange={setShowExpiryDialog}>
                <DialogContent dir={direction}>
                    <DialogHeader dir={direction}>
                        <DialogTitle>{t('purchases.createOrder.addToCart')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4" dir={direction}>
                        {pendingProduct && (
                            <>
                                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                                    <p className="text-sm font-medium">{t('purchases.createOrder.product')}: {pendingProduct.name}</p>
                                    <p className="text-xs text-gray-500">{t('purchases.createOrder.price')}: {formatCurrency(pendingProduct.costPrice || pendingProduct.price)}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('purchases.createOrder.expiryDateOptional')}</Label>
                                    <Input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        placeholder={t('purchases.createOrder.expiryDatePlaceholder')}
                                        dir="ltr"
                                    />
                                    <p className="text-xs text-gray-500">{t('purchases.createOrder.expiryDateHint')}</p>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter dir={direction} className={direction === 'rtl' ? 'flex-row-reverse' : ''}>
                        <Button variant="outline" onClick={() => {
                            setShowExpiryDialog(false);
                            setPendingProduct(null);
                            setExpiryDate('');
                        }}>
                            {t('purchases.createOrder.cancel')}
                        </Button>
                        <Button onClick={confirmAddProduct}>
                            {t('purchases.createOrder.addToCartButton')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

