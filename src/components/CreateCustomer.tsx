'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowRight, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    customerType: 'فرد' | 'مؤسسة' | 'محل تجاري';
    taxNumber?: string;
    nationalAddress?: {
        buildingNumber?: string;
        streetName?: string;
        district?: string;
        city?: string;
        postalCode?: string;
        unitNumber?: string;
        additionalNumber?: string;
    };
    totalOrders: number;
    totalSpent: number;
    creditLimit: number;
    currentBalance: number;
    graceDays: number;
    creditStatus: 'ممتاز' | 'تحذير' | 'موقوف';
}

const STORAGE_KEY = 'customers_data';

interface CreateCustomerProps {
    customerId?: string;
}

export function CreateCustomer({ customerId }: CreateCustomerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const isEditMode = !!customerId;

    // Prefetch customers page on mount
    useEffect(() => {
        router.prefetch('/customers');
    }, [router]);
    const [formData, setFormData] = useState<Partial<Customer>>({
        customerType: 'فرد',
        nationalAddress: {},
        creditLimit: 0,
        currentBalance: 0,
        graceDays: 30,
        creditStatus: 'ممتاز'
    });

    // Load customer data if editing
    useEffect(() => {
        if (customerId && typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const customers: Customer[] = JSON.parse(stored);
                    const customer = customers.find(c => c.id === customerId);
                    if (customer) {
                        setFormData({
                            ...customer,
                            nationalAddress: customer.nationalAddress || {}
                        });
                    } else {
                        toast.error('العميل غير موجود');
                        startTransition(() => {
                            router.push('/customers');
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading customer:', error);
                toast.error('حدث خطأ أثناء تحميل بيانات العميل');
            }
        }
    }, [customerId, router]);

    const handleSave = () => {
        // Validation
        if (!formData.name || !formData.phone) {
            toast.error('يرجى إدخال الاسم ورقم الهاتف');
            return;
        }

        if ((formData.customerType === 'مؤسسة' || formData.customerType === 'محل تجاري')) {
            if (!formData.taxNumber) {
                toast.error('الرقم الضريبي مطلوب للمؤسسات والمحلات التجارية');
                return;
            }
            if (!formData.nationalAddress?.buildingNumber || !formData.nationalAddress?.streetName ||
                !formData.nationalAddress?.district || !formData.nationalAddress?.city ||
                !formData.nationalAddress?.postalCode) {
                toast.error('يرجى إدخال جميع بيانات العنوان الوطني المطلوبة');
                return;
            }
        }

        // Load existing customers
        let existingCustomers: Customer[] = [];
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    existingCustomers = JSON.parse(stored);
                }
            } catch (error) {
                console.error('Error loading customers:', error);
            }
        }

        if (isEditMode && customerId) {
            // Update existing customer
            const updatedCustomers = existingCustomers.map(c =>
                c.id === customerId
                    ? { ...formData, id: customerId } as Customer
                    : c
            );

            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));
                    toast.success('تم تحديث العميل بنجاح');
                    startTransition(() => {
                        router.push('/customers');
                    });
                } catch (error) {
                    console.error('Error updating customer:', error);
                    toast.error('حدث خطأ أثناء تحديث العميل');
                }
            }
        } else {
            // Create new customer
            const newCustomer: Customer = {
                id: String(Date.now()),
                name: formData.name!,
                email: formData.email || '',
                phone: formData.phone!,
                address: formData.address || '',
                customerType: formData.customerType || 'فرد',
                taxNumber: formData.taxNumber,
                nationalAddress: formData.nationalAddress,
                totalOrders: formData.totalOrders || 0,
                totalSpent: formData.totalSpent || 0,
                creditLimit: formData.creditLimit || 0,
                currentBalance: formData.currentBalance || 0,
                graceDays: formData.graceDays || 30,
                creditStatus: formData.creditStatus || 'ممتاز'
            };

            // Save to localStorage
            const updatedCustomers = [...existingCustomers, newCustomer];
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));
                    toast.success('تم إضافة العميل بنجاح');
                    startTransition(() => {
                        router.push('/customers');
                    });
                } catch (error) {
                    console.error('Error saving customer:', error);
                    toast.error('حدث خطأ أثناء حفظ العميل');
                }
            }
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/customers" prefetch={true}>
                        <Button variant="ghost" className="gap-2">
                            <ArrowRight className="w-4 h-4" />
                            رجوع
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{isEditMode ? 'تعديل العميل' : 'إضافة عميل جديد'}</h1>
                        <p className="text-gray-600">أدخل معلومات العميل في الحقول أدناه</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>معلومات العميل الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>الاسم الكامل <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="أدخل الاسم الكامل"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>البريد الإلكتروني</Label>
                        <Input
                            type="email"
                            placeholder="example@domain.com"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>رقم الهاتف <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="05xxxxxxxx"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>العنوان</Label>
                        <Input
                            placeholder="أدخل العنوان الكامل"
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    {/* نوع العميل */}
                    <div>
                        <Label>نوع العميل</Label>
                        <Select
                            value={formData.customerType || 'فرد'}
                            onValueChange={(value: 'فرد' | 'مؤسسة' | 'محل تجاري') => {
                                setFormData({
                                    ...formData,
                                    customerType: value,
                                    // إعادة تعيين البيانات الضريبية عند تغيير النوع
                                    taxNumber: value === 'فرد' ? undefined : formData.taxNumber,
                                    nationalAddress: value === 'فرد' ? undefined : (formData.nationalAddress || {})
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="فرد">فرد</SelectItem>
                                <SelectItem value="مؤسسة">مؤسسة</SelectItem>
                                <SelectItem value="محل تجاري">محل تجاري</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* البيانات الضريبية (للمؤسسات والمحلات التجارية فقط) */}
                    {(formData.customerType === 'مؤسسة' || formData.customerType === 'محل تجاري') && (
                        <>
                            <div>
                                <Label>الرقم الضريبي <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="300123456700003"
                                    value={formData.taxNumber || ''}
                                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">مطلوب للربط مع هيئة الزكاة والدخل</p>
                            </div>

                            {/* العنوان الوطني */}
                            <div className="border-t pt-4 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    <Label className="text-base font-semibold">العنوان الوطني</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>رقم المبنى <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="1234"
                                            value={formData.nationalAddress?.buildingNumber || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                nationalAddress: { ...formData.nationalAddress, buildingNumber: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>اسم الشارع <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="شارع الملك فهد"
                                            value={formData.nationalAddress?.streetName || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                nationalAddress: { ...formData.nationalAddress, streetName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>اسم الحي <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="حي العليا"
                                            value={formData.nationalAddress?.district || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                nationalAddress: { ...formData.nationalAddress, district: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>المدينة <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="الرياض"
                                            value={formData.nationalAddress?.city || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                nationalAddress: { ...formData.nationalAddress, city: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>الرمز البريدي <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="12345"
                                            value={formData.nationalAddress?.postalCode || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                nationalAddress: { ...formData.nationalAddress, postalCode: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>رقم الوحدة (اختياري)</Label>
                                        <Input
                                            placeholder="5"
                                            value={formData.nationalAddress?.unitNumber || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                nationalAddress: { ...formData.nationalAddress, unitNumber: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>رقم إضافي (اختياري)</Label>
                                        <Input
                                            placeholder="1234"
                                            value={formData.nationalAddress?.additionalNumber || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                nationalAddress: { ...formData.nationalAddress, additionalNumber: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Credit Information */}
            <Card>
                <CardHeader>
                    <CardTitle>معلومات الائتمان</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>حد الائتمان (ر.س)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.creditLimit ?? ''}
                                onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label>الرصيد الحالي (ر.س)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.currentBalance ?? ''}
                                onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>أيام السماح</Label>
                            <Input
                                type="number"
                                placeholder="30"
                                value={formData.graceDays ?? ''}
                                onChange={(e) => setFormData({ ...formData, graceDays: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label>حالة الائتمان</Label>
                            <Select
                                value={formData.creditStatus || 'ممتاز'}
                                onValueChange={(value: 'ممتاز' | 'تحذير' | 'موقوف') => setFormData({ ...formData, creditStatus: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ممتاز">ممتاز</SelectItem>
                                    <SelectItem value="تحذير">تحذير</SelectItem>
                                    <SelectItem value="موقوف">موقوف</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
                <Link href="/customers" prefetch={true}>
                    <Button variant="outline">
                        إلغاء
                    </Button>
                </Link>
                <Button onClick={handleSave} className="gap-2" disabled={isPending}>
                    {isPending ? 'جاري الحفظ...' : (isEditMode ? 'تحديث العميل' : 'حفظ العميل')}
                </Button>
            </div>
        </div>
    );
}

