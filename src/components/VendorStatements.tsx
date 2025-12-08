import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Download, Search, CreditCard, Banknote } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { createPaymentVoucherEntry, addJournalEntry } from '../data/journalEntries';
import { deductFromSafe } from '../data/safes';
import { deductFromMainBank } from '../data/banks';

interface VendorSummary {
    id: string;
    name: string;
    phone: string;
    address: string;
    status: 'ضمن الحد' | 'خطر' | 'موقوف';
    creditLimit: number;
    currentBalance: number; // ما نستحقه للمورد (دائن)
}

interface PurchaseOrder {
    id: string;
    orderNumber: string;
    issueDate: string;
    dueDate: string;
    description: string;
    amount: number;
    paid: number;
    status: 'داخل المدة' | 'متأخر' | 'قيد المتابعة';
}

interface PaymentLog {
    id: string;
    date: string;
    method: 'cash' | 'card';
    amount: number;
    note?: string;
}

const vendors: VendorSummary[] = [
    { id: '1', name: 'مورد المعدات المكتبية', phone: '0501234567', address: 'الرياض - حي العليا', status: 'ضمن الحد', creditLimit: 100000, currentBalance: 19550 },
    { id: '2', name: 'مورد الأثاث', phone: '0502222222', address: 'جدة - حي الزهراء', status: 'خطر', creditLimit: 50000, currentBalance: 2300 },
    { id: '3', name: 'مورد الأجهزة الإلكترونية', phone: '0503333333', address: 'الدمام - الحي التجاري', status: 'ضمن الحد', creditLimit: 150000, currentBalance: 4100 },
];

const initialPurchaseOrders: Record<string, PurchaseOrder[]> = {
    '1': [
        { id: 'po-1', orderNumber: 'PO-2025-001', issueDate: '2025-01-10', dueDate: '2025-02-10', description: 'توريد أجهزة كمبيوتر ومستلزمات مكتبية', amount: 19550, paid: 0, status: 'متأخر' },
        { id: 'po-2', orderNumber: 'PO-2025-002', issueDate: '2025-01-25', dueDate: '2025-02-25', description: 'توريد طابعات وشاشات', amount: 12000, paid: 0, status: 'داخل المدة' },
    ],
    '2': [
        { id: 'po-3', orderNumber: 'PO-2025-003', issueDate: '2025-01-18', dueDate: '2025-02-18', description: 'توريد أثاث مكتبي', amount: 2300, paid: 0, status: 'متأخر' },
    ],
    '3': [
        { id: 'po-4', orderNumber: 'PO-2025-004', issueDate: '2025-01-20', dueDate: '2025-02-20', description: 'توريد أجهزة إلكترونية', amount: 4100, paid: 0, status: 'داخل المدة' },
    ],
};

