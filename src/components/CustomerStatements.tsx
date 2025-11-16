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
import { createCashReceiptEntry, addJournalEntry } from '../data/journalEntries';

interface CustomerSummary {
    id: string;
    name: string;
    phone: string;
    address: string;
    status: 'ضمن الحد' | 'خطر' | 'موقوف';
    creditLimit: number;
    currentBalance: number;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
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

const customers: CustomerSummary[] = [
    { id: '1', name: 'شركة النجاح التقنية', phone: '0501234567', address: 'الرياض - حي العليا', status: 'ضمن الحد', creditLimit: 50000, currentBalance: 32000 },
    { id: '2', name: 'مؤسسة الريادة للخدمات', phone: '0502222222', address: 'جدة - حي الزهراء', status: 'خطر', creditLimit: 30000, currentBalance: 28500 },
    { id: '3', name: 'شركة التميز للاستثمار', phone: '0503333333', address: 'الدمام - الحي التجاري', status: 'ضمن الحد', creditLimit: 80000, currentBalance: 12000 },
];

const initialInvoices: Record<string, Invoice[]> = {
    '1': [
        { id: 'inv-1', invoiceNumber: 'INV-2025-001', issueDate: '2025-01-05', dueDate: '2025-02-05', description: 'توريد أجهزة كمبيوتر ومستلزمات مكتبية', amount: 18000, paid: 5000, status: 'متأخر' },
        { id: 'inv-2', invoiceNumber: 'INV-2025-002', issueDate: '2025-01-18', dueDate: '2025-02-18', description: 'عقد صيانة سنوي', amount: 9000, paid: 0, status: 'داخل المدة' },
        { id: 'inv-3', invoiceNumber: 'INV-2025-003', issueDate: '2025-02-01', dueDate: '2025-03-01', description: 'توريد طابعات وشحنها', amount: 11000, paid: 0, status: 'داخل المدة' },
    ],
    '2': [
        { id: 'inv-4', invoiceNumber: 'INV-2025-004', issueDate: '2025-01-02', dueDate: '2025-02-02', description: 'تجهيز مركز خدمة عملاء', amount: 15000, paid: 2000, status: 'متأخر' },
        { id: 'inv-5', invoiceNumber: 'INV-2025-005', issueDate: '2025-01-22', dueDate: '2025-02-22', description: 'توريد أجهزة نقاط بيع', amount: 12000, paid: 0, status: 'قيد المتابعة' },
    ],
    '3': [
        { id: 'inv-6', invoiceNumber: 'INV-2025-006', issueDate: '2025-01-10', dueDate: '2025-02-10', description: 'تطوير نظام داخلي', amount: 12000, paid: 0, status: 'داخل المدة' },
    ],
};

export function CustomerStatements() {
    const [selectedCustomerId, setSelectedCustomerId] = useState('1');
    const [searchTerm, setSearchTerm] = useState('');
    const [customerInvoices, setCustomerInvoices] = useState<Record<string, Invoice[]>>(initialInvoices);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentLogs, setPaymentLogs] = useState<Record<string, PaymentLog[]>>({
        '1': [{ id: 'pay-1', date: '2025-02-05', method: 'cash', amount: 5000, note: 'دفعة عبر الخزينة' }],
        '2': [],
        '3': [],
    });

