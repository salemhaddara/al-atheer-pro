import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Search, Edit, Trash2, Package, TrendingDown, DollarSign, ChevronDown, ChevronUp, X, Folder, FolderOpen, ChevronLeft, FolderTree, Percent, Receipt, RotateCcw, ShoppingCart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
  productCount?: number;
}

interface TaxRate {
  id: string;
  name: string;
  rate: number;
}

interface ProductUnit {
  id: string;
  unitName: string;
  conversionFactor: number;
  barcode: string;
  sellPrice: number;
  purchasePrice: number;
  isBase: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryPath?: string;
  baseUnit: string;
  baseBarcode: string;
  units: ProductUnit[];
  stock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  minSellPrice: number;
  allowedDiscount: number;
  taxRateId?: string;
  taxIncluded: boolean;
  returnPeriodDays: number;
  allowReturn: boolean;
  minQuantity: number;
  maxQuantity?: number;
  status: string;
}

export function Products() {
  // Tax Rates State
  const [taxRates] = useState<TaxRate[]>([
    { id: 'tax-1', name: 'القيمة المضافة 15%', rate: 15 },
    { id: 'tax-2', name: 'القيمة المضافة 5%', rate: 5 },
    { id: 'tax-3', name: 'معفى من الضريبة', rate: 0 },
  ]);

  // Categories State
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'cat-1',
      name: 'إلكترونيات',
      parentId: null,
      children: [
        {
          id: 'cat-1-1',
          name: 'أجهزة كمبيوتر',
          parentId: 'cat-1',
          children: [
            { id: 'cat-1-1-1', name: 'لابتوب', parentId: 'cat-1-1', children: [] },
            { id: 'cat-1-1-2', name: 'كمبيوتر مكتبي', parentId: 'cat-1-1', children: [] }
          ]
        },
        {
          id: 'cat-1-2',
          name: 'هواتف ذكية',
          parentId: 'cat-1',
          children: [
            { id: 'cat-1-2-1', name: 'آيفون', parentId: 'cat-1-2', children: [] },
            { id: 'cat-1-2-2', name: 'أندرويد', parentId: 'cat-1-2', children: [] }
          ]
        }
      ]
    },
    {
      id: 'cat-2',
      name: 'أطعمة ومشروبات',
      parentId: null,
      children: [
        {
          id: 'cat-2-1',
          name: 'مشروبات',
          parentId: 'cat-2',
          children: [
            { id: 'cat-2-1-1', name: 'عصائر', parentId: 'cat-2-1', children: [] },
            { id: 'cat-2-1-2', name: 'مشروبات غازية', parentId: 'cat-2-1', children: [] }
          ]
        },
        {
          id: 'cat-2-2',
          name: 'أطعمة معلبة',
          parentId: 'cat-2',
          children: []
        }
      ]
    }
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'لابتوب ديل XPS 13',
      sku: 'DELL-XPS-001',
      categoryId: 'cat-1-1-1',
      categoryPath: 'إلكترونيات > أجهزة كمبيوتر > لابتوب',
      baseUnit: 'حبة',
      baseBarcode: '1234567890123',
      units: [
        { id: '1', unitName: 'حبة', conversionFactor: 1, barcode: '1234567890123', sellPrice: 4500, purchasePrice: 4000, isBase: true },
        { id: '2', unitName: 'كرتون (5 حبات)', conversionFactor: 5, barcode: '1234567890124', sellPrice: 21000, purchasePrice: 19000, isBase: false }
      ],
      stock: 25,
      minStock: 5,
      costPrice: 4000,
      sellPrice: 4500,
      minSellPrice: 4200,
      allowedDiscount: 10,
      taxRateId: 'tax-1',
      taxIncluded: false,
      returnPeriodDays: 7,
      allowReturn: true,
      minQuantity: 1,
      maxQuantity: undefined,
      status: 'نشط'
    },
    {
      id: '2',
      name: 'آيفون 15 برو',
      sku: 'APPL-IPH-015',
      categoryId: 'cat-1-2-1',
      categoryPath: 'إلكترونيات > هواتف ذكية > آيفون',
      baseUnit: 'حبة',
      baseBarcode: '2345678901234',
      units: [
        { id: '1', unitName: 'حبة', conversionFactor: 1, barcode: '2345678901234', sellPrice: 5200, purchasePrice: 4800, isBase: true },
        { id: '2', unitName: 'كرتون (10 حبات)', conversionFactor: 10, barcode: '2345678901235', sellPrice: 50000, purchasePrice: 46000, isBase: false }
      ],
      stock: 15,
      minStock: 3,
      costPrice: 4800,
      sellPrice: 5200,
      minSellPrice: 5000,
      allowedDiscount: 5,
      taxRateId: 'tax-1',
      taxIncluded: true,
      returnPeriodDays: 14,
      allowReturn: true,
      minQuantity: 1,
      maxQuantity: 5,
      status: 'نشط'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Category Management State
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', parentId: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cat-1', 'cat-2']));

  // Product Form Tab State
  const [activeFormTab, setActiveFormTab] = useState('basic');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    baseUnit: 'حبة',
    barcode: '',
    stock: 0,
    minStock: 5,
    costPrice: 0,
    sellPrice: 0,
    minSellPrice: 0,
    allowedDiscount: 0,
    taxRateId: 'tax-1',
    taxIncluded: false,
    returnPeriodDays: 0,
    allowReturn: true,
    minQuantity: 1,
    maxQuantity: undefined as number | undefined,
    status: 'نشط'
  });

  const [additionalUnits, setAdditionalUnits] = useState<Array<{
    name: string;
    quantity: number;
    barcode: string;
    sellPrice: number;
    costPrice: number;
  }>>([]);

  // Helper Functions for Categories
  const findCategoryById = (categories: Category[], id: string): Category | null => {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.children.length > 0) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getCategoryPath = (categoryId: string): string => {
    const path: string[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const cat = findCategoryById(categories, currentId);
      if (cat) {
        path.unshift(cat.name);
        currentId = cat.parentId;
      } else {
        break;
      }
    }
    return path.join(' > ');
  };

  const addCategoryToTree = (categories: Category[], newCategory: Category, parentId: string | null): Category[] => {
    if (!parentId) {
      return [...categories, newCategory];
    }

    return categories.map(cat => {
      if (cat.id === parentId) {
        return { ...cat, children: [...cat.children, newCategory] };
      }
      if (cat.children.length > 0) {
        return { ...cat, children: addCategoryToTree(cat.children, newCategory, parentId) };
      }
      return cat;
    });
  };

  const updateCategoryInTree = (categories: Category[], updatedCategory: Category): Category[] => {
    return categories.map(cat => {
      if (cat.id === updatedCategory.id) {
        return { ...updatedCategory, children: cat.children };
      }
      if (cat.children.length > 0) {
        return { ...cat, children: updateCategoryInTree(cat.children, updatedCategory) };
      }
      return cat;
    });
  };

  const deleteCategoryFromTree = (categories: Category[], categoryId: string): Category[] => {
    return categories.filter(cat => {
      if (cat.id === categoryId) return false;
      if (cat.children.length > 0) {
        cat.children = deleteCategoryFromTree(cat.children, categoryId);
      }
      return true;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.includes(searchTerm) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.baseBarcode.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  // Category Management Handlers
  const handleAddCategory = (parentId: string | null = null) => {
    setCategoryFormData({ name: '', parentId: parentId || '' });
    setEditingCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({ name: category.name, parentId: category.parentId || '' });
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryFormData.name.trim()) {
      toast.error('يرجى إدخال اسم التصنيف');
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategory: Category = {
        ...editingCategory,
        name: categoryFormData.name,
      };
      setCategories(updateCategoryInTree(categories, updatedCategory));
      toast.success('تم تحديث التصنيف بنجاح');
    } else {
      // Add new category
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: categoryFormData.name,
        parentId: categoryFormData.parentId || null,
        children: []
      };
      setCategories(addCategoryToTree(categories, newCategory, newCategory.parentId));

      // Expand parent if exists
      if (newCategory.parentId) {
        setExpandedCategories(prev => new Set(prev).add(newCategory.parentId!));
      }

      toast.success('تم إضافة التصنيف بنجاح');
    }

    setIsCategoryDialogOpen(false);
    setCategoryFormData({ name: '', parentId: '' });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = findCategoryById(categories, categoryId);
    if (!category) return;

    // Check if category has children
    if (category.children.length > 0) {
      toast.error('لا يمكن حذف تصنيف يحتوي على تصنيفات فرعية');
      return;
    }

    // Check if category has products
    const hasProducts = products.some(p => p.categoryId === categoryId);
    if (hasProducts) {
      toast.error('لا يمكن حذف تصنيف يحتوي على منتجات');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف التصنيف "${category.name}"؟`)) {
      setCategories(deleteCategoryFromTree(categories, categoryId));
      toast.success('تم حذف التصنيف بنجاح');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      baseUnit: 'حبة',
      barcode: '',
      stock: 0,
      minStock: 5,
      costPrice: 0,
      sellPrice: 0,
      minSellPrice: 0,
      allowedDiscount: 0,
      taxRateId: 'tax-1',
      taxIncluded: false,
      returnPeriodDays: 0,
      allowReturn: true,
      minQuantity: 1,
      maxQuantity: undefined,
      status: 'نشط'
    });
    setAdditionalUnits([]);
    setEditingProduct(null);
    setActiveFormTab('basic');
  };

  const handleAddProduct = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      baseUnit: product.baseUnit,
      barcode: product.baseBarcode,
      stock: product.stock,
      minStock: product.minStock,
      costPrice: product.costPrice,
      sellPrice: product.sellPrice,
      minSellPrice: product.minSellPrice,
      allowedDiscount: product.allowedDiscount,
      taxRateId: product.taxRateId || 'tax-1',
      taxIncluded: product.taxIncluded,
      returnPeriodDays: product.returnPeriodDays,
      allowReturn: product.allowReturn,
      minQuantity: product.minQuantity,
      maxQuantity: product.maxQuantity,
      status: product.status
    });

    // Load additional units (exclude base unit)
    const nonBaseUnits = product.units.filter(u => !u.isBase).map(u => ({
      name: u.unitName,
      quantity: u.conversionFactor,
      barcode: u.barcode,
      sellPrice: u.sellPrice,
      costPrice: u.purchasePrice
    }));
    setAdditionalUnits(nonBaseUnits);

    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter(p => p.id !== id));
      toast.success('تم حذف المنتج بنجاح');
    }
  };

  const handleSaveProduct = () => {
    // Validation
    if (!formData.name || !formData.sku || !formData.categoryId || !formData.barcode) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Validate pricing
    if (formData.minSellPrice > formData.sellPrice) {
      toast.error('الحد الأدنى لسعر البيع لا يمكن أن يكون أكبر من السعر الافتراضي');
      return;
    }

    if (formData.minSellPrice < formData.costPrice) {
      toast.error('الحد الأدنى لسعر البيع لا يمكن أن يكون أقل من سعر التكلفة');
      return;
    }

    // Validate quantities
    if (formData.maxQuantity && formData.maxQuantity < formData.minQuantity) {
      toast.error('الحد الأعلى للكمية لا يمكن أن يكون أقل من الحد الأدنى');
      return;
    }

    // Create base unit
    const baseUnit: ProductUnit = {
      id: '1',
      unitName: formData.baseUnit,
      conversionFactor: 1,
      barcode: formData.barcode,
      sellPrice: formData.sellPrice,
      purchasePrice: formData.costPrice,
      isBase: true
    };

    // Create additional units
    const units: ProductUnit[] = [
      baseUnit,
      ...additionalUnits.map((unit, index) => ({
        id: String(index + 2),
        unitName: unit.name,
        conversionFactor: unit.quantity,
        barcode: unit.barcode || `${formData.barcode}${index + 1}`,
        sellPrice: unit.sellPrice,
        purchasePrice: unit.costPrice,
        isBase: false
      }))
    ];

    const productData: Product = {
      id: editingProduct?.id || String(Date.now()),
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      categoryPath: getCategoryPath(formData.categoryId),
      baseUnit: formData.baseUnit,
      baseBarcode: formData.barcode,
      units,
      stock: formData.stock,
      minStock: formData.minStock,
      costPrice: formData.costPrice,
      sellPrice: formData.sellPrice,
      minSellPrice: formData.minSellPrice,
      allowedDiscount: formData.allowedDiscount,
      taxRateId: formData.taxRateId,
      taxIncluded: formData.taxIncluded,
      returnPeriodDays: formData.returnPeriodDays,
      allowReturn: formData.allowReturn,
      minQuantity: formData.minQuantity,
      maxQuantity: formData.maxQuantity,
      status: formData.status
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
      toast.success('تم تحديث المنتج بنجاح');
    } else {
      setProducts([...products, productData]);
      toast.success('تم إضافة المنتج بنجاح');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleAddUnit = () => {
    setAdditionalUnits([
      ...additionalUnits,
      { name: '', quantity: 1, barcode: '', sellPrice: 0, costPrice: 0 }
    ]);
  };

  const handleRemoveUnit = (index: number) => {
    setAdditionalUnits(additionalUnits.filter((_, i) => i !== index));
  };

  const handleUpdateUnit = (index: number, field: string, value: any) => {
    const updated = [...additionalUnits];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalUnits(updated);
  };

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

  // Category Selector Component for Product Form
  const CategorySelector = ({
    categories,
    selectedId,
    onSelect
  }: {
    categories: Category[];
    selectedId: string;
    onSelect: (id: string) => void
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempExpandedCategories, setTempExpandedCategories] = useState<Set<string>>(new Set(['cat-1', 'cat-2']));

    const toggleTempCategory = (categoryId: string) => {
      setTempExpandedCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(categoryId)) {
          newSet.delete(categoryId);
        } else {
          newSet.add(categoryId);
        }
        return newSet;
      });
    };

    const renderCategoryOption = (category: Category, level: number = 0): any => {
      const isExpanded = tempExpandedCategories.has(category.id);
      const hasChildren = category.children.length > 0;

      return (
        <div key={category.id}>
          <div
            className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-100 cursor-pointer rounded ${selectedId === category.id ? 'bg-blue-50 border border-blue-300' : ''
              }`}
            style={{ paddingRight: `${level * 1.5 + 0.75}rem` }}
            onClick={() => {
              onSelect(category.id);
              setIsOpen(false);
            }}
          >
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTempCategory(category.id);
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-5" />
            )}
            {hasChildren ? (
              <FolderOpen className="w-4 h-4 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm">{category.name}</span>
          </div>
          {isExpanded && hasChildren && (
            <div>
              {category.children.map(child => renderCategoryOption(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    const selectedCategory = selectedId ? findCategoryById(categories, selectedId) : null;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={selectedCategory ? '' : 'text-gray-500'}>
            {selectedCategory ? selectedCategory.name : 'اختر التصنيف'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border bg-white shadow-lg">
              {categories.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  لا توجد تصنيفات متاحة
                </div>
              ) : (
                <div className="p-2">
                  {categories.map(cat => renderCategoryOption(cat))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Recursive CategoryTree Component
  const CategoryTreeItem = ({ category, level = 0 }: { category: Category; level?: number }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0;
    const productCount = products.filter(p => p.categoryId === category.id).length;
    const isSelected = selectedCategoryId === category.id;

    return (
      <div className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-200' : ''
            }`}
          style={{ paddingRight: `${level * 1.5 + 0.75}rem` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <div
            className="flex-1 flex items-center justify-between gap-2"
            onClick={() => setSelectedCategoryId(category.id)}
          >
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">{category.name}</span>
            </div>

            <div className="flex items-center gap-1">
              {productCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {productCount}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddCategory(category.id);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                title="إضافة تصنيف فرعي"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCategory(category);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                title="تعديل"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(category.id);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-600"
                title="حذف"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-1">
            {category.children.map((child) => (
              <CategoryTreeItem key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="text-right">
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        <p className="text-gray-600 mt-1">إدارة منتجاتك وأسعارها ووحدات القياس</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-3xl font-bold">{totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">منتج مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-3xl font-bold text-red-600">{lowStockProducts}</div>
            <p className="text-xs text-gray-500 mt-1">منتج يحتاج طلب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStockValue)}</div>
            <p className="text-xs text-gray-500 mt-1">إجمالي التكلفة</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Categories and Products */}
      <Tabs defaultValue="products" className="w-full" dir="rtl">
        <TabsList className="w-full justify-end">
          <TabsTrigger value="products" className="flex-1">
            <Package className="w-4 h-4 ml-2" />
            قائمة المنتجات
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex-1">
            <FolderTree className="w-4 h-4 ml-2" />
            إدارة التصنيفات
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4" dir="rtl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <CardTitle className="flex items-center gap-2">
                    <FolderTree className="w-5 h-5" />
                    إدارة التصنيفات
                  </CardTitle>
                  <CardDescription>تنظيم المنتجات في تصنيفات وتصنيفات فرعية</CardDescription>
                </div>
                <Button onClick={() => handleAddCategory(null)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة تصنيف رئيسي
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>لا توجد تصنيفات. ابدأ بإضافة تصنيف رئيسي</p>
                  </div>
                ) : (
                  <div className="space-y-1 group">
                    {categories.map((category) => (
                      <CategoryTreeItem key={category.id} category={category} />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">

                <div className="text-right">
                  <CardTitle>قائمة المنتجات</CardTitle>
                  <CardDescription>جميع المنتجات المسجلة في النظام</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddProduct} className="gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة منتج جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
                    <DialogHeader className="text-right border-b pb-4">
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        قم بملء البيانات في كل قسم بشكل منظم
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeFormTab} onValueChange={setActiveFormTab} className="flex-1 flex flex-col overflow-hidden" dir="rtl">
                      <TabsList className="w-full justify-start bg-gray-100 p-1 rounded-lg mb-4">
                        <TabsTrigger value="basic" className="flex-1 gap-2">
                          <Package className="w-4 h-4" />
                          المعلومات الأساسية
                        </TabsTrigger>
                        <TabsTrigger value="pricing" className="flex-1 gap-2">
                          <DollarSign className="w-4 h-4" />
                          التسعير والضرائب
                        </TabsTrigger>
                        <TabsTrigger value="units" className="flex-1 gap-2">
                          <Package className="w-4 h-4" />
                          وحدات القياس
                        </TabsTrigger>
                        <TabsTrigger value="policies" className="flex-1 gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          السياسات
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex-1 overflow-y-auto px-1">
                        {/* Tab 1: Basic Information */}
                        <TabsContent value="basic" className="space-y-6 mt-0">
                          <div className="bg-white p-6 rounded-lg border-2 border-blue-100">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-lg">اسم المنتج *</Label>
                                <Input
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  placeholder="مثال: لابتوب ديل"
                                  className="text-right h-11"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-lg">رمز المنتج (SKU) *</Label>
                                <Input
                                  value={formData.sku}
                                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                  placeholder="PROD-001"
                                  dir="ltr"
                                  className="font-mono h-11"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-lg">التصنيف *</Label>
                                <CategorySelector
                                  categories={categories}
                                  selectedId={formData.categoryId}
                                  onSelect={(id) => setFormData({ ...formData, categoryId: id })}
                                />
                                {formData.categoryId && (
                                  <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200 mt-2">
                                    📂 {getCategoryPath(formData.categoryId)}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label className="text-lg">الحالة</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                  <SelectTrigger className="h-11">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="نشط">نشط</SelectItem>
                                    <SelectItem value="معطل">معطل</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
                            <h3 className="text-xl font-bold text-right mb-4 text-blue-800">الوحدة الأساسية</h3>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-base">وحدة القياس *</Label>
                                <Select value={formData.baseUnit} onValueChange={(value) => setFormData({ ...formData, baseUnit: value })}>
                                  <SelectTrigger className="h-11">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="حبة">حبة</SelectItem>
                                    <SelectItem value="كيلو">كيلو</SelectItem>
                                    <SelectItem value="لتر">لتر</SelectItem>
                                    <SelectItem value="متر">متر</SelectItem>
                                    <SelectItem value="علبة">علبة</SelectItem>
                                    <SelectItem value="كيس">كيس</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-base">الكمية الحالية *</Label>
                                <Input
                                  type="number"
                                  value={formData.stock}
                                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                  placeholder="0"
                                  className="h-11"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-base">الحد الأدنى *</Label>
                                <Input
                                  type="number"
                                  value={formData.minStock}
                                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                                  placeholder="5"
                                  className="h-11"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-base">الباركود *</Label>
                                <Input
                                  value={formData.barcode}
                                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                  placeholder="123456789"
                                  dir="ltr"
                                  className="font-mono h-11"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-base">سعر التكلفة *</Label>
                                <Input
                                  type="number"
                                  value={formData.costPrice}
                                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                                  placeholder="0.00"
                                  step="0.01"
                                  className="h-11"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-base">سعر البيع *</Label>
                                <Input
                                  type="number"
                                  value={formData.sellPrice}
                                  onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                                  placeholder="0.00"
                                  step="0.01"
                                  className="h-11"
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Tab 2: Pricing & Tax */}
                        <TabsContent value="pricing" className="space-y-6 mt-0">
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200">
                            <h3 className="text-xl font-bold text-right mb-4 text-green-800 flex items-center gap-2">
                              <DollarSign className="w-6 h-6" />
                              إعدادات التسعير المتقدمة
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-base">
                                  الحد الأدنى لسعر البيع *
                                  <span className="text-xs text-gray-600 block mt-1">(لا يمكن للموظف البيع تحته)</span>
                                </Label>
                                <Input
                                  type="number"
                                  value={formData.minSellPrice}
                                  onChange={(e) => setFormData({ ...formData, minSellPrice: Number(e.target.value) })}
                                  placeholder="0.00"
                                  step="0.01"
                                  className="h-11"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-base flex items-center gap-2">
                                  <Percent className="w-4 h-4" />
                                  الخصم المسموح به (%)
                                </Label>
                                <Input
                                  type="number"
                                  value={formData.allowedDiscount}
                                  onChange={(e) => setFormData({ ...formData, allowedDiscount: Number(e.target.value) })}
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                  className="h-11"
                                />
                              </div>
                            </div>

                            {formData.sellPrice > 0 && formData.minSellPrice > 0 && (
                              <div className="text-sm bg-white p-4 rounded-lg border-2 border-green-300 mt-4">
                                <p className="text-gray-700 text-right font-medium">
                                  💰 نطاق السعر: من <strong className="text-green-600">{formatCurrency(formData.minSellPrice)}</strong> إلى <strong className="text-green-600">{formatCurrency(formData.sellPrice)}</strong>
                                </p>
                                {formData.allowedDiscount > 0 && (
                                  <p className="text-gray-700 text-right mt-2 font-medium">
                                    🏷️ بعد الخصم الأقصى ({formData.allowedDiscount}%): <strong className="text-orange-600">{formatCurrency(formData.sellPrice * (1 - formData.allowedDiscount / 100))}</strong>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-200">
                        <h3 className="text-xl font-bold text-right mb-4 text-purple-800 flex items-center gap-2">
                          <Receipt className="w-6 h-6" />
                          إعدادات الضرائب
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-base">القيمة المضافة / الضريبة *</Label>
                            <Select value={formData.taxRateId} onValueChange={(value) => setFormData({ ...formData, taxRateId: value })}>
                              <SelectTrigger className="h-11">
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
                            <Label className="text-base">السعر شامل الضريبة؟</Label>
                            <Select value={formData.taxIncluded ? 'yes' : 'no'} onValueChange={(value) => setFormData({ ...formData, taxIncluded: value === 'yes' })}>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">✅ نعم، شامل</SelectItem>
                                <SelectItem value="no">➕ لا، يضاف على السعر</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {formData.sellPrice > 0 && formData.taxRateId && (
                          <div className="text-sm bg-white p-4 rounded-lg border-2 border-purple-300 mt-4 text-right">
                            {(() => {
                              const tax = taxRates.find(t => t.id === formData.taxRateId);
                              if (!tax) return null;
                              const taxAmount = formData.taxIncluded
                                ? formData.sellPrice * (tax.rate / (100 + tax.rate))
                                : formData.sellPrice * (tax.rate / 100);
                              const finalPrice = formData.taxIncluded
                                ? formData.sellPrice
                                : formData.sellPrice + taxAmount;
                              return (
                                <div className="space-y-2">
                                  <p className="text-gray-700 font-medium">
                                    📊 السعر قبل الضريبة: <strong className="text-blue-600">{formatCurrency(formData.taxIncluded ? formData.sellPrice - taxAmount : formData.sellPrice)}</strong>
                                  </p>
                                  <p className="text-gray-700 font-medium">
                                    💵 قيمة الضريبة ({tax.rate}%): <strong className="text-orange-600">{formatCurrency(taxAmount)}</strong>
                                  </p>
                                  <p className="text-lg font-bold text-gray-800 pt-2 border-t-2 border-purple-200">
                                    💰 السعر النهائي للعميل: <strong className="text-purple-600">{formatCurrency(finalPrice)}</strong>
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Units */}
                  <TabsContent value="units" className="space-y-6 mt-0">
                    <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
                      <h3 className="text-xl font-bold text-right mb-4 text-orange-800 flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        وحدات القياس الإضافية
                      </h3>
                      <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" size="sm" onClick={handleAddUnit} className="gap-2">
                          <Plus className="w-4 h-4" />
                          إضافة وحدة أخرى
                        </Button>
                        <h3 className="text-lg font-semibold text-right">وحدات إضافية (اختياري)</h3>
                      </div>

                      <div className="text-sm text-gray-600 text-right p-3 bg-gray-50 rounded-lg border">
                        💡 <strong>مثال:</strong> إذا كانت الوحدة الأساسية "حبة"، يمكنك إضافة "كرتون (12 حبة)" أو "صندوق (50 حبة)"
                      </div>

                      {additionalUnits.length > 0 && (
                        <div className="space-y-3">
                          {additionalUnits.map((unit, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-white space-y-3">
                              <div className="flex items-center justify-between">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUnit(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <p className="text-sm font-semibold text-gray-700">وحدة {index + 1}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">اسم الوحدة</Label>
                                  <Select
                                    value={unit.name}
                                    onValueChange={(value) => handleUpdateUnit(index, 'name', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="كرتون">كرتون</SelectItem>
                                      <SelectItem value="صندوق">صندوق</SelectItem>
                                      <SelectItem value="علبة">علبة</SelectItem>
                                      <SelectItem value="دستة">دستة</SelectItem>
                                      <SelectItem value="حزمة">حزمة</SelectItem>
                                      <SelectItem value="باكيت">باكيت</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs">كم {formData.baseUnit}؟</Label>
                                  <Input
                                    type="number"
                                    value={unit.quantity}
                                    onChange={(e) => handleUpdateUnit(index, 'quantity', Number(e.target.value))}
                                    placeholder="مثال: 12"
                                    min="1"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs">الباركود</Label>
                                  <Input
                                    value={unit.barcode}
                                    onChange={(e) => handleUpdateUnit(index, 'barcode', e.target.value)}
                                    placeholder="اختياري"
                                    dir="ltr"
                                    className="font-mono"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs">سعر التكلفة</Label>
                                  <Input
                                    type="number"
                                    value={unit.costPrice}
                                    onChange={(e) => handleUpdateUnit(index, 'costPrice', Number(e.target.value))}
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </div>

                                <div className="space-y-1 col-span-2">
                                  <Label className="text-xs">سعر البيع</Label>
                                  <Input
                                    type="number"
                                    value={unit.sellPrice}
                                    onChange={(e) => handleUpdateUnit(index, 'sellPrice', Number(e.target.value))}
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </div>
                              </div>

                              {unit.quantity > 0 && (
                                <p className="text-xs text-gray-600 text-right bg-gray-50 p-2 rounded">
                                  📦 1 {unit.name} = {unit.quantity} {formData.baseUnit}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab 4: Policies */}
                  <TabsContent value="policies" className="space-y-6 mt-0">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg border-2 border-amber-200">
                      <h3 className="text-xl font-bold text-right mb-4 text-amber-800 flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6" />
                        سياسات البيع والإرجاع
                      </h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-base flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            فترة الإرجاع (أيام)
                          </Label>
                          <Input
                            type="number"
                            value={formData.returnPeriodDays}
                            onChange={(e) => setFormData({ ...formData, returnPeriodDays: Number(e.target.value) })}
                            placeholder="0"
                            min="0"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base">الحد الأدنى للكمية *</Label>
                          <Input
                            type="number"
                            value={formData.minQuantity}
                            onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                            placeholder="1"
                            min="1"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base">الحد الأعلى للكمية</Label>
                          <Input
                            type="number"
                            value={formData.maxQuantity || ''}
                            onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="غير محدد"
                            min="1"
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label className="text-base">السماح بإرجاع المنتج؟</Label>
                        <Select value={formData.allowReturn ? 'yes' : 'no'} onValueChange={(value) => setFormData({ ...formData, allowReturn: value === 'yes' })}>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">✅ نعم، يمكن إرجاعه</SelectItem>
                            <SelectItem value="no">❌ لا، غير قابل للإرجاع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-sm bg-white p-4 rounded-lg border-2 border-amber-300 space-y-2 text-right mt-4">
                        {formData.allowReturn && formData.returnPeriodDays > 0 ? (
                          <p className="text-green-600 flex items-center justify-end gap-2 font-medium text-base">
                            <CheckCircle2 className="w-5 h-5" />
                            يمكن إرجاع المنتج خلال {formData.returnPeriodDays} يوم من تاريخ الشراء
                          </p>
                        ) : (
                          <p className="text-red-600 flex items-center justify-end gap-2 font-medium text-base">
                            <AlertCircle className="w-5 h-5" />
                            هذا المنتج غير قابل للإرجاع
                          </p>
                        )}
                        <p className="text-gray-700 font-medium">
                          📦 الحد الأدنى للبيع: {formData.minQuantity} وحدة
                        </p>
                        {formData.maxQuantity && (
                          <p className="text-orange-600 font-medium">
                            ⚠️ الحد الأقصى: {formData.maxQuantity} وحدة للعميل الواحد
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
              </div>
            </Tabs>

            {/* Dialog Actions */}
            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1 h-11">
                إلغاء
              </Button>
              <Button onClick={handleSaveProduct} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700">
                {editingProduct ? '💾 حفظ التعديلات' : '➕ إضافة المنتج'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

    </div>
        </CardHeader>

    <CardContent className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="ابحث بالاسم، SKU، أو الباركود..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          dir="rtl"
        />
      </div>

      {/* Products Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-right w-12"></TableHead>
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">SKU</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">المخزون</TableHead>
              <TableHead className="text-right">سعر البيع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right w-24">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.minStock;
              const isExpanded = expandedRow === product.id;

              return (
                <>
                  <TableRow key={product.id} className={isLowStock ? 'bg-red-50/30' : ''}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRow(isExpanded ? null : product.id)}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <div className="flex items-center gap-2 justify-end">
                          <p className="font-medium">{product.name}</p>
                          {product.maxQuantity && (
                            <Badge variant="secondary" className="text-xs" title={`حد أقصى: ${product.maxQuantity} وحدات`}>
                              عرض
                            </Badge>
                          )}
                          {product.allowReturn && product.returnPeriodDays > 0 && (
                            <span title={`قابل للإرجاع خلال ${product.returnPeriodDays} أيام`}>
                              <RotateCcw className="w-3 h-3 text-green-600" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{product.baseUnit}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-xs w-fit">
                          {findCategoryById(categories, product.categoryId)?.name || 'غير محدد'}
                        </Badge>
                        {product.categoryPath && (
                          <span className="text-xs text-gray-500">{product.categoryPath}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`font-bold ${isLowStock ? 'text-red-600' : ''}`}>
                          {product.stock}
                        </span>
                        {isLowStock && (
                          <Badge variant="destructive" className="text-xs">منخفض</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(product.sellPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.status === 'نشط' ? 'default' : 'secondary'} className="text-xs">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="حذف"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row - Unit Details */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-gray-50 p-6">
                        <div className="space-y-6">
                          {/* Pricing & Sales Policies */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Pricing Info */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-semibold text-right mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                معلومات التسعير
                              </h5>
                              <div className="space-y-2 text-sm text-right">
                                <div className="flex justify-between">
                                  <span className="text-green-600 font-bold">{formatCurrency(product.sellPrice)}</span>
                                  <span className="text-gray-600">السعر الافتراضي:</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">{formatCurrency(product.minSellPrice)}</span>
                                  <span className="text-gray-600">الحد الأدنى:</span>
                                </div>
                                {product.allowedDiscount > 0 && (
                                  <div className="flex justify-between pt-2 border-t">
                                    <span className="text-blue-600 font-medium">{product.allowedDiscount}%</span>
                                    <span className="text-gray-600">الخصم المسموح:</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Tax Info */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-semibold text-right mb-3 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-purple-600" />
                                معلومات الضريبة
                              </h5>
                              <div className="space-y-2 text-sm text-right">
                                {product.taxRateId && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="font-medium">
                                        {taxRates.find(t => t.id === product.taxRateId)?.name || 'غير محدد'}
                                      </span>
                                      <span className="text-gray-600">النوع:</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <Badge variant={product.taxIncluded ? 'default' : 'outline'} className="text-xs">
                                        {product.taxIncluded ? 'شامل' : 'يضاف'}
                                      </Badge>
                                      <span className="text-gray-600">الضريبة:</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Return & Quantity Policies */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-semibold text-right mb-3 flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-amber-600" />
                                سياسات البيع
                              </h5>
                              <div className="space-y-2 text-sm text-right">
                                {product.allowReturn ? (
                                  <div className="flex items-center justify-between text-green-600">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>{product.returnPeriodDays} أيام</span>
                                    </div>
                                    <span>الإرجاع:</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between text-red-600">
                                    <div className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      <span>غير مسموح</span>
                                    </div>
                                    <span>الإرجاع:</span>
                                  </div>
                                )}
                                <div className="flex justify-between pt-2 border-t">
                                  <span className="font-medium">{product.minQuantity} وحدة</span>
                                  <span className="text-gray-600">الحد الأدنى:</span>
                                </div>
                                {product.maxQuantity && (
                                  <div className="flex justify-between items-center">
                                    <Badge variant="destructive" className="text-xs">
                                      {product.maxQuantity} وحدة
                                    </Badge>
                                    <span className="text-gray-600">الحد الأعلى:</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Units Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                الباركود الأساسي: <code className="bg-white px-2 py-1 rounded font-mono text-xs">{product.baseBarcode}</code>
                              </div>
                              <h4 className="font-semibold text-lg">وحدات القياس</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {product.units.map((unit) => (
                                <div
                                  key={unit.id}
                                  className={`p-4 rounded-lg border-2 ${unit.isBase ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                                    }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex gap-2">
                                      {unit.isBase && (
                                        <Badge variant="default" className="text-xs">أساسية</Badge>
                                      )}
                                    </div>
                                    <p className="font-bold text-lg">{unit.unitName}</p>
                                  </div>

                                  <div className="space-y-2 text-sm text-right">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">المعادلة:</span>
                                      <span className="font-medium">
                                        1 {unit.unitName} = {unit.conversionFactor} {product.baseUnit}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">الباركود:</span>
                                      <code className="bg-white px-2 py-0.5 rounded text-xs font-mono">
                                        {unit.barcode}
                                      </code>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                      <span className="text-green-600 font-bold">
                                        {formatCurrency(unit.sellPrice)}
                                      </span>
                                      <span className="text-gray-600">سعر البيع:</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-blue-600 font-medium">
                                        {formatCurrency(unit.purchasePrice)}
                                      </span>
                                      <span className="text-gray-600">سعر الشراء:</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>لا توجد منتجات</p>
          </div>
        )}
      </div>
    </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

    {/* Category Dialog */}
    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>
            {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </DialogTitle>
          <DialogDescription>
            {categoryFormData.parentId
              ? `إضافة تصنيف فرعي تحت: ${findCategoryById(categories, categoryFormData.parentId)?.name}`
              : 'إضافة تصنيف رئيسي جديد'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>اسم التصنيف *</Label>
            <Input
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              placeholder="مثال: إلكترونيات"
              className="text-right"
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={() => setIsCategoryDialogOpen(false)} variant="outline" className="flex-1">
            إلغاء
          </Button>
          <Button onClick={handleSaveCategory} className="flex-1">
            {editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
