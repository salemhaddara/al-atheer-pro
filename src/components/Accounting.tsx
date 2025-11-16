import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Search, Filter, FileText, DollarSign, TrendingUp, TrendingDown, Download, Eye, ShoppingCart, Package, Warehouse, Receipt, ArrowRightLeft, Zap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { getAllJournalEntries, getEntriesByType, addJournalEntry, type JournalEntry } from '../data/journalEntries';

export function Accounting() {
  // Load entries from central storage
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    // Load entries on component mount
    const entries = getAllJournalEntries();
    setAllEntries(entries);

    // Set up interval to refresh entries (in case they're updated from other components)
    const interval = setInterval(() => {
      const updatedEntries = getAllJournalEntries();
      setAllEntries(updatedEntries);
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Separate auto and manual entries
  const autoEntries = useMemo(() => allEntries.filter(e => e.type === 'auto'), [allEntries]);
  const manualEntries = useMemo(() => allEntries.filter(e => e.type === 'manual'), [allEntries]);

  // القيود اليدوية (الحالية) - Default entries for initial setup
  const [defaultManualEntries] = useState<JournalEntry[]>([
    {
      id: 'JE-001',
      date: '2025-01-15',
      description: 'قيد افتتاحي - رأس المال',
      debitAccount: 'الصندوق',
      creditAccount: 'رأس المال',
      amount: 500000,
      reference: 'REF-001',
      status: 'مُعتمد',
      type: 'manual',
      operationType: 'افتتاحي',
      createdAt: new Date().toISOString()
    },
    {
      id: 'JE-002',
      date: '2025-01-20',
      description: 'شراء معدات مكتبية',
      debitAccount: 'المعدات',
      creditAccount: 'البنك',
      amount: 15000,
      reference: 'REF-002',
      status: 'مُعتمد',
      type: 'manual',
      createdAt: new Date().toISOString()
    },
    {
      id: 'JE-003',
      date: '2025-01-25',
      description: 'دفع إيجار المكتب - يناير',
      debitAccount: 'مصروفات الإيجار',
      creditAccount: 'الصندوق',
      amount: 8000,
      reference: 'REF-003',
      status: 'قيد المراجعة',
      type: 'manual',
      createdAt: new Date().toISOString()
    }
  ]);

  // Initialize default entries if storage is empty
  useEffect(() => {
    if (allEntries.length === 0 && typeof window !== 'undefined') {
      // Initialize with default manual entries only
      defaultManualEntries.forEach(entry => {
        addJournalEntry(entry);
      });
      setAllEntries(getAllJournalEntries());
    }
  }, []); // Run only once on mount

  const [accounts, setAccounts] = useState([
    { code: '1000', name: 'الصندوق', type: 'أصول', balance: 477000, currency: 'ريال' },
    { code: '1100', name: 'البنك', type: 'أصول', balance: 485000, currency: 'ريال' },
    { code: '1200', name: 'المعدات', type: 'أصول', balance: 15000, currency: 'ريال' },
    { code: '1300', name: 'المخزون', type: 'أصول', balance: 150000, currency: 'ريال' },
    { code: '1400', name: 'العملاء', type: 'أصول', balance: 32000, currency: 'ريال' },
    { code: '2000', name: 'رأس المال', type: 'حقوق ملكية', balance: 500000, currency: 'ريال' },
    { code: '2100', name: 'الموردين', type: 'خصوم', balance: 50000, currency: 'ريال' },
    { code: '3000', name: 'مصروفات الإيجار', type: 'مصروفات', balance: 8000, currency: 'ريال' },
    { code: '4000', name: 'إيرادات المبيعات', type: 'إيرادات', balance: 125000, currency: 'ريال' },
    { code: '4100', name: 'إيرادات الخدمات', type: 'إيرادات', balance: 1500, currency: 'ريال' }
  ]);

  const [currencies, setCurrencies] = useState([
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 1.00 },
    { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 3.75 },
    { code: 'EUR', name: 'يورو', symbol: '€', rate: 4.10 },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 1.02 }
  ]);

  const [taxRates, setTaxRates] = useState([
    { name: 'ضريبة القيمة المضافة (15%)', rate: 15, type: 'مبيعات وشراء', active: true },
    { name: 'ضريبة استقطاع (5%)', rate: 5, type: 'خدمات', active: true },
    { name: 'معفى من الضريبة', rate: 0, type: 'سلع أساسية', active: true }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | JournalEntry['operationType']>('all');
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    debitAccount: '',
    creditAccount: '',
    amount: 0
  });

  // فلترة القيود
  const filteredEntries = useMemo(() => {
    let entries = activeTab === 'auto' ? autoEntries : manualEntries;

    // فلترة حسب نوع العملية
    if (filterType !== 'all') {
      entries = entries.filter(entry => entry.operationType === filterType);
    }

    // فلترة حسب البحث
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      entries = entries.filter(entry =>
        entry.description.toLowerCase().includes(term) ||
        entry.reference.toLowerCase().includes(term) ||
        entry.debitAccount.toLowerCase().includes(term) ||
        entry.creditAccount.toLowerCase().includes(term)
      );
    }

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [autoEntries, manualEntries, activeTab, filterType, searchTerm]);

  const handleAddEntry = (formData: {
    date: string;
    reference: string;
    description: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
  }) => {
    const newEntry: JournalEntry = {
      id: `JE-${Date.now()}`,
      date: formData.date,
      description: formData.description,
      debitAccount: formData.debitAccount,
      creditAccount: formData.creditAccount,
      amount: formData.amount,
      reference: formData.reference,
      status: 'مُعتمد',
      type: 'manual',
      createdAt: new Date().toISOString()
    };

    addJournalEntry(newEntry);
    setAllEntries(getAllJournalEntries());
    toast.success('تم إضافة القيد المحاسبي بنجاح');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getOperationIcon = (type?: JournalEntry['operationType']) => {
    switch (type) {
      case 'بيع':
        return <ShoppingCart className="w-4 h-4" />;
      case 'شراء':
        return <Package className="w-4 h-4" />;
      case 'مخزون_توريد':
      case 'مخزون_صرف':
      case 'مخزون_تسوية':
      case 'مخزون_أول_مدة':
        return <Warehouse className="w-4 h-4" />;
      case 'سند_قبض':
      case 'سند_صرف':
        return <Receipt className="w-4 h-4" />;
      case 'افتتاحي':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getOperationBadgeColor = (type?: JournalEntry['operationType']) => {
    switch (type) {
      case 'بيع':
        return 'bg-green-100 text-green-700';
      case 'شراء':
        return 'bg-blue-100 text-blue-700';
      case 'مخزون_توريد':
      case 'مخزون_صرف':
      case 'مخزون_تسوية':
      case 'مخزون_أول_مدة':
        return 'bg-orange-100 text-orange-700';
      case 'سند_قبض':
        return 'bg-emerald-100 text-emerald-700';
      case 'سند_صرف':
        return 'bg-red-100 text-red-700';
      case 'افتتاحي':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOperationLabel = (type?: JournalEntry['operationType']) => {
    switch (type) {
      case 'بيع':
        return 'بيع';
      case 'شراء':
        return 'شراء';
      case 'مخزون_توريد':
        return 'توريد مخزون';
      case 'مخزون_صرف':
        return 'صرف مخزون';
      case 'مخزون_تسوية':
        return 'تسوية مخزون';
      case 'مخزون_أول_مدة':
        return 'مخزون أول المدة';
      case 'سند_قبض':
        return 'سند قبض';
      case 'سند_صرف':
        return 'سند صرف';
      case 'افتتاحي':
        return 'قيد افتتاحي';
      default:
        return 'عام';
    }
  };

  const totalAutoEntries = autoEntries.length;
  const totalManualEntries = manualEntries.length;
  const totalAutoAmount = autoEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalManualAmount = manualEntries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1 className="text-3xl font-bold">المحاسبة والمالية</h1>
          <p className="text-gray-600">إدارة القيود المحاسبية التلقائية واليدوية والحسابات المالية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              قيد محاسبي جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>إضافة قيد محاسبي يدوي</DialogTitle>
              <DialogDescription>
                قم بإدخال تفاصيل القيد المحاسبي (القيود التلقائية تُنشأ تلقائياً من العمليات)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم المرجع</Label>
                  <Input
                    placeholder="REF-004"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input
                  placeholder="وصف القيد المحاسبي"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الحساب المدين</Label>
                  <Select value={formData.debitAccount} onValueChange={(value) => setFormData({ ...formData, debitAccount: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.code} value={account.name}>
                          {account.name} ({account.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الحساب الدائن</Label>
                  <Select value={formData.creditAccount} onValueChange={(value) => setFormData({ ...formData, creditAccount: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.code} value={account.name}>
                          {account.name} ({account.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (!formData.debitAccount || !formData.creditAccount || !formData.amount || !formData.description) {
                    toast.error('يرجى ملء جميع الحقول المطلوبة');
                    return;
                  }
                  handleAddEntry(formData);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    reference: '',
                    description: '',
                    debitAccount: '',
                    creditAccount: '',
                    amount: 0
                  });
                  setIsDialogOpen(false);
                }} className="flex-1">حفظ القيد</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            <CardTitle className="text-sm">القيود التلقائية</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{totalAutoEntries}</div>
            <p className="text-xs text-gray-600 mt-1">إجمالي المبلغ: {formatCurrency(totalAutoAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">القيود اليدوية</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{totalManualEntries}</div>
            <p className="text-xs text-gray-600 mt-1">إجمالي المبلغ: {formatCurrency(totalManualAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">إجمالي الأصول</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(977000)}</div>
            <p className="text-xs text-gray-600 mt-1">+12% عن الشهر السابق</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">إجمالي القيود</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{allEntries.length}</div>
            <p className="text-xs text-gray-600 mt-1">إجمالي المبلغ: {formatCurrency(totalAutoAmount + totalManualAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="entries" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entries">القيود المحاسبية</TabsTrigger>
          <TabsTrigger value="accounts">دليل الحسابات</TabsTrigger>
          <TabsTrigger value="currencies">العملات</TabsTrigger>
          <TabsTrigger value="taxes">الضرائب</TabsTrigger>
        </TabsList>

        {/* Journal Entries */}
        <TabsContent value="entries" className="space-y-4 mt-4" dir="rtl">
          <Card>
            <CardHeader dir="rtl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'auto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('auto')}
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    القيود التلقائية ({totalAutoEntries})
                  </Button>
                  <Button
                    variant={activeTab === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('manual')}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    القيود اليدوية ({totalManualEntries})
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={(value: string) => {
                    const validTypes: Array<'all' | JournalEntry['operationType']> = ['all', 'بيع', 'شراء', 'مخزون_توريد', 'مخزون_صرف', 'مخزون_تسوية', 'مخزون_أول_مدة', 'سند_قبض', 'سند_صرف', 'افتتاحي', 'مرتجع_مبيعات'];
                    if (validTypes.includes(value as any)) {
                      setFilterType(value as typeof filterType);
                    }
                  }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="فلترة حسب النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="بيع">عمليات البيع</SelectItem>
                      <SelectItem value="شراء">عمليات الشراء</SelectItem>
                      <SelectItem value="مخزون_توريد">توريد مخزون</SelectItem>
                      <SelectItem value="مخزون_صرف">صرف مخزون</SelectItem>
                      <SelectItem value="مخزون_تسوية">تسوية مخزون</SelectItem>
                      <SelectItem value="مخزون_أول_مدة">مخزون أول المدة</SelectItem>
                      <SelectItem value="سند_قبض">سندات القبض</SelectItem>
                      <SelectItem value="سند_صرف">سندات الصرف</SelectItem>
                      <SelectItem value="افتتاحي">قيود افتتاحية</SelectItem>
                      <SelectItem value="مرتجع_مبيعات">مرتجعات المبيعات</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    تصدير
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="بحث في القيود..."
                    className="pl-10 text-right"
                    dir="rtl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="h-[600px]">
                <div dir="rtl">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">رقم القيد</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">المدين</TableHead>
                        <TableHead className="text-right">الدائن</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">المرجع</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-right">
                            {entry.operationType && (
                              <Badge className={getOperationBadgeColor(entry.operationType)}>
                                <span className="flex items-center gap-1">
                                  {getOperationIcon(entry.operationType)}
                                  {getOperationLabel(entry.operationType)}
                                </span>
                              </Badge>
                            )}
                            {!entry.operationType && (
                              <Badge variant="outline">
                                <FileText className="w-4 h-4 inline mr-1" />
                                عام
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">{entry.id}</TableCell>
                          <TableCell className="text-right">{entry.date}</TableCell>
                          <TableCell className="text-right">{entry.description}</TableCell>
                          <TableCell className="text-right text-red-600">{entry.debitAccount}</TableCell>
                          <TableCell className="text-right text-green-600">{entry.creditAccount}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(entry.amount)}</TableCell>
                          <TableCell className="text-right">
                            {entry.sourceReference ? (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-blue-600 hover:underline"
                                onClick={() => toast.info(`فتح المرجع: ${entry.sourceReference}`)}
                              >
                                {entry.reference}
                              </Button>
                            ) : (
                              <span>{entry.reference}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={entry.status === 'مُعتمد' ? 'default' : entry.status === 'قيد المراجعة' ? 'secondary' : 'destructive'}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toast.info('عرض تفاصيل القيد')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {entry.type === 'auto' && entry.sourceReference && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toast.info(`فتح العملية الأصلية: ${entry.sourceReference}`)}
                                  title="فتح العملية الأصلية"
                                >
                                  <ArrowRightLeft className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredEntries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                            لا توجد قيود مطابقة للبحث أو الفلترة المحددة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart of Accounts */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader dir="rtl">
              <div className="flex items-center justify-between" dir="rtl">
                <div className="text-right">
                  <CardTitle>دليل الحسابات</CardTitle>
                  <CardDescription>إدارة الحسابات المحاسبية</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  حساب جديد
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رمز الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                      <TableHead className="text-right">العملة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className="text-right">{account.code}</TableCell>
                        <TableCell className="text-right">{account.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{account.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                        <TableCell className="text-right">{account.currency}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">تعديل</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currencies */}
        <TabsContent value="currencies" className="space-y-4" dir="rtl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <CardTitle>إدارة العملات</CardTitle>
                  <CardDescription>تحديث أسعار صرف العملات</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  عملة جديدة
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الرمز</TableHead>
                      <TableHead className="text-right">اسم العملة</TableHead>
                      <TableHead className="text-right">الرمز</TableHead>
                      <TableHead className="text-right">سعر الصرف (مقابل الريال)</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency.code}>
                        <TableCell className="text-right">{currency.code}</TableCell>
                        <TableCell className="text-right">{currency.name}</TableCell>
                        <TableCell className="text-right">{currency.symbol}</TableCell>
                        <TableCell className="text-right">{currency.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">تحديث السعر</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Management */}
        <TabsContent value="taxes" className="space-y-4" dir="rtl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <CardTitle>إدارة الضرائب</CardTitle>
                  <CardDescription>إعداد وإدارة الضرائب المختلفة</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  ضريبة جديدة
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الضريبة</TableHead>
                      <TableHead className="text-right">النسبة (%)</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxRates.map((tax, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-right">{tax.name}</TableCell>
                        <TableCell className="text-right">{tax.rate}%</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{tax.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={tax.active ? 'default' : 'secondary'}>
                            {tax.active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">تعديل</Button>
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
