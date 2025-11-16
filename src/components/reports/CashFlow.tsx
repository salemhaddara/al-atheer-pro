import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';
import { Download, TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

export function CashFlow() {
  const { t, direction } = useLanguage();

  const monthlyFlow = [
    { month: 'يناير', operating: 145000, investing: -85000, financing: -20000, net: 40000 },
    { month: 'فبراير', operating: 180000, investing: -45000, financing: -25000, net: 110000 },
    { month: 'مارس', operating: 165000, investing: -120000, financing: 50000, net: 95000 },
    { month: 'أبريل', operating: 220000, investing: -35000, financing: -30000, net: 155000 },
    { month: 'مايو', operating: 195000, investing: -95000, financing: -25000, net: 75000 },
    { month: 'يونيو', operating: 245000, investing: -55000, financing: -35000, net: 155000 }
  ];

  const cashFlowStatement = {
    operating: {
      netIncome: 390000,
      depreciation: 75000,
      accountsReceivable: -85000,
      inventory: -120000,
      accountsPayable: 65000,
      other: 25000,
      total: 350000
    },
    investing: {
      equipmentPurchase: -180000,
      propertyPurchase: -250000,
      investmentSales: 45000,
      total: -385000
    },
    financing: {
      loanProceeds: 200000,
      loanRepayment: -150000,
      dividendsPaid: -65000,
      total: -15000
    }
  };

  const netChange = cashFlowStatement.operating.total + cashFlowStatement.investing.total + cashFlowStatement.financing.total;
  const beginningCash = 800000;
  const endingCash = beginningCash + netChange;

  const cumulativeData = monthlyFlow.map((item, index) => ({
    ...item,
    cumulative: monthlyFlow.slice(0, index + 1).reduce((sum, m) => sum + m.net, 0) + beginningCash
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const stats = [
    {
      title: 'التدفق من الأنشطة التشغيلية',
      value: formatCurrency(cashFlowStatement.operating.total),
      icon: Wallet,
      bgColor: 'bg-green-50',
      color: 'text-green-600',
      trend: 'up'
    },
    {
      title: 'التدفق من الأنشطة الاستثمارية',
      value: formatCurrency(cashFlowStatement.investing.total),
      icon: ArrowDownCircle,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600',
      trend: 'down'
    },
    {
      title: 'التدفق من الأنشطة التمويلية',
      value: formatCurrency(cashFlowStatement.financing.total),
      icon: ArrowUpCircle,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600',
      trend: 'down'
    },
    {
      title: 'صافي التغير في النقد',
      value: formatCurrency(netChange),
      icon: TrendingUp,
      bgColor: 'bg-emerald-50',
      color: 'text-emerald-600',
      trend: 'down'
    }
  ];

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">قائمة التدفقات النقدية</h1>
          <p className="text-gray-600">تحليل حركة النقد من الأنشطة التشغيلية والاستثمارية والتمويلية</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="ytd">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">من بداية العام</SelectItem>
              <SelectItem value="q2">الربع الثاني</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
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
            <CardTitle>التدفقات النقدية الشهرية</CardTitle>
            <CardDescription>التدفقات حسب نوع النشاط</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="operating" name="التشغيلية" fill="#10b981" />
                <Bar dataKey="investing" name="الاستثمارية" fill="#3b82f6" />
                <Bar dataKey="financing" name="التمويلية" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الرصيد النقدي التراكمي</CardTitle>
            <CardDescription>تطور الرصيد النقدي عبر الزمن</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="cumulative" name="الرصيد النقدي" stroke="#3b82f6" fill="#3b82f620" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cash Flow Statement */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة التدفقات النقدية التفصيلية</CardTitle>
          <CardDescription>من 1 يناير 2025 حتى 30 يونيو 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Operating Activities */}
            <div>
              <div className="flex justify-between items-center py-3 border-b-2 border-green-600 bg-green-50 px-4 rounded-t-lg">
                <span className="font-bold text-lg">التدفقات النقدية من الأنشطة التشغيلية</span>
              </div>
              <div className="space-y-2 px-4 py-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">صافي الربح</span>
                  <span className="font-medium text-green-600">{formatCurrency(cashFlowStatement.operating.netIncome)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 pr-4">+ الإهلاك والاستهلاك</span>
                  <span className="font-medium text-green-600">{formatCurrency(cashFlowStatement.operating.depreciation)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 pr-4">- الزيادة في المدينون</span>
                  <span className="font-medium text-red-600">{formatCurrency(cashFlowStatement.operating.accountsReceivable)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 pr-4">- الزيادة في المخزون</span>
                  <span className="font-medium text-red-600">{formatCurrency(cashFlowStatement.operating.inventory)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 pr-4">+ الزيادة في الدائنون</span>
                  <span className="font-medium text-green-600">{formatCurrency(cashFlowStatement.operating.accountsPayable)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 pr-4">+ تعديلات أخرى</span>
                  <span className="font-medium text-green-600">{formatCurrency(cashFlowStatement.operating.other)}</span>
                </div>
                <div className="flex justify-between py-3 bg-green-50 px-2 rounded-lg border-t-2 border-green-200 mt-2">
                  <span className="font-bold">صافي النقد من الأنشطة التشغيلية</span>
                  <span className="font-bold text-green-600">{formatCurrency(cashFlowStatement.operating.total)}</span>
                </div>
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <div className="flex justify-between items-center py-3 border-b-2 border-blue-600 bg-blue-50 px-4 rounded-t-lg">
                <span className="font-bold text-lg">التدفقات النقدية من الأنشطة الاستثمارية</span>
              </div>
              <div className="space-y-2 px-4 py-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">شراء معدات وآلات</span>
                  <span className="font-medium text-red-600">{formatCurrency(cashFlowStatement.investing.equipmentPurchase)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">شراء عقارات</span>
                  <span className="font-medium text-red-600">{formatCurrency(cashFlowStatement.investing.propertyPurchase)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">بيع استثمارات</span>
                  <span className="font-medium text-green-600">{formatCurrency(cashFlowStatement.investing.investmentSales)}</span>
                </div>
                <div className="flex justify-between py-3 bg-blue-50 px-2 rounded-lg border-t-2 border-blue-200 mt-2">
                  <span className="font-bold">صافي النقد من الأنشطة الاستثمارية</span>
                  <span className="font-bold text-blue-600">{formatCurrency(cashFlowStatement.investing.total)}</span>
                </div>
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <div className="flex justify-between items-center py-3 border-b-2 border-purple-600 bg-purple-50 px-4 rounded-t-lg">
                <span className="font-bold text-lg">التدفقات النقدية من الأنشطة التمويلية</span>
              </div>
              <div className="space-y-2 px-4 py-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">حصيلة قروض جديدة</span>
                  <span className="font-medium text-green-600">{formatCurrency(cashFlowStatement.financing.loanProceeds)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">سداد قروض</span>
                  <span className="font-medium text-red-600">{formatCurrency(cashFlowStatement.financing.loanRepayment)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">توزيعات الأرباح المدفوعة</span>
                  <span className="font-medium text-red-600">{formatCurrency(cashFlowStatement.financing.dividendsPaid)}</span>
                </div>
                <div className="flex justify-between py-3 bg-purple-50 px-2 rounded-lg border-t-2 border-purple-200 mt-2">
                  <span className="font-bold">صافي النقد من الأنشطة التمويلية</span>
                  <span className="font-bold text-purple-600">{formatCurrency(cashFlowStatement.financing.total)}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-3 pt-4">
              <div className="flex justify-between py-3 bg-gray-100 px-4 rounded-lg">
                <span className="font-bold text-lg">صافي التغير في النقد</span>
                <span className={`font-bold text-lg ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netChange)}
                </span>
              </div>
              <div className="flex justify-between py-2 px-4">
                <span className="font-semibold">النقد في بداية الفترة</span>
                <span className="font-semibold">{formatCurrency(beginningCash)}</span>
              </div>
              <div className="flex justify-between py-4 bg-emerald-100 px-4 rounded-lg border-2 border-emerald-600">
                <span className="font-bold text-xl text-emerald-800">النقد في نهاية الفترة</span>
                <span className="font-bold text-xl text-emerald-800">{formatCurrency(endingCash)}</span>
              </div>
            </div>

            {/* Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">معدل التدفق التشغيلي الشهري</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(cashFlowStatement.operating.total / 6)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">نسبة التدفق الحر</p>
                <p className="text-2xl font-bold text-blue-600">
                  {((cashFlowStatement.operating.total / cashFlowStatement.operating.netIncome) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">نسبة كفاية النقد</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((endingCash / (cashFlowStatement.operating.total / 6)) * 30).toFixed(0)} يوم
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


