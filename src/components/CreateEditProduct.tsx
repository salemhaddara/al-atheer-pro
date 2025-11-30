import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, X, Package, DollarSign, ShoppingCart, Info, ChevronDown, ChevronLeft, Folder, FolderOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
}

interface TaxRate {
  id: string;
  name: string;
  rate: number;
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
  baseUnit: string;
  baseBarcode: string;
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
  pricingTiers?: PricingTier[]; // Quantity-based pricing tiers
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  countryOfOrigin?: string;
  manufacturer?: string;
  status: string;
}

interface CreateEditProductProps {
  editingProduct: Product | null;
  categories: Category[];
  taxRates: TaxRate[];
  products: Product[];
  setProducts: (products: Product[]) => void;
  onBack: () => void;
  formData: any;
  setFormData: (data: any) => void;
  additionalUnits: Array<{
    name: string;
    quantity: number;
    barcode: string;
    sellPrice: number;
    costPrice: number;
  }>;
  setAdditionalUnits: (units: any) => void;
  activeProductTab: string;
  setActiveProductTab: (tab: string) => void;
  findCategoryById: (categories: Category[], id: string) => Category | null;
  getCategoryPath: (categoryId: string) => string;
  formatCurrency: (amount: number) => string;
  handleSaveProduct: () => void;
  handleAddUnit: () => void;
  handleRemoveUnit: (index: number) => void;
  handleUpdateUnit: (index: number, field: string, value: any) => void;
}

