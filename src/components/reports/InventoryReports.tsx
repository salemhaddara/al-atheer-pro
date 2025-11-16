import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { Download, Package, AlertTriangle, TrendingUp, Warehouse } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function InventoryReports() {
  const { t, direction } = useLanguage();

  const inventoryByCategory = [
    { name: 'حواسيب', quantity: 245, value: 735000, color: '#3b82f6' },
    { name: 'طابعات', quantity: 128, value: 256000, color: '#8b5cf6' },
    { name: 'شاشات', quantity: 183, value: 549000, color: '#10b981' },
    { name: 'ملحقات', quantity: 892, value: 267600, color: '#f59e0b' },
    { name: 'أخرى', quantity: 156, value: 234000, color: '#ef4444' }
  ];

  const lowStockItems = [
    { item: 'طابعة HP LaserJet', current: 8, minimum: 15, status: 'منخفض', category: 'طابعات' },
    { item: 'شاشة Dell 24"', current: 12, minimum: 20, status: 'منخفض', category: 'شاشات' },
    { item: 'كيبورد لاسلكي', current: 25, minimum: 50, status: 'منخفض', category: 'ملحقات' },
    { item: 'ماوس USB', current: 18, minimum: 40, status: 'منخفض', category: 'ملحقات' },
    { item: 'كابلات HDMI', current: 15, minimum: 30, status: 'منخفض', category: 'أخرى' }
  ];

  const topMovingItems = [
    { item: 'كمبيوتر محمول HP', sold: 145, remaining: 67, turnover: 2.16, value: 201000 },
    { item: 'طابعة Canon', sold: 98, remaining: 32, turnover: 3.06, value: 64000 },
    { item: 'شاشة Samsung 27"', sold: 87, remaining: 45, turnover: 1.93, value: 135000 },
    { item: 'لوحة مفاتيح Logitech', sold: 324, remaining: 156, turnover: 2.08, value: 46800 },
    { item: 'هارد SSD 1TB', sold: 198, remaining: 89, turnover: 2.22, value: 133500 }
  ];

  const warehouseData = [
    { warehouse: 'المستودع الرئيسي', items: 856, value: 1280000 },
    { warehouse: 'مستودع الفرع الشمالي', items: 432, value: 648000 },
    { warehouse: 'مستودع الفرع الجنوبي', items: 386, value: 579000 },
    { warehouse: 'مستودع التخليص', items: 134, value: 201000 }
  ];

  const rotationReport = [
    { item: 'كمبيوتر محمول HP', purchases: 180, sales: 150 },
    { item: 'طابعة Canon', purchases: 90, sales: 35 },
    { item: 'شاشة Samsung 32\"', purchases: 120, sales: 60 },
    { item: 'لوحة مفاتيح لاسلكية', purchases: 300, sales: 210 },
    { item: 'ماوس ألعاب', purchases: 140, sales: 30 },
    { item: 'هارد SSD 1TB', purchases: 220, sales: 198 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalQuantity = inventoryByCategory.reduce((sum, cat) => sum + cat.quantity, 0);
  const totalValue = inventoryByCategory.reduce((sum, cat) => sum + cat.value, 0);

  const stats = [
    {
      title: 'إجمالي الأصناف',
      value: totalQuantity.toString(),
      change: '+124',
      icon: Package,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'قيمة المخزون',
      value: formatCurrency(totalValue),
      change: '+8.5%',
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'أصناف منخفضة',
      value: lowStockItems.length.toString(),
      change: 'تحتاج طلب',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      color: 'text-red-600'
    },
    {
      title: 'عدد المستودعات',
      value: warehouseData.length.toString(),
      change: 'نشطة',
      icon: Warehouse,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600'
    }
  ];

  const getStockStatus = (current: number, minimum: number) => {
    const percentage = (current / minimum) * 100;
    if (percentage <= 50) return { label: 'حرج', color: 'bg-red-100 text-red-700' };
    if (percentage <= 100) return { label: 'منخفض', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'جيد', color: 'bg-green-100 text-green-700' };
  };

  const getRotationStatus = (ratio: number) => {
    if (ratio <= 0.4) {
      return { label: 'راكد', description: 'ضعيف الحركة ويحتاج عروض ترويجية', color: 'bg-red-100 text-red-700' };
    }
    if (ratio <= 0.8) {
      return { label: 'متوسط', description: 'يحتاج متابعة دورية وتحسين تسعير', color: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: 'سريع الدوران', description: 'ممتاز في المبيعات ويحتاج تزويد مستمر', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">تقارير المخزون</h1>
          <p className="text-gray-600">تحليل شامل لحالة المخزون والأصناف والحركة</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستودعات</SelectItem>
              <SelectItem value="main">المستودع الرئيسي</SelectItem>
              <SelectItem value="north">الفرع الشمالي</SelectItem>
              <SelectItem value="south">الفرع الجنوبي</SelectItem>
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
            <CardTitle>توزيع المخزون حسب الفئة</CardTitle>
            <CardDescription>الكمية والقيمة لكل فئة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryByCategory.map((entry, index) => (
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
            <CardTitle>المخزون حسب المستودع</CardTitle>
            <CardDescription>توزيع الأصناف والقيمة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="warehouse" type="category" width={150} />
                <Tooltip formatter={(value, name) => name === 'value' ? formatCurrency(Number(value)) : value} />
                <Legend />
                <Bar dataKey="items" name="الأصناف" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card className="mb-6 border-red-200">
        <CardHeader className="bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <CardTitle className="text-red-700">تنبيه: أصناف منخفضة المخزون</CardTitle>
          </div>
          <CardDescription>الأصناف التي وصلت إلى الحد الأدنى أو أقل</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الكمية الحالية</TableHead>
                <TableHead className="text-right">الحد الأدنى</TableHead>
                <TableHead className="text-right">المطلوب طلبه</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.map((item, index) => {
                const status = getStockStatus(item.current, item.minimum);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">{item.current}</TableCell>
                    <TableCell className="text-right">{item.minimum}</TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      {item.minimum - item.current + 10}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded text-sm ${status.color}`}>
                        {status.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Moving Items */}
      <Card>
        <CardHeader>
          <CardTitle>الأصناف الأكثر حركة</CardTitle>
          <CardDescription>الأصناف الأكثر مبيعاً ومعدل دورانها</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-right">المباع</TableHead>
                <TableHead className="text-right">المتبقي</TableHead>
                <TableHead className="text-right">معدل الدوران</TableHead>
                <TableHead className="text-right">القيمة المتبقية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMovingItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell className="text-right">{item.sold}</TableCell>
                  <TableCell className="text-right">{item.remaining}</TableCell>
                  <TableCell className="text-right font-bold text-purple-600">
                    {item.turnover.toFixed(2)}x
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-bold">
                    {formatCurrency(item.value)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded text-sm ${item.turnover >= 2 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {item.turnover >= 2 ? 'ممتاز' : 'جيد'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stagnation & Turnover Report */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">تقرير جديد</Badge>
              <CardTitle>معدل ركود ودوران الأصناف</CardTitle>
            </div>
            <CardDescription>
              مقارنة حركة الشراء والبيع لكل صنف لتحديد الأصناف الراكدة أو سريعة الدوران
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-right">الشراء (آخر 90 يوم)</TableHead>
                <TableHead className="text-right">البيع (آخر 90 يوم)</TableHead>
                <TableHead className="text-right">نسبة الدوران</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">توصيات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rotationReport.map((record, index) => {
                const ratio = record.sales / (record.purchases || 1);
                const ratioPercent = Math.min(1, ratio) * 100;
                const status = getRotationStatus(ratio);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{record.item}</TableCell>
                    <TableCell className="text-right">{record.purchases}</TableCell>
                    <TableCell className="text-right">{record.sales}</TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[160px]">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{(ratio * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${ratioPercent}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{status.description}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <p className="font-semibold text-red-700 mb-1">الأصناف الراكدة</p>
              <p>ينصح بعمل عروض تصفية، تحسين العرض البصري، أو إيقاف شراء جديد حتى تصريف المخزون.</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
              <p className="font-semibold text-yellow-700 mb-1">الأصناف متوسطة الحركة</p>
              <p>مراجعة التسعير، ربطها بحزم بيع، وتحفيز فريق المبيعات على تسويقها.</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <p className="font-semibold text-green-700 mb-1">الأصناف القوية</p>
              <p>الحرص على تزويد مستمر من الموردين وربطها باستراتيجية الترويج الأساسية للمتجر.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


