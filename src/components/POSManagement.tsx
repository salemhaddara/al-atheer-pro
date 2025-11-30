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
      toast.error('يرجى إدخال معرف نقطة البيع');
      return;
    }
    if (!newBranchId) {
      toast.error('يرجى اختيار الفرع');
      return;
    }

    const branch = branches.find(b => b.id === newBranchId);
    const employee = newEmployeeId ? employees.find(e => e.id === newEmployeeId) : undefined;

    const drawer = createOrUpdateDrawer(
      newPosId.trim(),
      newBranchId,
      branch?.name || 'الفرع الرئيسي',
      employee?.id,
      employee?.name
    );

    setDrawers(loadDrawers());
    toast.success('تم إنشاء/تحديث نقطة البيع بنجاح');
    setShowCreateDialog(false);
    setNewPosId('');
    setNewBranchId('');
    setNewEmployeeId('');
  };

  const handleCloseDrawer = () => {
    if (!selectedDrawer) return;

    const counted = parseFloat(actualCounted);
    if (!counted || counted < 0) {
      toast.error('يرجى إدخال المبلغ الفعلي');
      return;
    }

    const discrepancy = counted - selectedDrawer.currentBalance;
    if (discrepancy !== 0 && !discrepancyReason.trim()) {
      toast.error('يرجى إدخال سبب الفارق');
      return;
    }

    const result = closeDrawer(
      selectedDrawer.posId,
      counted,
      currentUser?.id || 'unknown',
      currentUser?.name || 'غير محدد',
      discrepancy !== 0 ? discrepancyReason : undefined
    );

    if (result.success) {
      toast.success('تم إغلاق الدرج بنجاح');
      setDrawers(loadDrawers());
      setShowCloseDialog(false);
      setActualCounted('');
      setDiscrepancyReason('');
      setSelectedDrawer(null);
    } else {
      toast.error(result.error || 'فشل إغلاق الدرج');
    }
  };

  const handleAddMoney = () => {
    if (!selectedDrawer) return;

    const amount = parseFloat(addMoneyAmount);
    if (!amount || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    const success = addToDrawer(
      selectedDrawer.posId,
      amount,
      'manual_add',
      currentUser?.id || 'unknown',
      currentUser?.name || 'غير محدد',
      addMoneyNotes || 'إضافة يدوية'
    );

    if (success) {
      toast.success(`تم إضافة ${formatCurrency(amount)} للدرج`);
      setDrawers(loadDrawers());
      setShowAddMoneyDialog(false);
      setAddMoneyAmount('');
      setAddMoneyNotes('');
      setSelectedDrawer(null);
    } else {
      toast.error('فشل إضافة المبلغ');
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
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>إدارة نقاط البيع والدرج النقدية</h1>
          <p className="text-gray-600">إدارة نقاط البيع وتعيين الموظفين وإدارة الدرج النقدية</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة نقطة بيع جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة/تعديل نقطة بيع</DialogTitle>
                <DialogDescription>إنشاء نقطة بيع جديدة أو تحديث موجودة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>معرف نقطة البيع *</Label>
                  <Input
                    value={newPosId}
                    onChange={(e) => setNewPosId(e.target.value)}
                    placeholder="pos-1, pos-2, ..."
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفرع *</Label>
                  <Select value={newBranchId} onValueChange={setNewBranchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفرع" />
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
                  <Label>الموظف المسؤول (اختياري)</Label>
                  <Select value={newEmployeeId} onValueChange={setNewEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">لا يوجد</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleCreatePOS}>
                    حفظ
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
            <CardTitle className="text-sm">إجمالي نقاط البيع</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{availableDrawers.length}</div>
            <p className="text-xs text-gray-600 mt-1">نقطة بيع نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Wallet className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">إجمالي الأرصدة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">
              {formatCurrency(availableDrawers.reduce((sum, d) => sum + d.currentBalance, 0))}
            </div>
            <p className="text-xs text-gray-600 mt-1">في جميع الدرج</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Lock className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm">الدرج المفتوحة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">
              {availableDrawers.filter(d => d.status === 'open').length}
            </div>
            <p className="text-xs text-gray-600 mt-1">درج مفتوح</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <User className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">الموظفين المعينين</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">
              {new Set(availableDrawers.filter(d => d.employeeId).map(d => d.employeeId)).size}
            </div>
            <p className="text-xs text-gray-600 mt-1">موظف نشط</p>
          </CardContent>
        </Card>
      </div>

      {/* POS Terminals Table */}
      <Card>
        <CardHeader>
          <CardTitle>نقاط البيع والدرج النقدية</CardTitle>
          <CardDescription>عرض وإدارة جميع نقاط البيع والدرج النقدية</CardDescription>
        </CardHeader>
        <CardContent>
          <div dir="rtl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">معرف نقطة البيع</TableHead>
                  <TableHead className="text-right">الفرع</TableHead>
                  <TableHead className="text-right">الموظف المسؤول</TableHead>
                  <TableHead className="text-right">رصيد الافتتاح</TableHead>
                  <TableHead className="text-right">الرصيد الحالي</TableHead>
                  <TableHead className="text-right">نقد المبيعات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
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
                          <span className="text-gray-400">غير معين</span>
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
                          {drawer.status === 'open' ? 'مفتوح' : 'مغلق'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDrawer(drawer);
                              setShowAddMoneyDialog(true);
                            }}
                            title="إضافة نقد"
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
                              title="إغلاق الدرج"
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
                            title="سجل الحركات"
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
                            title="سجل الإغلاق"
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
                      <p>لا توجد نقاط بيع مسجلة</p>
                      <p className="text-sm mt-2">اضغط على "إضافة نقطة بيع جديدة" لإنشاء واحدة</p>
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
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إغلاق درج النقدية</DialogTitle>
            <DialogDescription>
              {selectedDrawer && `نقطة البيع: ${selectedDrawer.posId} - ${selectedDrawer.branchName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>رصيد الافتتاح:</span>
                  <span className="font-semibold">{formatCurrency(selectedDrawer.openingBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>نقد المبيعات:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedDrawer.currentBalance - selectedDrawer.openingBalance)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">المتوقع في الدرج:</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedDrawer.currentBalance)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>المبلغ الفعلي الموجود في الدرج *</Label>
                <Input
                  type="number"
                  value={actualCounted}
                  onChange={(e) => setActualCounted(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="text-lg"
                />
              </div>
              {actualCounted && parseFloat(actualCounted) !== selectedDrawer.currentBalance && (
                <div className="space-y-2">
                  <Label>سبب الفارق (مطلوب)</Label>
                  <Textarea
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    placeholder="مثال: خطأ في العد، نقص نقد..."
                    rows={3}
                  />
                  <div className="text-sm text-red-600">
                    الفارق: {formatCurrency(parseFloat(actualCounted) - selectedDrawer.currentBalance)}
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowCloseDialog(false);
                  setActualCounted('');
                  setDiscrepancyReason('');
                  setSelectedDrawer(null);
                }}>
                  إلغاء
                </Button>
                <Button onClick={handleCloseDrawer}>
                  <Lock className="w-4 h-4 ml-2" />
                  إغلاق الدرج
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={showAddMoneyDialog} onOpenChange={setShowAddMoneyDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة نقد للدرج</DialogTitle>
            <DialogDescription>
              {selectedDrawer && `نقطة البيع: ${selectedDrawer.posId} - ${selectedDrawer.branchName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>الرصيد الحالي:</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedDrawer.currentBalance)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input
                  type="number"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea
                  value={addMoneyNotes}
                  onChange={(e) => setAddMoneyNotes(e.target.value)}
                  placeholder="مثال: نقد للصرف..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowAddMoneyDialog(false);
                  setAddMoneyAmount('');
                  setAddMoneyNotes('');
                  setSelectedDrawer(null);
                }}>
                  إلغاء
                </Button>
                <Button onClick={handleAddMoney}>
                  <DollarSign className="w-4 h-4 ml-2" />
                  إضافة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>سجل حركات الدرج</DialogTitle>
            <DialogDescription>
              {selectedDrawer && `نقطة البيع: ${selectedDrawer.posId} - ${selectedDrawer.branchName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المستخدم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drawerTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{new Date(txn.date).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {txn.type === 'opening' ? 'فتح' :
                           txn.type === 'sale' ? 'بيع' :
                           txn.type === 'return' ? 'مرتجع' :
                           txn.type === 'manual_add' ? 'إضافة يدوية' :
                           txn.type === 'manual_deduct' ? 'خصم يدوي' :
                           txn.type === 'closing' ? 'إغلاق' : txn.type}
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
                        لا توجد حركات مسجلة
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
        <DialogContent className="max-w-4xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>سجل إغلاق الدرج</DialogTitle>
            <DialogDescription>
              {selectedDrawer && `نقطة البيع: ${selectedDrawer.posId} - ${selectedDrawer.branchName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">رصيد الافتتاح</TableHead>
                    <TableHead className="text-right">نقد المبيعات</TableHead>
                    <TableHead className="text-right">المتوقع</TableHead>
                    <TableHead className="text-right">الفعلي</TableHead>
                    <TableHead className="text-right">الفارق</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">المغلق بواسطة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drawerReconciliations.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{new Date(rec.date).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{formatCurrency(rec.openingBalance)}</TableCell>
                      <TableCell>{formatCurrency(rec.salesCash)}</TableCell>
                      <TableCell>{formatCurrency(rec.expectedBalance)}</TableCell>
                      <TableCell>{formatCurrency(rec.actualCounted)}</TableCell>
                      <TableCell className={rec.discrepancy === 0 ? 'text-green-600' : 'text-red-600'}>
                        {rec.discrepancy > 0 ? '+' : ''}{formatCurrency(rec.discrepancy)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rec.status === 'closed' ? 'default' : 'destructive'}>
                          {rec.status === 'closed' ? 'مطابق' : 'فارق'}
                        </Badge>
                      </TableCell>
                      <TableCell>{rec.closedByName}</TableCell>
                    </TableRow>
                  ))}
                  {drawerReconciliations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        لا توجد عمليات إغلاق مسجلة
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