    const selectedCustomer = useMemo(
        () => customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0],
        [selectedCustomerId]
    );

    const invoices = useMemo(() => customerInvoices[selectedCustomerId] ?? [], [customerInvoices, selectedCustomerId]);
    const totalDue = invoices.reduce((sum, invoice) => sum + (invoice.amount - invoice.paid), 0);

    const filteredInvoices = useMemo(() => {
        if (!searchTerm.trim()) return invoices;
        const term = searchTerm.toLowerCase();
        return invoices.filter(
            (invoice) =>
                invoice.invoiceNumber.toLowerCase().includes(term) ||
                invoice.description.toLowerCase().includes(term)
        );
    }, [invoices, searchTerm]);

    const handlePayment = () => {
        if (paymentAmount <= 0) {
            toast.error('يرجى إدخال قيمة دفعة صحيحة');
            return;
        }

        if (paymentAmount > totalDue) {
            toast.error('قيمة الدفعة أكبر من الرصيد المستحق');
            return;
        }

        const updatedInvoices = invoices.map((invoice) => ({ ...invoice }));
        let remaining = paymentAmount;

        for (const invoice of updatedInvoices) {
            const outstanding = invoice.amount - invoice.paid;
            if (outstanding <= 0) continue;
            const applied = Math.min(outstanding, remaining);
            invoice.paid += applied;
            remaining -= applied;
            if (remaining <= 0) break;
        }

        setCustomerInvoices((prev) => ({ ...prev, [selectedCustomerId]: updatedInvoices }));

        // Generate receipt number
        const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Create automatic journal entry for cash receipt
        const journalEntry = createCashReceiptEntry(
            receiptNumber,
            paymentAmount,
            paymentMethod,
            selectedCustomerId,
            selectedCustomer.name,
            paymentNote || undefined
        );
        
        // Add journal entry
        addJournalEntry(journalEntry);

        setPaymentLogs((prev) => ({
            ...prev,
            [selectedCustomerId]: [
                { id: `pay-${Date.now()}`, date: new Date().toISOString().split('T')[0], method: paymentMethod, amount: paymentAmount, note: paymentNote },
                ...(prev[selectedCustomerId] ?? []),
            ],
        }));

        toast.success(`تم تسجيل الدفعة وسيتم توريدها للخزينة - ${receiptNumber}`);
        setPaymentAmount(0);
        setPaymentNote('');
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(value);

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">كشف حساب العملاء</h1>
                    <p className="text-gray-500 mt-1">عرض الفواتير الائتمانية وتسجيل الدفعات النقدية والبطاقات</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => toast.success('تم تصدير الكشف للعميل')}>
                        <Download className="w-4 h-4" />
                        تصدير كشف للعميل
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-600">اختر العميل</label>
                            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-600">بحث في الفواتير</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="رقم الفاتورة أو الوصف..."
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
                                <CardTitle>{selectedCustomer.name}</CardTitle>
                                <CardDescription>
                                    {selectedCustomer.phone} | {selectedCustomer.address}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">إجمالي الدين الحالي</span>
                                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalDue)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    حالة العميل: <Badge variant={selectedCustomer.status === 'خطر' ? 'destructive' : 'secondary'}>{selectedCustomer.status}</Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                    حد الائتمان: {formatCurrency(selectedCustomer.creditLimit)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200">
                            <CardHeader>
                                <CardTitle>تسجيل دفعة للعميل</CardTitle>
                                <CardDescription>المبلغ سيتم توريده إلى الخزينة / البنك حسب الطريقة</CardDescription>
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
                                        placeholder="مثال: دفعة من العميل عبر المحاسبة"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full" onClick={handlePayment}>
                                    تسجيل الدفعة
                                </Button>
                                <p className="text-xs text-gray-500">
                                    عند حفظ الدفعة سيتم خصم المبلغ من رصيد العميل وترحيله إلى الخزينة تلقائياً.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>فواتير العميل</CardTitle>
                    <CardDescription>السجل الائتماني الحالي (لا توجد ديون على النظام من الموردين)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="max-h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">رقم الفاتورة</TableHead>
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
                                {filteredInvoices.map((invoice) => {
                                    const remaining = invoice.amount - invoice.paid;
                                    return (
                                        <TableRow key={invoice.id}>
                                            <TableCell>{invoice.invoiceNumber}</TableCell>
                                            <TableCell>{invoice.issueDate}</TableCell>
                                            <TableCell>{invoice.dueDate}</TableCell>
                                            <TableCell>{invoice.description}</TableCell>
                                            <TableCell className="text-red-600">{formatCurrency(invoice.amount)}</TableCell>
                                            <TableCell className="text-green-600">{invoice.paid ? formatCurrency(invoice.paid) : '-'}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(remaining)}</TableCell>
                                            <TableCell>
                                                <Badge variant={invoice.status === 'متأخر' ? 'destructive' : invoice.status === 'قيد المتابعة' ? 'secondary' : 'default'}>
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredInvoices.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                                            لا توجد فواتير مطابقة لبحثك
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
                    <CardDescription>كل دفعة يتم تسجيلها يتم توريدها فوراً إلى الخزنة أو البنك</CardDescription>
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
                            {(paymentLogs[selectedCustomerId] ?? []).map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={payment.method === 'cash' ? 'default' : 'secondary'}>
                                            {payment.method === 'cash' ? 'نقدي - الخزينة' : 'بطاقة - POS'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-green-600">{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell>{payment.note || '-'}</TableCell>
                                </TableRow>
                            ))}
                            {(paymentLogs[selectedCustomerId] ?? []).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                                        لا توجد دفعات مسجلة لهذا العميل
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

