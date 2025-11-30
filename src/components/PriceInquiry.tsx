import { useMemo, useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';

interface Product {
  id: string;
  name: string;
  baseUnit: string;
  baseBarcode: string;
  sellPrice: number;
  status?: string;
}

const STORAGE_KEY = 'products';

// Load products from localStorage
const loadProducts = (): Product[] => {
  try {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const products = JSON.parse(stored);
    // Filter only active products and map to our interface
    return products
      .filter((p: any) => !p.status || p.status === 'نشط')
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        baseUnit: p.baseUnit,
        baseBarcode: p.baseBarcode,
        sellPrice: p.sellPrice,
        status: p.status
      }));
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

export function PriceInquiry() {
  const [search, setSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load products on mount
  useEffect(() => {
    const loadedProducts = loadProducts();
    setProducts(loadedProducts);
  }, []);

  // Listen for storage changes to update products
  useEffect(() => {
    const handleStorageChange = () => {
      const loadedProducts = loadProducts();
      setProducts(loadedProducts);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('productsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('productsUpdated', handleStorageChange);
    };
  }, []);

  // Handle search and select product
  useEffect(() => {
    if (!search.trim()) {
      setSelectedProduct(null);
      return;
    }

    const term = search.trim().toLowerCase();
    const found = products.find((item) =>
      item.name.toLowerCase().includes(term) ||
      item.baseBarcode.toLowerCase().includes(term)
    );

    setSelectedProduct(found || null);
  }, [search, products]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const hideSidebar = () => {
    // Inject CSS to hide sidebar - use multiple selectors to catch all variations
    let style = document.getElementById('price-inquiry-sidebar-hide');
    if (!style) {
      style = document.createElement('style');
      style.id = 'price-inquiry-sidebar-hide';
      document.head.appendChild(style);
    }
    style.textContent = `
      div.fixed.h-screen.w-64,
      div[class*="fixed"][class*="h-screen"][class*="w-64"],
      div.fixed.top-0.h-screen.w-64,
      div[class*="right-0"][class*="border-l"][class*="w-64"],
      div[class*="left-0"][class*="border-r"][class*="w-64"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        max-width: 0 !important;
        min-width: 0 !important;
        overflow: hidden !important;
        transform: translateX(100%) !important;
      }
      main {
        margin-right: 0 !important;
        margin-left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    `;
  };

  const showSidebar = () => {
    // Remove the injected CSS
    const style = document.getElementById('price-inquiry-sidebar-hide');
    if (style) {
      style.remove();
    }

    // Restore main content margins
    const main = document.querySelector('main');
    if (main) {
      const direction = document.documentElement.dir || 'rtl';
      if (direction === 'rtl') {
        (main as HTMLElement).style.marginRight = '16rem';
        (main as HTMLElement).style.marginLeft = '0';
      } else {
        (main as HTMLElement).style.marginLeft = '16rem';
        (main as HTMLElement).style.marginRight = '0';
      }
      (main as HTMLElement).style.width = '';
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Hide sidebar before entering fullscreen
      hideSidebar();

      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen first
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }

      // Show sidebar after exiting
      setTimeout(() => {
        showSidebar();
        setIsFullscreen(false);
      }, 100);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (isCurrentlyFullscreen) {
        hideSidebar();
      } else {
        showSidebar();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8" dir="rtl">
      {/* Fullscreen Button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="gap-2"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              خروج من وضع ملء الشاشة
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              ملء الشاشة
            </>
          )}
        </Button>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">شاشة الاستعلام عن الأسعار</h1>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الباركود..."
            className="pr-10 h-14 text-lg text-right"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6 bg-gray-50 p-8 rounded-lg border">
          {/* الباركود */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-right block">الباركود</Label>
            <div className="flex gap-2">
              <Input
                value={selectedProduct?.baseBarcode || ''}
                readOnly
                className="text-right font-mono"
                placeholder="---"
              />
              <Input
                value={selectedProduct?.baseBarcode || ''}
                readOnly
                className="text-right font-mono"
                placeholder="---"
              />
            </div>
          </div>

          {/* اسم الصنف */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-right block">اسم الصنف</Label>
            <Input
              value={selectedProduct?.name || ''}
              readOnly
              className="text-right text-lg"
              placeholder="---"
            />
          </div>

          {/* الوحدة */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-right block">الوحدة</Label>
            <Input
              value={selectedProduct?.baseUnit || ''}
              readOnly
              className="text-right"
              placeholder="---"
            />
          </div>

          {/* سعر البيع */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-right block">سعر البيع</Label>
            <Input
              value={selectedProduct ? formatCurrency(selectedProduct.sellPrice) : ''}
              readOnly
              className="text-right text-xl font-bold text-green-600"
              placeholder="---"
            />
          </div>
        </div>

        {/* No Results Message */}
        {search && !selectedProduct && (
          <div className="text-center text-gray-500 text-lg py-8">
            لم يتم العثور على منتج بهذا الاسم أو الباركود
          </div>
        )}

        {/* Initial Message */}
        {!search && (
          <div className="text-center text-gray-400 text-lg py-8">
            ابدأ البحث عن منتج بالاسم أو الباركود
          </div>
        )}
      </div>
    </div>
  );
}
