'use client';

import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  UserCircle,
  FileText,
  Settings as SettingsIcon,
  Building2,
  Warehouse,
  Calculator,
  Receipt,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users2,
  Briefcase,
  MapPin,
  DollarSign,
  ChevronDown,
  Store,
  BarChart3,
  Wallet,
  CreditCard,
  PackageCheck,
  Landmark,
  CalendarClock,
  BookOpen
} from 'lucide-react';
import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface SidebarProps {
  currentCompany: string;
  onCompanyChange: (company: string) => void;
}

// Route mapping for Next.js
const routeMap: Record<string, string> = {
  'dashboard': '/',
  'accounting': '/accounting',
  'chart-of-accounts': '/chart-of-accounts',
  'account-statements': '/account-statements',
  'receipt-vouchers': '/receipt-vouchers',
  'payment-vouchers': '/payment-vouchers',
  'trial-balance': '/trial-balance',
  'invoices': '/invoices',
  'purchases': '/purchases',
  'pos': '/pos',
  'pos-management': '/pos-management',
  'quotations': '/quotations',
  'price-inquiry': '/price-inquiry',
  'hr': '/hr',
  'employees': '/employees',
  'shifts': '/shifts',
  'warehouses': '/warehouses',
  'opening-inventory': '/opening-inventory',
  'products': '/products',
  'services': '/services',
  'safes': '/safes',
  'banks-pos': '/banks-pos',
  'companies': '/companies',
  'branches': '/branches',
  'customers': '/customers',
  'customer-statements': '/customer-statements',
  'suppliers': '/suppliers',
  'reports': '/reports',
  'financial-reports': '/reports/financial',
  'profit-loss': '/reports/profit-loss',
  'balance-sheet': '/reports/balance-sheet',
  'cash-flow': '/reports/cash-flow',
  'purchase-reports': '/reports/purchase',
  'inventory-reports': '/reports/inventory',
  'customer-reports': '/reports/customer',
  'supplier-reports': '/reports/supplier',
  'tax-reports': '/reports/tax',
  'settings': '/settings',
  'system-setup': '/settings/system-setup',
  'permissions': '/settings/permissions',
};

