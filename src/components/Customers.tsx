'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, CreditCard, AlertTriangle, ShieldCheck, Download, Banknote, User } from 'lucide-react';
import { toast } from 'sonner';
import { createCashReceiptEntry, addJournalEntry } from '../data/journalEntries';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  // نوع العميل
  customerType: 'فرد' | 'مؤسسة' | 'محل تجاري';
  // البيانات الضريبية (للمؤسسات والمحلات التجارية)
  taxNumber?: string; // الرقم الضريبي
  // العنوان الوطني (للربط مع هيئة الزكاة والدخل)
  nationalAddress?: {
    buildingNumber?: string; // رقم المبنى
    streetName?: string; // اسم الشارع
    district?: string; // اسم الحي
    city?: string; // اسم المدينة
    postalCode?: string; // الرمز البريدي
    unitNumber?: string; // رقم الوحدة (اختياري)
    additionalNumber?: string; // رقم إضافي (اختياري)
  };
  // بيانات إضافية
  totalOrders: number;
  totalSpent: number;
  creditLimit: number;
  currentBalance: number;
  graceDays: number;
  creditStatus: 'ممتاز' | 'تحذير' | 'موقوف';
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

interface Transaction {
  id: string;
  type: 'فاتورة' | 'دفعة' | 'طلب_بيع' | 'خدمة';
  date: string;
  reference: string;
  description: string;
  amount: number;
  status: 'مكتمل' | 'قيد_الانتظار' | 'ملغي';
}

// Mock data for invoices per customer
const customerInvoices: Record<string, Invoice[]> = {
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
  '4': [],
  '5': [],
};

// Mock data for payments per customer
const customerPayments: Record<string, PaymentLog[]> = {
  '1': [
    { id: 'pay-1', date: '2025-02-05', method: 'cash', amount: 5000, note: 'دفعة عبر الخزينة' },
    { id: 'pay-2', date: '2025-01-20', method: 'card', amount: 3000, note: 'دفعة عبر POS' },
  ],
  '2': [
    { id: 'pay-3', date: '2025-01-15', method: 'cash', amount: 2000, note: 'دفعة جزئية' },
  ],
  '3': [],
  '4': [],
  '5': [],
};

// Mock data for transactions per customer
const customerTransactions: Record<string, Transaction[]> = {
  '1': [
    { id: 'txn-1', type: 'طلب_بيع', date: '2025-02-10', reference: 'POS-2025-001', description: 'بيع منتجات متنوعة', amount: 2500, status: 'مكتمل' },
    { id: 'txn-2', type: 'خدمة', date: '2025-01-25', reference: 'SRV-2025-001', description: 'خدمة صيانة', amount: 1500, status: 'مكتمل' },
    { id: 'txn-3', type: 'فاتورة', date: '2025-01-05', reference: 'INV-2025-001', description: 'توريد أجهزة كمبيوتر', amount: 18000, status: 'مكتمل' },
  ],
  '2': [
    { id: 'txn-4', type: 'طلب_بيع', date: '2025-02-08', reference: 'POS-2025-002', description: 'بيع أجهزة', amount: 3500, status: 'مكتمل' },
    { id: 'txn-5', type: 'فاتورة', date: '2025-01-02', reference: 'INV-2025-004', description: 'تجهيز مركز خدمة عملاء', amount: 15000, status: 'مكتمل' },
  ],
  '3': [
    { id: 'txn-6', type: 'طلب_بيع', date: '2025-02-05', reference: 'POS-2025-003', description: 'بيع منتجات', amount: 1200, status: 'مكتمل' },
  ],
  '4': [],
  '5': [],
};

const STORAGE_KEY = 'customers_data';

