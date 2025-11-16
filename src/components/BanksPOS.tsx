import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Landmark, CreditCard, TrendingUp, Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function BanksPOS() {
    // Banks State
    const [banks, setBanks] = useState([
        {
            id: '1',
            name: 'البنك الأهلي السعودي',
            nameEn: 'Al Ahli Bank',
            accountNumber: '1234567890',
            iban: 'SA1234567890123456789012',
            country: 'المملكة العربية السعودية',
            city: 'الرياض',
            region: 'حي الملز',
            mobile: '0501234567',
            balance: 450000,
            status: 'نشط'
        },
        {
            id: '2',
            name: 'بنك الراجحي',
            nameEn: 'Al Rajhi Bank',
            accountNumber: '0987654321',
            iban: 'SA0987654321098765432109',
            country: 'المملكة العربية السعودية',
            city: 'الرياض',
            region: 'حي العليا',
            mobile: '0507654321',
            balance: 320000,
            status: 'نشط'
        },
        {
            id: '3',
            name: 'البنك السعودي الفرنسي',
            nameEn: 'Banque Saudi Fransi',
            accountNumber: '5555666677',
            iban: 'SA5555666677778888999900',
            country: 'المملكة العربية السعودية',
            city: 'جدة',
            region: 'حي الروضة',
            mobile: '0505556666',
            balance: 180000,
            status: 'نشط'
        }
    ]);

    // POS Terminals State
    const [terminals, setTerminals] = useState([
        { id: '1', name: 'نقطة البيع 1', nameEn: 'POS Terminal 1', terminalNumber: 'POS-001-2024', bankId: '1', bankName: 'البنك الأهلي السعودي', location: 'الفرع الرئيسي', assignedTo: 'أحمد محمد', status: 'نشط', dailyLimit: 50000, commission: 1.5 },
        { id: '2', name: 'نقطة البيع 2', nameEn: 'POS Terminal 2', terminalNumber: 'POS-002-2024', bankId: '2', bankName: 'بنك الراجحي', location: 'فرع الشمال', assignedTo: 'فاطمة علي', status: 'نشط', dailyLimit: 30000, commission: 1.5 },
        { id: '3', name: 'نقطة البيع 3', nameEn: 'POS Terminal 3', terminalNumber: 'POS-003-2024', bankId: '1', bankName: 'البنك الأهلي السعودي', location: 'فرع الجنوب', assignedTo: 'سعيد خالد', status: 'نشط', dailyLimit: 40000, commission: 1.5 },
        { id: '4', name: 'جهاز الصراف 1', nameEn: 'ATM Machine 1', terminalNumber: 'ATM-001-2024', bankId: '3', bankName: 'البنك السعودي الفرنسي', location: 'فرع الغرب', assignedTo: 'مريم أحمد', status: 'صيانة', dailyLimit: 35000, commission: 1.5 }
    ]);

    // Transactions State
    const [transactions, setTransactions] = useState([
        { id: 'TXN-001', date: '2025-01-28', terminalId: '1', terminalName: 'نقطة البيع 1', bankName: 'البنك الأهلي', amount: 5000, commission: 75, netAmount: 4925, status: 'مكتمل', customer: 'عميل 1', reference: 'REF-001' },
        { id: 'TXN-002', date: '2025-01-28', terminalId: '2', terminalName: 'نقطة البيع 2', bankName: 'بنك الراجحي', amount: 3200, commission: 48, netAmount: 3152, status: 'مكتمل', customer: 'عميل 2', reference: 'REF-002' },
        { id: 'TXN-003', date: '2025-01-29', terminalId: '1', terminalName: 'نقطة البيع 1', bankName: 'البنك الأهلي', amount: 7500, commission: 112.5, netAmount: 7387.5, status: 'قيد المعالجة', customer: 'عميل 3', reference: 'REF-003' },
        { id: 'TXN-004', date: '2025-01-29', terminalId: '3', terminalName: 'نقطة البيع 3', bankName: 'البنك الأهلي', amount: 2100, commission: 31.5, netAmount: 2068.5, status: 'فشل', customer: 'عميل 4', reference: 'REF-004' }
    ]);

    // Bank Transfers State
    const [transfers, setTransfers] = useState([
        { id: 'TRF-001', date: '2025-01-28', terminalName: 'نقطة البيع 1', bankName: 'البنك الأهلي', amount: 15000, receivedDate: '2025-01-29', status: 'مستلم', reference: 'BT-001' },
        { id: 'TRF-002', date: '2025-01-28', terminalName: 'نقطة البيع 2', bankName: 'بنك الراجحي', amount: 8500, receivedDate: null, status: 'معلق', reference: 'BT-002' },
        { id: 'TRF-003', date: '2025-01-29', terminalName: 'نقطة البيع 3', bankName: 'البنك الأهلي', amount: 12000, receivedDate: null, status: 'قيد التحويل', reference: 'BT-003' }
    ]);

    const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
    const [isTerminalDialogOpen, setIsTerminalDialogOpen] = useState(false);
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<any>(null);
    const [editingTerminal, setEditingTerminal] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
    };

    const handleAddBank = () => {
        setEditingBank(null);
        setIsBankDialogOpen(true);
    };

    const handleEditBank = (bank: any) => {
        setEditingBank(bank);
        setIsBankDialogOpen(true);
    };

    const handleDeleteBank = (bankId: string) => {
        const hasTerminals = terminals.some(t => t.bankId === bankId);
        if (hasTerminals) {
            toast.error('لا يمكن حذف البنك. يوجد أجهزة صراف مرتبطة به');
            return;
        }
        setBanks(banks.filter(b => b.id !== bankId));
        toast.success('تم حذف البنك بنجاح');
    };

    const handleSaveBank = () => {
        toast.success(editingBank ? 'تم تحديث البنك بنجاح' : 'تم إضافة البنك بنجاح');
        setIsBankDialogOpen(false);
        setEditingBank(null);
    };

    const handleAddTerminal = () => {
        setEditingTerminal(null);
        setIsTerminalDialogOpen(true);
    };

    const handleEditTerminal = (terminal: any) => {
        setEditingTerminal(terminal);
        setIsTerminalDialogOpen(true);
    };

    const handleDeleteTerminal = (terminalId: string) => {
        setTerminals(terminals.filter(t => t.id !== terminalId));
        toast.success('تم حذف جهاز الصراف بنجاح');
    };

    const handleSaveTerminal = () => {
        toast.success(editingTerminal ? 'تم تحديث جهاز الصراف بنجاح' : 'تم إضافة جهاز الصراف بنجاح');
        setIsTerminalDialogOpen(false);
        setEditingTerminal(null);
    };

    const handleAddTransaction = () => {
        setIsTransactionDialogOpen(true);
    };

    const handleSaveTransaction = () => {
        toast.success('تم تسجيل المعاملة بنجاح');
        setIsTransactionDialogOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'نشط': case 'مكتمل': case 'مستلم': return 'default';
            case 'معلق': case 'قيد المعالجة': case 'قيد التحويل': return 'secondary';
            case 'صيانة': return 'outline';
            case 'فشل': case 'معطل': return 'destructive';
            default: return 'outline';
        }
    };

    // Calculate statistics
    const totalBankBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);
    const activePOSCount = terminals.filter(t => t.status === 'نشط').length;
    const todayTransactions = transactions.filter(t => t.date === '2025-01-29');
    const todayAmount = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingTransfers = transfers.filter(t => t.status !== 'مستلم').length;

    return (
        <div className="space-y-4 md:space-y-6 w-full overflow-hidden">
            {/* Header */}
            <div className="text-right">
                <h1 className="text-2xl md:text-3xl font-bold">إدارة البنوك وأجهزة الصراف</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">متابعة الحسابات البنكية ونقاط البيع والمعاملات المالية</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Landmark className="w-4 h-4 text-blue-600" />
                        <CardTitle className="text-xs md:text-sm">إجمالي الأرصدة البنكية</CardTitle>
                    </CardHeader>
                    <CardContent className="text-right">
                        <div className="text-lg md:text-2xl font-bold">{formatCurrency(totalBankBalance)}</div>
                        <p className="text-xs text-gray-600 mt-1">{banks.length} بنك نشط</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <CardTitle className="text-xs md:text-sm">أجهزة الصراف النشطة</CardTitle>
                    </CardHeader>
                    <CardContent className="text-right">
                        <div className="text-lg md:text-2xl font-bold">{activePOSCount}</div>
                        <p className="text-xs text-gray-600 mt-1">من {terminals.length} جهاز</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <CardTitle className="text-xs md:text-sm">معاملات اليوم</CardTitle>
                    </CardHeader>
                    <CardContent className="text-right">
                        <div className="text-lg md:text-2xl font-bold">{formatCurrency(todayAmount)}</div>
                        <p className="text-xs text-gray-600 mt-1">{todayTransactions.length} معاملة</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <CardTitle className="text-xs md:text-sm">تحويلات معلقة</CardTitle>
                    </CardHeader>
                    <CardContent className="text-right">
                        <div className="text-lg md:text-2xl font-bold">{pendingTransfers}</div>
                        <p className="text-xs text-gray-600 mt-1">تحويل قيد الانتظار</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="banks" className="w-full overflow-hidden">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="banks">البنوك</TabsTrigger>
                    <TabsTrigger value="terminals">أجهزة الصراف</TabsTrigger>
                    <TabsTrigger value="transactions">المعاملات</TabsTrigger>
                    <TabsTrigger value="transfers">التحويلات</TabsTrigger>
                </TabsList>

                {/* Banks Tab */}
                <TabsContent value="banks" className="space-y-4 overflow-hidden">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={handleAddBank} size="sm" className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            إضافة بنك
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent dir="rtl">
                                        <DialogHeader className="text-right">
                                            <DialogTitle>{editingBank ? 'تعديل البنك' : 'إضافة بنك جديد'}</DialogTitle>
                                            <DialogDescription>قم بإدخال بيانات البنك والحساب البنكي</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>اسم البنك (عربي) *</Label>
                                                    <Input defaultValue={editingBank?.name} placeholder="البنك الأهلي السعودي" />
                                                </div>

                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>الدولة / Country</Label>
                                                    <Input defaultValue={editingBank?.country} placeholder="المملكة العربية السعودية" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>المدينة / City</Label>
                                                    <Input defaultValue={editingBank?.city} placeholder="الرياض" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>المنطقة / Region</Label>
                                                    <Input defaultValue={editingBank?.region} placeholder="حي العليا" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>رقم الحساب / Account Number *</Label>
                                                    <Input
                                                        defaultValue={editingBank?.accountNumber}
                                                        placeholder="1234567890"
                                                        dir="ltr"
                                                        className="font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>رقم الآيبان / IBAN *</Label>
                                                    <Input
                                                        defaultValue={editingBank?.iban}
                                                        placeholder="SA1234567890123456789012"
                                                        dir="ltr"
                                                        className="font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>رقم الجوال المسجل / Registered Mobile</Label>
                                                <Input
                                                    defaultValue={editingBank?.mobile}
                                                    placeholder="05xxxxxxxx"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>الرصيد الافتتاحي (ر.س)</Label>
                                                <Input
                                                    type="number"
                                                    defaultValue={editingBank?.balance}
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <Select defaultValue={editingBank?.status || 'نشط'}>
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="نشط">نشط</SelectItem>
                                                        <SelectItem value="معطل">معطل</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <div className="text-right">
                                                    <Label>حالة البنك</Label>
                                                    <p className="text-sm text-gray-600">تفعيل أو تعطيل</p>
                                                </div>
                                            </div>
                                            <Button className="w-full" onClick={handleSaveBank}>
                                                {editingBank ? 'حفظ التغييرات' : 'إضافة البنك'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <div className="text-right">
                                    <CardTitle>قائمة البنوك</CardTitle>
                                    <CardDescription>إدارة الحسابات البنكية والأرصدة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto" dir="rtl">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">اسم البنك</TableHead>
                                            <TableHead className="text-right">المدينة</TableHead>
                                            <TableHead className="text-right">رقم الحساب</TableHead>
                                            <TableHead className="text-right">الآيبان (IBAN)</TableHead>
                                            <TableHead className="text-right">الرصيد</TableHead>
                                            <TableHead className="text-right">الأجهزة المرتبطة</TableHead>
                                            <TableHead className="text-right">الحالة</TableHead>
                                            <TableHead className="text-right">إجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {banks.map((bank) => {
                                            const linkedTerminals = terminals.filter(t => t.bankId === bank.id).length;
                                            return (
                                                <TableRow key={bank.id}>
                                                    <TableCell className="text-right font-medium">{bank.name}</TableCell>
                                                    <TableCell className="text-right">{bank.city}</TableCell>
                                                    <TableCell className="text-right">
                                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{bank.accountNumber}</code>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{bank.iban}</code>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-green-600">
                                                        {formatCurrency(bank.balance)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline">{linkedTerminals} جهاز</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={getStatusColor(bank.status)}>{bank.status}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex gap-1 justify-end">
                                                            <Button variant="ghost" size="sm" onClick={() => handleEditBank(bank)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteBank(bank.id)}
                                                                disabled={linkedTerminals > 0}
                                                            >
                                                                <Trash2 className={`w-4 h-4 ${linkedTerminals > 0 ? 'text-gray-300' : 'text-red-600'}`} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* POS Terminals Tab */}
                <TabsContent value="terminals" className="space-y-4 overflow-hidden">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Dialog open={isTerminalDialogOpen} onOpenChange={setIsTerminalDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={handleAddTerminal} size="sm" className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            إضافة جهاز
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent dir="rtl">
                                        <DialogHeader className="text-right">
                                            <DialogTitle>{editingTerminal ? 'تعديل جهاز الصراف' : 'إضافة جهاز صراف جديد'}</DialogTitle>
                                            <DialogDescription>قم بإدخال بيانات جهاز نقطة البيع</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>اسم الجهاز (عربي) *</Label>
                                                    <Input defaultValue={editingTerminal?.name} placeholder="نقطة البيع 1" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Device Name (English) *</Label>
                                                    <Input defaultValue={editingTerminal?.nameEn} placeholder="POS Terminal 1" dir="ltr" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>رقم الجهاز / Device Number *</Label>
                                                <Input
                                                    defaultValue={editingTerminal?.terminalNumber}
                                                    placeholder="POS-001-2024 أو ATM-001-2024"
                                                    dir="ltr"
                                                    className="font-mono"
                                                />
                                                <p className="text-xs text-gray-500">مثال: POS-001-2024 لنقاط البيع أو ATM-001-2024 للصرافات</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>البنك المرتبط / Linked Bank *</Label>
                                                <Select defaultValue={editingTerminal?.bankId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر البنك" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {banks.map(bank => (
                                                            <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>موقع الجهاز / Device Location</Label>
                                                <Input defaultValue={editingTerminal?.location} placeholder="الفرع الرئيسي" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الموظف المسؤول / Assigned Employee</Label>
                                                <Input defaultValue={editingTerminal?.assignedTo} placeholder="أحمد محمد" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>الحد اليومي / Daily Limit</Label>
                                                    <Input type="number" defaultValue={editingTerminal?.dailyLimit} placeholder="50000" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>نسبة العمولة % / Commission Rate</Label>
                                                    <Input type="number" step="0.1" defaultValue={editingTerminal?.commission} placeholder="1.5" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <Select defaultValue={editingTerminal?.status || 'نشط'}>
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="نشط">نشط</SelectItem>
                                                        <SelectItem value="معطل">معطل</SelectItem>
                                                        <SelectItem value="صيانة">صيانة</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <div className="text-right">
                                                    <Label>حالة الجهاز</Label>
                                                    <p className="text-sm text-gray-600">تفعيل أو تعطيل</p>
                                                </div>
                                            </div>
                                            <Button className="w-full" onClick={handleSaveTerminal}>
                                                {editingTerminal ? 'حفظ التغييرات' : 'إضافة الجهاز'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <div className="text-right">
                                    <CardTitle>أجهزة الصراف ونقاط البيع</CardTitle>
                                    <CardDescription>إدارة أجهزة الدفع الإلكتروني</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="ابحث عن جهاز..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pr-10"
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto" dir="rtl">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">اسم الجهاز (عربي)</TableHead>
                                            <TableHead className="text-right">Device Name (English)</TableHead>
                                            <TableHead className="text-right">رقم الجهاز</TableHead>
                                            <TableHead className="text-right">البنك</TableHead>
                                            <TableHead className="text-right">الموقع</TableHead>
                                            <TableHead className="text-right">المسؤول</TableHead>
                                            <TableHead className="text-right">الحد اليومي</TableHead>
                                            <TableHead className="text-right">العمولة</TableHead>
                                            <TableHead className="text-right">الحالة</TableHead>
                                            <TableHead className="text-right">إجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {terminals
                                            .filter(t =>
                                                searchQuery === '' ||
                                                t.name.includes(searchQuery) ||
                                                t.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                t.terminalNumber.includes(searchQuery) ||
                                                t.location.includes(searchQuery)
                                            )
                                            .map((terminal) => (
                                                <TableRow key={terminal.id}>
                                                    <TableCell className="text-right font-medium">{terminal.name}</TableCell>
                                                    <TableCell className="text-right" dir="ltr">{terminal.nameEn}</TableCell>
                                                    <TableCell className="text-right">
                                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{terminal.terminalNumber}</code>
                                                    </TableCell>
                                                    <TableCell className="text-right">{terminal.bankName}</TableCell>
                                                    <TableCell className="text-right">{terminal.location}</TableCell>
                                                    <TableCell className="text-right">{terminal.assignedTo}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatCurrency(terminal.dailyLimit)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline">{terminal.commission}%</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={getStatusColor(terminal.status)}>{terminal.status}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex gap-1 justify-end">
                                                            <Button variant="ghost" size="sm" onClick={() => handleEditTerminal(terminal)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTerminal(terminal.id)}>
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-4 overflow-hidden">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={handleAddTransaction} size="sm" className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            تسجيل معاملة
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent dir="rtl">
                                        <DialogHeader className="text-right">
                                            <DialogTitle>تسجيل معاملة جديدة</DialogTitle>
                                            <DialogDescription>قم بإدخال بيانات معاملة نقطة البيع</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>جهاز الصراف *</Label>
                                                <Select>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر الجهاز" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {terminals.filter(t => t.status === 'نشط').map(terminal => (
                                                            <SelectItem key={terminal.id} value={terminal.id}>
                                                                {terminal.name} - {terminal.terminalNumber}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>المبلغ *</Label>
                                                <Input type="number" placeholder="0.00" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>اسم العميل (اختياري)</Label>
                                                <Input placeholder="اسم العميل" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الرقم المرجعي</Label>
                                                <Input placeholder="REF-001" dir="ltr" className="font-mono" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>ملاحظات</Label>
                                                <textarea className="w-full border rounded-lg p-2 text-right" rows={3} placeholder="أي ملاحظات إضافية..." />
                                            </div>
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-right">
                                                <p className="text-sm text-blue-800">
                                                    <strong>ملاحظة:</strong> سيتم حساب العمولة تلقائياً بناءً على إعدادات الجهاز
                                                </p>
                                            </div>
                                            <Button className="w-full" onClick={handleSaveTransaction}>
                                                تسجيل المعاملة
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <div className="text-right">
                                    <CardTitle>سجل المعاملات</CardTitle>
                                    <CardDescription>جميع معاملات نقاط البيع</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto" dir="rtl">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">رقم المعاملة</TableHead>
                                            <TableHead className="text-right">التاريخ</TableHead>
                                            <TableHead className="text-right">الجهاز</TableHead>
                                            <TableHead className="text-right">البنك</TableHead>
                                            <TableHead className="text-right">العميل</TableHead>
                                            <TableHead className="text-right">المبلغ</TableHead>
                                            <TableHead className="text-right">العمولة</TableHead>
                                            <TableHead className="text-right">الصافي</TableHead>
                                            <TableHead className="text-right">المرجع</TableHead>
                                            <TableHead className="text-right">الحالة</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="text-right">
                                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{transaction.id}</code>
                                                </TableCell>
                                                <TableCell className="text-right">{transaction.date}</TableCell>
                                                <TableCell className="text-right">{transaction.terminalName}</TableCell>
                                                <TableCell className="text-right">{transaction.bankName}</TableCell>
                                                <TableCell className="text-right">{transaction.customer}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(transaction.amount)}</TableCell>
                                                <TableCell className="text-right text-red-600">-{formatCurrency(transaction.commission)}</TableCell>
                                                <TableCell className="text-right font-bold text-green-600">{formatCurrency(transaction.netAmount)}</TableCell>
                                                <TableCell className="text-right">
                                                    <code className="text-xs">{transaction.reference}</code>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bank Transfers Tab */}
                <TabsContent value="transfers" className="space-y-4 overflow-hidden">
                    <Card className="overflow-hidden">
                        <CardHeader className="text-right">
                            <CardTitle>التحويلات البنكية</CardTitle>
                            <CardDescription>متابعة التحويلات من أجهزة الصراف إلى البنوك</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto" dir="rtl">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">رقم التحويل</TableHead>
                                            <TableHead className="text-right">تاريخ التحويل</TableHead>
                                            <TableHead className="text-right">من الجهاز</TableHead>
                                            <TableHead className="text-right">إلى البنك</TableHead>
                                            <TableHead className="text-right">المبلغ</TableHead>
                                            <TableHead className="text-right">تاريخ الاستلام</TableHead>
                                            <TableHead className="text-right">المرجع</TableHead>
                                            <TableHead className="text-right">الحالة</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transfers.map((transfer) => (
                                            <TableRow key={transfer.id}>
                                                <TableCell className="text-right">
                                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{transfer.id}</code>
                                                </TableCell>
                                                <TableCell className="text-right">{transfer.date}</TableCell>
                                                <TableCell className="text-right">{transfer.terminalName}</TableCell>
                                                <TableCell className="text-right">{transfer.bankName}</TableCell>
                                                <TableCell className="text-right font-bold text-blue-600">{formatCurrency(transfer.amount)}</TableCell>
                                                <TableCell className="text-right">
                                                    {transfer.receivedDate || <span className="text-gray-400">-</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <code className="text-xs">{transfer.reference}</code>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={getStatusColor(transfer.status)}>{transfer.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
