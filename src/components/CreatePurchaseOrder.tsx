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
    const { isAdmin, currentUser } = useUser();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('1');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [showExpiryDialog, setShowExpiryDialog] = useState(false);
    const [pendingProduct, setPendingProduct] = useState<typeof products[0] | null>(null);
    const [expiryDate, setExpiryDate] = useState('');

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
            toast.success(`تم إضافة ${pendingProduct.name} للسلة`);
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
                toast.error('لم يتم العثور على منتج بهذا الباركود');
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
            toast.error('يرجى اختيار المورد');
            return;
        }

        if (cart.length === 0) {
            toast.error('السلة فارغة');
            return;
        }

        // Validate payment breakdown matches total
        if (Math.abs(paymentTotal - total) > 0.01) {
            toast.error(`المبلغ المدخل (${formatCurrency(paymentTotal)}) لا يساوي الإجمالي (${formatCurrency(total)})`);
            return;
        }

        // Validate bank selection if bank withdrawal is used
        if (paymentBreakdown.bankWithdrawal > 0 && !selectedBankId) {
            toast.error('يرجى اختيار البنك للصرف');
            return;
        }

        const order = {
            supplierId: selectedSupplierId,
            supplierName: selectedSupplier.name,
            date: purchaseDate,
            dueDate: dueDate || purchaseDate,
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
        toast.success('تم إنشاء طلب الشراء بنجاح');
        onBack();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack} className="gap-2">
                        <ArrowRight className="w-4 h-4" />
                        رجوع
                    </Button>
                    <div>
                        <h1>إنشاء طلب شراء جديد</h1>
                        <p className="text-gray-600">إضافة منتجات من الموردين</p>
                    </div>
                </div>
            </div>

            {/* Supplier Info Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>المورد (مطلوب)</Label>
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
                                placeholder="ابحث عن المورد بالاسم أو رقم الحساب..."
                                searchPlaceholder="ابحث بالاسم أو رقم الحساب أو الهاتف..."
                                emptyMessage="لا يوجد موردين"
                                displayKey="name"
                                searchKeys={['name', 'accountNumber', 'phone', 'contact']}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>المستودع</Label>
                            <Select
                                value={selectedWarehouse}
                                onValueChange={setSelectedWarehouse}
                                disabled={!isAdmin() && availableWarehouses.length === 1}
                            >
                                <SelectTrigger>
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
                        <div className="space-y-2">
                            <Label>تاريخ الشراء</Label>
                            <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                        </div>
                    </div>
                    {selectedSupplier && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{selectedSupplier.name}</p>
                                    <p className="text-sm text-gray-600">الهاتف: {selectedSupplier.phone}</p>
                                </div>
                                <Badge variant="outline">مورد</Badge>
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
                        <CardContent className="pt-6">
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

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleProductClick(product)}
                            >
                                <CardContent className="p-4">
                                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h4 className="text-sm mb-2">{product.name}</h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-blue-600 font-medium">{formatCurrency(product.costPrice || product.price)}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {product.barcode}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500">المخزون: {product.stock}</p>
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
                                                    <Package className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                                        <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
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

                                        {/* Credit Payment */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                                    آجل (على الحساب)
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

                                        {/* Bank Withdrawal Payment */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm flex items-center gap-2">
                                                    <Wallet className="w-4 h-4 text-purple-600" />
                                                    صرف من بنك
                                                </label>
                                                {paymentRemaining > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs"
                                                        onClick={() => fillRemaining('bankWithdrawal')}
                                                    >
                                                        تعبئة المتبقي
                                                    </Button>
                                                )}
                                            </div>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={paymentBreakdown.bankWithdrawal > 0 ? paymentBreakdown.bankWithdrawal : ''}
                                                onChange={(e) => updatePaymentBreakdown('bankWithdrawal', parseFloat(e.target.value) || 0)}
                                                className="text-right mb-2"
                                                min="0"
                                                step="0.01"
                                            />
                                            {paymentBreakdown.bankWithdrawal > 0 && (
                                                <Select
                                                    value={selectedBankId}
                                                    onValueChange={setSelectedBankId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر البنك" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {banks.map((bank) => (
                                                            <SelectItem key={bank.id} value={bank.id}>
                                                                {bank.name} - الرصيد: {formatCurrency(bank.balance)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
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
                                    </div>

                                    {/* Additional Fields */}
                                    <div className="space-y-2">
                                        <Label>تاريخ الاستحقاق (اختياري)</Label>
                                        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>ملاحظات (اختياري)</Label>
                                        <Input placeholder="ملاحظات إضافية" value={notes} onChange={(e) => setNotes(e.target.value)} />
                                    </div>

                                    {/* Save Button */}
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleSaveOrder}
                                        disabled={!selectedSupplier || cart.length === 0}
                                    >
                                        <ShoppingCart className="w-5 h-5 ml-2" />
                                        حفظ طلب الشراء
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Expiry Date Dialog */}
            <Dialog open={showExpiryDialog} onOpenChange={setShowExpiryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة منتج للسلة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {pendingProduct && (
                            <>
                                <div>
                                    <p className="text-sm font-medium">المنتج: {pendingProduct.name}</p>
                                    <p className="text-xs text-gray-500">السعر: {formatCurrency(pendingProduct.costPrice || pendingProduct.price)}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>تاريخ انتهاء الصلاحية (اختياري)</Label>
                                    <Input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        placeholder="اختر التاريخ"
                                    />
                                    <p className="text-xs text-gray-500">يمكنك ترك هذا الحقل فارغاً إذا لم يكن للمنتج تاريخ انتهاء</p>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowExpiryDialog(false);
                            setPendingProduct(null);
                            setExpiryDate('');
                        }}>
                            إلغاء
                        </Button>
                        <Button onClick={confirmAddProduct}>
                            إضافة للسلة
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

