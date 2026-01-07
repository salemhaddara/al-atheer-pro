import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Search, Edit, Trash2, Briefcase, DollarSign, ChevronDown, ChevronUp, Folder, FolderOpen, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';

// Service Category Interface
interface ServiceCategory {
    id: string;
    name: string;
    parentId: string | null;
    children: ServiceCategory[];
    serviceCount?: number;
}

// Tax Rate Interface
interface TaxRate {
    id: string;
    name: string;
    rate: number;
}

// Service Interface - No stock, no purchase price, no units
interface Service {
    id: string;
    code: string;           // كود الخدمة
    name: string;           // اسم الخدمة
    categoryId: string;     // تصنيف الخدمة
    categoryPath?: string;  // مسار التصنيف
    price: number;          // سعر الخدمة
    taxRateId?: string;     // معدل الضريبة
    taxIncluded: boolean;   // الضريبة مشمولة؟
    description?: string;   // وصف الخدمة
    status: 'نشط' | 'غير نشط';  // حالة الخدمة
    duration?: number;      // مدة تنفيذ الخدمة (بالدقائق) - اختياري
    provider?: string;      // مزود الخدمة - اختياري
    createdAt: string;
    updatedAt: string;
}

export function Services() {
    const { direction } = useLanguage();

    // Tax Rates State
    const [taxRates] = useState<TaxRate[]>([
        { id: 'tax-1', name: 'القيمة المضافة 15%', rate: 15 },
        { id: 'tax-2', name: 'القيمة المضافة 5%', rate: 5 },
        { id: 'tax-3', name: 'معفى من الضريبة', rate: 0 },
    ]);

    // Service Categories State (منفصلة عن تصنيفات المنتجات)
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([
        {
            id: 'scat-1',
            name: 'خدمات تقنية',
            parentId: null,
            children: [
                {
                    id: 'scat-1-1',
                    name: 'صيانة أجهزة',
                    parentId: 'scat-1',
                    children: [
                        { id: 'scat-1-1-1', name: 'صيانة كمبيوتر', parentId: 'scat-1-1', children: [] },
                        { id: 'scat-1-1-2', name: 'صيانة هواتف', parentId: 'scat-1-1', children: [] }
                    ]
                },
                {
                    id: 'scat-1-2',
                    name: 'برمجة وتطوير',
                    parentId: 'scat-1',
                    children: []
                }
            ]
        },
        {
            id: 'scat-2',
            name: 'خدمات استشارية',
            parentId: null,
            children: [
                {
                    id: 'scat-2-1',
                    name: 'استشارات تقنية',
                    parentId: 'scat-2',
                    children: []
                },
                {
                    id: 'scat-2-2',
                    name: 'استشارات إدارية',
                    parentId: 'scat-2',
                    children: []
                }
            ]
        },
        {
            id: 'scat-3',
            name: 'خدمات توصيل',
            parentId: null,
            children: []
        }
    ]);

    // Services State
    const [services, setServices] = useState<Service[]>([
        {
            id: 'srv-1',
            code: 'SRV-001',
            name: 'صيانة كمبيوتر محمول',
            categoryId: 'scat-1-1-1',
            categoryPath: 'خدمات تقنية > صيانة أجهزة > صيانة كمبيوتر',
            price: 200,
            taxRateId: 'tax-1',
            taxIncluded: false,
            description: 'خدمة صيانة شاملة للكمبيوتر المحمول تشمل التنظيف والفحص',
            status: 'نشط',
            duration: 60,
            provider: 'قسم الصيانة',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'srv-2',
            code: 'SRV-002',
            name: 'استشارة تقنية',
            categoryId: 'scat-2-1',
            categoryPath: 'خدمات استشارية > استشارات تقنية',
            price: 300,
            taxRateId: 'tax-1',
            taxIncluded: true,
            description: 'استشارة تقنية متخصصة لمدة ساعة',
            status: 'نشط',
            duration: 60,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'srv-3',
            code: 'SRV-003',
            name: 'توصيل طلب',
            categoryId: 'scat-3',
            categoryPath: 'خدمات توصيل',
            price: 50,
            taxRateId: 'tax-3',
            taxIncluded: false,
            description: 'خدمة توصيل داخل المدينة',
            status: 'نشط',
            duration: 30,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [activeTab, setActiveTab] = useState('services');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['scat-1', 'scat-2']));

    // Form State
    const [formData, setFormData] = useState<Partial<Service>>({
        code: '',
        name: '',
        categoryId: '',
        price: 0,
        taxRateId: 'tax-1',
        taxIncluded: false,
        description: '',
        status: 'نشط',
        duration: undefined,
        provider: ''
    });

    // Category Form State
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        parentId: null as string | null
    });

    // Generate Service Code
    const generateServiceCode = () => {
        const maxCode = services.reduce((max, service) => {
            const num = parseInt(service.code.split('-')[1]);
            return num > max ? num : max;
        }, 0);
        return `SRV-${String(maxCode + 1).padStart(3, '0')}`;
    };

    // Get Category Path
    const getCategoryPath = (categoryId: string, categories: ServiceCategory[]): string => {
        const findPath = (cats: ServiceCategory[], id: string, path: string[] = []): string[] | null => {
            for (const cat of cats) {
                if (cat.id === id) {
                    return [...path, cat.name];
                }
                if (cat.children.length > 0) {
                    const result = findPath(cat.children, id, [...path, cat.name]);
                    if (result) return result;
                }
            }
            return null;
        };
        const path = findPath(categories, categoryId);
        return path ? path.join(' > ') : '';
    };

    // Flatten Categories for Select
    const flattenCategories = (cats: ServiceCategory[], level = 0): { id: string; name: string; level: number }[] => {
        let result: { id: string; name: string; level: number }[] = [];
        cats.forEach(cat => {
            result.push({ id: cat.id, name: cat.name, level });
            if (cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children, level + 1));
            }
        });
        return result;
    };

    // Filter Services
    const filteredServices = services.filter(service => {
        const matchesSearch =
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Add Service
    const handleAddService = () => {
        if (!formData.name || !formData.categoryId || !formData.price) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة');
            return;
        }

        const newService: Service = {
            id: `srv-${Date.now()}`,
            code: formData.code || generateServiceCode(),
            name: formData.name,
            categoryId: formData.categoryId,
            categoryPath: getCategoryPath(formData.categoryId, serviceCategories),
            price: formData.price,
            taxRateId: formData.taxRateId,
            taxIncluded: formData.taxIncluded || false,
            description: formData.description,
            status: formData.status || 'نشط',
            duration: formData.duration,
            provider: formData.provider,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setServices([...services, newService]);
        setIsAddDialogOpen(false);
        resetForm();
        toast.success('تم إضافة الخدمة بنجاح');
    };

    // Edit Service
    const handleEditService = () => {
        if (!editingService || !formData.name || !formData.categoryId || !formData.price) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة');
            return;
        }

        const updatedService: Service = {
            ...editingService,
            code: formData.code || editingService.code,
            name: formData.name,
            categoryId: formData.categoryId,
            categoryPath: getCategoryPath(formData.categoryId, serviceCategories),
            price: formData.price,
            taxRateId: formData.taxRateId,
            taxIncluded: formData.taxIncluded || false,
            description: formData.description,
            status: formData.status || 'نشط',
            duration: formData.duration,
            provider: formData.provider,
            updatedAt: new Date().toISOString()
        };

        setServices(services.map(s => s.id === editingService.id ? updatedService : s));
        setIsEditDialogOpen(false);
        setEditingService(null);
        resetForm();
        toast.success('تم تحديث الخدمة بنجاح');
    };

    // Delete Service
    const handleDeleteService = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            setServices(services.filter(s => s.id !== id));
            toast.success('تم حذف الخدمة بنجاح');
        }
    };

    // Open Edit Dialog
    const openEditDialog = (service: Service) => {
        setEditingService(service);
        setFormData({
            code: service.code,
            name: service.name,
            categoryId: service.categoryId,
            price: service.price,
            taxRateId: service.taxRateId,
            taxIncluded: service.taxIncluded,
            description: service.description,
            status: service.status,
            duration: service.duration,
            provider: service.provider
        });
        setIsEditDialogOpen(true);
    };

    // Reset Form
    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            categoryId: '',
            price: 0,
            taxRateId: 'tax-1',
            taxIncluded: false,
            description: '',
            status: 'نشط',
            duration: undefined,
            provider: ''
        });
    };

    // Add Category
    const handleAddCategory = () => {
        if (!categoryFormData.name) {
            toast.error('الرجاء إدخال اسم التصنيف');
            return;
        }

        const newCategory: ServiceCategory = {
            id: `scat-${Date.now()}`,
            name: categoryFormData.name,
            parentId: categoryFormData.parentId,
            children: []
        };

        if (categoryFormData.parentId) {
            const addToParent = (cats: ServiceCategory[]): ServiceCategory[] => {
                return cats.map(cat => {
                    if (cat.id === categoryFormData.parentId) {
                        return { ...cat, children: [...cat.children, newCategory] };
                    }
                    if (cat.children.length > 0) {
                        return { ...cat, children: addToParent(cat.children) };
                    }
                    return cat;
                });
            };
            setServiceCategories(addToParent(serviceCategories));
        } else {
            setServiceCategories([...serviceCategories, newCategory]);
        }

        setCategoryFormData({ name: '', parentId: null });
        setIsCategoryDialogOpen(false);
        toast.success('تم إضافة التصنيف بنجاح');
    };

    // Toggle Category Expansion
    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // Render Category Tree
    const renderCategoryTree = (cats: ServiceCategory[], level = 0) => {
        return cats.map(cat => {
            const isExpanded = expandedCategories.has(cat.id);
            const hasChildren = cat.children.length > 0;
            const serviceCount = services.filter(s => s.categoryId === cat.id).length;

            return (
                <div key={cat.id} style={{ marginRight: `${level * 20}px` }}>
                    <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        {hasChildren && (
                            <button onClick={() => toggleCategory(cat.id)} className="hover:bg-gray-200 rounded p-1">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </button>
                        )}
                        {!hasChildren && <div className="w-6" />}
                        {isExpanded ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-gray-500" />}
                        <span className="flex-1">{cat.name}</span>
                        <Badge variant="secondary">{serviceCount}</Badge>
                    </div>
                    {hasChildren && isExpanded && renderCategoryTree(cat.children, level + 1)}
                </div>
            );
        });
    };

    // Get Tax Rate Name
    const getTaxRateName = (taxRateId?: string) => {
        const taxRate = taxRates.find(t => t.id === taxRateId);
        return taxRate ? taxRate.name : 'غير محدد';
    };

    // Calculate Price with Tax
    const calculatePriceWithTax = (price: number, taxRateId?: string, taxIncluded: boolean = false) => {
        if (!taxRateId) return price;
        const taxRate = taxRates.find(t => t.id === taxRateId);
        if (!taxRate) return price;

        if (taxIncluded) {
            return price;
        } else {
            return price * (1 + taxRate.rate / 100);
        }
    };

    // Statistics
    const totalServices = services.length;
    const activeServices = services.filter(s => s.status === 'نشط').length;
    const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);

    return (
        <div className="space-y-6" dir={direction}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
                    <p className="text-gray-600">تعريف وإدارة الخدمات المقدمة (بدون مخزون أو سعر شراء)</p>
                </div>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة خدمة جديدة
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500">إجمالي الخدمات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            <span className="text-2xl font-bold">{totalServices}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500">الخدمات النشطة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-green-500" />
                            <span className="text-2xl font-bold">{activeServices}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500">متوسط سعر الخدمة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-purple-500" />
                            <span className="text-2xl font-bold">{totalServices > 0 ? (totalRevenue / totalServices).toFixed(2) : 0} ر.س</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" dir="rtl">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="services">الخدمات</TabsTrigger>
                    <TabsTrigger value="categories">التصنيفات</TabsTrigger>
                </TabsList>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-4" dir="rtl">
                    <Card>
                        <CardHeader>
                            <CardTitle>قائمة الخدمات</CardTitle>
                            <CardDescription>البحث والتصفح في جميع الخدمات المتاحة</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search and Filter */}
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="البحث بالاسم أو الكود..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="جميع التصنيفات" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">جميع التصنيفات</SelectItem>
                                        {flattenCategories(serviceCategories).map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {'─'.repeat(cat.level)} {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Services Table */}
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>كود الخدمة</TableHead>
                                            <TableHead>اسم الخدمة</TableHead>
                                            <TableHead>التصنيف</TableHead>
                                            <TableHead>السعر</TableHead>
                                            <TableHead>الضريبة</TableHead>
                                            <TableHead>السعر النهائي</TableHead>
                                            <TableHead>المدة</TableHead>
                                            <TableHead>الحالة</TableHead>
                                            <TableHead>الإجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredServices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                                                    لا توجد خدمات متاحة
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredServices.map(service => (
                                                <TableRow key={service.id}>
                                                    <TableCell className="font-mono">{service.code}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{service.name}</div>
                                                            {service.description && (
                                                                <div className="text-xs text-gray-500 mt-1">{service.description.substring(0, 50)}...</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs text-gray-600">{service.categoryPath}</div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{service.price.toFixed(2)} ر.س</TableCell>
                                                    <TableCell>
                                                        <div className="text-xs">
                                                            <div>{getTaxRateName(service.taxRateId)}</div>
                                                            <Badge variant={service.taxIncluded ? "default" : "secondary"} className="text-xs mt-1">
                                                                {service.taxIncluded ? 'مشمولة' : 'غير مشمولة'}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold">
                                                        {calculatePriceWithTax(service.price, service.taxRateId, service.taxIncluded).toFixed(2)} ر.س
                                                    </TableCell>
                                                    <TableCell>
                                                        {service.duration ? `${service.duration} دقيقة` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={service.status === 'نشط' ? "default" : "secondary"}>
                                                            {service.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>تصنيفات الخدمات</CardTitle>
                                    <CardDescription>إدارة تصنيفات الخدمات (منفصلة عن تصنيفات المنتجات)</CardDescription>
                                </div>
                                <Button onClick={() => setIsCategoryDialogOpen(true)} size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    إضافة تصنيف
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg p-4">
                                {renderCategoryTree(serviceCategories)}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Service Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>إضافة خدمة جديدة</DialogTitle>
                        <DialogDescription>
                            أدخل تفاصيل الخدمة الجديدة (لا حاجة لسعر شراء أو مخزون)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Service Code */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">كود الخدمة</Label>
                                <Input
                                    id="code"
                                    placeholder="SRV-001 (تلقائي)"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">اتركه فارغاً للإنشاء التلقائي</p>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">الحالة</Label>
                                <Select value={formData.status} onValueChange={(value: 'نشط' | 'غير نشط') => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="نشط">نشط</SelectItem>
                                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Service Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم الخدمة *</Label>
                            <Input
                                id="name"
                                placeholder="مثال: صيانة كمبيوتر محمول"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">التصنيف *</Label>
                            <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر التصنيف" />
                                </SelectTrigger>
                                <SelectContent>
                                    {flattenCategories(serviceCategories).map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {'─'.repeat(cat.level)} {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">سعر الخدمة * (ر.س)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">مدة التنفيذ (دقيقة)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="0"
                                    placeholder="60"
                                    value={formData.duration || ''}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
                                />
                            </div>
                        </div>

                        {/* Tax */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="taxRate">معدل الضريبة</Label>
                                <Select value={formData.taxRateId} onValueChange={(value) => setFormData({ ...formData, taxRateId: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taxRates.map(tax => (
                                            <SelectItem key={tax.id} value={tax.id}>
                                                {tax.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxIncluded">الضريبة مشمولة؟</Label>
                                <Select
                                    value={formData.taxIncluded ? 'yes' : 'no'}
                                    onValueChange={(value) => setFormData({ ...formData, taxIncluded: value === 'yes' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">نعم</SelectItem>
                                        <SelectItem value="no">لا</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Provider */}
                        <div className="space-y-2">
                            <Label htmlFor="provider">مزود الخدمة (اختياري)</Label>
                            <Input
                                id="provider"
                                placeholder="مثال: قسم الصيانة"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">الوصف</Label>
                            <Textarea
                                id="description"
                                placeholder="وصف تفصيلي للخدمة..."
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Price Summary */}
                        {formData.price && formData.price > 0 && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">ملخص السعر:</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>سعر الخدمة:</span>
                                        <span className="font-medium">{formData.price.toFixed(2)} ر.س</span>
                                    </div>
                                    {formData.taxRateId && !formData.taxIncluded && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>الضريبة ({taxRates.find(t => t.id === formData.taxRateId)?.rate}%):</span>
                                                <span className="font-medium">
                                                    {(formData.price * (taxRates.find(t => t.id === formData.taxRateId)?.rate || 0) / 100).toFixed(2)} ر.س
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-t pt-1 font-bold">
                                                <span>الإجمالي:</span>
                                                <span>{calculatePriceWithTax(formData.price, formData.taxRateId, formData.taxIncluded).toFixed(2)} ر.س</span>
                                            </div>
                                        </>
                                    )}
                                    {formData.taxIncluded && (
                                        <div className="text-green-600 text-xs">
                                            السعر يشمل الضريبة
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                إلغاء
                            </Button>
                            <Button onClick={handleAddService}>
                                <Plus className="h-4 w-4 ml-2" />
                                إضافة الخدمة
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Service Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل الخدمة</DialogTitle>
                        <DialogDescription>
                            تحديث معلومات الخدمة
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Same form as Add Dialog */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-code">كود الخدمة</Label>
                                <Input
                                    id="edit-code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-status">الحالة</Label>
                                <Select value={formData.status} onValueChange={(value: 'نشط' | 'غير نشط') => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="نشط">نشط</SelectItem>
                                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-name">اسم الخدمة *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-category">التصنيف *</Label>
                            <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {flattenCategories(serviceCategories).map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {'─'.repeat(cat.level)} {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-price">سعر الخدمة * (ر.س)</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-duration">مدة التنفيذ (دقيقة)</Label>
                                <Input
                                    id="edit-duration"
                                    type="number"
                                    min="0"
                                    value={formData.duration || ''}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-taxRate">معدل الضريبة</Label>
                                <Select value={formData.taxRateId} onValueChange={(value) => setFormData({ ...formData, taxRateId: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taxRates.map(tax => (
                                            <SelectItem key={tax.id} value={tax.id}>
                                                {tax.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-taxIncluded">الضريبة مشمولة؟</Label>
                                <Select
                                    value={formData.taxIncluded ? 'yes' : 'no'}
                                    onValueChange={(value) => setFormData({ ...formData, taxIncluded: value === 'yes' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">نعم</SelectItem>
                                        <SelectItem value="no">لا</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-provider">مزود الخدمة</Label>
                            <Input
                                id="edit-provider"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">الوصف</Label>
                            <Textarea
                                id="edit-description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                إلغاء
                            </Button>
                            <Button onClick={handleEditService}>
                                <Edit className="h-4 w-4 ml-2" />
                                تحديث الخدمة
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent dir="rtl">
                    <DialogHeader>
                        <DialogTitle>إضافة تصنيف خدمة</DialogTitle>
                        <DialogDescription>
                            إضافة تصنيف جديد لتنظيم الخدمات
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">اسم التصنيف *</Label>
                            <Input
                                id="cat-name"
                                placeholder="مثال: خدمات تقنية"
                                value={categoryFormData.name}
                                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-parent">التصنيف الأب (اختياري)</Label>
                            <Select
                                value={categoryFormData.parentId || 'none'}
                                onValueChange={(value) => setCategoryFormData({ ...categoryFormData, parentId: value === 'none' ? null : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="بدون تصنيف أب" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">بدون تصنيف أب</SelectItem>
                                    {flattenCategories(serviceCategories).map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {'─'.repeat(cat.level)} {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                                إلغاء
                            </Button>
                            <Button onClick={handleAddCategory}>
                                <Plus className="h-4 w-4 ml-2" />
                                إضافة التصنيف
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

