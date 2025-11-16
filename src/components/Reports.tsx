import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, FileText } from 'lucide-react';
import { useState } from 'react';

export function Reports() {
  const [period, setPeriod] = useState('monthly');

  const salesTrend = [
    { month: 'يناير', revenue: 45000, profit: 12000, expenses: 33000 },
    { month: 'فبراير', revenue: 52000, profit: 15000, expenses: 37000 },
    { month: 'مارس', revenue: 48000, profit: 13000, expenses: 35000 },
    { month: 'إبريل', revenue: 61000, profit: 18000, expenses: 43000 },
    { month: 'مايو', revenue: 55000, profit: 16000, expenses: 39000 },
    { month: 'يونيو', revenue: 67000, profit: 21000, expenses: 46000 },
  ];

  const categoryPerformance = [
    { category: 'إلكترونيات', sales: 125000, orders: 450 },
    { category: 'ملابس', sales: 98000, orders: 780 },
    { category: 'أطعمة', sales: 87000, orders: 920 },
    { category: 'كتب', sales: 54000, orders: 650 },
    { category: 'أخرى', sales: 32000, orders: 280 },
  ];

  const kpis = [
    {
      title: 'إجمالي الإيرادات',
      value: '328,000 ر.س',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'إجمالي الطلبات',
      value: '3,080',
      change: '+12.5%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'متوسط قيمة الطلب',
      value: '106 ر.س',
      change: '+5.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'معدل النمو',
      value: '15.8%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="text-right flex-1">
          <h1>التقارير والتحليلات</h1>
          <p className="text-gray-600">تقارير شاملة للعمليات المالية والمخزون والمبيعات</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">التقارير المالية</TabsTrigger>
          <TabsTrigger value="inventory">تقارير المخزون</TabsTrigger>
          <TabsTrigger value="performance">تقارير الأداء</TabsTrigger>
        </TabsList>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;

              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-2">{kpi.title}</p>
                        <p className="text-2xl mb-2">{kpi.value}</p>
                        <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          <TrendIcon className="w-4 h-4" />
                          <span>{kpi.change}</span>
                        </div>
                      </div>
                      <div className={`${kpi.bgColor} ${kpi.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الإيرادات والأرباح والمصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="الإيرادات" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" name="الأرباح" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="المصروفات" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أداء الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="sales" fill="#8b5cf6" name="المبيعات" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>تقرير حالة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>تقارير المخزون التفصيلية</p>
                <p className="text-sm mt-2">عرض حالة المخزون في جميع المستودعات</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Reports */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>تقارير الأداء العام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ملخصات الأداء للشركات والفروع</p>
                <p className="text-sm mt-2">تحليل شامل للأداء العام</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}