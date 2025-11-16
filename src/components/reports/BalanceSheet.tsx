import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';
import { Download, Building2, Wallet, TrendingUp, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function BalanceSheet() {
  const { t, direction } = useLanguage();

  const balanceSheet = {
    assets: {
      current: {
        cash: 850000,
        accountsReceivable: 620000,
        inventory: 1200000,
        prepaidExpenses: 45000,
        total: 2715000
      },
      fixed: {
        land: 2500000,
        buildings: 1800000,
        equipment: 650000,
        vehicles: 420000,
        accumulatedDepreciation: -580000,
        total: 4790000
      },
      total: 7505000
    },
    liabilities: {
      current: {
        accountsPayable: 480000,
        shortTermLoans: 320000,
        accrued: 125000,
        total: 925000
      },
      longTerm: {
        longTermLoans: 1200000,
        bonds: 800000,
        total: 2000000
      },
      total: 2925000
    },
    equity: {
      capital: 3000000,
      retainedEarnings: 1190000,
      currentYearProfit: 390000,
      total: 4580000
    }
  };

  const assetDistribution = [
    { name: 'النقد والأرصدة', value: balanceSheet.assets.current.cash, color: '#3b82f6' },
    { name: 'المدينون', value: balanceSheet.assets.current.accountsReceivable, color: '#8b5cf6' },
    { name: 'المخزون', value: balanceSheet.assets.current.inventory, color: '#10b981' },
    { name: 'الأصول الثابتة', value: balanceSheet.assets.fixed.total, color: '#f59e0b' }
  ];

  const comparisonData = [
    { category: 'الأصول المتداولة', amount: balanceSheet.assets.current.total },
    { category: 'الأصول الثابتة', amount: balanceSheet.assets.fixed.total },
    { category: 'الخصوم المتداولة', amount: balanceSheet.liabilities.current.total },
    { category: 'الخصوم طويلة الأجل', amount: balanceSheet.liabilities.longTerm.total },
    { category: 'حقوق الملكية', amount: balanceSheet.equity.total }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const stats = [
    {
      title: 'إجمالي الأصول',
      value: formatCurrency(balanceSheet.assets.total),
      icon: Building2,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'إجمالي الخصوم',
      value: formatCurrency(balanceSheet.liabilities.total),
      icon: Wallet,
      bgColor: 'bg-red-50',
      color: 'text-red-600'
    },
    {
      title: 'حقوق الملكية',
      value: formatCurrency(balanceSheet.equity.total),
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'رأس المال العامل',
      value: formatCurrency(balanceSheet.assets.current.total - balanceSheet.liabilities.current.total),
      icon: Package,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600'
    }
  ];

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">الميزانية العمومية</h1>
          <p className="text-gray-600">المركز المالي للشركة في تاريخ 30 يونيو 2025</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="2025-06">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-06">يونيو 2025</SelectItem>
              <SelectItem value="2025-03">مارس 2025</SelectItem>
              <SelectItem value="2024-12">ديسمبر 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع الأصول</CardTitle>
            <CardDescription>نسب الأصول حسب التصنيف</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مقارنة المكونات</CardTitle>
            <CardDescription>الأصول، الخصوم، وحقوق الملكية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={150} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Balance Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">الأصول</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Assets */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-700">الأصول المتداولة</h3>
                <div className="space-y-2 pr-4">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">النقد والأرصدة البنكية</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.assets.current.cash)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">المدينون والذمم المدينة</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.assets.current.accountsReceivable)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">المخزون</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.assets.current.inventory)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">مصروفات مدفوعة مقدماً</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.assets.current.prepaidExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-blue-200 mt-2">
                    <span className="font-bold">إجمالي الأصول المتداولة</span>
                    <span className="font-bold text-blue-600">{formatCurrency(balanceSheet.assets.current.total)}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Assets */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-700">الأصول الثابتة</h3>
                <div className="space-y-2 pr-4">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">الأراضي</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.assets.fixed.land)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">المباني والمنشآت</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.assets.fixed.buildings)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">الآلات والمعدات</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.assets.fixed.equipment)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">السيارات والمركبات</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.assets.fixed.vehicles)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700 text-red-600">مجمع الإهلاك</span>
                    <span className="font-medium text-red-600">{formatCurrency(balanceSheet.assets.fixed.accumulatedDepreciation)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-blue-200 mt-2">
                    <span className="font-bold">إجمالي الأصول الثابتة</span>
                    <span className="font-bold text-blue-600">{formatCurrency(balanceSheet.assets.fixed.total)}</span>
                  </div>
                </div>
              </div>

              {/* Total Assets */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-bold text-xl">إجمالي الأصول</span>
                  <span className="font-bold text-xl text-blue-600">{formatCurrency(balanceSheet.assets.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">الخصوم وحقوق الملكية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Liabilities */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-700">الخصوم المتداولة</h3>
                <div className="space-y-2 pr-4">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">الدائنون والذمم الدائنة</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.liabilities.current.accountsPayable)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">قروض قصيرة الأجل</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.liabilities.current.shortTermLoans)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">مصروفات مستحقة</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.liabilities.current.accrued)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-red-200 mt-2">
                    <span className="font-bold">إجمالي الخصوم المتداولة</span>
                    <span className="font-bold text-red-600">{formatCurrency(balanceSheet.liabilities.current.total)}</span>
                  </div>
                </div>
              </div>

              {/* Long-term Liabilities */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-700">الخصوم طويلة الأجل</h3>
                <div className="space-y-2 pr-4">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">قروض طويلة الأجل</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.liabilities.longTerm.longTermLoans)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">سندات دين</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.liabilities.longTerm.bonds)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-red-200 mt-2">
                    <span className="font-bold">إجمالي الخصوم طويلة الأجل</span>
                    <span className="font-bold text-red-600">{formatCurrency(balanceSheet.liabilities.longTerm.total)}</span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities */}
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">إجمالي الخصوم</span>
                  <span className="font-bold text-lg text-red-600">{formatCurrency(balanceSheet.liabilities.total)}</span>
                </div>
              </div>

              {/* Equity */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-700">حقوق الملكية</h3>
                <div className="space-y-2 pr-4">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">رأس المال</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.equity.capital)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">أرباح محتجزة</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.equity.retainedEarnings)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">أرباح العام الحالي</span>
                    <span className="font-medium">{formatCurrency(balanceSheet.equity.currentYearProfit)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-green-200 mt-2">
                    <span className="font-bold">إجمالي حقوق الملكية</span>
                    <span className="font-bold text-green-600">{formatCurrency(balanceSheet.equity.total)}</span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities & Equity */}
              <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-400">
                <div className="flex justify-between">
                  <span className="font-bold text-xl">إجمالي الخصوم وحقوق الملكية</span>
                  <span className="font-bold text-xl">{formatCurrency(balanceSheet.liabilities.total + balanceSheet.equity.total)}</span>
                </div>
              </div>

              {/* Financial Ratios */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">نسبة التداول</p>
                  <p className="text-lg font-bold text-blue-600">
                    {(balanceSheet.assets.current.total / balanceSheet.liabilities.current.total).toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">نسبة المديونية</p>
                  <p className="text-lg font-bold text-purple-600">
                    {((balanceSheet.liabilities.total / balanceSheet.assets.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


