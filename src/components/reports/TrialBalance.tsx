import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Download, Printer, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { loadAccounts, calculateAccountBalance, type Account } from '../../data/chartOfAccounts';
import { getAllJournalEntries } from '../../data/journalEntries';
import { useLanguage } from '../../contexts/LanguageContext';

interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export function TrialBalance() {
  const { t, direction } = useLanguage();
  const [accounts] = useState<Account[]>(loadAccounts());
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const journalEntries = useMemo(() => getAllJournalEntries(), []);

  // Filter journal entries up to the selected date
  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => entry.date <= asOfDate);
  }, [journalEntries, asOfDate]);

  // Calculate trial balance
  const trialBalance = useMemo(() => {
    const rows: TrialBalanceRow[] = [];
    let totalDebit = 0;
    let totalCredit = 0;

    // Get only detail accounts (level > 0)
    const detailAccounts = accounts.filter(acc => acc.isActive && acc.level > 0);

    detailAccounts.forEach(account => {
      const balance = calculateAccountBalance(account.code, filteredEntries);
      
      let debit = 0;
      let credit = 0;

      if (account.nature === 'مدين' || account.nature === 'Debit') {
        if (balance >= 0) {
          debit = balance;
        } else {
          credit = Math.abs(balance);
        }
      } else {
        if (balance >= 0) {
          credit = balance;
        } else {
          debit = Math.abs(balance);
        }
      }

      totalDebit += debit;
      totalCredit += credit;

      rows.push({
        accountCode: account.code,
        accountName: account.name,
        debit,
        credit,
        balance
      });
    });

    return {
      rows: rows.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalDebit,
      totalCredit,
      difference: Math.abs(totalDebit - totalCredit)
    };
  }, [accounts, filteredEntries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      [t('accounting.trialBalance.trialBalanceTitle'), t('accounting.trialBalance.asOfDateDesc').replace('{date}', formatDate(asOfDate))],
      [],
      [t('accounting.trialBalance.accountCode'), t('accounting.trialBalance.accountName'), t('accounting.trialBalance.debit'), t('accounting.trialBalance.credit'), t('accounting.trialBalance.balance')],
      ...trialBalance.rows.map(row => [
        row.accountCode,
        row.accountName,
        row.debit.toFixed(2),
        row.credit.toFixed(2),
        row.balance.toFixed(2)
      ]),
      [],
      [t('accounting.trialBalance.total'), '', trialBalance.totalDebit.toFixed(2), trialBalance.totalCredit.toFixed(2), ''],
      [t('accounting.trialBalance.difference'), '', trialBalance.difference.toFixed(2), '', '']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${t('accounting.trialBalance.exportFileName').replace('{date}', asOfDate)}.csv`;
    link.click();
    toast.success(t('accounting.trialBalance.exportSuccess'));
  };

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <h1>{t('accounting.trialBalance.title')}</h1>
          <p className="text-gray-600">{t('accounting.trialBalance.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            {t('accounting.trialBalance.print')}
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t('accounting.trialBalance.export')}
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label>{t('accounting.trialBalance.asOfDate')}</Label>
              <div className="relative">
                <Calendar className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className={direction === 'rtl' ? 'pr-10' : 'pl-10'}
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader dir={direction}>
          <CardTitle>{t('accounting.trialBalance.trialBalanceTitle')}</CardTitle>
          <CardDescription>
            {t('accounting.trialBalance.asOfDateDesc').replace('{date}', formatDate(asOfDate))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table dir={direction}>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${direction === 'rtl' ? 'text-right' : 'text-left'} w-24`}>{t('accounting.trialBalance.accountCode')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.trialBalance.accountName')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.trialBalance.debit')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.trialBalance.credit')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('accounting.trialBalance.balance')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalance.rows.length > 0 ? (
                  <>
                    {trialBalance.rows.map((row) => (
                      <TableRow key={row.accountCode}>
                        <TableCell className="font-mono text-sm">{row.accountCode}</TableCell>
                        <TableCell>{row.accountName}</TableCell>
                        <TableCell className={row.debit > 0 ? 'text-blue-600 font-medium' : ''}>
                          {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                        </TableCell>
                        <TableCell className={row.credit > 0 ? 'text-purple-600 font-medium' : ''}>
                          {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                        </TableCell>
                        <TableCell className={row.balance >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {formatCurrency(row.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell colSpan={2} className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        {t('accounting.trialBalance.total')}
                      </TableCell>
                      <TableCell className="text-blue-600">
                        {formatCurrency(trialBalance.totalDebit)}
                      </TableCell>
                      <TableCell className="text-purple-600">
                        {formatCurrency(trialBalance.totalCredit)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(trialBalance.totalDebit - trialBalance.totalCredit)}
                      </TableCell>
                    </TableRow>
                    {trialBalance.difference > 0.01 && (
                      <TableRow className="bg-red-50">
                        <TableCell colSpan={5} className="text-center text-red-600 font-semibold">
                          ⚠️ {t('accounting.trialBalance.differenceWarning').replace('{difference}', formatCurrency(trialBalance.difference))}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>{t('accounting.trialBalance.noAccounts')}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

