import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Package, Barcode as BarcodeIcon, Info } from 'lucide-react';

interface PriceItem {
  id: string;
  name: string;
  baseUnit: string;
  price: number;
  barcode: string;
}

// ملاحظة: في النسخة الحقيقية يمكن قراءة هذه البيانات من نفس مصدر بيانات المنتجات
const SAMPLE_ITEMS: PriceItem[] = [
  { id: '1', name: 'لابتوب ديل XPS 13', baseUnit: 'حبة', price: 4500, barcode: '1234567890123' },
  { id: '2', name: 'آيفون 15 برو', baseUnit: 'حبة', price: 5200, barcode: '2345678901234' },
  { id: '3', name: 'عصير برتقال طبيعي', baseUnit: 'زجاجة', price: 8, barcode: '3456789012345' },
  { id: '4', name: 'مشروب غازي كوكاكولا', baseUnit: 'علبة', price: 2.5, barcode: '5678901234567' },
  { id: '5', name: 'تونة معلبة', baseUnit: 'علبة', price: 12, barcode: '6789012345678' },
];

export function PriceInquiry() {
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return SAMPLE_ITEMS;
    return SAMPLE_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.barcode.toLowerCase().includes(term)
    );
  }, [search]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center px-4 py-6 bg-gradient-to-b from-slate-50 to-slate-100" dir="rtl">
      <Card className="w-full max-w-4xl shadow-lg border-slate-200">
        <CardHeader className="text-right border-b bg-white/70 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="text-right">
                <CardTitle className="text-2xl">شاشة الاستعلام عن الأسعار</CardTitle>
                <CardDescription className="text-sm mt-1">
                  ابحث عن سعر أي صنف باستخدام الاسم أو رقم الصنف أو الباركود – مخصصة لشاشات خدمة العملاء في المتاجر الكبيرة
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              مخصصة لاستخدام العملاء فقط
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="اكتب اسم الصنف، رقم الصنف، أو امسح الباركود..."
              className="pr-10 h-12 text-lg text-right"
            />
          </div>

          {/* Result table */}
          <div className="border rounded-xl overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right w-24">رقم الصنف</TableHead>
                  <TableHead className="text-right">اسم الصنف</TableHead>
                  <TableHead className="text-right w-32">الوحدة</TableHead>
                  <TableHead className="text-right w-40">السعر</TableHead>
                  <TableHead className="text-right w-48">الباركود</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/40">
                    <TableCell className="font-medium text-right">
                      <Badge variant="secondary" className="font-mono text-xs px-2 py-1">
                        {item.id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-slate-50">
                        {item.baseUnit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-end rounded-full bg-emerald-50 text-emerald-700 px-4 py-1.5 text-lg font-bold min-w-[120px]">
                        {formatCurrency(item.price)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-2 font-mono text-xs bg-slate-100 rounded-full px-3 py-1">
                        <BarcodeIcon className="w-3 h-3 text-gray-500" />
                        {item.barcode}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-gray-500 text-sm">
                      لم يتم العثور على أي صنف مطابق لبيانات البحث الحالية
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


