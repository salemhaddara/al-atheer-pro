import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, FileText, Users, Package, Download, Printer } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface QuotationItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Quotation {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'مسودة' | 'مرسل';
}

export function Quotations() {
  const [customerName, setCustomerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const products: Product[] = [
    { id: '1', name: 'كمبيوتر محمول HP', price: 3000 },
    { id: '2', name: 'طابعة Canon', price: 2000 },
    { id: '3', name: 'شاشة Samsung 27\"', price: 1500 },
    { id: '4', name: 'لوحة مفاتيح Logitech', price: 300 },
    { id: '5', name: 'ماوس Logitech', price: 150 },
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.15;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const addProductToQuotation = (product: Product) => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      setItems(items.map(i =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setItems([...items, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const saveQuotation = () => {
    if (!customerName.trim()) {
      return;
    }
    if (items.length === 0) {
      return;
    }

    const id = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    const q: Quotation = {
      id,
      customerName: customerName.trim(),
      date: today,
      total,
      status: 'مسودة'
    };

    setQuotations([q, ...quotations]);
    setItems([]);
    setCustomerName('');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>عروض الأسعار</h1>
          <p className="text-gray-600">إنشاء وعرض عروض أسعار للعملاء بدون تنفيذ عملية بيع</p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">إنشاء عرض سعر</TabsTrigger>
          <TabsTrigger value="list">قائمة عروض الأسعار</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer & Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Customer Info */}
              <Card>
                <CardHeader className="text-right">
                  <CardTitle>بيانات العميل</CardTitle>
                  <CardDescription>أدخل اسم العميل الذي طلب عرض السعر</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>اسم العميل</Label>
                    <Input
                      placeholder="مثال: شركة النجاح التقنية"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Search */}
              <Card>
                <CardHeader className="text-right">
                  <CardTitle>المنتجات</CardTitle>
                  <CardDescription>أضف المنتجات إلى عرض السعر</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="بحث عن منتج..."
                        className="pl-10 text-right"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => addProductToQuotation(product)}
                        >
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gray-100 rounded-lg.mb-3 flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-sm mb-2 text-right">{product.name}</h4>
                            <div className="text-right text-blue-600 font-medium">
                              {formatCurrency(product.price)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center.text-gray-500 py-6">
                          لا توجد منتجات مطابقة للبحث
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quotation Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader className="text-right">
                  <CardTitle className="flex items-center justify-between">
                    <span>ملخص عرض السعر</span>
                    <FileText className="w-5 h-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                      <FileText className="w-10 h-10 mx-auto mb-3.opacity-40" />
                      <p>لم تقم بإضافة أي منتجات بعد</p>
                    </div>
                  ) : (
                    <>
                      <div className="border rounded-lg.max-h-52 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">الصنف</TableHead>
                              <TableHead className="text-right">الكمية</TableHead>
                              <TableHead className="text-right">السعر</TableHead>
                              <TableHead className="text-right">الإجمالي</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-right">{item.name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.price * item.quantity)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>المجموع الفرعي:</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الضريبة (15%):</span>
                          <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>الإجمالي:</span>
                          <span className="text-blue-600">{formatCurrency(total)}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={saveQuotation}
                        disabled={!customerName.trim() || items.length === 0}
                      >
                        حفظ عرض السعر
                      </Button>

                      <div className="flex gap-2 justify-between">
                        <Button variant="outline" className="flex-1 gap-2">
                          <Printer className="w-4 h-4" />
                          طباعة
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                          <Download className="w-4 h-4" />
                          تصدير PDF
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>قائمة عروض الأسعار</CardTitle>
              <CardDescription>أحدث عروض الأسعار التي تم إنشاؤها</CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <Users className="w-10 h-10 mx-auto mb-3.opacity-40" />
                  <p>لا توجد عروض أسعار مسجلة حتى الآن</p>
                </div>
              ) : (
                <div dir="rtl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم العرض</TableHead>
                        <TableHead className="text-right">العميل</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="text-right">{q.id}</TableCell>
                          <TableCell className="text-right">{q.customerName}</TableCell>
                          <TableCell className="text-right">{q.date}</TableCell>
                          <TableCell className="text-right">{formatCurrency(q.total)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{q.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


