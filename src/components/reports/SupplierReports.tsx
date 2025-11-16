import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { Download, Users2, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function SupplierReports() {
  const { t, direction } = useLanguage();

  const supplierCategories = [
    { name: 'أجهزة إلكترونية', count: 15, spending: 1250000, color: '#3b82f6' },
    { name: 'مستلزمات مكتبية', count: 12, spending: 380000, color: '#8b5cf6' },
    { name: 'قطع غيار', count: 8, spending: 520000, color: '#10b981' },
    { name: 'خدمات', count: 10, spending: 290000, color: '#f59e0b' }
  ];

  const topSuppliers = [
    { supplier: 'شركة التوريدات المتقدمة', orders: 65, spending: 975000, avgOrder: 15000, onTimeRate: 95, quality: 4.8 },
    { supplier: 'مؤسسة الإمدادات الذكية', orders: 52, spending: 780000, avgOrder: 15000, onTimeRate: 92, quality: 4.6 },
    { supplier: 'شركة التجهيزات الحديثة', orders: 71, spending: 1065000, avgOrder: 15000, onTimeRate: 88, quality: 4.5 },
    { supplier: 'مجموعة التوريد المتكامل', orders: 48, spending: 720000, avgOrder: 15000, onTimeRate: 94, quality: 4.7 },
    { supplier: 'شركة المواد الأولية', orders: 55, spending: 825000, avgOrder: 15000, onTimeRate: 90, quality: 4.6 }
  ];

  const supplierPerformance = [
    { supplier: 'التوريدات المتقدمة', onTime: 95, quality: 96, price: 88, overall: 93 },
    { supplier: 'الإمدادات الذكية', onTime: 92, quality: 92, price: 90, overall: 91 },
    { supplier: 'التجهيزات الحديثة', onTime: 88, quality: 90, price: 95, overall: 91 },
    { supplier: 'التوريد المتكامل', onTime: 94, quality: 94, price: 85, overall: 91 },
    { supplier: 'المواد الأولية', onTime: 90, quality: 92, price: 92, overall: 91 }
  ];

  const monthlySpending = [
    { month: 'يناير', spending: 280000, suppliers: 38 },
    { month: 'فبراير', spending: 315000, suppliers: 40 },
    { month: 'مارس', spending: 298000, suppliers: 39 },
    { month: 'أبريل', spending: 385000, suppliers: 42 },
    { month: 'مايو', spending: 340000, suppliers: 41 },
    { month: 'يونيو', spending: 420000, suppliers: 43 }
  ];

  const paymentTerms = [
    { term: 'نقدي', suppliers: 18, percentage: 40 },
    { term: '30 يوم', suppliers: 15, percentage: 33 },
    { term: '60 يوم', suppliers: 10, percentage: 22 },
    { term: '90 يوم', suppliers: 2, percentage: 5 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalSuppliers = supplierCategories.reduce((sum, cat) => sum + cat.count, 0);
  const totalSpending = supplierCategories.reduce((sum, cat) => sum + cat.spending, 0);
  const avgSpendingPerSupplier = totalSpending / totalSuppliers;

  const stats = [
    {
      title: 'إجمالي الموردين',
      value: totalSuppliers.toString(),
      change: '+5 جديد',
      icon: Users2,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'إجمالي المشتريات',
      value: formatCurrency(totalSpending),
      change: '+11.2%',
      icon: DollarSign,
      bgColor: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'متوسط الإنفاق للمورد',
      value: formatCurrency(avgSpendingPerSupplier),
      change: '+6.1%',
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600'
    },
    {
      title: 'معدل التسليم في الموعد',
      value: '91.8%',
      change: 'ممتاز',
      icon: Clock,
      bgColor: 'bg-amber-50',
      color: 'text-amber-600'
    }
  ];

  const getQualityBadge = (quality: number) => {
    if (quality >= 4.7) return { label: 'ممتاز', className: 'bg-green-100 text-green-700' };
    if (quality >= 4.5) return { label: 'جيد جداً', className: 'bg-blue-100 text-blue-700' };
    return { label: 'جيد', className: 'bg-yellow-100 text-yellow-700' };
  };

  const getOnTimeColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">تقارير الموردين</h1>
          <p className="text-gray-600">تحليل شامل لأداء الموردين والمشتريات والجودة</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الموردين</SelectItem>
              <SelectItem value="electronics">أجهزة إلكترونية</SelectItem>
              <SelectItem value="office">مستلزمات مكتبية</SelectItem>
              <SelectItem value="parts">قطع غيار</SelectItem>
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
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <p className={`text-xs ${stat.color}`}>{stat.change}</p>
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
            <CardTitle>الإنفاق حسب فئة المورد</CardTitle>
            <CardDescription>توزيع المشتريات على الفئات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={supplierCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="spending"
                >
                  {supplierCategories.map((entry, index) => (
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
            <CardTitle>الإنفاق الشهري</CardTitle>
            <CardDescription>تطور المشتريات على مدار 6 أشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="spending" name="الإنفاق" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>أفضل الموردين</CardTitle>
          <CardDescription>الموردون الأكثر تعاملاً وأداءً</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">عدد الطلبات</TableHead>
                <TableHead className="text-right">إجمالي الإنفاق</TableHead>
                <TableHead className="text-right">متوسط الطلب</TableHead>
                <TableHead className="text-right">التسليم في الموعد</TableHead>
                <TableHead className="text-right">تقييم الجودة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSuppliers.map((supplier, index) => {
                const qualityBadge = getQualityBadge(supplier.quality);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{supplier.supplier}</TableCell>
                    <TableCell className="text-right">{supplier.orders}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatCurrency(supplier.spending)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(supplier.avgOrder)}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${getOnTimeColor(supplier.onTimeRate)}`}>
                        {supplier.onTimeRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={qualityBadge.className}>
                        {supplier.quality}/5.0 - {qualityBadge.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>أداء الموردين</CardTitle>
          <CardDescription>مؤشرات الأداء الرئيسية للموردين</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={supplierPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="supplier" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" name="التسليم في الموعد" fill="#3b82f6" />
              <Bar dataKey="quality" name="الجودة" fill="#10b981" />
              <Bar dataKey="price" name="السعر" fill="#f59e0b" />
              <Bar dataKey="overall" name="التقييم العام" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle>شروط الدفع</CardTitle>
          <CardDescription>توزيع الموردين حسب شروط الدفع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentTerms.map((term, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="font-medium min-w-[100px]">{term.term}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${term.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{term.suppliers} مورد</span>
                  <span className="font-bold text-blue-600 min-w-[50px] text-left">{term.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