export function VendorStatements() {
    const [selectedVendorId, setSelectedVendorId] = useState('1');
    const [searchTerm, setSearchTerm] = useState('');
    const [vendorPurchaseOrders, setVendorPurchaseOrders] = useState<Record<string, PurchaseOrder[]>>(initialPurchaseOrders);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentLogs, setPaymentLogs] = useState<Record<string, PaymentLog[]>>({
        '1': [],
        '2': [],
        '3': [],
    });

    const selectedVendor = useMemo(
        () => vendors.find((vendor) => vendor.id === selectedVendorId) ?? vendors[0],
        [selectedVendorId]
    );

    const purchaseOrders = useMemo(() => vendorPurchaseOrders[selectedVendorId] ?? [], [vendorPurchaseOrders, selectedVendorId]);
    const totalDue = purchaseOrders.reduce((sum, order) => sum + (order.amount - order.paid), 0);

    const filteredPurchaseOrders = useMemo(() => {
        if (!searchTerm.trim()) return purchaseOrders;
        const term = searchTerm.toLowerCase();
        return purchaseOrders.filter(
            (order) =>
                order.orderNumber.toLowerCase().includes(term) ||
                order.description.toLowerCase().includes(term)
        );
    }, [purchaseOrders, searchTerm]);

    const handlePayment = () => {
        if (paymentAmount <= 0) {
            toast.error('يرجى إدخال قيمة دفعة صحيحة');
            return;
        }

        if (paymentAmount > totalDue) {
            toast.error('قيمة الدفعة أكبر من الرصيد المستحق');
            return;
        }

        const updatedOrders = purchaseOrders.map((order) => ({ ...order }));
        let remaining = paymentAmount;

        for (const order of updatedOrders) {
            const outstanding = order.amount - order.paid;
            if (outstanding <= 0) continue;
            const applied = Math.min(outstanding, remaining);
            order.paid += applied;
            remaining -= applied;
            if (remaining <= 0) break;
        }

        setVendorPurchaseOrders((prev) => ({ ...prev, [selectedVendorId]: updatedOrders }));

        // Generate payment voucher number
        const voucherNumber = `PV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

        // Create automatic journal entry for payment voucher
        const journalEntry = createPaymentVoucherEntry(
            voucherNumber,
            paymentAmount,
            paymentMethod,
            selectedVendorId,
            selectedVendor.name,
            paymentNote || undefined
        );

        // Add journal entry
        addJournalEntry(journalEntry);

        // Update safe/bank balance
        if (paymentMethod === 'cash') {
            // Deduct from default safe (you may want to add safe selection)
            const success = deductFromSafe('safe-1', paymentAmount);
            if (!success) {
                toast.warning('تم تسجيل الدفعة ولكن فشل تحديث الخزينة');
            }
        } else {
            // Deduct from main bank
            const success = deductFromMainBank(paymentAmount);
            if (!success) {
                toast.warning('تم تسجيل الدفعة ولكن فشل تحديث البنك');
            }
        }

        setPaymentLogs((prev) => ({
            ...prev,
            [selectedVendorId]: [
                { id: `pay-${Date.now()}`, date: new Date().toISOString().split('T')[0], method: paymentMethod, amount: paymentAmount, note: paymentNote },
                ...(prev[selectedVendorId] ?? []),
            ],
        }));

        toast.success(`تم تسجيل الدفعة وسيتم خصمها من الخزينة/البنك - ${voucherNumber}`);
        setPaymentAmount(0);
        setPaymentNote('');
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(value);

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">كشف حساب الموردين</h1>
                    <p className="text-gray-500 mt-1">عرض أوامر الشراء وتسجيل الدفعات النقدية والبطاقات للموردين</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => toast.success('تم تصدير الكشف للمورد')}>
                        <Download className="w-4 h-4" />
                        تصدير كشف للمورد
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-600">اختر المورد</label>
                            <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id}>
                                            {vendor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-600">بحث في أوامر الشراء</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="رقم الأمر أو الوصف..."
                                    className="pl-9 text-right"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-blue-200">
                            <CardHeader>
                                <CardTitle>{selectedVendor.name}</CardTitle>
                                <CardDescription>
                                    {selectedVendor.phone} | {selectedVendor.address}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">إجمالي الدين الحالي</span>
                                    <span className="text-2xl font-bold text-red-600">{formatCurrency(totalDue)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    حالة المورد: <Badge variant={selectedVendor.status === 'خطر' ? 'destructive' : 'secondary'}>{selectedVendor.status}</Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                    حد الائتمان: {formatCurrency(selectedVendor.creditLimit)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle>تسجيل دفعة للمورد</CardTitle>
                                <CardDescription>المبلغ سيتم خصمه من الخزينة / البنك حسب الطريقة</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">المبلغ (ر.س)</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={paymentAmount || ''}
                                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">طريقة الدفع</label>
                                        <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card') => setPaymentMethod(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">
                                                    <div className="flex items-center gap-2">
                                                        <Banknote className="w-4 h-4" />
                                                        نقدي (خزنة)
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="card">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4" />
                                                        بطاقة (POS)
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">ملاحظات</label>
                                    <Input
                                        placeholder="مثال: دفعة للمورد عبر المحاسبة"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full" onClick={handlePayment}>
                                    تسجيل الدفعة
                                </Button>
                                <p className="text-xs text-gray-500">
                                    عند حفظ الدفعة سيتم خصم المبلغ من رصيد المورد وخصمه من الخزينة/البنك تلقائياً.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>أوامر الشراء للمورد</CardTitle>
                    <CardDescription>السجل الائتماني الحالي (الديون المستحقة على النظام للموردين)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="max-h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">رقم الأمر</TableHead>
                                    <TableHead className="text-right">التاريخ</TableHead>
                                    <TableHead className="text-right">الاستحقاق</TableHead>
                                    <TableHead className="text-right">الوصف</TableHead>
                                    <TableHead className="text-right">القيمة</TableHead>
                                    <TableHead className="text-right">المدفوع</TableHead>
                                    <TableHead className="text-right">المتبقي</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPurchaseOrders.map((order) => {
                                    const remaining = order.amount - order.paid;
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.orderNumber}</TableCell>
                                            <TableCell>{order.issueDate}</TableCell>
                                            <TableCell>{order.dueDate}</TableCell>
                                            <TableCell>{order.description}</TableCell>
                                            <TableCell className="text-red-600">{formatCurrency(order.amount)}</TableCell>
                                            <TableCell className="text-green-600">{order.paid ? formatCurrency(order.paid) : '-'}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(remaining)}</TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === 'متأخر' ? 'destructive' : order.status === 'قيد المتابعة' ? 'secondary' : 'default'}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredPurchaseOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                                            لا توجد أوامر شراء مطابقة لبحثك
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>سجل الدفعات</CardTitle>
                    <CardDescription>كل دفعة يتم تسجيلها يتم خصمها فوراً من الخزنة أو البنك</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">الطريقة</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-right">ملاحظة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(paymentLogs[selectedVendorId] ?? []).map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={payment.method === 'cash' ? 'default' : 'secondary'}>
                                            {payment.method === 'cash' ? 'نقدي - الخزينة' : 'بطاقة - POS'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-red-600">{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell>{payment.note || '-'}</TableCell>
                                </TableRow>
                            ))}
                            {(paymentLogs[selectedVendorId] ?? []).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                                        لا توجد دفعات مسجلة لهذا المورد
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
