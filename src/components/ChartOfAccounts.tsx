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
import { useLanguage } from '../contexts/LanguageContext';

export function ChartOfAccounts() {
  const { t, direction } = useLanguage();
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
    if (!confirm(t('accounting.deleteConfirm').replace('{name}', account.name))) return;

    // Check if account is used in journal entries
    const journalEntries = getAllJournalEntries();
    if (isAccountUsed(account.code, journalEntries)) {
      toast.error(t('accounting.cannotDeleteUsed'));
      return;
    }

    try {
      deleteAccount(account.id);
      setAccounts(loadAccounts());
      toast.success(t('accounting.accountDeleted'));
    } catch (error: any) {
      toast.error(error.message || t('accounting.deleteFailed'));
    }
  };

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error(t('accounting.fillRequiredFields'));
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
        toast.success(t('accounting.accountUpdated'));
      } else {
        addAccount(accountData);
        toast.success(t('accounting.accountAdded'));
      }

      setAccounts(loadAccounts());
      setIsDialogOpen(false);
      setEditingAccount(null);
    } catch (error: any) {
      toast.error(error.message || t('accounting.saveFailed'));
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
          style={{ [direction === 'rtl' ? 'paddingRight' : 'paddingLeft']: `${level * 2}rem` }}
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
          <TableCell style={{ [direction === 'rtl' ? 'paddingRight' : 'paddingLeft']: `${level * 1.5 + 0.5}rem` }}>
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
          <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
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
              {account.isActive ? t('accounting.accountActive') : t('accounting.accountInactive')}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(account)}
                title={t('accounting.accountEdit')}
              >
                <Edit className="w-4 h-4" />
              </Button>
              {level > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(account)}
                  title={t('accounting.accountDelete')}
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
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <h1>{t('accounting.chartOfAccountsTitle')}</h1>
          <p className="text-gray-600">{t('accounting.chartOfAccountsSubtitle')}</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('accounting.addNewAccount')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
              <Input
                placeholder={t('accounting.searchByNameOrCode')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={direction === 'rtl' ? 'pr-10' : 'pl-10'}
                dir={direction}
              />
            </div>
            <Select value={filterType} onValueChange={(value: AccountType | 'all') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('accounting.filterByType')} />
              </SelectTrigger>
              <SelectContent dir={direction}>
                <SelectItem value="all">{t('accounting.allAccountTypes')}</SelectItem>
                <SelectItem value="أصول">{t('accounting.accountTypes.assets')}</SelectItem>
                <SelectItem value="خصوم">{t('accounting.accountTypes.liabilities')}</SelectItem>
                <SelectItem value="حقوق_ملكية">{t('accounting.accountTypes.equity')}</SelectItem>
                <SelectItem value="إيرادات">{t('accounting.accountTypes.revenue')}</SelectItem>
                <SelectItem value="مصروفات">{t('accounting.accountTypes.expenses')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader dir={direction}>
          <CardTitle>{t('accounting.accountsList')}</CardTitle>
          <CardDescription>{t('accounting.accountsListDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table dir={direction}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.accountCodeShort')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.accountName')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.accountType')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.accountNature')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.balance')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.accountStatus')}</TableHead>
                  <TableHead className={`${direction === 'rtl' ? 'text-right' : 'text-left'} w-24`}>{t('accounting.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTree.length > 0 ? (
                  filteredTree.map(account => renderAccountRow(account, 0))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {t('accounting.noAccounts')}
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
            <DialogTitle>{editingAccount ? t('accounting.editAccount') : t('accounting.addAccount')}</DialogTitle>
            <DialogDescription>
              {editingAccount ? t('accounting.editAccountDesc') : t('accounting.addAccountDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('accounting.accountCodeLabel')}</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('accounting.accountCodePlaceholder')}
                  className="font-mono"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accounting.accountNameLabel')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('accounting.accountNamePlaceholder')}
                  className={direction === 'rtl' ? 'text-right' : 'text-left'}
                  dir={direction}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('accounting.parentAccount')}</Label>
                <Select value={formData.parentId || 'none'} onValueChange={handleParentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('accounting.parentAccountPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent dir={direction}>
                    <SelectItem value="none">{t('accounting.mainAccount')}</SelectItem>
                    {parentOptions.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('accounting.accountTypeLabel')}</Label>
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
                  <SelectContent dir={direction}>
                    <SelectItem value="أصول">{t('accounting.accountTypes.assets')}</SelectItem>
                    <SelectItem value="خصوم">{t('accounting.accountTypes.liabilities')}</SelectItem>
                    <SelectItem value="حقوق_ملكية">{t('accounting.accountTypes.equity')}</SelectItem>
                    <SelectItem value="إيرادات">{t('accounting.accountTypes.revenue')}</SelectItem>
                    <SelectItem value="مصروفات">{t('accounting.accountTypes.expenses')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('accounting.accountNatureLabel')}</Label>
                <Select
                  value={formData.nature}
                  onValueChange={(value: 'مدين' | 'دائن') => setFormData({ ...formData, nature: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={direction}>
                    <SelectItem value="مدين">{t('accounting.accountNatures.debit')}</SelectItem>
                    <SelectItem value="دائن">{t('accounting.accountNatures.credit')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('accounting.openingBalance')}</Label>
                <Input
                  type="number"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                  placeholder="0"
                  step="0.01"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('accounting.accountDescription')}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('accounting.accountDescriptionPlaceholder')}
                className={direction === 'rtl' ? 'text-right' : 'text-left'}
                dir={direction}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <Label>{t('accounting.accountIsActive')}</Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
              {t('accounting.accountCancel')}
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingAccount ? t('accounting.accountSaveChanges') : t('accounting.addAccountButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