// Load customers from localStorage
const loadCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading customers:', error);
  }

  // Return default customers if nothing stored
  return [
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '0501234567',
      address: 'الرياض، المملكة العربية السعودية',
      customerType: 'فرد',
      totalOrders: 24,
      totalSpent: 12500,
      creditLimit: 20000,
      currentBalance: 6800,
      graceDays: 30,
      creditStatus: 'ممتاز'
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      phone: '0502345678',
      address: 'جدة، المملكة العربية السعودية',
      customerType: 'فرد',
      totalOrders: 18,
      totalSpent: 8900,
      creditLimit: 15000,
      currentBalance: 12000,
      graceDays: 20,
      creditStatus: 'تحذير'
    },
    {
      id: '3',
      name: 'شركة النجاح التقنية',
      email: 'info@alnajah.com',
      phone: '0503456789',
      address: 'الدمام، المملكة العربية السعودية',
      customerType: 'مؤسسة',
      taxNumber: '300123456700003',
      nationalAddress: {
        buildingNumber: '1234',
        streetName: 'شارع الملك فهد',
        district: 'حي العليا',
        city: 'الدمام',
        postalCode: '32245',
        unitNumber: '5',
        additionalNumber: '1234'
      },
      totalOrders: 32,
      totalSpent: 18700,
      creditLimit: 25000,
      currentBalance: 4000,
      graceDays: 35,
      creditStatus: 'ممتاز'
    },
    {
      id: '4',
      name: 'محل الأمل للتجارة',
      email: 'info@alamal.com',
      phone: '0504567890',
      address: 'مكة المكرمة، المملكة العربية السعودية',
      customerType: 'محل تجاري',
      taxNumber: '300234567800003',
      nationalAddress: {
        buildingNumber: '5678',
        streetName: 'طريق الحرم',
        district: 'حي العزيزية',
        city: 'مكة المكرمة',
        postalCode: '24231',
        unitNumber: '10'
      },
      totalOrders: 15,
      totalSpent: 6400,
      creditLimit: 12000,
      currentBalance: 11800,
      graceDays: 15,
      creditStatus: 'موقوف'
    },
    {
      id: '5',
      name: 'سعد عبدالله',
      email: 'saad@example.com',
      phone: '0505678901',
      address: 'المدينة المنورة، المملكة العربية السعودية',
      customerType: 'فرد',
      totalOrders: 27,
      totalSpent: 15200,
      creditLimit: 18000,
      currentBalance: 5000,
      graceDays: 25,
      creditStatus: 'ممتاز'
    },
  ];
};

