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
  ChevronLeft,
  ChevronRight,
  Store,
  BarChart3,
  Wallet,
  CreditCard,
  PackageCheck,
  Landmark,
  CalendarClock,
  BookOpen,
  MapPin as MapPinIcon
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
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
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
  'vendor-statements': '/vendor-statements',
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

export const Sidebar = memo(function Sidebar({ currentCompany, onCompanyChange, isCollapsed: controlledCollapsed, onToggle }: SidebarProps) {
  const { t, direction } = useLanguage();
  const { isAdmin, currentUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });
  const [expandedSections, setExpandedSections] = useState<string[]>(['accounting', 'sales']);
  const [currentBranch, setCurrentBranch] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_branch') || 'الفرع الرئيسي';
    }
    return 'الفرع الرئيسي';
  });

  // Use controlled state if provided, otherwise use internal state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(newCollapsed);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_collapsed', String(newCollapsed));
      }
    }
    onToggle?.(newCollapsed);
  }, [isCollapsed, controlledCollapsed, onToggle]);

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
          { id: 'vendor-statements', label: 'كشوف الموردين', icon: FileText, adminOnly: true },
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
      className={`fixed top-0 h-screen bg-white border-gray-200 shadow-lg overflow-y-auto transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20 overflow-x-visible' : 'w-64 overflow-x-hidden'
        } ${direction === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'}`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db transparent'
      }}
      dir={direction}
    >
      {/* Header with Toggle Button */}
      <div className={`border-b border-gray-200 relative ${isCollapsed ? 'p-3' : 'p-6'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-gray-600 hover:text-gray-900"
              aria-label={t('sidebar.expand') || 'Expand sidebar'}
            >
              {direction === 'rtl' ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-blue-600 font-semibold pr-10">{t('sidebar.systemTitle')}</h1>
            <p className="text-gray-500 text-sm mt-1 pr-10">{t('sidebar.systemSubtitle')}</p>
            <button
              onClick={toggleCollapse}
              className={`absolute top-4 ${direction === 'rtl' ? 'left-4' : 'right-4'} p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900`}
              aria-label={t('sidebar.collapse') || 'Collapse sidebar'}
            >
              {direction === 'rtl' ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </>
        )}
      </div>

      {/* User Info Section */}
      {currentUser && (
        <div className={`border-b border-gray-200 ${isCollapsed ? 'py-3' : 'py-4'}`}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm ring-2 ring-blue-100">
                  <span className="text-white font-semibold text-sm">
                    {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                {currentUser.role === 'admin' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 space-y-3">
              {/* User Avatar and Basic Info */}
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm ring-2 ring-blue-100">
                    <span className="text-white font-semibold text-base">
                      {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{currentUser.name} {currentUser.position && (
                    <span className="text-xs text-gray-600 truncate leading-tight">({currentUser.position})</span>
                  )}</p>

                  {currentUser.department && (
                    <p className="text-xs text-gray-500 truncate leading-tight">{currentUser.department}</p>
                  )}
                </div>
              </div>

              {/* Branch Info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <MapPinIcon className={`w-4 h-4 text-gray-500 flex-shrink-0 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{currentBranch}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Company Selector */}
      {!isCollapsed && (
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
      )}

      <nav className={`${isCollapsed ? 'px-2 py-3 overflow-visible' : 'p-4'}`}>
        {menuSections.map((section, sectionIndex) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections.includes(section.id);

          // When collapsed, show all items directly without sections
          if (isCollapsed) {
            return (
              <div key={section.id}>
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const route = routeMap[item.id] || `/${item.id}`;
                  const isActive = pathname === route || (pathname === '/' && item.id === 'dashboard');
                  const isFirstInSection = itemIndex === 0;
                  const showSectionDivider = isFirstInSection && sectionIndex > 0;

                  return (
                    <div key={item.id} className="relative">
                      {/* Section divider */}
                      {showSectionDivider && (
                        <div className="h-px bg-gray-200 my-2 mx-2" />
                      )}
                      <Link
                        href={route}
                        prefetch={true}
                        className={`w-full flex items-center justify-center px-2 py-2.5 rounded-xl mb-1.5 transition-all duration-200 relative group ${isActive
                          ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className={`absolute ${direction === 'rtl' ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 ${direction === 'rtl' ? 'rounded-l-full' : 'rounded-r-full'}`} />
                        )}
                        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600' : ''} relative z-10`} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            );
          }

          // When expanded, show sections with expandable functionality
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
