import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, FileText, } from 'lucide-react';
import { toast } from 'sonner';
import { createCashReceiptEntry, addJournalEntry } from '../data/journalEntries';
import { addToSafe, getSafeBalance } from '../data/safes';
import { SearchableSelect } from './ui/searchable-select';
import {
  loadReceiptVouchers,
  addReceiptVoucher,
  updateReceiptVoucher,
  deleteReceiptVoucher,
  generateReceiptVoucherNumber,
  loadOtherSources,
  type ReceiptVoucher
} from '../data/vouchers';

export function ReceiptVouchers() {
  const [vouchers, setVouchers] = useState<ReceiptVoucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ReceiptVoucher['status']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<ReceiptVoucher | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'card',
    fromType: 'customer' as 'customer' | 'other',
    fromId: '',
    fromName: '',
    amount: 0,
    description: '',
    safeId: 'main',
    bankAccount: ''
  });

  // Load vouchers on mount
  useEffect(() => {
    setVouchers(loadReceiptVouchers());
  }, []);

  // Load customers from POS component (shared data structure)
  const customers = useMemo(() => [
    { id: 'general', name: 'عميل عام', accountNumber: 'ACC-GEN', phone: '' },
    { id: '1', name: 'شركة النجاح التقنية', accountNumber: 'ACC-001', phone: '0501234567' },
    { id: '2', name: 'مؤسسة الريادة للخدمات', accountNumber: 'ACC-002', phone: '0502222222' },
    { id: '3', name: 'شركة التميز للاستثمار', accountNumber: 'ACC-003', phone: '0503333333' },
  ], []);

  // Load other sources
  const otherSources = useMemo(() => loadOtherSources(), []);

  // Load safes
  const safes = useMemo(() => [
    { id: 'main', name: 'الخزينة الرئيسية', balance: getSafeBalance('main') },
    { id: 'pos', name: 'خزينة نقاط البيع', balance: getSafeBalance('pos') },
  ], []);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      const matchesSearch = !searchTerm.trim() ||
        voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || voucher.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [vouchers, searchTerm, filterStatus]);

  const handleAddNew = () => {
    setEditingVoucher(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      fromType: 'customer',
      fromId: '',
      fromName: '',
      amount: 0,
      description: '',
      safeId: 'main',
      bankAccount: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (voucher: ReceiptVoucher) => {
    setEditingVoucher(voucher);

    // If it's "other" type and no fromId, try to find by name
    let fromId = voucher.fromId || '';
    if (voucher.fromType === 'other' && !fromId && voucher.fromName) {
      const foundSource = otherSources.find(s => s.name === voucher.fromName);
      if (foundSource) {
        fromId = foundSource.id;
      }
    }

    setFormData({
      date: voucher.date,
      paymentMethod: voucher.paymentMethod,
      fromType: voucher.fromType,
      fromId: fromId,
      fromName: voucher.fromName,
      amount: voucher.amount,
      description: voucher.description,
      safeId: voucher.safeId || 'main',
      bankAccount: voucher.bankAccount || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السند؟')) return;

    if (deleteReceiptVoucher(id)) {
      setVouchers(loadReceiptVouchers());
      toast.success('تم حذف السند بنجاح');
    } else {
      toast.error('فشل حذف السند');
    }
  };

  const handleSave = () => {
    if (!formData.fromName.trim() || formData.amount <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.paymentMethod === 'cash' && !formData.safeId) {
      toast.error('يرجى اختيار الخزينة');
      return;
    }

    const voucherNumber = editingVoucher?.voucherNumber || generateReceiptVoucherNumber();

    if (editingVoucher) {
      // Update existing voucher
      const updated = updateReceiptVoucher(editingVoucher.id, {
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        fromType: formData.fromType,
        fromId: formData.fromId || undefined,
        fromName: formData.fromName,
        amount: formData.amount,
        description: formData.description,
        safeId: formData.paymentMethod === 'cash' ? formData.safeId : undefined,
        bankAccount: formData.paymentMethod === 'card' ? formData.bankAccount : undefined,
        status: 'مُعتمد'
      });

      if (updated) {
        setVouchers(loadReceiptVouchers());
        toast.success('تم تحديث السند بنجاح');
      } else {
        toast.error('فشل تحديث السند');
      }
    } else {
      // Create new voucher
      const voucher = addReceiptVoucher({
        voucherNumber,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        fromType: formData.fromType,
        fromId: formData.fromId || undefined,
        fromName: formData.fromName,
        amount: formData.amount,
        description: formData.description,
        safeId: formData.paymentMethod === 'cash' ? formData.safeId : undefined,
        bankAccount: formData.paymentMethod === 'card' ? formData.bankAccount : undefined,
        status: 'مُعتمد'
      });

      // Create journal entry
      const journalEntry = createCashReceiptEntry(
        voucherNumber,
        formData.amount,
        formData.paymentMethod,
        formData.fromId,
        formData.fromName,
        formData.description || undefined
      );
      addJournalEntry(journalEntry);

      // Update safe balance if cash
      if (formData.paymentMethod === 'cash' && formData.safeId) {
        const success = addToSafe(formData.safeId, formData.amount);
        if (!success) {
          toast.error('فشل تحديث الخزينة');
          return;
        }
      }

      // Update customer balance if customer
      if (formData.fromType === 'customer' && formData.fromId) {
        // TODO: Update customer balance in customers data
        // This will be implemented when we create customers.ts
      }

      setVouchers(loadReceiptVouchers());
      toast.success('تم إنشاء سند القبض بنجاح');
    }

    setIsDialogOpen(false);
    setEditingVoucher(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA');
  };

  const customerOptions = useMemo(() => {
    return customers.map(c => ({
      id: c.id,
      name: c.name,
      accountNumber: c.accountNumber,
      phone: c.phone
    }));
  }, [customers]);

  const otherSourceOptions = useMemo(() => {
    return otherSources.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description
    }));
  }, [otherSources]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>سندات القبض</h1>
          <p className="text-gray-600">إدارة سندات استلام النقدية</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          سند قبض جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث برقم السند أو المصدر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                dir="rtl"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: 'all' | ReceiptVoucher['status']) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="مُعتمد">مُعتمد</SelectItem>
                <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                <SelectItem value="ملغي">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة سندات القبض</CardTitle>
          <CardDescription>جميع سندات استلام النقدية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم السند</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">من</TableHead>
                  <TableHead className="text-right">نوع الدفع</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right w-24">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.length > 0 ? (
                  filteredVouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {voucher.voucherNumber}
                        </code>
                      </TableCell>
                      <TableCell>{formatDate(voucher.date)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{voucher.fromName}</p>
                          {voucher.fromType === 'customer' && (
                            <Badge variant="outline" className="text-xs mt-1">
                              عميل
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={voucher.paymentMethod === 'cash' ? 'default' : 'secondary'}>
                          {voucher.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {formatCurrency(voucher.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            voucher.status === 'مُعتمد' ? 'default' :
                              voucher.status === 'قيد المراجعة' ? 'secondary' : 'destructive'
                          }
                        >
                          {voucher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(voucher)}
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(voucher.id)}
                            title="حذف"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>لا توجد سندات قبض</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingVoucher ? 'تعديل سند القبض' : 'سند قبض جديد'}</DialogTitle>
            <DialogDescription>
              {editingVoucher ? 'تعديل بيانات سند القبض' : 'إنشاء سند قبض جديد'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التاريخ *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الدفع *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: 'cash' | 'card') => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>المصدر *</Label>
              <Select
                value={formData.fromType}
                onValueChange={(value: 'customer' | 'other') => setFormData({ ...formData, fromType: value, fromId: '', fromName: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">عميل</SelectItem>
                  <SelectItem value="other">مصدر آخر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.fromType === 'customer' ? (
              <div className="space-y-2">
                <Label>اختر العميل *</Label>
                <SearchableSelect
                  options={customerOptions}
                  value={formData.fromId}
                  onValueChange={(id) => {
                    const customer = customers.find(c => c.id === id);
                    setFormData({
                      ...formData,
                      fromId: id,
                      fromName: customer?.name || ''
                    });
                  }}
                  placeholder="ابحث عن العميل..."
                  searchPlaceholder="ابحث بالاسم أو رقم الحساب..."
                  emptyMessage="لا يوجد عملاء"
                  displayKey="name"
                  searchKeys={['name', 'accountNumber', 'phone']}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>اختر المصدر *</Label>
                <SearchableSelect
                  options={otherSourceOptions}
                  value={formData.fromId}
                  onValueChange={(id) => {
                    const source = otherSources.find(s => s.id === id);
                    setFormData({
                      ...formData,
                      fromId: id,
                      fromName: source?.name || ''
                    });
                  }}
                  placeholder="ابحث عن المصدر..."
                  searchPlaceholder="ابحث بالاسم..."
                  emptyMessage="لا توجد مصادر أخرى"
                  displayKey="name"
                  searchKeys={['name', 'description']}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المبلغ *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              {formData.paymentMethod === 'cash' ? (
                <div className="space-y-2">
                  <Label>الخزينة *</Label>
                  <Select
                    value={formData.safeId}
                    onValueChange={(value) => setFormData({ ...formData, safeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {safes.map(safe => (
                        <SelectItem key={safe.id} value={safe.id}>
                          {safe.name} ({formatCurrency(safe.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>الحساب البنكي</Label>
                  <Input
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    placeholder="رقم الحساب البنكي"
                    className="text-right"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>الوصف / الملاحظات</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف السند (اختياري)"
                className="text-right"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingVoucher ? 'حفظ التعديلات' : 'إنشاء السند'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

