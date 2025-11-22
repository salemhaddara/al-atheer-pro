import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, Folder, FolderOpen, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  loadAccounts,
  saveAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  getAccountById,
  generateNextAccountCode,
  isAccountCodeUnique,
  getChildAccounts,
  calculateAccountBalance,
  validateAccount,
  isAccountUsed,
  type Account,
  type AccountType,
  type AccountWithChildren
} from '../data/chartOfAccounts';
import { getAllJournalEntries } from '../data/journalEntries';

export function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AccountType | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    parentId: '',
    type: 'أصول' as AccountType,
    nature: 'مدين' as 'مدين' | 'دائن',
    openingBalance: 0,
    description: '',
    isActive: true
  });

  // Load accounts on mount
  useEffect(() => {
    const loadedAccounts = loadAccounts();
    setAccounts(loadedAccounts);
    // Expand all main accounts by default
    const mainAccountIds = loadedAccounts.filter(acc => acc.level === 0).map(acc => acc.id);
    setExpandedAccounts(new Set(mainAccountIds));
  }, []);

  // Load journal entries for balance calculation
  const journalEntries = useMemo(() => getAllJournalEntries(), []);

  // Calculate all account balances once and cache them
  const accountBalances = useMemo(() => {
    const balances = new Map<string, number>();
    accounts.forEach(acc => {
      balances.set(acc.code, calculateAccountBalance(acc.code, journalEntries));
    });
    return balances;
  }, [accounts, journalEntries]);

  // Build account tree
  const accountTree = useMemo(() => {
    const buildTree = (parentId: string | null): AccountWithChildren[] => {
      return accounts
        .filter(acc => acc.parentId === parentId && acc.isActive)
        .map(acc => ({
          ...acc,
          children: buildTree(acc.id),
          balance: accountBalances.get(acc.code) || 0
        }))
        .sort((a, b) => a.code.localeCompare(b.code));
    };
    return buildTree(null);
  }, [accounts, accountBalances]);

  // Filter accounts
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim() && filterType === 'all') return accountTree;

    const filterTree = (tree: AccountWithChildren[]): AccountWithChildren[] => {
      return tree
        .filter(acc => {
          const matchesSearch = !searchTerm.trim() ||
            acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.code.includes(searchTerm) ||
            acc.description?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesType = filterType === 'all' || acc.type === filterType;
          
          return matchesSearch && matchesType;
        })
        .map(acc => ({
          ...acc,
          children: acc.children ? filterTree(acc.children) : []
        }));
    };

    return filterTree(accountTree);
  }, [accountTree, searchTerm, filterType]);

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setFormData({
      code: '',
      name: '',
      parentId: '',
      type: 'أصول',
      nature: 'مدين',
      openingBalance: 0,
      description: '',
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      parentId: account.parentId || '',
      type: account.type,
      nature: account.nature,
      openingBalance: account.openingBalance,
      description: account.description || '',
      isActive: account.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (account: Account) => {
    if (!confirm(`هل أنت متأكد من حذف الحساب "${account.name}"؟`)) return;

    // Check if account is used in journal entries
    const journalEntries = getAllJournalEntries();
    if (isAccountUsed(account.code, journalEntries)) {
      toast.error('لا يمكن حذف الحساب لأنه مستخدم في قيود محاسبية');
      return;
    }

    try {
      deleteAccount(account.id);
      setAccounts(loadAccounts());
      toast.success('تم حذف الحساب بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف الحساب');
    }
  };

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Determine level
    const parent = formData.parentId ? getAccountById(formData.parentId) : null;
    const level = parent ? parent.level + 1 : 0;

    // Determine nature based on type if not set
    let nature = formData.nature;
    if (!nature) {
      if (formData.type === 'أصول' || formData.type === 'مصروفات') {
        nature = 'مدين';
      } else {
        nature = 'دائن';
      }
    }

    // Validate account data
    const accountData = {
      ...formData,
      level,
      nature
    };
    
    const validationErrors = validateAccount(accountData, editingAccount?.id);
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    try {
      if (editingAccount) {
        updateAccount(editingAccount.id, accountData);
        toast.success('تم تحديث الحساب بنجاح');
      } else {
        addAccount(accountData);
        toast.success('تم إضافة الحساب بنجاح');
      }

      setAccounts(loadAccounts());
      setIsDialogOpen(false);
      setEditingAccount(null);
    } catch (error: any) {
      toast.error(error.message || 'فشل حفظ الحساب');
    }
  };

  const handleParentChange = (parentId: string) => {
    if (parentId === 'none') {
      setFormData(prev => ({
        ...prev,
        parentId: '',
        code: prev.code || generateNextAccountCode(null)
      }));
    } else {
      const parent = getAccountById(parentId);
      if (parent) {
        setFormData(prev => ({
          ...prev,
          parentId,
          type: parent.type,
          code: prev.code || generateNextAccountCode(parentId)
        }));
      }
    }
  };

  const renderAccountRow = (account: AccountWithChildren, level: number = 0) => {
    const isExpanded = expandedAccounts.has(account.id);
    const hasChildren = account.children && account.children.length > 0;
    const balance = accountBalances.get(account.code) || 0;

    return (
      <React.Fragment key={account.id}>
        <TableRow
          className={level > 0 ? 'bg-gray-50' : ''}
          style={{ paddingRight: `${level * 2}rem` }}
        >
          <TableCell>
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAccount(account.id)}
                className="p-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}
          </TableCell>
          <TableCell className="font-mono text-sm">{account.code}</TableCell>
          <TableCell style={{ paddingRight: `${level * 1.5 + 0.5}rem` }}>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-blue-500" />
                ) : (
                  <Folder className="w-4 h-4 text-gray-400" />
                )
              ) : (
                <BookOpen className="w-4 h-4 text-gray-400" />
              )}
              <span className={level === 0 ? 'font-bold' : ''}>{account.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline">{account.type}</Badge>
          </TableCell>
          <TableCell>
            <Badge variant={account.nature === 'مدين' ? 'default' : 'secondary'}>
              {account.nature}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            {balance >= 0 ? (
              <span className="text-green-600 font-semibold">
                {balance.toLocaleString('ar-SA')} ر.س
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                {Math.abs(balance).toLocaleString('ar-SA')} ر.س
              </span>
            )}
          </TableCell>
          <TableCell>
            <Badge variant={account.isActive ? 'default' : 'secondary'}>
              {account.isActive ? 'نشط' : 'معطل'}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(account)}
                title="تعديل"
              >
                <Edit className="w-4 h-4" />
              </Button>
              {level > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(account)}
                  title="حذف"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
        {isExpanded && hasChildren && account.children!.map(child => renderAccountRow(child, level + 1))}
      </React.Fragment>
    );
  };

  // Get parent options for select
  const parentOptions = useMemo(() => {
    return accounts.filter(acc => acc.isActive && acc.level < 2); // Allow up to 2 levels deep
  }, [accounts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>شجرة الحسابات</h1>
          <p className="text-gray-600">إدارة وتنظيم الحسابات المحاسبية</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة حساب جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث بالاسم أو الرمز..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                dir="rtl"
              />
            </div>
            <Select value={filterType} onValueChange={(value: AccountType | 'all') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="أصول">أصول</SelectItem>
                <SelectItem value="خصوم">خصوم</SelectItem>
                <SelectItem value="حقوق_ملكية">حقوق ملكية</SelectItem>
                <SelectItem value="إيرادات">إيرادات</SelectItem>
                <SelectItem value="مصروفات">مصروفات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الحسابات</CardTitle>
          <CardDescription>جميع الحسابات مع أرصدتها الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="text-right">الرمز</TableHead>
                  <TableHead className="text-right">اسم الحساب</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الطبيعة</TableHead>
                  <TableHead className="text-right">الرصيد</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right w-24">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTree.length > 0 ? (
                  filteredTree.map(account => renderAccountRow(account, 0))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      لا توجد حسابات
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
            <DialogTitle>{editingAccount ? 'تعديل الحساب' : 'إضافة حساب جديد'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد إلى شجرة الحسابات'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رمز الحساب *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="مثال: 1010"
                  className="font-mono"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>اسم الحساب *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: الصندوق"
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الحساب الأب</Label>
                <Select value={formData.parentId || 'none'} onValueChange={handleParentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب الأب (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">حساب رئيسي</SelectItem>
                    {parentOptions.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نوع الحساب *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: AccountType) => {
                    setFormData({
                      ...formData,
                      type: value,
                      nature: value === 'أصول' || value === 'مصروفات' ? 'مدين' : 'دائن'
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="أصول">أصول</SelectItem>
                    <SelectItem value="خصوم">خصوم</SelectItem>
                    <SelectItem value="حقوق_ملكية">حقوق ملكية</SelectItem>
                    <SelectItem value="إيرادات">إيرادات</SelectItem>
                    <SelectItem value="مصروفات">مصروفات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>طبيعة الحساب *</Label>
                <Select
                  value={formData.nature}
                  onValueChange={(value: 'مدين' | 'دائن') => setFormData({ ...formData, nature: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مدين">مدين</SelectItem>
                    <SelectItem value="دائن">دائن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الرصيد الافتتاحي</Label>
                <Input
                  type="number"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                  placeholder="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الحساب (اختياري)"
                className="text-right"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <Label>الحساب نشط</Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingAccount ? 'حفظ التعديلات' : 'إضافة الحساب'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

