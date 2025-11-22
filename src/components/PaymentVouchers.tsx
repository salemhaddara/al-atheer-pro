import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, Download, Printer, FileText, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { createPaymentVoucherEntry, addJournalEntry } from '../data/journalEntries';
import { deductFromSafe, getSafeBalance } from '../data/safes';
import { SearchableSelect } from './ui/searchable-select';
import {
  loadPaymentVouchers,
  savePaymentVouchers,
  addPaymentVoucher,
  updatePaymentVoucher,
  deletePaymentVoucher,
  generatePaymentVoucherNumber,
  type PaymentVoucher
} from '../data/vouchers';

export function PaymentVouchers() {
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentVoucher['status']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<PaymentVoucher | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'card',
    toType: 'supplier' as 'supplier' | 'other',
    toId: '',
    toName: '',
    amount: 0,
    description: '',
    safeId: 'main',
    bankAccount: ''
  });

  // Load vouchers on mount
  useEffect(() => {
    setVouchers(loadPaymentVouchers());
  }, []);

  // Load suppliers from Purchases component (shared data structure)
  const suppliers = useMemo(() => [
    { id: '1', name: 'مورد المعدات المكتبية', accountNumber: 'SUP-001', phone: '0501234567' },
    { id: '2', name: 'مورد الأثاث', accountNumber: 'SUP-002', phone: '0507654321' },
    { id: '3', name: 'مورد الأجهزة الإلكترونية', accountNumber: 'SUP-003', phone: '0509876543' },
  ], []);

  // Load safes
  const safes = useMemo(() => [
    { id: 'main', name: 'الخزينة الرئيسية', balance: getSafeBalance('main') },
    { id: 'pos', name: 'خزينة نقاط البيع', balance: getSafeBalance('pos') },
  ], []);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      const matchesSearch = !searchTerm.trim() ||
        voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.toName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      toType: 'supplier',
      toId: '',
      toName: '',
      amount: 0,
      description: '',
      safeId: 'main',
      bankAccount: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (voucher: PaymentVoucher) => {
    setEditingVoucher(voucher);
    setFormData({
      date: voucher.date,
      paymentMethod: voucher.paymentMethod,
      toType: voucher.toType,
      toId: voucher.toId || '',
      toName: voucher.toName,
      amount: voucher.amount,
      description: voucher.description,
      safeId: voucher.safeId || 'main',
      bankAccount: voucher.bankAccount || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السند؟')) return;
    
    if (deletePaymentVoucher(id)) {
      setVouchers(loadPaymentVouchers());
      toast.success('تم حذف السند بنجاح');
    } else {
      toast.error('فشل حذف السند');
    }
  };

  const handleSave = () => {
    if (!formData.toName.trim() || formData.amount <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.paymentMethod === 'cash' && !formData.safeId) {
      toast.error('يرجى اختيار الخزينة');
      return;
    }

    // Check safe balance if cash payment
    if (formData.paymentMethod === 'cash' && formData.safeId) {
      const safeBalance = getSafeBalance(formData.safeId);
      if (safeBalance < formData.amount) {
        toast.error(`الرصيد غير كافي في الخزينة. المتاح: ${formatCurrency(safeBalance)}`);
        return;
      }
    }

    const voucherNumber = editingVoucher?.voucherNumber || generatePaymentVoucherNumber();
    
    if (editingVoucher) {
      // Update existing voucher
      const updated = updatePaymentVoucher(editingVoucher.id, {
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        toType: formData.toType,
        toId: formData.toId || undefined,
        toName: formData.toName,
        amount: formData.amount,
        description: formData.description,
        safeId: formData.paymentMethod === 'cash' ? formData.safeId : undefined,
        bankAccount: formData.paymentMethod === 'card' ? formData.bankAccount : undefined,
        status: 'مُعتمد'
      });
      
      if (updated) {
        setVouchers(loadPaymentVouchers());
        toast.success('تم تحديث السند بنجاح');
      } else {
        toast.error('فشل تحديث السند');
      }
    } else {
      // Create new voucher
      const voucher = addPaymentVoucher({
        voucherNumber,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        toType: formData.toType,
        toId: formData.toId || undefined,
        toName: formData.toName,
        amount: formData.amount,
        description: formData.description,
        safeId: formData.paymentMethod === 'cash' ? formData.safeId : undefined,
        bankAccount: formData.paymentMethod === 'card' ? formData.bankAccount : undefined,
        status: 'مُعتمد'
      });

      // Create journal entry
      const journalEntry = createPaymentVoucherEntry(
        voucherNumber,
        formData.amount,
        formData.paymentMethod,
        formData.toId,
        formData.toName,
        formData.description || undefined
      );
      addJournalEntry(journalEntry);

      // Update safe balance if cash
      if (formData.paymentMethod === 'cash' && formData.safeId) {
        const success = deductFromSafe(formData.safeId, formData.amount);
        if (!success) {
          toast.error('فشل تحديث الخزينة');
          return;
        }
      }

      // Update supplier balance if supplier
      if (formData.toType === 'supplier' && formData.toId) {
        // TODO: Update supplier balance in suppliers data
        // This will be implemented when we create suppliers.ts
      }

      setVouchers(loadPaymentVouchers());
      toast.success('تم إنشاء سند الصرف بنجاح');
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

  const supplierOptions = useMemo(() => {
    return suppliers.map(s => ({
      id: s.id,
      name: s.name,
      accountNumber: s.accountNumber,
      phone: s.phone
    }));
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>سندات الصرف</h1>
          <p className="text-gray-600">إدارة سندات دفع النقدية</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          سند صرف جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث برقم السند أو المستفيد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                dir="rtl"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: 'all' | PaymentVoucher['status']) => setFilterStatus(value)}>
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
          <CardTitle>قائمة سندات الصرف</CardTitle>
          <CardDescription>جميع سندات دفع النقدية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم السند</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">إلى</TableHead>
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
                          <p className="font-medium">{voucher.toName}</p>
                          {voucher.toType === 'supplier' && (
                            <Badge variant="outline" className="text-xs mt-1">
                              مورد
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={voucher.paymentMethod === 'cash' ? 'default' : 'secondary'}>
                          {voucher.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
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
                      <p>لا توجد سندات صرف</p>
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
            <DialogTitle>{editingVoucher ? 'تعديل سند الصرف' : 'سند صرف جديد'}</DialogTitle>
            <DialogDescription>
              {editingVoucher ? 'تعديل بيانات سند الصرف' : 'إنشاء سند صرف جديد'}
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
              <Label>المستفيد *</Label>
              <Select
                value={formData.toType}
                onValueChange={(value: 'supplier' | 'other') => setFormData({ ...formData, toType: value, toId: '', toName: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier">مورد</SelectItem>
                  <SelectItem value="other">مستفيد آخر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.toType === 'supplier' ? (
              <div className="space-y-2">
                <Label>اختر المورد *</Label>
                <SearchableSelect
                  options={supplierOptions}
                  value={formData.toId}
                  onValueChange={(id) => {
                    const supplier = suppliers.find(s => s.id === id);
                    setFormData({
                      ...formData,
                      toId: id,
                      toName: supplier?.name || ''
                    });
                  }}
                  placeholder="ابحث عن المورد..."
                  searchPlaceholder="ابحث بالاسم أو رقم الحساب..."
                  emptyMessage="لا يوجد موردين"
                  displayKey="name"
                  searchKeys={['name', 'accountNumber', 'phone']}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>اسم المستفيد *</Label>
                <Input
                  value={formData.toName}
                  onChange={(e) => setFormData({ ...formData, toName: e.target.value })}
                  placeholder="أدخل اسم المستفيد"
                  className="text-right"
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

