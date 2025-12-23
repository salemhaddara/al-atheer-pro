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
  loadOtherRecipients,
  type PaymentVoucher
} from '../data/vouchers';
import { useLanguage } from '../contexts/LanguageContext';

export function PaymentVouchers() {
  const { t, direction } = useLanguage();
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
    { id: 'general', name: t('accounting.paymentVouchers.generalSupplier') || 'مورد عام', accountNumber: 'SUP-GEN', phone: '' },
    { id: '1', name: 'مورد المعدات المكتبية', accountNumber: 'SUP-001', phone: '0501234567' },
    { id: '2', name: 'مورد الأثاث', accountNumber: 'SUP-002', phone: '0507654321' },
    { id: '3', name: 'مورد الأجهزة الإلكترونية', accountNumber: 'SUP-003', phone: '0509876543' },
  ], [t]);

  // Load other recipients
  const otherRecipients = useMemo(() => loadOtherRecipients(), []);

  // Load safes
  const safes = useMemo(() => [
    { id: 'main', name: t('accounting.paymentVouchers.mainSafe') || 'الخزينة الرئيسية', balance: getSafeBalance('main') },
    { id: 'pos', name: t('accounting.paymentVouchers.posSafe') || 'خزينة نقاط البيع', balance: getSafeBalance('pos') },
  ], [t]);

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

    // If it's "other" type and no toId, try to find by name
    let toId = voucher.toId || '';
    if (voucher.toType === 'other' && !toId && voucher.toName) {
      const foundRecipient = otherRecipients.find(r => r.name === voucher.toName);
      if (foundRecipient) {
        toId = foundRecipient.id;
      }
    }

    setFormData({
      date: voucher.date,
      paymentMethod: voucher.paymentMethod,
      toType: voucher.toType,
      toId: toId,
      toName: voucher.toName,
      amount: voucher.amount,
      description: voucher.description,
      safeId: voucher.safeId || 'main',
      bankAccount: voucher.bankAccount || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm(t('accounting.paymentVouchers.deleteConfirm'))) return;

    if (deletePaymentVoucher(id)) {
      setVouchers(loadPaymentVouchers());
      toast.success(t('accounting.paymentVouchers.voucherDeleted'));
    } else {
      toast.error(t('accounting.paymentVouchers.deleteFailed'));
    }
  };

  const handleSave = () => {
    if (!formData.toName.trim() || formData.amount <= 0) {
      toast.error(t('accounting.paymentVouchers.fillRequiredFields'));
      return;
    }

    if (formData.paymentMethod === 'cash' && !formData.safeId) {
      toast.error(t('accounting.paymentVouchers.selectSafe'));
      return;
    }

    // Check safe balance if cash payment
    if (formData.paymentMethod === 'cash' && formData.safeId) {
      const safeBalance = getSafeBalance(formData.safeId);
      if (safeBalance < formData.amount) {
        toast.error(t('accounting.paymentVouchers.insufficientBalance').replace('{balance}', formatCurrency(safeBalance)));
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
        toast.success(t('accounting.paymentVouchers.voucherUpdated'));
      } else {
        toast.error(t('accounting.paymentVouchers.updateFailed'));
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
          toast.error(t('accounting.paymentVouchers.safeUpdateFailed'));
          return;
        }
      }

      // Update supplier balance if supplier
      if (formData.toType === 'supplier' && formData.toId) {
        // TODO: Update supplier balance in suppliers data
        // This will be implemented when we create suppliers.ts
      }

      setVouchers(loadPaymentVouchers());
      toast.success(t('accounting.paymentVouchers.voucherCreated'));
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

  const otherRecipientOptions = useMemo(() => {
    return otherRecipients.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description
    }));
  }, [otherRecipients]);

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <h1>{t('accounting.paymentVouchers.title')}</h1>
          <p className="text-gray-600">{t('accounting.paymentVouchers.subtitle')}</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('accounting.paymentVouchers.newVoucher')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
              <Input
                placeholder={t('accounting.paymentVouchers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={direction === 'rtl' ? 'pr-10' : 'pl-10'}
                dir={direction}
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: 'all' | PaymentVoucher['status']) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('accounting.paymentVouchers.filterByStatus')} />
              </SelectTrigger>
              <SelectContent dir={direction}>
                <SelectItem value="all">{t('accounting.paymentVouchers.allStatuses')}</SelectItem>
                <SelectItem value="مُعتمد">{t('accounting.statuses.approved')}</SelectItem>
                <SelectItem value="قيد المراجعة">{t('accounting.statuses.underReview')}</SelectItem>
                <SelectItem value="ملغي">{t('accounting.statuses.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader dir={direction}>
          <CardTitle>{t('accounting.paymentVouchers.vouchersList')}</CardTitle>
          <CardDescription>{t('accounting.paymentVouchers.vouchersListDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table dir={direction}>
              <TableHeader>
                <TableRow>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.paymentVouchers.voucherNumber')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.paymentVouchers.date')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.paymentVouchers.to')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.paymentVouchers.paymentType')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.paymentVouchers.amount')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.paymentVouchers.status')}</TableHead>
                  <TableHead className={`${direction === 'rtl' ? 'text-right' : 'text-left'} w-24`}>{t('accounting.paymentVouchers.actions')}</TableHead>
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
                              {t('accounting.paymentVouchers.supplier')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={voucher.paymentMethod === 'cash' ? 'default' : 'secondary'}>
                          {voucher.paymentMethod === 'cash' ? t('accounting.paymentVouchers.cash') : t('accounting.paymentVouchers.card')}
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
                          {voucher.status === 'مُعتمد' ? t('accounting.statuses.approved') :
                           voucher.status === 'قيد المراجعة' ? t('accounting.statuses.underReview') :
                           voucher.status === 'ملغي' ? t('accounting.statuses.rejected') :
                           voucher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(voucher)}
                            title={t('accounting.paymentVouchers.editVoucher')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(voucher.id)}
                            title={t('accounting.paymentVouchers.deleteVoucher')}
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
                      <p>{t('accounting.paymentVouchers.noVouchers')}</p>
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
        <DialogContent className="max-w-2xl" dir={direction}>
          <DialogHeader dir={direction}>
            <DialogTitle>{editingVoucher ? t('accounting.paymentVouchers.editVoucher') : t('accounting.paymentVouchers.newVoucherTitle')}</DialogTitle>
            <DialogDescription>
              {editingVoucher ? t('accounting.paymentVouchers.editVoucherDesc') : t('accounting.paymentVouchers.createVoucherDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('accounting.paymentVouchers.dateLabel')}</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accounting.paymentVouchers.paymentTypeLabel')}</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: 'cash' | 'card') => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={direction}>
                    <SelectItem value="cash">{t('accounting.paymentVouchers.cash')}</SelectItem>
                    <SelectItem value="card">{t('accounting.paymentVouchers.card')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('accounting.paymentVouchers.recipientLabel')}</Label>
              <Select
                value={formData.toType}
                onValueChange={(value: 'supplier' | 'other') => setFormData({ ...formData, toType: value, toId: '', toName: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={direction}>
                  <SelectItem value="supplier">{t('accounting.paymentVouchers.supplier')}</SelectItem>
                  <SelectItem value="other">{t('accounting.paymentVouchers.otherRecipient')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.toType === 'supplier' ? (
              <div className="space-y-2">
                <Label>{t('accounting.paymentVouchers.selectSupplier')}</Label>
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
                  placeholder={t('accounting.paymentVouchers.supplierSearchPlaceholder')}
                  searchPlaceholder={t('accounting.paymentVouchers.supplierSearchPlaceholder')}
                  emptyMessage={t('accounting.paymentVouchers.noSuppliers')}
                  displayKey="name"
                  searchKeys={['name', 'accountNumber', 'phone']}
                  dir={direction}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{t('accounting.paymentVouchers.selectRecipient')}</Label>
                <SearchableSelect
                  options={otherRecipientOptions}
                  value={formData.toId}
                  onValueChange={(id) => {
                    const recipient = otherRecipients.find(r => r.id === id);
                    setFormData({
                      ...formData,
                      toId: id,
                      toName: recipient?.name || ''
                    });
                  }}
                  placeholder={t('accounting.paymentVouchers.recipientSearchPlaceholder')}
                  searchPlaceholder={t('accounting.paymentVouchers.recipientSearchPlaceholder')}
                  emptyMessage={t('accounting.paymentVouchers.noRecipients')}
                  displayKey="name"
                  searchKeys={['name', 'description']}
                  dir={direction}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('accounting.paymentVouchers.amountLabel')}</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder={t('accounting.paymentVouchers.amountPlaceholder')}
                  step="0.01"
                  min="0"
                  dir="ltr"
                />
              </div>
              {formData.paymentMethod === 'cash' ? (
                <div className="space-y-2">
                  <Label>{t('accounting.paymentVouchers.safeLabel')}</Label>
                  <Select
                    value={formData.safeId}
                    onValueChange={(value) => setFormData({ ...formData, safeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir={direction}>
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
                  <Label>{t('accounting.paymentVouchers.bankAccountLabel')}</Label>
                  <Input
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    placeholder={t('accounting.paymentVouchers.bankAccountPlaceholder')}
                    className={direction === 'rtl' ? 'text-right' : 'text-left'}
                    dir={direction}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('accounting.paymentVouchers.descriptionLabel')}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('accounting.paymentVouchers.descriptionPlaceholder')}
                className={direction === 'rtl' ? 'text-right' : 'text-left'}
                dir={direction}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
              {t('accounting.paymentVouchers.cancel')}
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingVoucher ? t('accounting.paymentVouchers.saveChanges') : t('accounting.paymentVouchers.createVoucher')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

