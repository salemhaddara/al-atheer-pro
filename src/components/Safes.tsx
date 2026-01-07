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
        toast.error(result.message || 'Failed to load safes');
      }
    } catch (error) {
      console.error('Error fetching safes:', error);
      toast.error('An error occurred while loading safes');
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
      toast.error('Please fill all required fields');
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
          toast.success('Safe updated successfully');
        }
      } else {
        result = await createSafe(payload);
        if (result.success) {
          toast.success('Safe created successfully');
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
          toast.error(result.message || 'Failed to save safe');
        }
      }
    } catch (error) {
      console.error('Error saving safe:', error);
      toast.error('An error occurred while saving safe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSafe = async (safe: SafeType) => {
    if (!confirm('Are you sure you want to delete this safe?')) {
      return;
    }

    try {
      const result = await deleteSafe(safe.id);
      if (result.success) {
        toast.success('Safe deleted successfully');
        await fetchSafes();
      } else {
        toast.error(result.message || 'Failed to delete safe');
      }
    } catch (error) {
      console.error('Error deleting safe:', error);
      toast.error('An error occurred while deleting safe');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const totalBalance = safes.reduce((sum, safe) => sum + (safe.current_balance || 0), 0);
  const activeSafes = safes.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>إدارة الخزائن</h1>
          <p className="text-gray-600">إدارة الخزائن والأرصدة النقدية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddSafe} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              خزينة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>{editingSafe ? 'تعديل الخزينة' : 'إضافة خزينة جديدة'}</DialogTitle>
              <DialogDescription>قم بإدخال بيانات الخزينة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الخزينة (عربي) *</Label>
                  <Input 
                    placeholder="خزينة الفرع الشرقي"
                    value={safeFormData.name_ar}
                    onChange={(e) => setSafeFormData({ ...safeFormData, name_ar: e.target.value })}
                    dir={direction}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Safe Name (English) *</Label>
                  <Input 
                    placeholder="East Branch Safe" 
                    dir="ltr"
                    value={safeFormData.name_en}
                    onChange={(e) => setSafeFormData({ ...safeFormData, name_en: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>الفرع المرتبط *</Label>
                <Select
                  value={safeFormData.branch_id}
                  onValueChange={(value) => setSafeFormData({ ...safeFormData, branch_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفرع" />
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

              <div className="space-y-2">
                <Label>الرصيد الافتتاحي (ر.س)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={safeFormData.current_balance}
                  onChange={(e) => setSafeFormData({ ...safeFormData, current_balance: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>حالة الخزينة</Label>
                  <p className="text-sm text-gray-600">تفعيل أو تعطيل الخزينة</p>
                </div>
                <Switch 
                  checked={safeFormData.is_active}
                  onCheckedChange={(checked) => setSafeFormData({ ...safeFormData, is_active: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  placeholder="أدخل أي ملاحظات إضافية..."
                  rows={3}
                  value={safeFormData.notes}
                  onChange={(e) => setSafeFormData({ ...safeFormData, notes: e.target.value })}
                  dir={direction}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingSafe(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSaveSafe}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    editingSafe ? 'حفظ التغييرات' : 'حفظ الخزينة'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Vault className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">إجمالي الخزائن</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{safes.length}</div>
            <p className="text-xs text-gray-600 mt-1">خزينة مسجلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">الخزائن النشطة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{activeSafes}</div>
            <p className="text-xs text-gray-600 mt-1">خزينة نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">إجمالي الأرصدة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-gray-600 mt-1">الرصيد الإجمالي</p>
          </CardContent>
        </Card>
      </div>

      {/* Safes Table */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle>قائمة الخزائن</CardTitle>
          <CardDescription>عرض وإدارة جميع الخزائن </CardDescription>
        </CardHeader>
        <CardContent>
          <div dir="rtl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الخزينة (عربي)</TableHead>
                  <TableHead className="text-right">الفرع المرتبط</TableHead>
                  <TableHead className="text-right">الرصيد الحالي</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">ملاحظات</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
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
                      No safes found
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
                            {safe.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <span className="max-w-xs truncate block">
                            {safe.notes || '-'}
                          </span>
                        </TableCell>
                        <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => handleEditSafe(safe)}
                            >
                              <Edit className="w-4 h-4" />
                              تعديل
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteSafe(safe)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <HistoryIcon className="w-4 h-4" />
                              سجل الحركات
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
