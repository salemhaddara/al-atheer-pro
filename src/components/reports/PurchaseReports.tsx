import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useLanguage } from '../../contexts/LanguageContext';
import { Download, ShoppingBag, TrendingDown, Package, Users2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function PurchaseReports() {
  const { t, direction } = useLanguage();

  const monthlyPurchases = [
    { month: 'يناير', purchases: 280000, orders: 85, avgOrder: 3294 },
    { month: 'فبراير', purchases: 315000, orders: 92, avgOrder: 3424 },
    { month: 'مارس', purchases: 298000, orders: 88, avgOrder: 3386 },
    { month: 'أبريل', purchases: 385000, orders: 108, avgOrder: 3565 },
    { month: 'مايو', purchases: 340000, orders: 96, avgOrder: 3542 },
    { month: 'يونيو', purchases: 420000, orders: 115, avgOrder: 3652 }
  ];

  const topSuppliers = [
    { supplier: 'شركة التوريدات المتقدمة', orders: 45, amount: 675000, onTime: 95 },
    { supplier: 'مؤسسة الإمدادات الذكية', orders: 38, amount: 532000, onTime: 92 },
    { supplier: 'شركة التجهيزات الحديثة', orders: 52, amount: 728000, onTime: 88 },
    { supplier: 'مجموعة التوريد المتكامل', orders: 35, amount: 490000, onTime: 94 },
    { supplier: 'شركة المواد الأولية', orders: 41, amount: 615000, onTime: 90 }
  ];

  const topPurchases = [
    { item: 'أجهزة كمبيوتر محمولة', quantity: 180, cost: 540000, supplier: 'شركة التجهيزات الحديثة' },
    { item: 'طابعات وماسحات', quantity: 95, cost: 285000, supplier: 'شركة التوريدات المتقدمة' },
    { item: 'شاشات LED', quantity: 120, cost: 360000, supplier: 'مجموعة التوريد المتكامل' },
    { item: 'ملحقات ومستلزمات', quantity: 850, cost: 255000, supplier: 'مؤسسة الإمدادات الذكية' },
    { item: 'قطع غيار وصيانة', quantity: 320, cost: 192000, supplier: 'شركة المواد الأولية' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalPurchases = monthlyPurchases.reduce((sum, m) => sum + m.purchases, 0);
  const totalOrders = monthlyPurchases.reduce((sum, m) => sum + m.orders, 0);
  const avgOrderValue = totalPurchases / totalOrders;

  const stats = [
    {
      title: 'إجمالي المشتريات',
      value: formatCurrency(totalPurchases),
      change: '+11.2%',
      icon: ShoppingBag,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'عدد طلبات الشراء',
      value: totalOrders.toString(),
      change: '+9.5%',
      icon: Package,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600'
    },
    {
      title: 'متوسط قيمة الطلب',
      value: formatCurrency(avgOrderValue),
      change: '+1.6%',
      icon: TrendingDown,
      bgColor: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'الموردين النشطين',
      value: '43',
      change: '+3',
      icon: Users2,
      bgColor: 'bg-amber-50',
      color: 'text-amber-600'
    }
  ];

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">تقارير المشتريات</h1>
          <p className="text-gray-600">تحليل مفصل لعمليات الشراء والموردين والتكاليف</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="6m">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6m">آخر 6 أشهر</SelectItem>
              <SelectItem value="3m">آخر 3 أشهر</SelectItem>
              <SelectItem value="1y">آخر سنة</SelectItem>
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
                    <p className="text-xs text-green-600">{stat.change}</p>
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
            <CardTitle>اتجاه المشتريات الشهرية</CardTitle>
            <CardDescription>إجمالي المشتريات وعدد الطلبات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPurchases}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => typeof value === 'number' && value > 1000 ? formatCurrency(value) : value} />
                <Legend />
                <Bar dataKey="purchases" name="المشتريات" fill="#3b82f6" />
                <Bar dataKey="orders" name="الطلبات" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>متوسط قيمة طلب الشراء</CardTitle>
            <CardDescription>تطور متوسط قيمة الطلب شهرياً</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPurchases}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="avgOrder" name="متوسط قيمة الطلب" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>أفضل الموردين</CardTitle>
          <CardDescription>الموردون الأكثر تعاملاً من حيث الطلبات والمبالغ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">عدد الطلبات</TableHead>
                <TableHead className="text-right">إجمالي المشتريات</TableHead>
                <TableHead className="text-right">معدل التسليم في الموعد</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSuppliers.map((supplier, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{supplier.supplier}</TableCell>
                  <TableCell className="text-right">{supplier.orders}</TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    {formatCurrency(supplier.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded text-sm ${
                      supplier.onTime >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {supplier.onTime}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-yellow-500">{'⭐'.repeat(Math.floor(supplier.onTime / 20))}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>أكثر الأصناف شراءً</CardTitle>
          <CardDescription>الأصناف الأكثر شراءً خلال الفترة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">التكلفة الإجمالية</TableHead>
                <TableHead className="text-right">المورد الرئيسي</TableHead>
                <TableHead className="text-right">نسبة من الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPurchases.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right font-bold text-purple-600">
                    {formatCurrency(item.cost)}
                  </TableCell>
                  <TableCell className="text-right text-sm">{item.supplier}</TableCell>
                  <TableCell className="text-right">
                    {((item.cost / totalPurchases) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


