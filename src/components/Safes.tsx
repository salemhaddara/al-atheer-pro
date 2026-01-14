import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Vault, Plus, DollarSign, TrendingUp, Edit, HistoryIcon, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getSafes,
  createSafe,
  updateSafe,
  deleteSafe,
  getBranches,
  type Safe as SafeType,
  type Branch,
  type CreateSafeRequest
} from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useLanguage } from '../contexts/LanguageContext';

export function Safes() {
  const { t, direction } = useLanguage();
  const [safes, setSafes] = useState<SafeType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSafe, setEditingSafe] = useState<SafeType | null>(null);
  const [safeFormData, setSafeFormData] = useState({
    name_ar: '',
    name_en: '',
    branch_id: '',
    is_active: true,
    current_balance: '0',
    notes: ''
  });

  useEffect(() => {
    fetchSafes();
    fetchBranches();
  }, []);

  const fetchSafes = async () => {
    setIsLoading(true);
    try {
      const result = await getSafes({ per_page: 100 });
      if (result.success) {
        const safesData = result.data.safes;
        const safesList = safesData?.data || (Array.isArray(safesData) ? safesData : []);
        setSafes(safesList);
      } else {
        toast.error(result.message || t('safes.messages.loadFailed'));
      }
    } catch (error) {
      console.error('Error fetching safes:', error);
      toast.error(t('safes.messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const result = await getBranches({ per_page: 100 });
      if (result.success) {
        const branchesData = result.data.branches;
        const branchesList = branchesData?.data || (Array.isArray(branchesData) ? branchesData : []);
        setBranches(branchesList);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleAddSafe = () => {
    setEditingSafe(null);
    setSafeFormData({
      name_ar: '',
      name_en: '',
      branch_id: '',
      is_active: true,
      current_balance: '0',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditSafe = (safe: SafeType) => {
    setEditingSafe(safe);
    setSafeFormData({
      name_ar: safe.name_ar || '',
      name_en: safe.name_en || '',
      branch_id: safe.branch_id?.toString() || '',
      is_active: safe.is_active ?? true,
      current_balance: safe.current_balance?.toString() || '0',
      notes: safe.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveSafe = async () => {
    if (!safeFormData.name_ar || !safeFormData.name_en || !safeFormData.branch_id) {
      toast.error(t('safes.messages.fillRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSafeRequest = {
        name_ar: safeFormData.name_ar.trim(),
        name_en: safeFormData.name_en.trim(),
        branch_id: parseInt(safeFormData.branch_id),
        is_active: safeFormData.is_active ?? true,
        current_balance: parseFloat(safeFormData.current_balance) || 0
      };

      if (safeFormData.notes?.trim()) {
        payload.notes = safeFormData.notes.trim();
      }

      let result;
      if (editingSafe) {
        result = await updateSafe(editingSafe.id, payload);
        if (result.success) {
          toast.success(t('safes.messages.updateSuccess'));
        }
      } else {
        result = await createSafe(payload);
        if (result.success) {
          toast.success(t('safes.messages.createSuccess'));
        }
      }

      if (result.success) {
        setIsDialogOpen(false);
        setEditingSafe(null);
        setSafeFormData({
          name_ar: '',
          name_en: '',
          branch_id: '',
          is_active: true,
          current_balance: '0',
          notes: ''
        });
        await fetchSafes();
      } else {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat();
          toast.error(errorMessages[0] || result.message);
        } else {
          toast.error(result.message || t('safes.messages.saveFailed'));
        }
      }
    } catch (error) {
      console.error('Error saving safe:', error);
      toast.error(t('safes.messages.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSafe = async (safe: SafeType) => {
    if (!confirm(t('safes.messages.deleteConfirm') || 'Are you sure you want to delete this safe?')) {
      return;
    }

    try {
      const result = await deleteSafe(safe.id);
      if (result.success) {
        toast.success(t('safes.messages.deleteSuccess'));
        await fetchSafes();
      } else {
        toast.error(result.message || t('safes.messages.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting safe:', error);
      toast.error(t('safes.messages.deleteError'));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(direction === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const totalBalance = safes.reduce((sum, safe) => sum + (safe.current_balance || 0), 0);
  const activeSafes = safes.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <h1>{t('safes.title')}</h1>
          <p className="text-gray-600">{t('safes.subtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddSafe} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              {t('safes.newSafe')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir={direction}>
            <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
              <DialogTitle>{editingSafe ? t('safes.editSafe') : t('safes.addSafe')}</DialogTitle>
              <DialogDescription>{t('safes.safeData')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label>{t('safes.form.nameAr')}</Label>
                  <Input
                    placeholder={t('safes.form.nameArPlaceholder') || 'خزينة الفرع الشرقي'}
                    value={safeFormData.name_ar}
                    onChange={(e) => setSafeFormData({ ...safeFormData, name_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label className="block">{t('safes.form.nameEn')}</Label>
                  <Input
                    placeholder={t('safes.form.nameEnPlaceholder') || 'East Branch Safe'}
                    dir="ltr"
                    value={safeFormData.name_en}
                    onChange={(e) => setSafeFormData({ ...safeFormData, name_en: e.target.value })}
                  />
                </div>
              </div>

              <div className={`space-y-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                <Label>{t('safes.form.linkedBranch')}</Label>
                <Select
                  value={safeFormData.branch_id}
                  onValueChange={(value) => setSafeFormData({ ...safeFormData, branch_id: value })}
                >
                  <SelectTrigger dir={direction}>
                    <SelectValue placeholder={t('safes.form.selectBranch') || 'اختر الفرع'} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => {
                      const authUser = getStoredUser();
                      const isSuperAdmin = authUser?.is_system_owner_admin === true;
                      const branchName = direction === 'rtl' ? branch.name_ar : branch.name_en;
                      const institutionName = branch.institution
                        ? (direction === 'rtl' ? branch.institution.name_ar : branch.institution.name_en)
                        : '';

                      return (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {isSuperAdmin && institutionName
                            ? `${branchName} - ${institutionName}`
                            : branchName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className={`space-y-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                <Label>{t('safes.form.initialBalance')}</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={safeFormData.current_balance}
                  onChange={(e) => setSafeFormData({ ...safeFormData, current_balance: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className={`flex items-center justify-between p-3 border rounded-lg ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <Label>{t('safes.form.status')}</Label>
                  <p className="text-sm text-gray-600">{t('safes.form.statusDesc')}</p>
                </div>
                <Switch
                  checked={safeFormData.is_active}
                  onCheckedChange={(checked) => setSafeFormData({ ...safeFormData, is_active: checked })}
                />
              </div>

              <div className={`space-y-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                <Label>{t('safes.form.notes')}</Label>
                <Textarea
                  placeholder={t('safes.form.notesPlaceholder') || 'أدخل أي ملاحظات إضافية...'}
                  rows={3}
                  value={safeFormData.notes}
                  onChange={(e) => setSafeFormData({ ...safeFormData, notes: e.target.value })}
                  dir={direction}
                />
              </div>

              <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingSafe(null);
                  }}
                >
                  {t('safes.cancel')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveSafe}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t('safes.saving')}
                    </>
                  ) : (
                    editingSafe ? t('safes.saveChanges') : t('safes.save')
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between pb-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <Vault className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">{t('safes.stats.totalSafes')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl">{safes.length}</div>
            <p className="text-xs text-gray-600 mt-1">{t('safes.stats.registeredSafe')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between pb-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <TrendingUp className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">{t('safes.stats.activeSafes')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl">{activeSafes}</div>
            <p className="text-xs text-gray-600 mt-1">{t('safes.stats.activeSafe')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between pb-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <DollarSign className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">{t('safes.stats.totalBalances')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-gray-600 mt-1">{t('safes.stats.totalBalance')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Safes Table */}
      <Card>
        <CardHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <CardTitle>{t('safes.table.title')}</CardTitle>
          <CardDescription>{t('safes.table.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div dir={direction}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('safes.table.nameAr')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('safes.table.branch')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('safes.table.balance')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('safes.table.status')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('safes.table.notes')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('safes.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : safes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {t('safes.table.noSafes')}
                    </TableCell>
                  </TableRow>
                ) : (
                  safes.map((safe) => {
                    const branch = safe.branch;
                    const branchName = branch ? (direction === 'rtl' ? branch.name_ar : branch.name_en) : '-';
                    return (
                      <TableRow key={safe.id}>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          {direction === 'rtl' ? safe.name_ar : safe.name_en}
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          {branchName}
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <span className="text-green-600">{formatCurrency(safe.current_balance || 0)}</span>
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <Badge variant={safe.is_active ? 'default' : 'secondary'}>
                            {safe.is_active ? t('safes.table.active') : t('safes.table.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <span className="max-w-xs truncate block">
                            {safe.notes || '-'}
                          </span>
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleEditSafe(safe)}
                            >
                              <Edit className="w-4 h-4" />
                              {t('safes.table.edit')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSafe(safe)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <HistoryIcon className="w-4 h-4" />
                              {t('safes.table.history')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
