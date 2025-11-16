import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Building2, Warehouse, Users2, Receipt } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

export function Dashboard() {
  const { t, direction, language } = useLanguage();

  const stats = [
    {
      title: t('dashboard.stats.totalRevenue.title'),
      value: '8,450,000 ' + (language === 'ar' ? 'ر.س' : 'SAR'),
      change: '+18.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: t('dashboard.stats.totalRevenue.description')
    },
    {
      title: t('dashboard.stats.totalSales.title'),
      value: '452,350 ' + (language === 'ar' ? 'ر.س' : 'SAR'),
      change: '+12.5%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: t('dashboard.stats.totalSales.description')
    },
    {
      title: t('dashboard.stats.activeCustomers.title'),
      value: '1,284',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: t('dashboard.stats.activeCustomers.description')
    },
    {
      title: t('dashboard.stats.products.title'),
      value: '3,456',
      change: '+8.2%',
      trend: 'up',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: t('dashboard.stats.products.description')
    },
    {
      title: t('dashboard.stats.companies.title'),
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Building2,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: t('dashboard.stats.companies.description')
    },
    {
      title: t('dashboard.stats.branches.title'),
      value: '45',
      change: '+5',
      trend: 'up',
      icon: Warehouse,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: t('dashboard.stats.branches.description')
    },
    {
      title: t('dashboard.stats.employees.title'),
      value: '287',
      change: '+12',
      trend: 'up',
      icon: Users2,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: t('dashboard.stats.employees.description')
    },
    {
      title: t('dashboard.stats.invoices.title'),
      value: '1,892',
      change: '-3.1%',
      trend: 'down',
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: t('dashboard.stats.invoices.description')
    },
  ];

  const salesData = [
    { month: t('dashboard.months.january'), sales: 450000, purchases: 280000, profit: 170000 },
    { month: t('dashboard.months.february'), sales: 520000, purchases: 310000, profit: 210000 },
    { month: t('dashboard.months.march'), sales: 480000, purchases: 295000, profit: 185000 },
    { month: t('dashboard.months.april'), sales: 610000, purchases: 350000, profit: 260000 },
    { month: t('dashboard.months.may'), sales: 550000, purchases: 320000, profit: 230000 },
    { month: t('dashboard.months.june'), sales: 670000, purchases: 380000, profit: 290000 },
  ];

  const companyPerformance = [
    { company: language === 'ar' ? 'شركة الأمل للتجارة' : 'Al-Amal Trading Company', revenue: 2500000, growth: 18 },
    { company: language === 'ar' ? 'شركة النجاح التقنية' : 'Al-Najah Technology Company', revenue: 1800000, growth: 15 },
    { company: language === 'ar' ? 'مؤسسة الريادة' : 'Al-Reyada Corporation', revenue: 1200000, growth: 22 },
    { company: language === 'ar' ? 'شركة التميز' : 'Al-Tamayoz Company', revenue: 980000, growth: 12 },
  ];

  const inventoryStatus = [
    { 
      category: language === 'ar' ? 'إلكترونيات' : 'Electronics', 
      stock: 3200, 
      value: 12500000, 
      status: t('dashboard.inventory.status.good')
    },
    { 
      category: language === 'ar' ? 'معدات مكتبية' : 'Office Equipment', 
      stock: 1800, 
      value: 4200000, 
      status: t('dashboard.inventory.status.low')
    },
    { 
      category: language === 'ar' ? 'أثاث' : 'Furniture', 
      stock: 950, 
      value: 8900000, 
      status: t('dashboard.inventory.status.good')
    },
    { 
      category: language === 'ar' ? 'مستلزمات' : 'Supplies', 
      stock: 4500, 
      value: 2100000, 
      status: t('dashboard.inventory.status.excellent')
    },
  ];

  const recentActivities = [
    { 
      action: language === 'ar' ? 'فاتورة مبيعات جديدة' : 'New sales invoice', 
      user: language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed', 
      time: language === 'ar' ? 'منذ 5 دقائق' : '5 minutes ago', 
      type: 'sale' 
    },
    { 
      action: language === 'ar' ? 'إضافة منتج جديد' : 'Add new product', 
      user: language === 'ar' ? 'فاطمة علي' : 'Fatima Ali', 
      time: language === 'ar' ? 'منذ 15 دقيقة' : '15 minutes ago', 
      type: 'product' 
    },
    { 
      action: language === 'ar' ? 'طلب شراء مُعتمد' : 'Purchase order approved', 
      user: language === 'ar' ? 'سعيد خالد' : 'Saeed Khaled', 
      time: language === 'ar' ? 'منذ 30 دقيقة' : '30 minutes ago', 
      type: 'purchase' 
    },
    { 
      action: language === 'ar' ? 'تحديث بيانات عميل' : 'Update customer data', 
      user: language === 'ar' ? 'نورة عبدالله' : 'Noura Abdullah', 
      time: language === 'ar' ? 'منذ ساعة' : '1 hour ago', 
      type: 'customer' 
    },
    { 
      action: language === 'ar' ? 'صرف راتب موظف' : 'Employee salary payment', 
      user: language === 'ar' ? 'محمد أحمد' : 'Mohammed Ahmed', 
      time: language === 'ar' ? 'منذ ساعتين' : '2 hours ago', 
      type: 'payroll' 
    },
  ];


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    if (status === t('dashboard.inventory.status.excellent')) {
      return 'bg-green-100 text-green-700';
    }
    if (status === t('dashboard.inventory.status.good')) {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div dir={direction}>
      <div className="mb-8">
        <h1>{t('dashboard.title')}</h1>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
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
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                    <p className="text-2xl mb-2">{stat.value}</p>
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <span className="text-xs text-gray-500">{stat.description}</span>
                      <div className={`flex items-center gap-1 text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{stat.change}</span>
                        <TrendIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.charts.salesPurchases.title')}</CardTitle>
            <CardDescription>{t('dashboard.charts.salesPurchases.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full" dir="ltr">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" reversed={direction === 'rtl'} />
                  <YAxis orientation={direction === 'rtl' ? 'right' : 'left'} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))} 
                    labelStyle={{ direction: direction }}
                  />
                  <Legend wrapperStyle={{ direction: direction, textAlign: direction === 'rtl' ? 'right' : 'left' }} />
                  <Area type="monotone" dataKey="sales" stackId="1" stroke="#3b82f6" fill="#93c5fd" name={t('dashboard.charts.sales')} />
                  <Area type="monotone" dataKey="purchases" stackId="2" stroke="#f59e0b" fill="#fcd34d" name={t('dashboard.charts.purchases')} />
                  <Area type="monotone" dataKey="profit" stackId="3" stroke="#10b981" fill="#6ee7b7" name={t('dashboard.charts.profit')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.charts.companyPerformance.title')}</CardTitle>
            <CardDescription>{t('dashboard.charts.companyPerformance.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full" dir="ltr">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="company" type="category" width={150} orientation={direction === 'rtl' ? 'right' : 'left'} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    labelStyle={{ direction: direction }}
                  />
                  <Legend wrapperStyle={{ direction: direction, textAlign: direction === 'rtl' ? 'right' : 'left' }} />
                  <Bar dataKey="revenue" fill="#8b5cf6" name={t('dashboard.charts.revenue')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.inventory.title')}</CardTitle>
            <CardDescription>{t('dashboard.inventory.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryStatus.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <span className={`px-3 py-1 rounded-full text-sm shrink-0 ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <div className="flex-1">
                    <p className="mb-1">{item.category}</p>
                    <p className="text-sm text-gray-600">{item.stock} {t('dashboard.inventory.unit')} • {formatCurrency(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.activities.title')}</CardTitle>
            <CardDescription>{t('dashboard.activities.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm mb-1">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                  </div>
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                    activity.type === 'sale' ? 'bg-green-600' :
                    activity.type === 'product' ? 'bg-blue-600' :
                    activity.type === 'purchase' ? 'bg-orange-600' :
                    activity.type === 'customer' ? 'bg-purple-600' :
                    'bg-pink-600'
                  }`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
