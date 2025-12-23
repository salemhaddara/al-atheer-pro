import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Store, Plus, Wallet, Lock, DollarSign, User, Building2, History, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  loadDrawers,
  getDrawer,
  createOrUpdateDrawer,
  closeDrawer,
  addToDrawer,
  getDrawerTransactions,
  getDrawerReconciliations,
  type CashDrawer,
  type DrawerReconciliation
} from '../data/cashDrawers';

// Sample employees - in real app, load from employees data
const employees = [
  { id: 'emp-1', name: 'أحمد محمد', email: 'ahmed@example.com' },
  { id: 'emp-2', name: 'فاطمة علي', email: 'fatima@example.com' },
  { id: 'emp-3', name: 'سعيد خالد', email: 'saeed@example.com' },
];

// Sample branches
const branches = [
  { id: 'branch-1', name: 'الفرع الرئيسي' },
  { id: 'branch-2', name: 'فرع الشمال' },
  { id: 'branch-3', name: 'فرع الجنوب' },
];

export function POSManagement() {
  const { t, direction } = useLanguage();
  const { currentUser } = useUser();
  const [drawers, setDrawers] = useState<Record<string, CashDrawer>>({});
  const [selectedDrawer, setSelectedDrawer] = useState<CashDrawer | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showReconciliationsDialog, setShowReconciliationsDialog] = useState(false);

  // Form states
  const [newPosId, setNewPosId] = useState('');
  const [newBranchId, setNewBranchId] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [actualCounted, setActualCounted] = useState('');
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyNotes, setAddMoneyNotes] = useState('');

  // Load drawers on mount
  useEffect(() => {
    const loadedDrawers = loadDrawers();
    setDrawers(loadedDrawers);
  }, []);

  // Filter drawers based on user role
  const availableDrawers = useMemo(() => {
    const allDrawers = Object.values(drawers);
    // For now, show all drawers to everyone (no permission checks)
    return allDrawers;
    // Employee sees only their assigned drawer (commented for now)
    // if (currentUser?.id) {
    //   return allDrawers.filter(d => d.employeeId === currentUser.id);
    // }
  }, [drawers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCreatePOS = () => {
    if (!newPosId.trim()) {
      toast.error(t('posManagement.posIdRequired'));
      return;
    }
    if (!newBranchId) {
      toast.error(t('posManagement.branchRequired'));
      return;
    }

    const branch = branches.find(b => b.id === newBranchId);
    const employee = newEmployeeId ? employees.find(e => e.id === newEmployeeId) : undefined;

    const drawer = createOrUpdateDrawer(
      newPosId.trim(),
      newBranchId,
      branch?.name || t('sidebar.mainBranch'),
      employee?.id,
      employee?.name
    );

    setDrawers(loadDrawers());
    toast.success(t('posManagement.posCreated'));
    setShowCreateDialog(false);
    setNewPosId('');
    setNewBranchId('');
    setNewEmployeeId('');
  };

  const handleCloseDrawer = () => {
    if (!selectedDrawer) return;

    const counted = parseFloat(actualCounted);
    if (!counted || counted < 0) {
      toast.error(t('posManagement.closeDrawer.actualAmountRequired'));
      return;
    }

    const discrepancy = counted - selectedDrawer.currentBalance;
    if (discrepancy !== 0 && !discrepancyReason.trim()) {
      toast.error(t('posManagement.closeDrawer.discrepancyReasonRequired'));
      return;
    }

    const result = closeDrawer(
      selectedDrawer.posId,
      counted,
      currentUser?.id || 'unknown',
      currentUser?.name || t('pos.notSpecified'),
      discrepancy !== 0 ? discrepancyReason : undefined
    );

    if (result.success) {
      toast.success(t('posManagement.closeDrawer.closedSuccessfully'));
      setDrawers(loadDrawers());
      setShowCloseDialog(false);
      setActualCounted('');
      setDiscrepancyReason('');
      setSelectedDrawer(null);
    } else {
      toast.error(result.error || t('posManagement.closeDrawer.closeFailed'));
    }
  };

  const handleAddMoney = () => {
    if (!selectedDrawer) return;

    const amount = parseFloat(addMoneyAmount);
    if (!amount || amount <= 0) {
      toast.error(t('posManagement.addMoney.validAmountRequired'));
      return;
    }

    const success = addToDrawer(
      selectedDrawer.posId,
      amount,
      'manual_add',
      currentUser?.id || 'unknown',
      currentUser?.name || t('pos.notSpecified'),
      addMoneyNotes || t('pos.manualAdd')
    );

    if (success) {
      toast.success(t('posManagement.addMoney.amountAdded').replace('{amount}', formatCurrency(amount)));
      setDrawers(loadDrawers());
      setShowAddMoneyDialog(false);
      setAddMoneyAmount('');
      setAddMoneyNotes('');
      setSelectedDrawer(null);
    } else {
      toast.error(t('posManagement.addMoney.addFailed'));
    }
  };

  const drawerTransactions = useMemo(() => {
    if (!selectedDrawer) return [];
    return getDrawerTransactions(selectedDrawer.posId);
  }, [selectedDrawer]);

  const drawerReconciliations = useMemo(() => {
    if (!selectedDrawer) return [];
    return getDrawerReconciliations(selectedDrawer.posId);
  }, [selectedDrawer]);

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>{t('posManagement.title')}</h1>
          <p className="text-gray-600">{t('posManagement.subtitle')}</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t('posManagement.addNewPOS')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir={direction}>
              <DialogHeader>
                <DialogTitle>{t('posManagement.addEditPOS')}</DialogTitle>
                <DialogDescription>{t('posManagement.addEditPOSDesc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('posManagement.posId')} *</Label>
                  <Input
                    value={newPosId}
                    onChange={(e) => setNewPosId(e.target.value)}
                    placeholder={t('posManagement.posIdPlaceholder')}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('posManagement.branchLabel')} *</Label>
                  <Select value={newBranchId} onValueChange={setNewBranchId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('posManagement.selectBranch')} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('posManagement.employeeLabel')}</Label>
                  <Select value={newEmployeeId || 'none'} onValueChange={(value) => setNewEmployeeId(value === 'none' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('posManagement.selectEmployee')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('posManagement.noEmployee')}</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={`flex gap-2 ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    {t('posManagement.cancel')}
                  </Button>
                  <Button onClick={handleCreatePOS}>
                    {t('posManagement.save')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Store className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">{t('posManagement.stats.totalPOS')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl">{availableDrawers.length}</div>
            <p className="text-xs text-gray-600 mt-1">{t('posManagement.stats.activePOS')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Wallet className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">{t('posManagement.stats.totalBalances')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl">
              {formatCurrency(availableDrawers.reduce((sum, d) => sum + d.currentBalance, 0))}
            </div>
            <p className="text-xs text-gray-600 mt-1">{t('posManagement.stats.inAllDrawers')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Lock className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm">{t('posManagement.stats.openDrawers')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl">
              {availableDrawers.filter(d => d.status === 'open').length}
            </div>
            <p className="text-xs text-gray-600 mt-1">{t('posManagement.stats.openDrawer')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <User className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">{t('posManagement.stats.assignedEmployees')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl">
              {new Set(availableDrawers.filter(d => d.employeeId).map(d => d.employeeId)).size}
            </div>
            <p className="text-xs text-gray-600 mt-1">{t('posManagement.stats.activeEmployee')}</p>
          </CardContent>
        </Card>
      </div>

      {/* POS Terminals Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('posManagement.table.title')}</CardTitle>
          <CardDescription>{t('posManagement.table.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div dir={direction}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.table.posId')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.table.branch')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.table.employee')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.table.openingBalance')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.table.currentBalance')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.table.salesCash')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.table.status')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableDrawers.map((drawer) => {
                  const salesCash = drawer.currentBalance - drawer.openingBalance;
                  return (
                    <TableRow key={drawer.posId}>
                      <TableCell className="font-mono text-sm">{drawer.posId}</TableCell>
                      <TableCell>{drawer.branchName}</TableCell>
                      <TableCell>
                        {drawer.employeeName ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {drawer.employeeName}
                          </div>
                        ) : (
                          <span className="text-gray-400">{t('posManagement.table.notAssigned')}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-blue-600 font-semibold">
                        {formatCurrency(drawer.openingBalance)}
                      </TableCell>
                      <TableCell className="text-green-600 font-bold">
                        {formatCurrency(drawer.currentBalance)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatCurrency(salesCash)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={drawer.status === 'open' ? 'default' : 'secondary'}>
                          {drawer.status === 'open' ? t('posManagement.table.open') : t('posManagement.table.closed')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex gap-2 ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDrawer(drawer);
                              setShowAddMoneyDialog(true);
                            }}
                            title={t('posManagement.table.addCash')}
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          {drawer.status === 'open' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDrawer(drawer);
                                setShowCloseDialog(true);
                              }}
                              title={t('posManagement.table.closeDrawer')}
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDrawer(drawer);
                              setShowHistoryDialog(true);
                            }}
                            title={t('posManagement.table.transactionHistory')}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDrawer(drawer);
                              setShowReconciliationsDialog(true);
                            }}
                            title={t('posManagement.table.closeHistory')}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {availableDrawers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <Store className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>{t('posManagement.table.noPOS')}</p>
                      <p className="text-sm mt-2">{t('posManagement.table.noPOSDesc')}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Close Drawer Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent dir={direction}>
          <DialogHeader>
            <DialogTitle>{t('posManagement.closeDrawer.title')}</DialogTitle>
            <DialogDescription>
              {selectedDrawer && t('posManagement.closeDrawer.posInfo').replace('{posId}', selectedDrawer.posId).replace('{branchName}', selectedDrawer.branchName)}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>{t('posManagement.closeDrawer.openingBalance')}</span>
                  <span className="font-semibold">{formatCurrency(selectedDrawer.openingBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('posManagement.closeDrawer.salesCash')}</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedDrawer.currentBalance - selectedDrawer.openingBalance)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">{t('posManagement.closeDrawer.expectedInDrawer')}</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedDrawer.currentBalance)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('posManagement.closeDrawer.actualAmount')} *</Label>
                <Input
                  type="number"
                  value={actualCounted}
                  onChange={(e) => setActualCounted(e.target.value)}
                  placeholder={t('posManagement.closeDrawer.actualAmountPlaceholder')}
                  step="0.01"
                  className="text-lg"
                />
              </div>
              {actualCounted && parseFloat(actualCounted) !== selectedDrawer.currentBalance && (
                <div className="space-y-2">
                  <Label>{t('posManagement.closeDrawer.discrepancyReason')}</Label>
                  <Textarea
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    placeholder={t('posManagement.closeDrawer.discrepancyReasonPlaceholder')}
                    rows={3}
                  />
                  <div className="text-sm text-red-600">
                    {t('posManagement.closeDrawer.discrepancy')} {formatCurrency(parseFloat(actualCounted) - selectedDrawer.currentBalance)}
                  </div>
                </div>
              )}
              <div className={`flex gap-2 ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                <Button variant="outline" onClick={() => {
                  setShowCloseDialog(false);
                  setActualCounted('');
                  setDiscrepancyReason('');
                  setSelectedDrawer(null);
                }}>
                  {t('posManagement.cancel')}
                </Button>
                <Button onClick={handleCloseDrawer}>
                  <Lock className={`w-4 h-4 ${direction === 'rtl' ? 'mr-2' : 'ml-2'}`} />
                  {t('pos.closeDrawer')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={showAddMoneyDialog} onOpenChange={setShowAddMoneyDialog}>
        <DialogContent dir={direction}>
          <DialogHeader>
            <DialogTitle>{t('posManagement.addMoney.title')}</DialogTitle>
            <DialogDescription>
              {selectedDrawer && t('posManagement.addMoney.posInfo').replace('{posId}', selectedDrawer.posId).replace('{branchName}', selectedDrawer.branchName)}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>{t('posManagement.addMoney.currentBalance')}</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedDrawer.currentBalance)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('posManagement.addMoney.amount')}</Label>
                <Input
                  type="number"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  placeholder={t('posManagement.addMoney.amountPlaceholder')}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('posManagement.addMoney.notes')}</Label>
                <Textarea
                  value={addMoneyNotes}
                  onChange={(e) => setAddMoneyNotes(e.target.value)}
                  placeholder={t('posManagement.addMoney.notesPlaceholder')}
                  rows={3}
                />
              </div>
              <div className={`flex gap-2 ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                <Button variant="outline" onClick={() => {
                  setShowAddMoneyDialog(false);
                  setAddMoneyAmount('');
                  setAddMoneyNotes('');
                  setSelectedDrawer(null);
                }}>
                  {t('posManagement.cancel')}
                </Button>
                <Button onClick={handleAddMoney}>
                  <DollarSign className={`w-4 h-4 ${direction === 'rtl' ? 'mr-2' : 'ml-2'}`} />
                  {t('pos.add')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl" dir={direction}>
          <DialogHeader>
            <DialogTitle>{t('posManagement.history.title')}</DialogTitle>
            <DialogDescription>
              {selectedDrawer && t('posManagement.history.posInfo').replace('{posId}', selectedDrawer.posId).replace('{branchName}', selectedDrawer.branchName)}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.history.date')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.history.type')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.history.amount')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.history.description')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.history.user')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drawerTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{new Date(txn.date).toLocaleDateString(direction === 'rtl' ? 'ar-SA' : 'en-US')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {txn.type === 'opening' ? t('posManagement.history.opening') :
                           txn.type === 'sale' ? t('posManagement.history.sale') :
                           txn.type === 'return' ? t('posManagement.history.return') :
                           txn.type === 'manual_add' ? t('posManagement.history.manualAdd') :
                           txn.type === 'manual_deduct' ? t('posManagement.history.manualDeduct') :
                           txn.type === 'closing' ? t('posManagement.history.closing') : txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell>{txn.description}</TableCell>
                      <TableCell>{txn.userName}</TableCell>
                    </TableRow>
                  ))}
                  {drawerTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {t('posManagement.history.noTransactions')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reconciliations Dialog */}
      <Dialog open={showReconciliationsDialog} onOpenChange={setShowReconciliationsDialog}>
        <DialogContent className="max-w-4xl" dir={direction}>
          <DialogHeader>
            <DialogTitle>{t('posManagement.reconciliations.title')}</DialogTitle>
            <DialogDescription>
              {selectedDrawer && t('posManagement.reconciliations.posInfo').replace('{posId}', selectedDrawer.posId).replace('{branchName}', selectedDrawer.branchName)}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.reconciliations.date')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.reconciliations.openingBalance')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.reconciliations.salesCash')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.reconciliations.expected')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.reconciliations.actual')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.reconciliations.discrepancy')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.reconciliations.status')}</TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('posManagement.reconciliations.closedBy')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drawerReconciliations.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{new Date(rec.date).toLocaleDateString(direction === 'rtl' ? 'ar-SA' : 'en-US')}</TableCell>
                      <TableCell>{formatCurrency(rec.openingBalance)}</TableCell>
                      <TableCell>{formatCurrency(rec.salesCash)}</TableCell>
                      <TableCell>{formatCurrency(rec.expectedBalance)}</TableCell>
                      <TableCell>{formatCurrency(rec.actualCounted)}</TableCell>
                      <TableCell className={rec.discrepancy === 0 ? 'text-green-600' : 'text-red-600'}>
                        {rec.discrepancy > 0 ? '+' : ''}{formatCurrency(rec.discrepancy)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rec.status === 'closed' ? 'default' : 'destructive'}>
                          {rec.status === 'closed' ? t('posManagement.reconciliations.matched') : t('posManagement.reconciliations.mismatched')}
                        </Badge>
                      </TableCell>
                      <TableCell>{rec.closedByName}</TableCell>
                    </TableRow>
                  ))}
                  {drawerReconciliations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {t('posManagement.reconciliations.noReconciliations')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

