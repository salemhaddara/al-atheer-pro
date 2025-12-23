'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Search, Filter, FileText, DollarSign, TrendingUp, TrendingDown, Download, Eye, ShoppingCart, Package, Warehouse, Receipt, ArrowRightLeft, Zap, BookOpen, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getAllJournalEntries, getEntriesByType, addJournalEntry, type JournalEntry } from '../data/journalEntries';
import { useLanguage } from '../contexts/LanguageContext';

export function Accounting() {
  const { t, direction } = useLanguage();
  // Load entries from central storage
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    // Load entries on component mount
    const loadEntries = () => {
      const entries = getAllJournalEntries();
      setAllEntries(prevEntries => {
        // Only update if entries actually changed
        if (JSON.stringify(entries) !== JSON.stringify(prevEntries)) {
          return entries;
        }
        return prevEntries;
      });
    };

    loadEntries();

    // Use a longer interval instead of frequent polling for better performance
    // Refresh every 10 seconds instead of 2 seconds
    const interval = setInterval(loadEntries, 10000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount

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
  const [showAddEntryPage, setShowAddEntryPage] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: ''
  });

  // Multiple debit and credit accounts
  const [debitEntries, setDebitEntries] = useState<Array<{ account: string; amount: number }>>([
    { account: '', amount: 0 }
  ]);
  const [creditEntries, setCreditEntries] = useState<Array<{ account: string; amount: number }>>([
    { account: '', amount: 0 }
  ]);

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

  const handleAddEntry = () => {
    // Validate that all debit and credit entries have accounts and amounts
    const validDebitEntries = debitEntries.filter(e => e.account && e.amount > 0);
    const validCreditEntries = creditEntries.filter(e => e.account && e.amount > 0);

    if (validDebitEntries.length === 0 || validCreditEntries.length === 0) {
      toast.error(t('accounting.errors.addDebitCredit'));
      return;
    }

    // Calculate totals
    const totalDebit = validDebitEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalCredit = validCreditEntries.reduce((sum, e) => sum + e.amount, 0);

    // Validate that debit total equals credit total
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      const errorMsg = t('accounting.errors.balanceMismatch').replace('{debit}', totalDebit.toFixed(2)).replace('{credit}', totalCredit.toFixed(2));
      toast.error(errorMsg);
      return;
    }

    if (!formData.description) {
      toast.error(t('accounting.errors.descriptionRequired'));
      return;
    }

    // Create journal entries
    // Strategy: Distribute each debit entry proportionally across all credit entries
    const baseId = Date.now();
    const entries: JournalEntry[] = [];

    validDebitEntries.forEach((debitEntry, debitIdx) => {
      const debitAmount = debitEntry.amount;

      // Calculate how much of this debit should go to each credit account
      validCreditEntries.forEach((creditEntry, creditIdx) => {
        // Proportional distribution: each credit gets (creditAmount / totalCredit) of each debit
        const creditProportion = creditEntry.amount / totalCredit;
        const allocatedAmount = debitAmount * creditProportion;

        if (allocatedAmount > 0.01) {
          entries.push({
            id: `JE-${baseId}-${debitIdx}-${creditIdx}`,
            date: formData.date,
            description: formData.description,
            debitAccount: debitEntry.account,
            creditAccount: creditEntry.account,
            amount: Math.round(allocatedAmount * 100) / 100, // Round to 2 decimal places
            reference: formData.reference || `REF-${baseId}`,
            status: 'مُعتمد',
            type: 'manual',
            createdAt: new Date().toISOString()
          });
        }
      });
    });

    // Add all entries
    entries.forEach(entry => addJournalEntry(entry));
    setAllEntries(getAllJournalEntries());
    const successMsg = t('accounting.success.entriesAdded').replace('{count}', entries.length.toString());
    toast.success(successMsg);

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: ''
    });
    setDebitEntries([{ account: '', amount: 0 }]);
    setCreditEntries([{ account: '', amount: 0 }]);
    setShowAddEntryPage(false);
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
        return t('accounting.operationTypes.sale');
      case 'شراء':
        return t('accounting.operationTypes.purchase');
      case 'مخزون_توريد':
        return t('accounting.operationTypes.inventorySupply');
      case 'مخزون_صرف':
        return t('accounting.operationTypes.inventoryDisbursement');
      case 'مخزون_تسوية':
        return t('accounting.operationTypes.inventoryAdjustment');
      case 'مخزون_أول_مدة':
        return t('accounting.operationTypes.openingInventory');
      case 'سند_قبض':
        return t('accounting.operationTypes.receiptVoucher');
      case 'سند_صرف':
        return t('accounting.operationTypes.paymentVoucher');
      case 'افتتاحي':
        return t('accounting.operationTypes.opening');
      default:
        return t('accounting.general');
    }
  };

  const totalAutoEntries = autoEntries.length;
  const totalManualEntries = manualEntries.length;
  const totalAutoAmount = autoEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalManualAmount = manualEntries.reduce((sum, e) => sum + e.amount, 0);

  // Show add entry page if showAddEntryPage is true
  if (showAddEntryPage) {
    return (
      <div className="space-y-6" dir={direction}>
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowAddEntryPage(false)} className="gap-2">
              {direction === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              {t('accounting.back')}
            </Button>
            <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
              <h1 className="text-3xl font-bold">{t('accounting.addManualEntry')}</h1>
              <p className="text-gray-600">{t('accounting.addManualEntryDesc')}</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('accounting.date')}</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('accounting.reference')}</Label>
                  <Input
                    placeholder={t('accounting.referencePlaceholder')}
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('accounting.description')}</Label>
                <Input
                  placeholder={t('accounting.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Debit and Credit Sections */}
              <div className="grid grid-cols-2 gap-6">
                {/* Debit Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-red-600">{t('accounting.debitAccounts')}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDebitEntries([...debitEntries, { account: '', amount: 0 }])}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('accounting.addAccountToEntry')}
                    </Button>
                  </div>
                  <div className="space-y-3 border rounded-lg p-4 bg-red-50">
                    {debitEntries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-[1fr_auto_120px] gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-sm">{t('accounting.account')}</Label>
                          <Select
                            value={entry.account}
                            onValueChange={(value) => {
                              const newEntries = [...debitEntries];
                              newEntries[index].account = value;
                              setDebitEntries(newEntries);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('accounting.account')} />
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
                        <div className="space-y-1">
                          <Label className="text-sm">{t('accounting.amount')}</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={entry.amount || ''}
                            onChange={(e) => {
                              const newEntries = [...debitEntries];
                              newEntries[index].amount = Number(e.target.value) || 0;
                              setDebitEntries(newEntries);
                            }}
                            className="w-32"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (debitEntries.length > 1) {
                              setDebitEntries(debitEntries.filter((_, i) => i !== index));
                            } else {
                              toast.error('يجب أن يكون هناك حساب مدين واحد على الأقل');
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{t('accounting.total')}:</span>
                        <span className="font-bold text-red-600">
                          {formatCurrency(debitEntries.reduce((sum, e) => sum + (e.amount || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-green-600">{t('accounting.creditAccounts')}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCreditEntries([...creditEntries, { account: '', amount: 0 }])}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('accounting.addAccountToEntry')}
                    </Button>
                  </div>
                  <div className="space-y-3 border rounded-lg p-4 bg-green-50">
                    {creditEntries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-[1fr_auto_120px] gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-sm">{t('accounting.account')}</Label>
                          <Select
                            value={entry.account}
                            onValueChange={(value) => {
                              const newEntries = [...creditEntries];
                              newEntries[index].account = value;
                              setCreditEntries(newEntries);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('accounting.account')} />
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
                        <div className="space-y-1">
                          <Label className="text-sm">{t('accounting.amount')}</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={entry.amount || ''}
                            onChange={(e) => {
                              const newEntries = [...creditEntries];
                              newEntries[index].amount = Number(e.target.value) || 0;
                              setCreditEntries(newEntries);
                            }}
                            className="w-32"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (creditEntries.length > 1) {
                              setCreditEntries(creditEntries.filter((_, i) => i !== index));
                            } else {
                              toast.error(t('accounting.errors.minCreditAccount'));
                            }
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{t('accounting.total')}:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(creditEntries.reduce((sum, e) => sum + (e.amount || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('accounting.difference')}:</span>
                  <span className={`font-bold text-lg ${Math.abs(
                    debitEntries.reduce((sum, e) => sum + (e.amount || 0), 0) -
                    creditEntries.reduce((sum, e) => sum + (e.amount || 0), 0)
                  ) < 0.01 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {formatCurrency(
                      debitEntries.reduce((sum, e) => sum + (e.amount || 0), 0) -
                      creditEntries.reduce((sum, e) => sum + (e.amount || 0), 0)
                    )}
                  </span>
                </div>
                {Math.abs(
                  debitEntries.reduce((sum, e) => sum + (e.amount || 0), 0) -
                  creditEntries.reduce((sum, e) => sum + (e.amount || 0), 0)
                ) >= 0.01 && (
                    <p className="text-sm text-red-600 mt-2">⚠️ {t('accounting.balanceWarning')}</p>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleAddEntry} className="flex-1" size="lg">
                  {t('accounting.saveEntry')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={() => {
                    setShowAddEntryPage(false);
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      reference: '',
                      description: ''
                    });
                    setDebitEntries([{ account: '', amount: 0 }]);
                    setCreditEntries([{ account: '', amount: 0 }]);
                  }}
                >
                  {t('accounting.cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main page
  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={`${direction === 'rtl' ? 'text-right' : 'text-left'} flex-1`}>
          <h1 className="text-3xl font-bold">{t('accounting.title')}</h1>
          <p className="text-gray-600">{t('accounting.subtitle')}</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setShowAddEntryPage(true)}>
          <Plus className="w-4 h-4" />
          {t('accounting.addEntry')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            <CardTitle className="text-sm">{t('accounting.autoEntries')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl font-bold">{totalAutoEntries}</div>
            <p className="text-xs text-gray-600 mt-1">{t('accounting.totalAmount')}: {formatCurrency(totalAutoAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">{t('accounting.manualEntries')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl font-bold">{totalManualEntries}</div>
            <p className="text-xs text-gray-600 mt-1">{t('accounting.totalAmount')}: {formatCurrency(totalManualAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">{t('accounting.totalAssets')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl">{formatCurrency(977000)}</div>
            <p className="text-xs text-gray-600 mt-1">+12% {t('accounting.previousMonth')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">{t('accounting.totalEntries')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl font-bold">{allEntries.length}</div>
            <p className="text-xs text-gray-600 mt-1">{t('accounting.totalAmount')}: {formatCurrency(totalAutoAmount + totalManualAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="entries" className="w-full" dir={direction}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entries">{t('accounting.journalEntries')}</TabsTrigger>
          <TabsTrigger value="accounts">{t('accounting.chartOfAccounts')}</TabsTrigger>
          <TabsTrigger value="currencies">{t('accounting.currencies')}</TabsTrigger>
          <TabsTrigger value="taxes">{t('accounting.taxes')}</TabsTrigger>
        </TabsList>

        {/* Journal Entries */}
        <TabsContent value="entries" className="space-y-4 mt-4" dir={direction}>
          <Card>
            <CardHeader dir={direction}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'auto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('auto')}
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    {t('accounting.autoEntries')} ({totalAutoEntries})
                  </Button>
                  <Button
                    variant={activeTab === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('manual')}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {t('accounting.manualEntries')} ({totalManualEntries})
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
                      <SelectValue placeholder={t('accounting.filterByType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('accounting.allTypes')}</SelectItem>
                      <SelectItem value="بيع">{t('accounting.operationTypes.salesOperations')}</SelectItem>
                      <SelectItem value="شراء">{t('accounting.operationTypes.purchaseOperations')}</SelectItem>
                      <SelectItem value="مخزون_توريد">{t('accounting.operationTypes.inventorySupply')}</SelectItem>
                      <SelectItem value="مخزون_صرف">{t('accounting.operationTypes.inventoryDisbursement')}</SelectItem>
                      <SelectItem value="مخزون_تسوية">{t('accounting.operationTypes.inventoryAdjustment')}</SelectItem>
                      <SelectItem value="مخزون_أول_مدة">{t('accounting.operationTypes.openingInventory')}</SelectItem>
                      <SelectItem value="سند_قبض">{t('accounting.operationTypes.receiptVouchers')}</SelectItem>
                      <SelectItem value="سند_صرف">{t('accounting.operationTypes.paymentVouchers')}</SelectItem>
                      <SelectItem value="افتتاحي">{t('accounting.operationTypes.openingEntries')}</SelectItem>
                      <SelectItem value="مرتجع_مبيعات">{t('accounting.operationTypes.salesReturns')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    {t('accounting.export')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                  <Input
                    placeholder={t('accounting.searchPlaceholder')}
                    className={direction === 'rtl' ? 'pr-10 text-right' : 'pl-10 text-left'}
                    dir={direction}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full overflow-auto" style={{ maxHeight: '600px' }}>
                <div dir={direction}>
                  <Table dir={direction} className="min-w-[1200px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.type')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.entryNumber')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.date')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.description')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.debit')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.credit')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.amount')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.reference')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.status')}</TableHead>
                        <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
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
                                <FileText className={`w-4 h-4 inline ${direction === 'rtl' ? 'mr-1' : 'ml-1'}`} />
                                {t('accounting.general')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className={`${direction === 'rtl' ? 'text-right' : 'text-left'} font-medium`}>{entry.id}</TableCell>
                          <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{entry.date}</TableCell>
                          <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{entry.description}</TableCell>
                          <TableCell className={`${direction === 'rtl' ? 'text-right' : 'text-left'} text-red-600`}>{entry.debitAccount}</TableCell>
                          <TableCell className={`${direction === 'rtl' ? 'text-right' : 'text-left'} text-green-600`}>{entry.creditAccount}</TableCell>
                          <TableCell className={`${direction === 'rtl' ? 'text-right' : 'text-left'} font-semibold`}>{formatCurrency(entry.amount)}</TableCell>
                          <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                            {entry.sourceReference ? (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-blue-600 hover:underline"
                                onClick={() => toast.info(`${t('accounting.openReference')}: ${entry.sourceReference}`)}
                              >
                                {entry.reference}
                              </Button>
                            ) : (
                              <span>{entry.reference}</span>
                            )}
                          </TableCell>
                          <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                            <Badge variant={
                              entry.status === 'مُعتمد' ? 'default' : 
                              entry.status === 'قيد المراجعة' ? 'secondary' : 
                              'destructive'
                            }>
                              {entry.status === 'مُعتمد' ? t('accounting.statuses.approved') : 
                               entry.status === 'قيد المراجعة' ? t('accounting.statuses.underReview') : 
                               entry.status === 'ملغي' ? t('accounting.statuses.rejected') : 
                               entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toast.info(t('accounting.viewDetails'))}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {entry.type === 'auto' && entry.sourceReference && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toast.info(`${t('accounting.openSource')}: ${entry.sourceReference}`)}
                                  title={t('accounting.openSource')}
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
                            {t('accounting.noEntries')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart of Accounts */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader dir={direction}>
              <div className="flex items-center justify-between" dir={direction}>
                <div className="text-right">
                  <CardTitle>{t('accounting.chartOfAccounts')}</CardTitle>
                  <CardDescription>{t('accounting.chartOfAccountsDesc')}</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('accounting.newAccount')}
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <div dir={direction}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">{t('accounting.accountCode')}</TableHead>
                      <TableHead className="text-left">{t('accounting.accountName')}</TableHead>
                      <TableHead className="text-left">{t('accounting.accountType')}</TableHead>
                      <TableHead className="text-left">{t('accounting.balance')}</TableHead>
                      <TableHead className="text-left">{t('accounting.currency')}</TableHead>
                      <TableHead className="text-right">{t('accounting.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{account.code}</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{account.name}</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <Badge variant="outline">{account.type}</Badge>
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{formatCurrency(account.balance)}</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{account.currency}</TableCell>
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
        <TabsContent value="currencies" className="space-y-4" dir={direction}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <CardTitle>{t('accounting.currencies')}</CardTitle>
                  <CardDescription>{t('accounting.currenciesDesc')}</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('accounting.addNewCurrency')}
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <div dir={direction}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.currencyCode')}</TableHead>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.currencyName')}</TableHead>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.currencySymbol')}</TableHead>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.exchangeRate')}</TableHead>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency.code}>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{currency.code}</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{currency.name}</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{currency.symbol}</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{currency.rate.toFixed(2)}</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <Button variant="ghost" size="sm">{t('accounting.updateRate')}</Button>
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
        <TabsContent value="taxes" className="space-y-4" dir={direction}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <CardTitle>{t('accounting.taxManagement')}</CardTitle>
                  <CardDescription>{t('accounting.taxManagementDesc')}</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('accounting.newTax')}
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <div dir={direction}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.taxName')}</TableHead>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.taxRate')}</TableHead>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.taxType')}</TableHead>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.taxStatus')}</TableHead>
                      <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxRates.map((tax, index) => (
                      <TableRow key={index}>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{tax.name}</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>{tax.rate}%</TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <Badge variant="outline">{tax.type}</Badge>
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <Badge variant={tax.active ? 'default' : 'secondary'}>
                            {tax.active ? t('accounting.active') : t('accounting.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <Button variant="ghost" size="sm">{t('accounting.edit')}</Button>
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
