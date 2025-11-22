import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useLanguage } from '../../contexts/LanguageContext';
import { Download, Users, DollarSign, TrendingUp, UserCheck, X, User } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SearchableSelect } from '../ui/searchable-select';

export function CustomerReports() {
  const { t, direction } = useLanguage();
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const customerSegments = [
    { name: 'VIP', count: 28, revenue: 1250000, color: '#8b5cf6' },
    { name: 'كبار العملاء', count: 65, revenue: 980000, color: '#3b82f6' },
    { name: 'عملاء منتظمين', count: 142, revenue: 756000, color: '#10b981' },
    { name: 'عملاء جدد', count: 87, revenue: 294000, color: '#f59e0b' }
  ];

  const topCustomers = [
    { customer: 'شركة النجاح التقنية', orders: 45, revenue: 675000, avgOrder: 15000, lastOrder: '2025-06-28', status: 'VIP' },
    { customer: 'مؤسسة الريادة', orders: 38, revenue: 570000, avgOrder: 15000, lastOrder: '2025-06-25', status: 'VIP' },
    { customer: 'شركة التميز', orders: 52, revenue: 780000, avgOrder: 15000, lastOrder: '2025-06-29', status: 'VIP' },
    { customer: 'مجموعة الإبداع', orders: 35, revenue: 525000, avgOrder: 15000, lastOrder: '2025-06-22', status: 'كبير' },
    { customer: 'شركة المستقبل', orders: 41, revenue: 615000, avgOrder: 15000, lastOrder: '2025-06-27', status: 'كبير' }
  ];

  const newCustomers = [
    { customer: 'شركة الرؤية الذكية', joinDate: '2025-06-15', orders: 3, revenue: 45000 },
    { customer: 'مؤسسة التطوير الحديث', joinDate: '2025-06-10', orders: 5, revenue: 75000 },
    { customer: 'شركة الابتكار الرقمي', joinDate: '2025-06-08', orders: 2, revenue: 30000 },
    { customer: 'مجموعة النهضة', joinDate: '2025-06-05', orders: 4, revenue: 60000 },
    { customer: 'شركة الأفق', joinDate: '2025-06-01', orders: 6, revenue: 90000 }
  ];

  const monthlyActivity = [
    { month: 'يناير', newCustomers: 12, activeCustomers: 145, totalOrders: 245 },
    { month: 'فبراير', newCustomers: 15, activeCustomers: 158, totalOrders: 268 },
    { month: 'مارس', newCustomers: 14, activeCustomers: 164, totalOrders: 252 },
    { month: 'أبريل', newCustomers: 18, activeCustomers: 178, totalOrders: 289 },
    { month: 'مايو', newCustomers: 16, activeCustomers: 186, totalOrders: 272 },
    { month: 'يونيو', newCustomers: 12, activeCustomers: 192, totalOrders: 298 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalCustomers = customerSegments.reduce((sum, seg) => sum + seg.count, 0);
  const totalRevenue = customerSegments.reduce((sum, seg) => sum + seg.revenue, 0);
  const avgRevenuePerCustomer = totalRevenue / totalCustomers;

  const stats = [
    {
      title: 'إجمالي العملاء',
      value: totalCustomers.toString(),
      change: '+87 جديد',
      icon: Users,
      bgColor: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'إجمالي الإيرادات',
      value: formatCurrency(totalRevenue),
      change: '+12.5%',
      icon: DollarSign,
      bgColor: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'متوسط الإيرادات للعميل',
      value: formatCurrency(avgRevenuePerCustomer),
      change: '+8.3%',
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      color: 'text-purple-600'
    },
    {
      title: 'العملاء النشطين',
      value: '192',
      change: 'هذا الشهر',
      icon: UserCheck,
      bgColor: 'bg-amber-50',
      color: 'text-amber-600'
    }
  ];

  // Selected customer data
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return allCustomers.find(c => c.id === selectedCustomerId);
  }, [selectedCustomerId]);

  // Customer options for SearchableSelect
  const customerOptions = useMemo(() => {
    return allCustomers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      accountNumber: c.id
    }));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VIP':
        return 'bg-purple-100 text-purple-700';
      case 'كبير':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Single customer report data
  const singleCustomerData = useMemo(() => {
    if (!selectedCustomer) return null;

    // Mock monthly data for selected customer
    const monthlyData = [
      { month: 'يناير', orders: 8, revenue: 120000 },
      { month: 'فبراير', orders: 7, revenue: 105000 },
      { month: 'مارس', orders: 9, revenue: 135000 },
      { month: 'أبريل', orders: 6, revenue: 90000 },
      { month: 'مايو', orders: 8, revenue: 120000 },
      { month: 'يونيو', orders: 7, revenue: 105000 }
    ];

    return {
      ...selectedCustomer,
      monthlyData,
      invoices: [
        { id: '1', number: 'INV-2025-001', date: '2025-06-15', amount: 45000, paid: 30000, status: 'مدفوعة جزئياً' },
        { id: '2', number: 'INV-2025-002', date: '2025-06-20', amount: 30000, paid: 0, status: 'غير مدفوعة' },
        { id: '3', number: 'INV-2025-003', date: '2025-06-28', amount: 25000, paid: 25000, status: 'مدفوعة' }
      ],
      payments: [
        { id: '1', date: '2025-06-10', amount: 30000, method: 'نقدي' },
        { id: '2', date: '2025-06-25', amount: 25000, method: 'بطاقة' }
      ]
    };
  }, [selectedCustomer]);

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">تقارير العملاء</h1>
          <p className="text-gray-600">تحليل شامل لقاعدة العملاء والمبيعات والنشاط</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Tabs value={viewMode} onValueChange={(value: 'all' | 'single') => {
            setViewMode(value);
            if (value === 'all') {
              setSelectedCustomerId('');
            }
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">عرض جماعي</TabsTrigger>
              <TabsTrigger value="single">تقرير عميل واحد</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Single Customer Selection */}
      {viewMode === 'single' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold mb-2 block">اختر العميل</label>
                <SearchableSelect
                  options={customerOptions}
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  placeholder="ابحث عن العميل..."
                  searchPlaceholder="ابحث بالاسم أو رقم الهاتف..."
                  emptyMessage="لا يوجد عملاء"
                  displayKey="name"
                  searchKeys={['name', 'phone']}
                />
              </div>
              {selectedCustomerId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCustomerId('');
                  }}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  إلغاء الاختيار
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Customer Report */}
      {viewMode === 'single' && selectedCustomer && singleCustomerData && (
        <div className="space-y-6">
          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {singleCustomerData.name}
                  </CardTitle>
                  <CardDescription>
                    رقم الهاتف: {singleCustomerData.phone} | تاريخ الانضمام: {singleCustomerData.joinDate}
                  </CardDescription>
                </div>
                <Badge className={getStatusBadge(singleCustomerData.status)}>
                  {singleCustomerData.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-blue-600">{singleCustomerData.orders}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(singleCustomerData.revenue)}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">متوسط الطلب</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(singleCustomerData.avgOrder)}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الرصيد الحالي</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(singleCustomerData.currentBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>النشاط الشهري</CardTitle>
              <CardDescription>الطلبات والإيرادات الشهرية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={singleCustomerData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" name="الإيرادات" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>الفواتير</CardTitle>
              <CardDescription>قائمة فواتير العميل</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">المدفوع</TableHead>
                    <TableHead className="text-right">المتبقي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {singleCustomerData.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.number}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(invoice.paid)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(invoice.amount - invoice.paid)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'مدفوعة' ? 'default' : invoice.status === 'مدفوعة جزئياً' ? 'secondary' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>المدفوعات</CardTitle>
              <CardDescription>سجل مدفوعات العميل</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">طريقة الدفع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {singleCustomerData.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell className="font-semibold text-green-600">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Customers Report */}
      {viewMode === 'all' && (
        <>
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
            <CardTitle>توزيع العملاء حسب الفئة</CardTitle>
            <CardDescription>العدد والإيرادات لكل فئة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name} (${count})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {customerSegments.map((entry, index) => (
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
            <CardTitle>نشاط العملاء الشهري</CardTitle>
            <CardDescription>العملاء الجدد والنشطين</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newCustomers" name="عملاء جدد" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="activeCustomers" name="عملاء نشطين" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>أفضل العملاء</CardTitle>
          <CardDescription>العملاء الأكثر شراءً وإيراداً</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">عدد الطلبات</TableHead>
                <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                <TableHead className="text-right">متوسط الطلب</TableHead>
                <TableHead className="text-right">آخر طلب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((customer, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{customer.customer}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(customer.status)}>{customer.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{customer.orders}</TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(customer.revenue)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(customer.avgOrder)}</TableCell>
                  <TableCell className="text-right text-sm text-gray-600">{customer.lastOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Customers */}
      <Card>
        <CardHeader>
          <CardTitle>العملاء الجدد</CardTitle>
          <CardDescription>العملاء المضافون مؤخراً</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">تاريخ الانضمام</TableHead>
                <TableHead className="text-right">عدد الطلبات</TableHead>
                <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                <TableHead className="text-right">الأداء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newCustomers.map((customer, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{customer.customer}</TableCell>
                  <TableCell className="text-right text-sm">{customer.joinDate}</TableCell>
                  <TableCell className="text-right">{customer.orders}</TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    {formatCurrency(customer.revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded text-sm ${
                      customer.orders >= 5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {customer.orders >= 5 ? 'ممتاز' : 'جيد'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </>
      )}

      {/* Show message if single mode but no customer selected */}
      {viewMode === 'single' && !selectedCustomer && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">يرجى اختيار عميل لعرض تقريره</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


