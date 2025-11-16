import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useLanguage } from '../../contexts/LanguageContext';
import { Download, Receipt, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function TaxReports() {
  const { t, direction } = useLanguage();

  const monthlyTax = [
    { month: 'يناير', sales: 67500, purchases: 42000, net: 25500 },
    { month: 'فبراير', sales: 78000, purchases: 47250, net: 30750 },
    { month: 'مارس', sales: 72000, purchases: 44700, net: 27300 },
    { month: 'أبريل', sales: 91500, purchases: 57750, net: 33750 },
    { month: 'مايو', sales: 82500, purchases: 51000, net: 31500 },
    { month: 'يونيو', sales: 100500, purchases: 63000, net: 37500 }
  ];

  const taxByCategory = [
    { category: 'مبيعات محلية', amount: 392000, rate: 15, color: '#3b82f6' },
    { category: 'صادرات', amount: 0, rate: 0, color: '#10b981' },
    { category: 'مبيعات معفاة', amount: 48000, rate: 0, color: '#f59e0b' },
    { category: 'مبيعات خاضعة للهامش', amount: 52000, rate: 15, color: '#8b5cf6' }
  ];

  const taxDetails = [
    { description: 'ضريبة المبيعات المستحقة', amount: 492000, percentage: 100 },
    { description: 'ضريبة المشتريات القابلة للخصم', amount: 305700, percentage: 62.1 },
    { description: 'صافي ضريبة القيمة المضافة المستحقة', amount: 186300, percentage: 37.9 }
  ];

  const monthlyFilings = [
    { period: 'يناير 2025', filingDate: '2025-02-28', amount: 25500, status: 'مقدم' },
    { period: 'فبراير 2025', filingDate: '2025-03-31', amount: 30750, status: 'مقدم' },
    { period: 'مارس 2025', filingDate: '2025-04-30', amount: 27300, status: 'مقدم' },
    { period: 'أبريل 2025', filingDate: '2025-05-31', amount: 33750, status: 'مقدم' },
    { period: 'مايو 2025', filingDate: '2025-06-30', amount: 31500, status: 'مقدم' },
    { period: 'يونيو 2025', filingDate: '2025-07-31', amount: 37500, status: 'معلق' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalSalesTax = monthlyTax.reduce((sum, m) => sum + m.sales, 0);
  const totalPurchasesTax = monthlyTax.reduce((sum, m) => sum + m.purchases, 0);
  const netTax = totalSalesTax - totalPurchasesTax;

  const stats = [
    {
      title: 'ضريبة المبيعات',
      value: formatCurrency(totalSalesTax),
      change: '+15.3%',
      icon: Receipt,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'ضريبة المشتريات',
      value: formatCurrency(totalPurchasesTax),
      change: '+11.2%',
      icon: FileText,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600'
    },
    {
      title: 'صافي الضريبة المستحقة',
      value: formatCurrency(netTax),
      change: '+23.4%',
      icon: DollarSign,
      bgColor: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'معدل الضريبة الفعلي',
      value: '15%',
      change: 'قياسي',
      icon: TrendingUp,
      bgColor: 'bg-amber-50',
      color: 'text-amber-600'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مقدم':
        return 'bg-green-100 text-green-700';
      case 'معلق':
        return 'bg-yellow-100 text-yellow-700';
      case 'متأخر':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">التقارير الضريبية</h1>
          <p className="text-gray-600">تقرير مفصل لضريبة القيمة المضافة والالتزامات الضريبية</p>
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
            تصدير للهيئة
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
            <CardTitle>الضريبة الشهرية</CardTitle>
            <CardDescription>ضريبة المبيعات والمشتريات والصافي</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTax}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="sales" name="ضريبة المبيعات" fill="#3b82f6" />
                <Bar dataKey="purchases" name="ضريبة المشتريات" fill="#8b5cf6" />
                <Bar dataKey="net" name="الصافي" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اتجاه صافي الضريبة</CardTitle>
            <CardDescription>تطور صافي الضريبة المستحقة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTax}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="net" name="صافي الضريبة" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tax Declaration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>الإقرار الضريبي - النصف الأول 2025</CardTitle>
          <CardDescription>ملخص الإقرار الضريبي للفترة من 1 يناير إلى 30 يونيو 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Sales Section */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-blue-700">المبيعات الخاضعة للضريبة</h3>
              <div className="space-y-2 pr-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">المبيعات المحلية القياسية (15%)</span>
                  <div className="text-left">
                    <div className="font-medium">2,613,333 ر.س</div>
                    <div className="text-sm text-blue-600">ضريبة: {formatCurrency(392000)}</div>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">المبيعات بنسبة صفر (صادرات)</span>
                  <div className="text-left">
                    <div className="font-medium">0 ر.س</div>
                    <div className="text-sm text-gray-500">ضريبة: {formatCurrency(0)}</div>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">المبيعات المعفاة</span>
                  <div className="text-left">
                    <div className="font-medium">320,000 ر.س</div>
                    <div className="text-sm text-gray-500">ضريبة: {formatCurrency(0)}</div>
                  </div>
                </div>
                <div className="flex justify-between py-3 bg-blue-50 px-2 rounded-lg">
                  <span className="font-bold">إجمالي ضريبة المبيعات</span>
                  <span className="font-bold text-blue-600">{formatCurrency(totalSalesTax)}</span>
                </div>
              </div>
            </div>

            {/* Purchases Section */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-purple-700">المشتريات القابلة للخصم</h3>
              <div className="space-y-2 pr-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">المشتريات المحلية الخاضعة للخصم</span>
                  <div className="text-left">
                    <div className="font-medium">2,038,000 ر.س</div>
                    <div className="text-sm text-purple-600">ضريبة قابلة للخصم: {formatCurrency(totalPurchasesTax)}</div>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">الواردات الخاضعة لضريبة القيمة المضافة</span>
                  <div className="text-left">
                    <div className="font-medium">0 ر.س</div>
                    <div className="text-sm text-gray-500">ضريبة: {formatCurrency(0)}</div>
                  </div>
                </div>
                <div className="flex justify-between py-3 bg-purple-50 px-2 rounded-lg">
                  <span className="font-bold">إجمالي ضريبة المشتريات القابلة للخصم</span>
                  <span className="font-bold text-purple-600">{formatCurrency(totalPurchasesTax)}</span>
                </div>
              </div>
            </div>

            {/* Net Tax */}
            <div className="bg-green-100 p-6 rounded-lg border-2 border-green-600">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-green-800 mb-1">صافي ضريبة القيمة المضافة المستحقة</h3>
                  <p className="text-sm text-green-700">المبلغ المطلوب دفعه للهيئة</p>
                </div>
                <div className="text-left">
                  <div className="text-3xl font-bold text-green-800">{formatCurrency(netTax)}</div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">معلومات الدفع</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">تاريخ الاستحقاق:</span>
                  <span className="font-medium mr-2">31 يوليو 2025</span>
                </div>
                <div>
                  <span className="text-gray-600">الرقم الضريبي:</span>
                  <span className="font-medium mr-2">300123456789003</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filing History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل التقديمات الضريبية</CardTitle>
          <CardDescription>تاريخ تقديم الإقرارات الضريبية</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الفترة</TableHead>
                <TableHead className="text-right">تاريخ التقديم</TableHead>
                <TableHead className="text-right">صافي الضريبة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyFilings.map((filing, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{filing.period}</TableCell>
                  <TableCell className="text-right">{filing.filingDate}</TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(filing.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusBadge(filing.status)}`}>
                      {filing.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <FileText className="w-4 h-4" />
                      عرض
                    </Button>
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


