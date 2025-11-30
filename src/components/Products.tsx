import { useState, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { CreateEditProduct } from './CreateEditProduct';
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Search, Edit, Trash2, Package, TrendingDown, DollarSign, ChevronDown, ChevronUp, X, Folder, FolderOpen, ChevronLeft, FolderTree, ShoppingCart, Info, Printer, Barcode as BarcodeIcon, Download } from 'lucide-react';
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

interface PricingTier {
  minQuantity: number; // Minimum quantity for this tier (e.g., 1, 6, 24)
  price: number; // Price per unit for this tier
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
  sellPrice: number; // Default/base price
  minSellPrice: number;
  allowedDiscount: number;
  taxRateId?: string;
  taxIncluded: boolean;
  returnPeriodDays: number;
  allowReturn: boolean;
  minQuantity: number; // Minimum quantity per client
  maxQuantity?: number; // Maximum quantity per client
  pricingTiers?: PricingTier[]; // Quantity-based pricing tiers
  // Secondary Information
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  countryOfOrigin?: string;
  manufacturer?: string;
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
      length: 30.4,
      width: 19.9,
      height: 1.6,
      weight: 1.2,
      countryOfOrigin: 'الصين',
      manufacturer: 'Dell',
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
      length: 14.7,
      width: 7.1,
      height: 0.8,
      weight: 0.187,
      countryOfOrigin: 'الولايات المتحدة',
      manufacturer: 'Apple Inc.',
      status: 'نشط'
    },
    {
      id: '3',
      name: 'عصير برتقال طبيعي',
      sku: 'JUICE-ORG-001',
      categoryId: 'cat-2-1-1',
      categoryPath: 'أطعمة ومشروبات > مشروبات > عصائر',
      baseUnit: 'زجاجة',
      baseBarcode: '3456789012345',
      units: [
        { id: '1', unitName: 'زجاجة', conversionFactor: 1, barcode: '3456789012345', sellPrice: 8, purchasePrice: 5, isBase: true },
        { id: '2', unitName: 'كرتون (24 زجاجة)', conversionFactor: 24, barcode: '3456789012346', sellPrice: 180, purchasePrice: 110, isBase: false }
      ],
      stock: 150,
      minStock: 50,
      costPrice: 5,
      sellPrice: 8,
      minSellPrice: 6,
      allowedDiscount: 15,
      taxRateId: 'tax-1',
      taxIncluded: true,
      returnPeriodDays: 3,
      allowReturn: true,
      minQuantity: 1,
      maxQuantity: 50,
      countryOfOrigin: 'السعودية',
      manufacturer: 'شركة العصائر الطبيعية',
      status: 'نشط'
    },
    {
      id: '4',
      name: 'كمبيوتر مكتبي Dell OptiPlex',
      sku: 'DELL-OPT-001',
      categoryId: 'cat-1-1-2',
      categoryPath: 'إلكترونيات > أجهزة كمبيوتر > كمبيوتر مكتبي',
      baseUnit: 'حبة',
      baseBarcode: '4567890123456',
      units: [
        { id: '1', unitName: 'حبة', conversionFactor: 1, barcode: '4567890123456', sellPrice: 3200, purchasePrice: 2800, isBase: true }
      ],
      stock: 12,
      minStock: 5,
      costPrice: 2800,
      sellPrice: 3200,
      minSellPrice: 3000,
      allowedDiscount: 8,
      taxRateId: 'tax-1',
      taxIncluded: false,
      returnPeriodDays: 14,
      allowReturn: true,
      minQuantity: 1,
      countryOfOrigin: 'الصين',
      manufacturer: 'Dell',
      status: 'نشط'
    },
    {
      id: '5',
      name: 'مشروب غازي كوكاكولا',
      sku: 'COLA-001',
      categoryId: 'cat-2-1-2',
      categoryPath: 'أطعمة ومشروبات > مشروبات > مشروبات غازية',
      baseUnit: 'علبة',
      baseBarcode: '5678901234567',
      units: [
        { id: '1', unitName: 'علبة', conversionFactor: 1, barcode: '5678901234567', sellPrice: 2.5, purchasePrice: 1.5, isBase: true },
        { id: '2', unitName: 'كرتون (30 علبة)', conversionFactor: 30, barcode: '5678901234568', sellPrice: 70, purchasePrice: 40, isBase: false }
      ],
      stock: 500,
      minStock: 100,
      costPrice: 1.5,
      sellPrice: 2.5,
      minSellPrice: 2,
      allowedDiscount: 10,
      taxRateId: 'tax-1',
      taxIncluded: true,
      returnPeriodDays: 0,
      allowReturn: false,
      minQuantity: 1,
      countryOfOrigin: 'السعودية',
      manufacturer: 'شركة كوكاكولا',
      status: 'نشط'
    },
    {
      id: '6',
      name: 'تونة معلبة',
      sku: 'TUNA-CAN-001',
      categoryId: 'cat-2-2',
      categoryPath: 'أطعمة ومشروبات > أطعمة معلبة',
      baseUnit: 'علبة',
      baseBarcode: '6789012345678',
      units: [
        { id: '1', unitName: 'علبة', conversionFactor: 1, barcode: '6789012345678', sellPrice: 12, purchasePrice: 8, isBase: true },
        { id: '2', unitName: 'كرتون (48 علبة)', conversionFactor: 48, barcode: '6789012345679', sellPrice: 550, purchasePrice: 360, isBase: false }
      ],
      stock: 200,
      minStock: 30,
      costPrice: 8,
      sellPrice: 12,
      minSellPrice: 10,
      allowedDiscount: 5,
      taxRateId: 'tax-1',
      taxIncluded: true,
      returnPeriodDays: 7,
      allowReturn: true,
      minQuantity: 1,
      countryOfOrigin: 'تايلاند',
      manufacturer: 'شركة الأسماك المعلبة',
      status: 'نشط'
    },
    {
      id: '7',
      name: 'هاتف سامسونج جالكسي S24',
      sku: 'SAMS-S24-001',
      categoryId: 'cat-1-2-2',
      categoryPath: 'إلكترونيات > هواتف ذكية > أندرويد',
      baseUnit: 'حبة',
      baseBarcode: '7890123456789',
      units: [
        { id: '1', unitName: 'حبة', conversionFactor: 1, barcode: '7890123456789', sellPrice: 3800, purchasePrice: 3400, isBase: true }
      ],
      stock: 8,
      minStock: 5,
      costPrice: 3400,
      sellPrice: 3800,
      minSellPrice: 3600,
      allowedDiscount: 3,
      taxRateId: 'tax-1',
      taxIncluded: true,
      returnPeriodDays: 14,
      allowReturn: true,
      minQuantity: 1,
      maxQuantity: 3,
      countryOfOrigin: 'كوريا الجنوبية',
      manufacturer: 'Samsung',
      status: 'نشط'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Barcode Generation & Printing State
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);
  const [barcodeConfig, setBarcodeConfig] = useState({
    type: 'CODE128', // EAN13, CODE128, CODE39, QR
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 14,
    fontFamily: 'Arial',
    textAlign: 'center' as 'left' | 'center' | 'right',
    textMargin: 2,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 10,
    showProductName: true,
    showPrice: true,
    showSKU: false,
    copies: 1,
    paperSize: 'A4' as 'A4' | 'label-small' | 'label-medium' | 'label-large',
    layout: 'grid' as 'grid' | 'list',
    labelsPerRow: 3
  });

  // Category Management State
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', parentId: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cat-1', 'cat-2']));

  // Product Form Tab State
  const [activeProductTab, setActiveProductTab] = useState('basic');

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
    pricingTiers: [] as PricingTier[],
    length: undefined as number | undefined,
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    weight: undefined as number | undefined,
    countryOfOrigin: '',
    manufacturer: '',
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

  // Helper function to get all child category IDs (recursive)
  const getAllCategoryIds = (category: Category): string[] => {
    let ids = [category.id];
    category.children.forEach(child => {
      ids = [...ids, ...getAllCategoryIds(child)];
    });
    return ids;
  };

  // Helper function to check if product belongs to category or its subcategories
  const productBelongsToCategory = (product: Product, categoryId: string): boolean => {
    if (categoryId === 'all') return true;

    const category = findCategoryById(categories, categoryId);
    if (!category) return false;

    const allCategoryIds = getAllCategoryIds(category);
    return allCategoryIds.includes(product.categoryId);
  };

  const filteredProducts = products.filter(product => {
    // Filter by search term
    const matchesSearch = product.name.includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.baseBarcode.includes(searchTerm);

    // Filter by category
    const matchesCategory = productBelongsToCategory(product, selectedFilterCategory);

    return matchesSearch && matchesCategory;
  });

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
      pricingTiers: [],
      length: undefined,
      width: undefined,
      height: undefined,
      weight: undefined,
      countryOfOrigin: '',
      manufacturer: '',
      status: 'نشط'
    });
    setAdditionalUnits([]);
    setEditingProduct(null);
    setActiveProductTab('basic');
  };

  const handleAddProduct = () => {
    resetForm();
    setShowCreateProduct(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowCreateProduct(true);
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
      pricingTiers: product.pricingTiers || [],
      length: product.length,
      width: product.width,
      height: product.height,
      weight: product.weight,
      countryOfOrigin: product.countryOfOrigin || '',
      manufacturer: product.manufacturer || '',
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

    // Sort pricing tiers by minQuantity
    const sortedTiers = formData.pricingTiers
      ? [...formData.pricingTiers].sort((a, b) => a.minQuantity - b.minQuantity)
      : [];

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
      pricingTiers: sortedTiers.length > 0 ? sortedTiers : undefined,
      length: formData.length,
      width: formData.width,
      height: formData.height,
      weight: formData.weight,
      countryOfOrigin: formData.countryOfOrigin,
      manufacturer: formData.manufacturer,
      status: formData.status
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
      toast.success('تم تحديث المنتج بنجاح');
    } else {
      setProducts([...products, productData]);
      toast.success('تم إضافة المنتج بنجاح');
    }

    setShowCreateProduct(false);
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

  // Barcode Generation & Printing Handlers
  const handleOpenBarcodeGenerator = (product: Product) => {
    setSelectedProductForBarcode(product);
    setIsBarcodeDialogOpen(true);
  };

  const handleGenerateBarcode = (product: Product) => {
    if (!product.baseBarcode) {
      // Generate a random barcode if none exists
      const newBarcode = '2' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
      const updatedProduct = { ...product, baseBarcode: newBarcode };
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
      toast.success(`تم إنشاء باركود جديد: ${newBarcode}`);
      handleOpenBarcodeGenerator(updatedProduct);
    } else {
      handleOpenBarcodeGenerator(product);
    }
  };

  const handlePrintBarcode = () => {
    if (!selectedProductForBarcode) return;

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('فشل فتح نافذة الطباعة');
      return;
    }

    const {
      paperSize,
      layout,
      labelsPerRow,
      copies,
      background,
      margin,
      showProductName,
      showPrice,
      showSKU
    } = barcodeConfig;

    // Calculate label dimensions based on paper size
    let labelWidth = '200px';
    let labelHeight = '100px';
    if (paperSize === 'label-small') {
      labelWidth = '150px';
      labelHeight = '80px';
    } else if (paperSize === 'label-medium') {
      labelWidth = '200px';
      labelHeight = '120px';
    } else if (paperSize === 'label-large') {
      labelWidth = '250px';
      labelHeight = '150px';
    }

    // Generate barcode labels HTML
    const labels = Array(copies).fill(0).map((_, idx) => `
      <div class="barcode-label" style="
        width: ${paperSize === 'A4' ? 'calc(100% / ' + labelsPerRow + ' - 20px)' : labelWidth};
        height: ${labelHeight};
        background: ${background};
        margin: ${margin}px;
        padding: 15px;
        border: 1px dashed #ccc;
        display: ${layout === 'grid' ? 'inline-block' : 'block'};
        page-break-inside: avoid;
        text-align: center;
        box-sizing: border-box;
      ">
        ${showProductName ? `<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${selectedProductForBarcode.name}</div>` : ''}
        ${showSKU ? `<div style="font-size: 11px; color: #666; margin-bottom: 5px;">SKU: ${selectedProductForBarcode.sku}</div>` : ''}
        <div style="margin: 10px 0;">
          <svg id="barcode-${idx}"></svg>
        </div>
        ${showPrice ? `<div style="font-size: 16px; font-weight: bold; color: #2563eb; margin-top: 8px;">${formatCurrency(selectedProductForBarcode.sellPrice)}</div>` : ''}
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة باركود - ${selectedProductForBarcode.name}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode/dist/JsBarcode.all.min.js"></script>
        <style>
          @page {
            size: ${paperSize === 'A4' ? 'A4' : 'auto'};
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .barcode-container {
            display: ${layout === 'grid' ? 'flex' : 'block'};
            flex-wrap: wrap;
            justify-content: ${layout === 'grid' ? 'flex-start' : 'center'};
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            padding: 10px;
            background: white;
            border-radius: 8px;
          }
          .print-button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 30px;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
            margin: 10px;
          }
          .print-button:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="print-header no-print">
          <h2>معاينة الباركود قبل الطباعة</h2>
          <button class="print-button" onclick="window.print()">🖨️ طباعة</button>
          <button class="print-button" onclick="window.close()" style="background: #6b7280;">إغلاق</button>
        </div>
        <div class="barcode-container">
          ${labels}
        </div>
        <script>
          window.onload = function() {
            for (let i = 0; i < ${copies}; i++) {
              JsBarcode("#barcode-" + i, "${selectedProductForBarcode.baseBarcode}", {
                format: "${barcodeConfig.type}",
                width: ${barcodeConfig.width},
                height: ${barcodeConfig.height},
                displayValue: ${barcodeConfig.displayValue},
                fontSize: ${barcodeConfig.fontSize},
                font: "${barcodeConfig.fontFamily}",
                textAlign: "${barcodeConfig.textAlign}",
                textMargin: ${barcodeConfig.textMargin},
                background: "${barcodeConfig.background}",
                lineColor: "${barcodeConfig.lineColor}",
                margin: 5
              });
            }
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
    toast.success('تم فتح نافذة الطباعة');
  };

  const handleDownloadBarcode = () => {
    if (!selectedProductForBarcode) return;
    toast.info('ميزة التحميل قيد التطوير');
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

  // Category Filter Options Component (for Select dropdown)
  const CategoryFilterOptions = ({ category, level = 0 }: { category: Category; level?: number }) => {
    const productCount = products.filter(p => productBelongsToCategory(p, category.id)).length;
    const indent = '　'.repeat(level); // Using full-width space for indentation

    return (
      <>
        <SelectItem value={category.id}>
          <div className="flex items-center gap-2 justify-end w-full">
            <span className="text-xs text-gray-500">({productCount})</span>
            <span>{indent}{category.name}</span>
            {category.children.length > 0 ? (
              <FolderOpen className="w-3 h-3 text-blue-500" />
            ) : (
              <Folder className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </SelectItem>
        {category.children.map(child => (
          <CategoryFilterOptions key={child.id} category={child} level={level + 1} />
        ))}
      </>
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

  // Show create/edit product page
  if (showCreateProduct) {
    return (
      <CreateEditProduct
        editingProduct={editingProduct}
        categories={categories}
        taxRates={taxRates}
        products={products}
        setProducts={setProducts}
        onBack={() => {
          setShowCreateProduct(false);
          setEditingProduct(null);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        additionalUnits={additionalUnits}
        setAdditionalUnits={setAdditionalUnits}
        activeProductTab={activeProductTab}
        setActiveProductTab={setActiveProductTab}
        findCategoryById={findCategoryById}
        getCategoryPath={getCategoryPath}
        formatCurrency={formatCurrency}
        handleSaveProduct={handleSaveProduct}
        handleAddUnit={handleAddUnit}
        handleRemoveUnit={handleRemoveUnit}
        handleUpdateUnit={handleUpdateUnit}
      />
    );
  }

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
                    <Button onClick={handleAddProduct} className="gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة منتج جديد
                    </Button>

              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                {/* Category Filter */}
                <div className="relative" dir="rtl">
                  <Select value={selectedFilterCategory} onValueChange={setSelectedFilterCategory}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="تصفية حسب التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2 justify-end w-full">
                          <span>جميع التصنيفات</span>
                        </div>
                      </SelectItem>
                      {categories.map(category => (
                        <CategoryFilterOptions key={category.id} category={category} level={0} />
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Summary and Results Count */}
              <div className="flex items-center justify-between" dir="rtl">
                {selectedFilterCategory !== 'all' ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">التصفية النشطة:</span>
                    <Badge variant="secondary" className="text-xs">
                      <FolderOpen className="w-3 h-3 ml-1" />
                      {findCategoryById(categories, selectedFilterCategory)?.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFilterCategory('all')}
                      className="h-7 px-2"
                    >
                      <X className="w-3 h-3 ml-1" />
                      إزالة التصفية
                    </Button>
                  </div>
                ) : (
                  <div></div>
                )}

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  عرض <span className="font-bold text-blue-600">{filteredProducts.length}</span> من {products.length} منتج
                </div>
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
                        <Fragment key={product.id}>
                          <TableRow className={isLowStock ? 'bg-red-50/30' : ''}>
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
                                <div className="flex items-center gap-2 justify-start">
                                  <p className="font-medium">{product.name}</p>
                                  {product.maxQuantity && (
                                    <Badge variant="outline" className="text-xs">
                                      حد أقصى: {product.maxQuantity}
                                    </Badge>
                                  )}
                                  {product.allowReturn && product.returnPeriodDays > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      قابل للإرجاع
                                    </Badge>
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
                              <div className="flex items-center gap-2 justify-start">
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
                                  onClick={() => handleGenerateBarcode(product)}
                                  title="طباعة باركود"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
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
                                      <h5 className="font-semibold text-right mb-3 text-gray-700">معلومات التسعير</h5>
                                      <div className="space-y-2 text-sm text-right">
                                        <div className="flex justify-between">
                                          <span className="font-bold">{formatCurrency(product.sellPrice)}</span>
                                          <span className="text-gray-600">السعر الافتراضي:</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="font-medium">{formatCurrency(product.minSellPrice)}</span>
                                          <span className="text-gray-600">الحد الأدنى:</span>
                                        </div>
                                        {product.allowedDiscount > 0 && (
                                          <div className="flex justify-between pt-2 border-t">
                                            <span className="font-medium">{product.allowedDiscount}%</span>
                                            <span className="text-gray-600">الخصم المسموح:</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Tax Info */}
                                    <div className="bg-white p-4 rounded-lg border">
                                      <h5 className="font-semibold text-right mb-3 text-gray-700">معلومات الضريبة</h5>
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
                                              <Badge variant="outline" className="text-xs">
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
                                      <h5 className="font-semibold text-right mb-3 text-gray-700">سياسات البيع</h5>
                                      <div className="space-y-2 text-sm text-right">
                                        {product.allowReturn ? (
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium">{product.returnPeriodDays} أيام</span>
                                            <span className="text-gray-600">الإرجاع:</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-500">غير مسموح</span>
                                            <span className="text-gray-600">الإرجاع:</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t">
                                          <span className="font-medium">{product.minQuantity} وحدة</span>
                                          <span className="text-gray-600">الحد الأدنى:</span>
                                        </div>
                                        {product.maxQuantity && (
                                          <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="text-xs">
                                              {product.maxQuantity} وحدة
                                            </Badge>
                                            <span className="text-gray-600">الحد الأعلى:</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Secondary Information Section */}
                                  {(product.length || product.width || product.height || product.weight || product.countryOfOrigin || product.manufacturer) && (
                                    <div className="bg-white p-4 rounded-lg border">
                                      <h5 className="font-semibold text-right mb-3 text-gray-700">معلومات إضافية</h5>
                                      <div className="grid grid-cols-2 gap-3 text-sm text-right">
                                        {(product.length || product.width || product.height) && (
                                          <div className="flex justify-between">
                                            <span className="font-medium">
                                              {product.length || 0} × {product.width || 0} × {product.height || 0} سم
                                            </span>
                                            <span className="text-gray-600">الأبعاد:</span>
                                          </div>
                                        )}
                                        {product.weight && (
                                          <div className="flex justify-between">
                                            <span className="font-medium">{product.weight} كجم</span>
                                            <span className="text-gray-600">الوزن:</span>
                                          </div>
                                        )}
                                        {product.countryOfOrigin && (
                                          <div className="flex justify-between">
                                            <span className="font-medium">{product.countryOfOrigin}</span>
                                            <span className="text-gray-600">بلد الصنع:</span>
                                          </div>
                                        )}
                                        {product.manufacturer && (
                                          <div className="flex justify-between">
                                            <span className="font-medium">{product.manufacturer}</span>
                                            <span className="text-gray-600">الشركة المصنعة:</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

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
                        </Fragment>
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

      {/* Barcode Generator & Printer Dialog */}
      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader className="text-right pb-4 border-b">
            <DialogTitle className="text-2xl flex items-center gap-2 justify-end">
              <BarcodeIcon className="w-6 h-6" />
              مولد ومطبعة الباركود
            </DialogTitle>
            <DialogDescription>
              {selectedProductForBarcode && (
                <div className="mt-2 space-y-1">
                  <p className="font-semibold text-base">{selectedProductForBarcode.name}</p>
                  <div className="flex items-center gap-2 justify-end text-sm">
                    <Badge variant="outline">{selectedProductForBarcode.sku}</Badge>
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                      {selectedProductForBarcode.baseBarcode}
                    </code>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1 py-4" dir="rtl">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="config">⚙️ إعدادات الباركود</TabsTrigger>
                <TabsTrigger value="preview">👁️ معاينة</TabsTrigger>
              </TabsList>

              {/* Configuration Tab */}
              <TabsContent value="config" className="space-y-6">
                {/* Barcode Type & Size */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">نوع وحجم الباركود</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>نوع الباركود</Label>
                        <Select
                          value={barcodeConfig.type}
                          onValueChange={(value) => setBarcodeConfig({ ...barcodeConfig, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CODE128">CODE 128 (الأكثر استخداماً)</SelectItem>
                            <SelectItem value="EAN13">EAN-13 (للمنتجات التجارية)</SelectItem>
                            <SelectItem value="CODE39">CODE 39</SelectItem>
                            <SelectItem value="UPC">UPC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>عدد النسخ للطباعة</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={barcodeConfig.copies}
                          onChange={(e) => setBarcodeConfig({ ...barcodeConfig, copies: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>عرض الخط ({barcodeConfig.width})</Label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.5"
                          value={barcodeConfig.width}
                          onChange={(e) => setBarcodeConfig({ ...barcodeConfig, width: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>ارتفاع الباركود ({barcodeConfig.height}px)</Label>
                        <input
                          type="range"
                          min="40"
                          max="200"
                          step="10"
                          value={barcodeConfig.height}
                          onChange={(e) => setBarcodeConfig({ ...barcodeConfig, height: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Text & Display Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">خيارات النص والعرض</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>حجم الخط</Label>
                        <Input
                          type="number"
                          min="8"
                          max="24"
                          value={barcodeConfig.fontSize}
                          onChange={(e) => setBarcodeConfig({ ...barcodeConfig, fontSize: Number(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>نوع الخط</Label>
                        <Select
                          value={barcodeConfig.fontFamily}
                          onValueChange={(value) => setBarcodeConfig({ ...barcodeConfig, fontFamily: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Courier">Courier</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={barcodeConfig.displayValue}
                        onChange={(e) => setBarcodeConfig({ ...barcodeConfig, displayValue: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <Label>عرض رقم الباركود</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Label Content Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">محتوى الملصق</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={barcodeConfig.showProductName}
                        onChange={(e) => setBarcodeConfig({ ...barcodeConfig, showProductName: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <Label>عرض اسم المنتج</Label>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={barcodeConfig.showPrice}
                        onChange={(e) => setBarcodeConfig({ ...barcodeConfig, showPrice: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <Label>عرض السعر</Label>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={barcodeConfig.showSKU}
                        onChange={(e) => setBarcodeConfig({ ...barcodeConfig, showSKU: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <Label>عرض رمز المنتج (SKU)</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Paper & Layout Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">إعدادات الورق والتخطيط</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>حجم الورق</Label>
                        <Select
                          value={barcodeConfig.paperSize}
                          onValueChange={(value: any) => setBarcodeConfig({ ...barcodeConfig, paperSize: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A4">A4 (210 × 297 مم)</SelectItem>
                            <SelectItem value="label-small">ملصق صغير (150 × 80 مم)</SelectItem>
                            <SelectItem value="label-medium">ملصق متوسط (200 × 120 مم)</SelectItem>
                            <SelectItem value="label-large">ملصق كبير (250 × 150 مم)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>نمط التخطيط</Label>
                        <Select
                          value={barcodeConfig.layout}
                          onValueChange={(value: any) => setBarcodeConfig({ ...barcodeConfig, layout: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">شبكي (Grid)</SelectItem>
                            <SelectItem value="list">قائمة (List)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {barcodeConfig.paperSize === 'A4' && barcodeConfig.layout === 'grid' && (
                      <div className="space-y-2">
                        <Label>عدد الملصقات في الصف</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={barcodeConfig.labelsPerRow}
                          onChange={(e) => setBarcodeConfig({ ...barcodeConfig, labelsPerRow: Number(e.target.value) })}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">الألوان</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>لون الخلفية</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={barcodeConfig.background}
                            onChange={(e) => setBarcodeConfig({ ...barcodeConfig, background: e.target.value })}
                            className="w-12 h-10 border rounded cursor-pointer"
                          />
                          <Input
                            value={barcodeConfig.background}
                            onChange={(e) => setBarcodeConfig({ ...barcodeConfig, background: e.target.value })}
                            placeholder="#ffffff"
                            className="font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>لون الخطوط</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={barcodeConfig.lineColor}
                            onChange={(e) => setBarcodeConfig({ ...barcodeConfig, lineColor: e.target.value })}
                            className="w-12 h-10 border rounded cursor-pointer"
                          />
                          <Input
                            value={barcodeConfig.lineColor}
                            onChange={(e) => setBarcodeConfig({ ...barcodeConfig, lineColor: e.target.value })}
                            placeholder="#000000"
                            className="font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">معاينة الباركود</CardTitle>
                    <CardDescription>هذه معاينة تقريبية للباركود</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed">
                      <div
                        className="mx-auto p-4 rounded-lg text-center"
                        style={{
                          background: barcodeConfig.background,
                          maxWidth: '400px'
                        }}
                      >
                        {barcodeConfig.showProductName && selectedProductForBarcode && (
                          <div className="font-bold text-sm mb-2">{selectedProductForBarcode.name}</div>
                        )}
                        {barcodeConfig.showSKU && selectedProductForBarcode && (
                          <div className="text-xs text-gray-600 mb-2">SKU: {selectedProductForBarcode.sku}</div>
                        )}
                        <div className="bg-white p-3 rounded border">
                          <BarcodeIcon
                            className="w-full h-24 mx-auto"
                            style={{ color: barcodeConfig.lineColor }}
                          />
                          {barcodeConfig.displayValue && selectedProductForBarcode && (
                            <div
                              className="mt-2 font-mono"
                              style={{
                                fontSize: `${barcodeConfig.fontSize}px`,
                                fontFamily: barcodeConfig.fontFamily
                              }}
                            >
                              {selectedProductForBarcode.baseBarcode}
                            </div>
                          )}
                        </div>
                        {barcodeConfig.showPrice && selectedProductForBarcode && (
                          <div className="font-bold text-blue-600 mt-2 text-lg">
                            {formatCurrency(selectedProductForBarcode.sellPrice)}
                          </div>
                        )}
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-4">
                        💡 هذه معاينة تقريبية. الباركود الفعلي سيظهر في نافذة الطباعة
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => setIsBarcodeDialogOpen(false)}
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleDownloadBarcode}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              تحميل
            </Button>
            <Button
              onClick={handlePrintBarcode}
              className="flex-1 gap-2"
            >
              <Printer className="w-4 h-4" />
              طباعة الآن
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