// Category Selector Component
const CategorySelector = ({
  categories,
  selectedId,
  onSelect,
  findCategoryById
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  findCategoryById: (categories: Category[], id: string) => Category | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempExpandedCategories, setTempExpandedCategories] = useState<Set<string>>(new Set());

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

export function CreateEditProduct({
  editingProduct,
  categories,
  taxRates,
  formData,
  setFormData,
  additionalUnits,
  setAdditionalUnits,
  activeProductTab,
  setActiveProductTab,
  findCategoryById,
  getCategoryPath,
  formatCurrency,
  handleSaveProduct,
  handleAddUnit,
  handleRemoveUnit,
  handleUpdateUnit,
  onBack
}: CreateEditProductProps) {
  return (
    <div className="space-y-6 w-full" dir="rtl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-3xl font-bold">
            {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h1>
          <p className="text-gray-600 mt-1">أدخل المعلومات المطلوبة في كل قسم</p>
        </div>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowRight className="w-4 h-4" />
          الرجوع
        </Button>
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeProductTab} onValueChange={setActiveProductTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full grid grid-cols-5 mb-4">
              <TabsTrigger value="basic" className="gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">الأساسيات</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">التسعير</span>
              </TabsTrigger>
              <TabsTrigger value="policies" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">السياسات</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-2">
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">معلومات إضافية</span>
              </TabsTrigger>
              <TabsTrigger value="units" className="gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">الوحدات</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1" dir="rtl">
              {/* Tab 1: Basic Information */}
              <TabsContent value="basic" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-right text-gray-700">المعلومات الأساسية</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اسم المنتج *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="مثال: لابتوب ديل"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>رمز المنتج (SKU) *</Label>
                      <Input
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="PROD-001"
                        dir="ltr"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>التصنيف *</Label>
                      <CategorySelector
                        categories={categories}
                        selectedId={formData.categoryId}
                        onSelect={(id) => setFormData({ ...formData, categoryId: id })}
                        findCategoryById={findCategoryById}
                      />
                      {formData.categoryId && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                          {getCategoryPath(formData.categoryId)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>الحالة</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
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

                <div className="border-t my-6"></div>

                {/* Base Unit Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-right text-gray-700">الوحدة الأساسية والمخزون</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>وحدة القياس *</Label>
                      <Select value={formData.baseUnit} onValueChange={(value) => setFormData({ ...formData, baseUnit: value })}>
                        <SelectTrigger>
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
                      <Label>الكمية الحالية *</Label>
                      <Input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الحد الأدنى *</Label>
                      <Input
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>الباركود *</Label>
                      <Input
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        placeholder="123456789"
                        dir="ltr"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>سعر التكلفة *</Label>
                      <Input
                        type="number"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>سعر البيع *</Label>
                      <Input
                        type="number"
                        value={formData.sellPrice}
                        onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Pricing & Tax */}
              <TabsContent value="pricing" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-right text-gray-700">إعدادات التسعير المتقدمة</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الحد الأدنى لسعر البيع *</Label>
                      <Input
                        type="number"
                        value={formData.minSellPrice}
                        onChange={(e) => setFormData({ ...formData, minSellPrice: Number(e.target.value) })}
                        placeholder="0.00"
                        step="0.01"
                      />
                      <span className="text-xs text-gray-500 block">لا يمكن البيع تحت هذا السعر</span>
                    </div>

                    <div className="space-y-2">
                      <Label>الخصم المسموح به (%)</Label>
                      <Input
                        type="number"
                        value={formData.allowedDiscount}
                        onChange={(e) => setFormData({ ...formData, allowedDiscount: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                      <span className="text-xs text-gray-500 block">الحد الأقصى للخصم</span>
                    </div>
                  </div>

                  {formData.sellPrice > 0 && formData.minSellPrice > 0 && (
                    <div className="text-xs bg-gray-50 p-3 rounded border space-y-1 text-right">
                      <p className="text-gray-700">
                        نطاق السعر: <strong>{formatCurrency(formData.minSellPrice)}</strong> - <strong>{formatCurrency(formData.sellPrice)}</strong>
                      </p>
                      {formData.allowedDiscount > 0 && (
                        <p className="text-gray-700">
                          السعر بعد الخصم الأقصى ({formData.allowedDiscount}%): <strong>{formatCurrency(formData.sellPrice * (1 - formData.allowedDiscount / 100))}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t my-6"></div>

                {/* Quantity-Based Pricing Tiers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-right text-gray-700">أسعار حسب الكمية</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newTiers = formData.pricingTiers || [];
                        const lastTier = newTiers.length > 0 ? newTiers[newTiers.length - 1] : null;
                        const nextMinQuantity = lastTier ? lastTier.minQuantity + 1 : 1;
                        setFormData({
                          ...formData,
                          pricingTiers: [
                            ...newTiers,
                            { minQuantity: nextMinQuantity, price: formData.sellPrice }
                          ]
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة سعر حسب الكمية
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    يمكنك تحديد أسعار مختلفة حسب الكمية المشتراة (مثال: 1-5 بسعر، 6-23 بسعر آخر، 24+ بسعر ثالث)
                  </p>

                  {formData.pricingTiers && formData.pricingTiers.length > 0 && (
                    <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                      {formData.pricingTiers
                        .sort((a, b) => a.minQuantity - b.minQuantity)
                        .map((tier, index) => (
                          <div key={index} className="grid grid-cols-3 gap-3 items-end bg-white p-3 rounded border">
                            <div className="space-y-1">
                              <Label className="text-xs">الحد الأدنى للكمية</Label>
                              <Input
                                type="number"
                                value={tier.minQuantity}
                                onChange={(e) => {
                                  const newTiers = [...(formData.pricingTiers || [])];
                                  newTiers[index] = { ...tier, minQuantity: Number(e.target.value) };
                                  setFormData({ ...formData, pricingTiers: newTiers });
                                }}
                                min="1"
                                placeholder="1"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">السعر للوحدة</Label>
                              <Input
                                type="number"
                                value={tier.price}
                                onChange={(e) => {
                                  const newTiers = [...(formData.pricingTiers || [])];
                                  newTiers[index] = { ...tier, price: Number(e.target.value) };
                                  setFormData({ ...formData, pricingTiers: newTiers });
                                }}
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 text-xs text-gray-600 text-right">
                                {index < (formData.pricingTiers?.length || 0) - 1 ? (
                                  <span>
                                    من {tier.minQuantity} إلى{' '}
                                    {(formData.pricingTiers?.[index + 1]?.minQuantity || 0) - 1}
                                  </span>
                                ) : (
                                  <span>من {tier.minQuantity} فأكثر</span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newTiers = (formData.pricingTiers || []).filter((_, i) => i !== index);
                                  setFormData({ ...formData, pricingTiers: newTiers });
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {formData.pricingTiers && formData.pricingTiers.length > 0 && (
                    <div className="text-xs bg-blue-50 p-3 rounded border text-right">
                      <p className="text-gray-700 font-medium mb-2">ملخص الأسعار:</p>
                      <div className="space-y-1">
                        {formData.pricingTiers
                          .sort((a, b) => a.minQuantity - b.minQuantity)
                          .map((tier, index) => {
                            const nextTier = formData.pricingTiers?.[index + 1];
                            const range = nextTier
                              ? `${tier.minQuantity} - ${nextTier.minQuantity - 1}`
                              : `${tier.minQuantity}+`;
                            return (
                              <p key={index} className="text-gray-600">
                                الكمية {range}: <strong>{formatCurrency(tier.price)}</strong> للوحدة
                              </p>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t my-6"></div>

                {/* Tax Settings Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-right text-gray-700">إعدادات الضرائب</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>القيمة المضافة / الضريبة *</Label>
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
                      <Label>السعر شامل الضريبة؟</Label>
                      <Select value={formData.taxIncluded ? 'yes' : 'no'} onValueChange={(value) => setFormData({ ...formData, taxIncluded: value === 'yes' })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">نعم، شامل</SelectItem>
                          <SelectItem value="no">لا، يضاف على السعر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.sellPrice > 0 && formData.taxRateId && (
                    <div className="text-xs bg-gray-50 p-3 rounded border text-right space-y-1">
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
                          <>
                            <p className="text-gray-700">
                              السعر قبل الضريبة: <strong>{formatCurrency(formData.taxIncluded ? formData.sellPrice - taxAmount : formData.sellPrice)}</strong>
                            </p>
                            <p className="text-gray-700">
                              قيمة الضريبة ({tax.rate}%): <strong>{formatCurrency(taxAmount)}</strong>
                            </p>
                            <p className="text-gray-700 pt-1 border-t font-medium">
                              السعر النهائي: <strong>{formatCurrency(finalPrice)}</strong>
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 3: Sales Policies */}
              <TabsContent value="policies" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-right text-gray-700">سياسات البيع</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>فترة الإرجاع (أيام)</Label>
                      <Input
                        type="number"
                        value={formData.returnPeriodDays}
                        onChange={(e) => setFormData({ ...formData, returnPeriodDays: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                      />
                      <span className="text-xs text-gray-500 block">المدة المسموح بها للإرجاع</span>
                    </div>

                    <div className="space-y-2">
                      <Label>الحد الأدنى للكمية *</Label>
                      <Input
                        type="number"
                        value={formData.minQuantity}
                        onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                        placeholder="1"
                        min="1"
                      />
                      <span className="text-xs text-gray-500 block">أقل كمية للبيع</span>
                    </div>

                    <div className="space-y-2">
                      <Label>الحد الأعلى للكمية</Label>
                      <Input
                        type="number"
                        value={formData.maxQuantity || ''}
                        onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="غير محدد"
                        min="1"
                      />
                      <span className="text-xs text-gray-500 block">للعروض الخاصة</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>السماح بإرجاع المنتج؟</Label>
                    <Select value={formData.allowReturn ? 'yes' : 'no'} onValueChange={(value) => setFormData({ ...formData, allowReturn: value === 'yes' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">نعم، يمكن إرجاعه</SelectItem>
                        <SelectItem value="no">لا، غير قابل للإرجاع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-xs bg-gray-50 p-3 rounded border space-y-2 text-right">
                    {formData.allowReturn && formData.returnPeriodDays > 0 ? (
                      <p className="text-gray-700 font-medium">
                        الإرجاع: متاح خلال {formData.returnPeriodDays} يوم من تاريخ الشراء
                      </p>
                    ) : (
                      <p className="text-gray-700 font-medium">
                        الإرجاع: غير متاح لهذا المنتج
                      </p>
                    )}
                    <p className="text-gray-600">
                      الحد الأدنى: {formData.minQuantity} وحدة
                    </p>
                    {formData.maxQuantity && (
                      <p className="text-gray-600">
                        الحد الأعلى: {formData.maxQuantity} وحدة للعميل الواحد
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Secondary Information */}
              <TabsContent value="info" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-right text-gray-700">الأبعاد والوزن</h3>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>الطول (سم)</Label>
                      <Input
                        type="number"
                        value={formData.length || ''}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="0"
                        step="0.01"
                      />
                      <span className="text-xs text-gray-500 block">اختياري</span>
                    </div>

                    <div className="space-y-2">
                      <Label>العرض (سم)</Label>
                      <Input
                        type="number"
                        value={formData.width || ''}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="0"
                        step="0.01"
                      />
                      <span className="text-xs text-gray-500 block">اختياري</span>
                    </div>

                    <div className="space-y-2">
                      <Label>الارتفاع (سم)</Label>
                      <Input
                        type="number"
                        value={formData.height || ''}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="0"
                        step="0.01"
                      />
                      <span className="text-xs text-gray-500 block">اختياري</span>
                    </div>

                    <div className="space-y-2">
                      <Label>الوزن (كجم)</Label>
                      <Input
                        type="number"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="0"
                        step="0.01"
                      />
                      <span className="text-xs text-gray-500 block">اختياري</span>
                    </div>
                  </div>

                  {(formData.length || formData.width || formData.height) && (
                    <div className="text-xs bg-gray-50 p-3 rounded border text-right">
                      <p className="text-gray-700">
                        الأبعاد: {formData.length || 0} × {formData.width || 0} × {formData.height || 0} سم
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t my-6"></div>

                {/* Manufacturer Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-right text-gray-700">معلومات الشركة المصنعة</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>بلد الصنع</Label>
                      <Input
                        value={formData.countryOfOrigin}
                        onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                        placeholder="مثال: السعودية، الصين، ألمانيا"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الشركة المصنعة</Label>
                      <Input
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        placeholder="مثال: سامسونج، ديل، أبل"
                        className="text-right"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 5: Additional Units */}
              <TabsContent value="units" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button type="button" variant="outline" size="sm" onClick={handleAddUnit} className="gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة وحدة أخرى
                    </Button>
                    <h3 className="text-sm font-semibold text-right text-gray-700">وحدات القياس الإضافية</h3>
                  </div>

                  <div className="text-sm text-gray-600 text-right p-3 bg-gray-50 rounded border">
                    <strong>مثال:</strong> إذا كانت الوحدة الأساسية "حبة"، يمكنك إضافة "كرتون (12 حبة)" أو "صندوق (50 حبة)"
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
                            <p className="text-xs text-gray-600 text-right bg-gray-50 p-2 rounded border">
                              المعادلة: 1 {unit.name} = {unit.quantity} {formData.baseUnit}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t mt-4">
            <Button onClick={onBack} variant="outline" className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handleSaveProduct} className="flex-1">
              {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

