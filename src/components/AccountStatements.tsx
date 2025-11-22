import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Download, Printer, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { loadAccounts, getAccountByCode, type Account } from '../data/chartOfAccounts';
import { getAllJournalEntries, type JournalEntry } from '../data/journalEntries';
import { SearchableSelect } from './ui/searchable-select';

interface AccountTransaction {
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  entryId: string;
}

export function AccountStatements() {
  const [accounts] = useState<Account[]>(loadAccounts());
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const journalEntries = useMemo(() => getAllJournalEntries(), []);

  const selectedAccount = useMemo(() => {
    if (!selectedAccountId) return null;
    return accounts.find(acc => acc.id === selectedAccountId);
  }, [selectedAccountId, accounts]);

  // Build account transactions
  const transactions = useMemo(() => {
    if (!selectedAccount) return [];

    const accountTransactions: AccountTransaction[] = [];
    let runningBalance = selectedAccount.openingBalance || 0;

    // Filter entries for this account
    const relevantEntries = journalEntries.filter(entry => {
      const debitMatch = entry.debitAccount === selectedAccount.name || entry.debitAccount === selectedAccount.code;
      const creditMatch = entry.creditAccount === selectedAccount.name || entry.creditAccount === selectedAccount.code;
      return debitMatch || creditMatch;
    });

    // Filter by date range
    const filteredEntries = relevantEntries.filter(entry => {
      const entryDate = entry.date;
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Sort by date
    filteredEntries.sort((a, b) => a.date.localeCompare(b.date));

    // Build transactions
    filteredEntries.forEach(entry => {
      const isDebit = entry.debitAccount === selectedAccount.name || entry.debitAccount === selectedAccount.code;
      const isCredit = entry.creditAccount === selectedAccount.name || entry.creditAccount === selectedAccount.code;

      if (isDebit) {
        // Debit transaction
        if (selectedAccount.nature === 'مدين') {
          runningBalance += entry.amount;
        } else {
          runningBalance -= entry.amount;
        }
        accountTransactions.push({
          date: entry.date,
          description: entry.description,
          reference: entry.reference,
          debit: entry.amount,
          credit: 0,
          balance: runningBalance,
          entryId: entry.id
        });
      }

      if (isCredit) {
        // Credit transaction
        if (selectedAccount.nature === 'مدين') {
          runningBalance -= entry.amount;
        } else {
          runningBalance += entry.amount;
        }
        accountTransactions.push({
          date: entry.date,
          description: entry.description,
          reference: entry.reference,
          debit: 0,
          credit: entry.amount,
          balance: runningBalance,
          entryId: entry.id
        });
      }
    });

    return accountTransactions;
  }, [selectedAccount, journalEntries, startDate, endDate]);

  // Calculate opening balance (before start date)
  const openingBalance = useMemo(() => {
    if (!selectedAccount) return 0;

    let balance = selectedAccount.openingBalance || 0;

    const entriesBeforeStart = journalEntries.filter(entry => {
      const entryDate = entry.date;
      if (entryDate >= startDate) return false;

      const debitMatch = entry.debitAccount === selectedAccount.name || entry.debitAccount === selectedAccount.code;
      const creditMatch = entry.creditAccount === selectedAccount.name || entry.creditAccount === selectedAccount.code;
      return debitMatch || creditMatch;
    });

    entriesBeforeStart.forEach(entry => {
      const isDebit = entry.debitAccount === selectedAccount.name || entry.debitAccount === selectedAccount.code;
      const isCredit = entry.creditAccount === selectedAccount.name || entry.creditAccount === selectedAccount.code;

      if (isDebit) {
        if (selectedAccount.nature === 'مدين') {
          balance += entry.amount;
        } else {
          balance -= entry.amount;
        }
      }

      if (isCredit) {
        if (selectedAccount.nature === 'مدين') {
          balance -= entry.amount;
        } else {
          balance += entry.amount;
        }
      }
    });

    return balance;
  }, [selectedAccount, journalEntries, startDate]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    const closingBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : openingBalance;

    return { totalDebit, totalCredit, closingBalance };
  }, [transactions, openingBalance]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!selectedAccount) {
      toast.error('يرجى اختيار حساب أولاً');
      return;
    }

    // Simple CSV export
    const csvContent = [
      ['كشف حساب', selectedAccount.name, `(${selectedAccount.code})`],
      ['من', startDate, 'إلى', endDate],
      [],
      ['التاريخ', 'الوصف', 'المرجع', 'مدين', 'دائن', 'الرصيد'],
      ...transactions.map(t => [
        formatDate(t.date),
        t.description,
        t.reference,
        t.debit.toFixed(2),
        t.credit.toFixed(2),
        t.balance.toFixed(2)
      ]),
      [],
      ['الإجمالي', '', '', totals.totalDebit.toFixed(2), totals.totalCredit.toFixed(2), totals.closingBalance.toFixed(2)]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `كشف_حساب_${selectedAccount.code}_${startDate}_${endDate}.csv`;
    link.click();
    toast.success('تم تصدير الكشف بنجاح');
  };

  // Prepare accounts for SearchableSelect
  const accountOptions = useMemo(() => {
    return accounts
      .filter(acc => acc.isActive && acc.level > 0) // Only show detail accounts, not main categories
      .map(acc => ({
        id: acc.id,
        name: `${acc.code} - ${acc.name}`,
        accountNumber: acc.code,
        description: acc.description
      }));
  }, [accounts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>كشوفات الحسابات</h1>
          <p className="text-gray-600">عرض حركات وأرصدة الحسابات</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>اختر الحساب *</Label>
              <SearchableSelect
                options={accountOptions}
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                placeholder="ابحث عن الحساب بالاسم أو الرمز..."
                searchPlaceholder="ابحث بالاسم أو الرمز..."
                emptyMessage="لا يوجد حسابات"
                displayKey="name"
                searchKeys={['name', 'accountNumber']}
              />
            </div>
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statement */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>كشف حساب: {selectedAccount.name}</CardTitle>
                <CardDescription>
                  الرمز: {selectedAccount.code} | النوع: {selectedAccount.type} | الطبيعة: {selectedAccount.nature}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {selectedAccount.isActive ? 'نشط' : 'معطل'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">الرصيد الافتتاحي</p>
                <p className={`text-lg font-bold ${openingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(openingBalance)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">إجمالي المدين</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(totals.totalDebit)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">إجمالي الدائن</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(totals.totalCredit)}
                </p>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المرجع</TableHead>
                    <TableHead className="text-right">مدين</TableHead>
                    <TableHead className="text-right">دائن</TableHead>
                    <TableHead className="text-right">الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow className="bg-blue-50 font-semibold">
                    <TableCell>{formatDate(startDate)}</TableCell>
                    <TableCell>الرصيد الافتتاحي</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      {openingBalance > 0 ? formatCurrency(openingBalance) : '-'}
                    </TableCell>
                    <TableCell>
                      {openingBalance < 0 ? formatCurrency(Math.abs(openingBalance)) : '-'}
                    </TableCell>
                    <TableCell className={openingBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(openingBalance)}
                    </TableCell>
                  </TableRow>

                  {/* Transactions */}
                  {transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                      <TableRow key={`${transaction.entryId}-${index}`}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {transaction.reference}
                          </code>
                        </TableCell>
                        <TableCell className={transaction.debit > 0 ? 'text-blue-600 font-medium' : ''}>
                          {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                        </TableCell>
                        <TableCell className={transaction.credit > 0 ? 'text-purple-600 font-medium' : ''}>
                          {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                        </TableCell>
                        <TableCell className={transaction.balance >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {formatCurrency(transaction.balance)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        لا توجد حركات في الفترة المحددة
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Totals Row */}
                  {transactions.length > 0 && (
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell colSpan={3} className="text-right">
                        الإجمالي
                      </TableCell>
                      <TableCell className="text-blue-600">
                        {formatCurrency(totals.totalDebit)}
                      </TableCell>
                      <TableCell className="text-purple-600">
                        {formatCurrency(totals.totalCredit)}
                      </TableCell>
                      <TableCell className={totals.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(totals.closingBalance)}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Closing Balance Row */}
                  {transactions.length > 0 && (
                    <TableRow className="bg-green-50 font-bold">
                      <TableCell colSpan={3} className="text-right">
                        الرصيد الختامي
                      </TableCell>
                      <TableCell>
                        {totals.closingBalance > 0 ? formatCurrency(totals.closingBalance) : '-'}
                      </TableCell>
                      <TableCell>
                        {totals.closingBalance < 0 ? formatCurrency(Math.abs(totals.closingBalance)) : '-'}
                      </TableCell>
                      <TableCell className={totals.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(totals.closingBalance)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedAccount && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">يرجى اختيار حساب لعرض كشفه</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

