import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ProfitLoss() {
  const { t, direction } = useLanguage();

  const monthlyPL = [
    { month: 'يناير', revenue: 450000, cogs: 180000, operating: 140000, netProfit: 130000 },
    { month: 'فبراير', revenue: 520000, cogs: 208000, operating: 132000, netProfit: 180000 },
    { month: 'مارس', revenue: 480000, cogs: 192000, operating: 118000, netProfit: 170000 },
    { month: 'أبريل', revenue: 610000, cogs: 244000, operating: 136000, netProfit: 230000 },
    { month: 'مايو', revenue: 550000, cogs: 220000, operating: 130000, netProfit: 200000 },
    { month: 'يونيو', revenue: 670000, cogs: 268000, operating: 122000, netProfit: 280000 }
  ];

  const plData = {
    revenue: {
      sales: 3280000,
      otherIncome: 85000,
      total: 3365000
    },
    expenses: {
      cogs: 1312000,
      salaries: 650000,
      rent: 180000,
      utilities: 95000,
      marketing: 145000,
      depreciation: 75000,
      other: 118000,
      total: 2575000
    }
  };

  const grossProfit = plData.revenue.total - plData.expenses.cogs;
  const operatingProfit = grossProfit - (plData.expenses.salaries + plData.expenses.rent + plData.expenses.utilities + plData.expenses.marketing);
  const netProfit = plData.revenue.total - plData.expenses.total;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const stats = [
    {
      title: 'إجمالي الإيرادات',
      value: formatCurrency(plData.revenue.total),
      icon: DollarSign,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'إجمالي الربح',
      value: formatCurrency(grossProfit),
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'الربح التشغيلي',
      value: formatCurrency(operatingProfit),
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600'
    },
    {
      title: 'صافي الربح',
      value: formatCurrency(netProfit),
      icon: TrendingUp,
      bgColor: 'bg-emerald-50',
      color: 'text-emerald-600'
    }
  ];

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">قائمة الأرباح والخسائر</h1>
          <p className="text-gray-600">تقرير مفصل للإيرادات والمصروفات وصافي الربح</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="ytd">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">من بداية العام</SelectItem>
              <SelectItem value="q1">الربع الأول</SelectItem>
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
            <CardTitle>صافي الربح الشهري</CardTitle>
            <CardDescription>تطور صافي الربح على مدار الأشهر الستة الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPL}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="netProfit" name="صافي الربح" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تحليل الإيرادات والمصروفات</CardTitle>
            <CardDescription>مقارنة شهرية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPL}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" name="الإيرادات" fill="#3b82f6" />
                <Bar dataKey="netProfit" name="صافي الربح" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed P&L Statement */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الدخل التفصيلية</CardTitle>
          <CardDescription>من بداية العام 2025 حتى 30 يونيو 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue Section */}
            <div>
              <div className="flex justify-between items-center py-3 border-b-2 border-blue-600 bg-blue-50 px-4 rounded-t-lg">
                <span className="font-bold text-lg">الإيرادات</span>
                <span className="font-bold text-lg">{formatCurrency(plData.revenue.total)}</span>
              </div>
              <div className="space-y-2 px-4 py-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">إيرادات المبيعات</span>
                  <span className="font-medium">{formatCurrency(plData.revenue.sales)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">إيرادات أخرى</span>
                  <span className="font-medium">{formatCurrency(plData.revenue.otherIncome)}</span>
                </div>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div>
              <div className="flex justify-between items-center py-3 px-4">
                <span className="font-semibold text-red-600">تكلفة البضاعة المباعة</span>
                <span className="font-semibold text-red-600">({formatCurrency(plData.expenses.cogs)})</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div>
              <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
                <span className="font-bold text-green-700">إجمالي الربح</span>
                <span className="font-bold text-green-700">{formatCurrency(grossProfit)}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="flex justify-between items-center py-3 border-b-2 border-gray-300 px-4">
                <span className="font-bold text-lg">المصروفات التشغيلية</span>
              </div>
              <div className="space-y-2 px-4 py-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">الرواتب والأجور</span>
                  <span className="font-medium text-red-600">({formatCurrency(plData.expenses.salaries)})</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">الإيجارات</span>
                  <span className="font-medium text-red-600">({formatCurrency(plData.expenses.rent)})</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">المرافق والخدمات</span>
                  <span className="font-medium text-red-600">({formatCurrency(plData.expenses.utilities)})</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">التسويق والإعلان</span>
                  <span className="font-medium text-red-600">({formatCurrency(plData.expenses.marketing)})</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">الإهلاك والاستهلاك</span>
                  <span className="font-medium text-red-600">({formatCurrency(plData.expenses.depreciation)})</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">مصروفات أخرى</span>
                  <span className="font-medium text-red-600">({formatCurrency(plData.expenses.other)})</span>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div>
              <div className="flex justify-between items-center py-4 bg-emerald-100 px-4 rounded-lg border-2 border-emerald-600">
                <span className="font-bold text-xl text-emerald-800">صافي الربح</span>
                <span className="font-bold text-xl text-emerald-800">{formatCurrency(netProfit)}</span>
              </div>
            </div>

            {/* Ratios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">هامش الربح الإجمالي</p>
                <p className="text-2xl font-bold text-blue-600">
                  {((grossProfit / plData.revenue.total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">هامش الربح التشغيلي</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((operatingProfit / plData.revenue.total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">هامش صافي الربح</p>
                <p className="text-2xl font-bold text-green-600">
                  {((netProfit / plData.revenue.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