export function Customers() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);

  // Prefetch common routes on mount
  useEffect(() => {
    router.prefetch('/customers/new');
  }, [router]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Record<string, Invoice[]>>(customerInvoices);
  const [payments, setPayments] = useState<Record<string, PaymentLog[]>>(customerPayments);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.taxNumber && customer.taxNumber.includes(searchTerm))
  );

  const selectedCustomer = useMemo(
    () => customers.find(c => c.id === selectedCustomerId) ?? null,
    [selectedCustomerId, customers]
  );

  const customerInvoicesList = useMemo(
    () => invoices[selectedCustomerId || ''] ?? [],
    [invoices, selectedCustomerId]
  );

  const customerPaymentsList = useMemo(
    () => payments[selectedCustomerId || ''] ?? [],
    [payments, selectedCustomerId]
  );

  const customerTransactionsList = useMemo(
    () => customerTransactions[selectedCustomerId || ''] ?? [],
    [selectedCustomerId]
  );

  const totalDue = useMemo(
    () => customerInvoicesList.reduce((sum, inv) => sum + (inv.amount - inv.paid), 0),
    [customerInvoicesList]
  );

  const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + c.currentBalance, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(value);

  const getCreditStatus = (customer: Customer) => {
    const usage = customer.currentBalance / (customer.creditLimit || 1);
    switch (customer.creditStatus) {
      case 'ممتاز':
        return { label: 'ضمن الحد', color: 'bg-green-100 text-green-700', usage };
      case 'تحذير':
        return { label: 'قرب الحد', color: 'bg-yellow-100 text-yellow-700', usage };
      default:
        return { label: 'موقوف مؤقتاً', color: 'bg-red-100 text-red-700', usage };
    }
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast.success('تم حذف العميل بنجاح');
    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
    }
  };

  const handleEdit = (customer: Customer) => {
    // Prefetch the edit page for faster navigation
    router.prefetch(`/customers/${customer.id}/edit`);
    startTransition(() => {
      router.push(`/customers/${customer.id}/edit`);
    });
  };

  const handleAddNew = () => {
    // Prefetch the new page for faster navigation
    router.prefetch('/customers/new');
    startTransition(() => {
      router.push('/customers/new');
    });
  };

  // Save customers to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
      } catch (error) {
        console.error('Error saving customers:', error);
      }
    }
  }, [customers]);

  // Reload customers when window regains focus (e.g., returning from add page)
  useEffect(() => {
    const handleFocus = () => {
      const loadedCustomers = loadCustomers();
      if (loadedCustomers.length !== customers.length ||
        JSON.stringify(loadedCustomers) !== JSON.stringify(customers)) {
        setCustomers(loadedCustomers);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [customers]);

  const handlePayment = () => {
    if (!selectedCustomerId) {
      toast.error('يرجى اختيار عميل أولاً');
      return;
    }

    if (paymentAmount <= 0) {
      toast.error('يرجى إدخال قيمة دفعة صحيحة');
      return;
    }

    if (paymentAmount > totalDue) {
      toast.error('قيمة الدفعة أكبر من الرصيد المستحق');
      return;
    }

    const updatedInvoices = customerInvoicesList.map((invoice) => ({ ...invoice }));
    let remaining = paymentAmount;

    for (const invoice of updatedInvoices) {
      const outstanding = invoice.amount - invoice.paid;
      if (outstanding <= 0) continue;
      const applied = Math.min(outstanding, remaining);
      invoice.paid += applied;
      remaining -= applied;
      if (remaining <= 0) break;
    }

    setInvoices((prev) => ({ ...prev, [selectedCustomerId]: updatedInvoices }));

    // Generate receipt number
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create automatic journal entry for cash receipt
    const journalEntry = createCashReceiptEntry(
      receiptNumber,
      paymentAmount,
      paymentMethod,
      selectedCustomerId,
      selectedCustomer?.name ?? '',
      paymentNote || undefined
    );

    // Add journal entry
    addJournalEntry(journalEntry);

    setPayments((prev) => ({
      ...prev,
      [selectedCustomerId]: [
        { id: `pay-${Date.now()}`, date: new Date().toISOString().split('T')[0], method: paymentMethod, amount: paymentAmount, note: paymentNote },
        ...(prev[selectedCustomerId] ?? []),
      ],
    }));

    // Update customer balance
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomerId ? { ...c, currentBalance: Math.max(0, c.currentBalance - paymentAmount) } : c
      )
    );

    toast.success(`تم تسجيل الدفعة وسيتم توريدها للخزينة - ${receiptNumber}`);
    setPaymentAmount(0);
    setPaymentNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1 className="text-3xl font-bold">إدارة العملاء</h1>
          <p className="text-gray-600">عرض وإدارة جميع العملاء</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          إضافة عميل جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm text-gray-500">إجمالي حدود الائتمان</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCreditLimit)}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm text-gray-500">الرصيد المستحق حالياً</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm text-gray-500">نسبة الاستخدام</p>
              <p className="text-2xl font-bold">
                {Math.round((totalOutstanding / (totalCreditLimit || 1)) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
        {/* Customer List */}
        <div className="lg:col-span-1 space-y-4" dir="rtl">
          <Card dir="rtl">
            <CardContent className="p-6" dir="rtl">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="البحث عن عميل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-right"
                  dir="rtl"
                />
              </div>
              <ScrollArea className="h-[600px]" dir="rtl">
                <div className="space-y-2">
                  {filteredCustomers.map((customer) => {
                    const isSelected = customer.id === selectedCustomerId;
                    const balance = invoices[customer.id]?.reduce((sum, inv) => sum + (inv.amount - inv.paid), 0) ?? customer.currentBalance;
                    return (
                      <button
                        key={customer.id}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className={`w-full text-right rounded-lg border p-4 transition-all ${isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                {customer.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-900">{customer.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1 mt-2">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {customer.customerType}
                                </Badge>
                                {customer.taxNumber && (
                                  <span className="text-xs">الضريبي: {customer.taxNumber}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant={customer.creditStatus === 'موقوف' ? 'destructive' : customer.creditStatus === 'تحذير' ? 'secondary' : 'default'}>
                            {getCreditStatus(customer).label}
                          </Badge>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">الرصيد المستحق:</span>
                            <span className="font-semibold text-blue-600">{formatCurrency(balance)}</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(100, (customer.currentBalance / customer.creditLimit) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Customer Profile */}
        <div className="lg:col-span-2" dir="rtl">
          {selectedCustomer ? (
            <Tabs defaultValue="summary" className="w-full" dir="rtl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                  <p className="text-sm text-gray-500">{selectedCustomer.phone} | {selectedCustomer.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(selectedCustomer)}>
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success('تم تصدير كشف الحساب')}>
                    <Download className="w-4 h-4 mr-2" />
                    تصدير PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
                      handleDelete(selectedCustomer.id);
                    }
                  }}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف
                  </Button>
                </div>
              </div>

              <TabsList className="grid grid-cols-4 w-full" dir="rtl">
                <TabsTrigger value="summary">ملخص عام</TabsTrigger>
                <TabsTrigger value="invoices">الفواتير والديون</TabsTrigger>
                <TabsTrigger value="payments">الدفعات</TabsTrigger>
                <TabsTrigger value="transactions">التعاملات</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4 mt-4" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">معلومات الاتصال</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          <Badge variant="outline" className="mr-2">{selectedCustomer.customerType}</Badge>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedCustomer.address}</span>
                      </div>
                      {selectedCustomer.taxNumber && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <span className="text-sm font-semibold text-gray-700">الرقم الضريبي:</span>
                          <span className="text-sm">{selectedCustomer.taxNumber}</span>
                        </div>
                      )}
                      {selectedCustomer.nationalAddress && (
                        <div className="pt-2 border-t space-y-2">
                          <span className="text-sm font-semibold text-gray-700 block mb-2">العنوان الوطني:</span>
                          <div className="text-xs text-gray-600 space-y-1 pr-4">
                            {selectedCustomer.nationalAddress.buildingNumber && (
                              <div>رقم المبنى: {selectedCustomer.nationalAddress.buildingNumber}</div>
                            )}
                            {selectedCustomer.nationalAddress.streetName && (
                              <div>الشارع: {selectedCustomer.nationalAddress.streetName}</div>
                            )}
                            {selectedCustomer.nationalAddress.district && (
                              <div>الحي: {selectedCustomer.nationalAddress.district}</div>
                            )}
                            {selectedCustomer.nationalAddress.city && (
                              <div>المدينة: {selectedCustomer.nationalAddress.city}</div>
                            )}
                            {selectedCustomer.nationalAddress.postalCode && (
                              <div>الرمز البريدي: {selectedCustomer.nationalAddress.postalCode}</div>
                            )}
                            {selectedCustomer.nationalAddress.unitNumber && (
                              <div>رقم الوحدة: {selectedCustomer.nationalAddress.unitNumber}</div>
                            )}
                            {selectedCustomer.nationalAddress.additionalNumber && (
                              <div>رقم إضافي: {selectedCustomer.nationalAddress.additionalNumber}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">ملخص الائتمان</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">حد الائتمان:</span>
                        <span className="font-semibold">{formatCurrency(selectedCustomer.creditLimit)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">الرصيد المستحق:</span>
                        <span className="font-semibold text-red-600">{formatCurrency(totalDue)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">الرصيد المتاح:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(selectedCustomer.creditLimit - totalDue)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">أيام السماح:</span>
                        <span className="font-semibold">{selectedCustomer.graceDays} يوم</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, (totalDue / selectedCustomer.creditLimit) * 100)}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">إحصائيات العميل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                        <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.totalSpent)}</p>
                        <p className="text-sm text-gray-500">إجمالي الإنفاق</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{customerInvoicesList.length}</p>
                        <p className="text-sm text-gray-500">عدد الفواتير</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">تسجيل دفعة</CardTitle>
                    <CardDescription>المبلغ سيتم توريده إلى الخزينة / البنك حسب الطريقة</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>المبلغ (ر.س)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={paymentAmount || ''}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>طريقة الدفع</Label>
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
                      <Label>ملاحظات</Label>
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
              </TabsContent>

              {/* Invoices Tab */}
              <TabsContent value="invoices" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>الفواتير المستحقة</CardTitle>
                    <CardDescription>جميع الفواتير التي لا تزال على ذمة العميل</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[500px]">
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
                          {customerInvoicesList.map((invoice) => {
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
                          {customerInvoicesList.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                                لا توجد فواتير مستحقة لهذا العميل
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>سجل الدفعات</CardTitle>
                    <CardDescription>كل دفعة يتم تسجيلها يتم توريدها فوراً إلى الخزنة أو البنك</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[500px]">
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
                          {customerPaymentsList.map((payment) => (
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
                          {customerPaymentsList.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                                لا توجد دفعات مسجلة لهذا العميل
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>سجل التعاملات</CardTitle>
                    <CardDescription>جميع التعاملات مع العميل (فواتير، طلبات بيع، خدمات)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">النوع</TableHead>
                            <TableHead className="text-right">الرقم المرجعي</TableHead>
                            <TableHead className="text-right">الوصف</TableHead>
                            <TableHead className="text-right">المبلغ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerTransactionsList.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{transaction.date}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  transaction.type === 'فاتورة' ? 'default' :
                                    transaction.type === 'دفعة' ? 'secondary' :
                                      transaction.type === 'طلب_بيع' ? 'outline' : 'secondary'
                                }>
                                  {transaction.type === 'فاتورة' ? 'فاتورة' :
                                    transaction.type === 'دفعة' ? 'دفعة' :
                                      transaction.type === 'طلب_بيع' ? 'طلب بيع' : 'خدمة'}
                                </Badge>
                              </TableCell>
                              <TableCell>{transaction.reference}</TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                              <TableCell>
                                <Badge variant={transaction.status === 'مكتمل' ? 'default' : transaction.status === 'قيد_الانتظار' ? 'secondary' : 'destructive'}>
                                  {transaction.status === 'مكتمل' ? 'مكتمل' : transaction.status === 'قيد_الانتظار' ? 'قيد الانتظار' : 'ملغي'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {customerTransactionsList.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                                لا توجد تعاملات مسجلة لهذا العميل
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">اختر عميلاً لعرض ملفه</h3>
                <p className="text-gray-500">انقر على أي عميل من القائمة لعرض تفاصيله الكاملة</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
