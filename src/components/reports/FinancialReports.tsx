import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Calendar, Download, FileText, Receipt, Wallet } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function FinancialReports() {
  const { t, direction } = useLanguage();

  // Sample data - المعلومات المالية
  const monthlyData = [
    { month: 'يناير', revenue: 450000, expenses: 320000, profit: 130000 },
    { month: 'فبراير', revenue: 520000, expenses: 340000, profit: 180000 },
    { month: 'مارس', revenue: 480000, expenses: 310000, profit: 170000 },
    { month: 'أبريل', revenue: 610000, expenses: 380000, profit: 230000 },
    { month: 'مايو', revenue: 550000, expenses: 350000, profit: 200000 },
    { month: 'يونيو', revenue: 670000, expenses: 390000, profit: 280000 }
  ];

  const quarterlyComparison = [
    { quarter: 'Q1 2024', amount: 1200000 },
    { quarter: 'Q2 2024', amount: 1450000 },
    { quarter: 'Q3 2024', amount: 1380000 },
    { quarter: 'Q4 2024', amount: 1650000 }
  ];

  const expenseBreakdown = [
    { name: 'الرواتب', value: 450000, color: '#3b82f6' },
    { name: 'الإيجارات', value: 180000, color: '#8b5cf6' },
    { name: 'المرافق', value: 85000, color: '#ec4899' },
    { name: 'التسويق', value: 120000, color: '#f59e0b' },
    { name: 'أخرى', value: 95000, color: '#10b981' }
  ];

  const stats = [
    {
      title: 'إجمالي الإيرادات',
      value: '3,280,000 ر.س',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'إجمالي المصروفات',
      value: '2,090,000 ر.س',
      change: '+8.2%',
      trend: 'up',
      icon: Receipt,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600'
    },
    {
      title: 'صافي الربح',
      value: '1,190,000 ر.س',
      change: '+23.4%',
      trend: 'up',
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'هامش الربح',
      value: '36.3%',
      change: '+2.1%',
      trend: 'up',
      icon: Calculator,
      bgColor: 'bg-amber-50',
      color: 'text-amber-600'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">التقارير المالية</h1>
          <p className="text-gray-600">تحليل شامل للأداء المالي والتدفقات النقدية</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="2025">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                    <p className="text-2xl font-bold mb-2">{stat.value}</p>
                    <div className={`flex items-center gap-1 text-sm justify-end ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>{stat.change}</span>
                      <TrendIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6" dir={direction}>
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="comparison">المقارنات</TabsTrigger>
          <TabsTrigger value="breakdown">التفصيل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات والمصروفات - آخر 6 أشهر</CardTitle>
              <CardDescription>مقارنة شهرية للإيرادات والمصروفات وصافي الربح</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" name="الإيرادات" fill="#3b82f6" />
                  <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" />
                  <Bar dataKey="profit" name="صافي الربح" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المصروفات</CardTitle>
                <CardDescription>تحليل المصروفات حسب الفئة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
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
                <CardTitle>ملخص المصروفات</CardTitle>
                <CardDescription>تفصيل المصروفات بالأرقام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: expense.color }}
                        />
                        <span className="text-sm font-medium">{expense.name}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{formatCurrency(expense.value)}</p>
                        <p className="text-xs text-gray-500">
                          {((expense.value / expenseBreakdown.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات صافي الربح</CardTitle>
              <CardDescription>تطور صافي الربح خلال الأشهر الستة الماضية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="profit" name="صافي الربح" stroke="#10b981" fill="#10b98120" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المقارنة الربع سنوية</CardTitle>
              <CardDescription>إجمالي الإيرادات لكل ربع سنة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={quarterlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" name="الإيرادات" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التفصيل المالي الشامل</CardTitle>
              <CardDescription>جدول تفصيلي للبيانات المالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-semibold">الشهر</th>
                      <th className="text-right p-3 font-semibold">الإيرادات</th>
                      <th className="text-right p-3 font-semibold">المصروفات</th>
                      <th className="text-right p-3 font-semibold">صافي الربح</th>
                      <th className="text-right p-3 font-semibold">هامش الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">{row.month}</td>
                        <td className="p-3 text-green-600 font-medium">{formatCurrency(row.revenue)}</td>
                        <td className="p-3 text-red-600 font-medium">{formatCurrency(row.expenses)}</td>
                        <td className="p-3 text-blue-600 font-bold">{formatCurrency(row.profit)}</td>
                        <td className="p-3">{((row.profit / row.revenue) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td className="p-3">الإجمالي</td>
                      <td className="p-3 text-green-600">
                        {formatCurrency(monthlyData.reduce((sum, row) => sum + row.revenue, 0))}
                      </td>
                      <td className="p-3 text-red-600">
                        {formatCurrency(monthlyData.reduce((sum, row) => sum + row.expenses, 0))}
                      </td>
                      <td className="p-3 text-blue-600">
                        {formatCurrency(monthlyData.reduce((sum, row) => sum + row.profit, 0))}
                      </td>
                      <td className="p-3">
                        {(
                          (monthlyData.reduce((sum, row) => sum + row.profit, 0) /
                            monthlyData.reduce((sum, row) => sum + row.revenue, 0)) *
                          100
                        ).toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