export const Sidebar = memo(function Sidebar({ currentCompany, onCompanyChange }: SidebarProps) {
  const { t, direction } = useLanguage();
  const { isAdmin } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(['accounting', 'sales']);

  // Prefetch common routes on mount for faster navigation
  useEffect(() => {
    const commonRoutes = ['/', '/customers', '/products', '/pos', '/purchases', '/employees'];
    commonRoutes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const companies = useMemo(() => [
    { id: 'alamal', name: t('sidebar.companies.alamal') },
    { id: 'alnajah', name: t('sidebar.companies.alnajah') },
    { id: 'alreyada', name: t('sidebar.companies.alreyada') },
    { id: 'altamayoz', name: t('sidebar.companies.altamayoz') }
  ], [t]);

  const menuSections = useMemo(() => {
    const allSections = [
      {
        id: 'main',
        label: t('sidebar.sections.main'),
        items: [
          { id: 'dashboard', label: t('sidebar.menu.dashboard'), icon: LayoutDashboard, adminOnly: false },
        ]
      },
      {
        id: 'accounting',
        label: t('sidebar.sections.accounting'),
        icon: Calculator,
        expandable: true,
        adminOnly: true,
        items: [
          { id: 'accounting', label: t('sidebar.menu.accounting'), icon: Receipt, adminOnly: true },
          { id: 'chart-of-accounts', label: 'شجرة الحسابات', icon: BookOpen, adminOnly: true },
          { id: 'account-statements', label: 'كشوفات الحسابات', icon: FileText, adminOnly: true },
          { id: 'receipt-vouchers', label: 'سندات القبض', icon: TrendingUp, adminOnly: true },
          { id: 'payment-vouchers', label: 'سندات الصرف', icon: TrendingDown, adminOnly: true },
          { id: 'trial-balance', label: 'ميزان المراجعة', icon: Calculator, adminOnly: true },
          { id: 'balance-sheet', label: t('sidebar.menu.balanceSheet'), icon: Receipt, adminOnly: true },
        ]
      },
      {
        id: 'sales',
        label: t('sidebar.sections.sales'),
        icon: ShoppingCart,
        expandable: true,
        items: [
          { id: 'purchases', label: t('sidebar.menu.purchases'), icon: ShoppingBag, adminOnly: true },
          { id: 'pos', label: t('sidebar.menu.pos'), icon: Store, adminOnly: false },
          { id: 'pos-management', label: 'إدارة نقاط البيع والدرج', icon: Wallet, adminOnly: false },
          { id: 'quotations', label: 'عروض الأسعار', icon: FileText, adminOnly: false },
          { id: 'price-inquiry', label: 'شاشة الأسعار (للعملاء)', icon: Package, adminOnly: false },
        ]
      },
      {
        id: 'hr',
        label: t('sidebar.sections.hr'),
        icon: Users2,
        expandable: true,
        adminOnly: true,
        items: [
          { id: 'hr', label: t('sidebar.menu.hr'), icon: Briefcase, adminOnly: true },
          { id: 'employees', label: t('sidebar.menu.employees'), icon: UserCircle, adminOnly: true },
          { id: 'shifts', label: t('sidebar.menu.shifts'), icon: CalendarClock, adminOnly: true },
        ]
      },
      {
        id: 'warehouses',
        label: t('sidebar.sections.warehouses'),
        icon: Warehouse,
        expandable: true,
        adminOnly: true,
        items: [
          { id: 'warehouses', label: t('sidebar.menu.warehouses'), icon: Warehouse, adminOnly: true },
          { id: 'opening-inventory', label: 'مخزون أول المدة', icon: Package, adminOnly: true },
          { id: 'products', label: t('sidebar.menu.products'), icon: Package, adminOnly: true },
          { id: 'services', label: t('sidebar.menu.services'), icon: Briefcase, adminOnly: true },
        ]
      },
      {
        id: 'financial-accounts',
        label: t('sidebar.sections.financialAccounts'),
        icon: DollarSign,
        expandable: true,
        adminOnly: true,
        items: [
          { id: 'safes', label: t('sidebar.menu.safes'), icon: DollarSign, adminOnly: true },
          { id: 'banks-pos', label: 'إدارة البنوك والصرافات', icon: Landmark, adminOnly: true },
        ]
      },
      {
        id: 'companies',
        label: t('sidebar.sections.companies'),
        icon: Building2,
        expandable: true,
        adminOnly: true,
        items: [
          { id: 'companies', label: t('sidebar.menu.companies'), icon: Building2, adminOnly: true },
          { id: 'branches', label: t('sidebar.menu.branches'), icon: MapPin, adminOnly: true },
        ]
      },
      {
        id: 'customers',
        label: t('sidebar.sections.customers'),
        icon: Users,
        expandable: true,
        adminOnly: false,
        items: [
          { id: 'customers', label: t('sidebar.menu.customers'), icon: Users, adminOnly: false },
          { id: 'customer-statements', label: 'كشوف العملاء', icon: FileText, adminOnly: true },
          { id: 'suppliers', label: t('sidebar.menu.suppliers'), icon: Users2, adminOnly: true },
        ]
      },
      {
        id: 'reports',
        label: t('sidebar.sections.reports'),
        icon: BarChart3,
        expandable: true,
        adminOnly: true,
        items: [
          { id: 'invoices', label: t('sidebar.menu.invoices'), icon: FileText, adminOnly: true },
          { id: 'financial-reports', label: t('sidebar.menu.financialReports'), icon: Calculator, adminOnly: true },
          { id: 'profit-loss', label: t('sidebar.menu.profitLoss'), icon: TrendingUp, adminOnly: true },
          { id: 'cash-flow', label: t('sidebar.menu.cashFlow'), icon: Wallet, adminOnly: true },
          { id: 'purchase-reports', label: t('sidebar.menu.purchaseReports'), icon: ShoppingBag, adminOnly: true },
          { id: 'inventory-reports', label: t('sidebar.menu.inventoryReports'), icon: PackageCheck, adminOnly: true },
          { id: 'customer-reports', label: t('sidebar.menu.customerReports'), icon: Users, adminOnly: true },
          { id: 'supplier-reports', label: t('sidebar.menu.supplierReports'), icon: Users2, adminOnly: true },
          { id: 'tax-reports', label: t('sidebar.menu.taxReports'), icon: CreditCard, adminOnly: true },
        ]
      },
      {
        id: 'settings',
        label: t('sidebar.sections.settings'),
        icon: SettingsIcon,
        expandable: true,
        adminOnly: true,
        items: [
          { id: 'settings', label: t('sidebar.menu.settingsGeneral'), icon: SettingsIcon, adminOnly: true },
          { id: 'system-setup', label: t('sidebar.menu.systemSetup'), icon: SettingsIcon, adminOnly: true },
          { id: 'permissions', label: t('sidebar.menu.permissions'), icon: UserCircle, adminOnly: true },
        ]
      }
    ];

    // Filter sections based on user role
    if (isAdmin()) {
      return allSections;
    }

    // For employees, filter out admin-only sections and items
    return allSections
      .filter(section => !section.adminOnly)
      .map(section => ({
        ...section,
        items: section.items?.filter(item => !item.adminOnly) || []
      }))
      .filter(section => section.items && section.items.length > 0);
  }, [t, isAdmin]);

  return (
    <div
      className={`fixed top-0 h-screen w-64 bg-white border-gray-200 shadow-sm overflow-y-auto ${direction === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'
        }`}
      dir={direction}
    >
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-blue-600">{t('sidebar.systemTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('sidebar.systemSubtitle')}</p>
      </div>

      {/* Company Selector */}
      <div className="p-4 border-b border-gray-200">
        <label className="text-sm text-gray-600 mb-2 block">{t('sidebar.currentCompany')}</label>
        <Select value={currentCompany} onValueChange={onCompanyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.name}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <nav className="p-4">
        {menuSections.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div key={section.id} className="mb-2">
              {section.expandable && SectionIcon ? (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SectionIcon className="w-4 h-4" />
                    <span className="text-sm">{section.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              ) : null}

              {(!section.expandable || isExpanded) && (
                <div className={section.expandable ? (direction === 'rtl' ? 'mr-4 mt-1' : 'ml-4 mt-1') : ''}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const route = routeMap[item.id] || `/${item.id}`;
                    const isActive = pathname === route || (pathname === '/' && item.id === 'dashboard');

                    return (
                      <Link
                        key={item.id}
                        href={route}
                        prefetch={true}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
});
