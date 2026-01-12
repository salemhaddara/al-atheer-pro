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
  MapPin as MapPinIcon,
  Search,
  X,
  LogOut
} from 'lucide-react';
import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface SidebarProps {
  currentCompany: string;
  onCompanyChange: (company: string) => void;
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  institutions?: any[];
  currentInstitution?: any | null;
  onInstitutionChange?: (institutionId: number | null) => void;
  isSuperAdmin?: boolean;
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

export const Sidebar = memo(function Sidebar({ 
  currentCompany, 
  onCompanyChange, 
  isCollapsed: controlledCollapsed, 
  onToggle,
  institutions = [],
  currentInstitution,
  onInstitutionChange,
  isSuperAdmin = false
}: SidebarProps) {
  const { t, direction, language } = useLanguage();
  const { currentUser, logout } = useUser();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBranch, setCurrentBranch] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_branch') || '';
    }
    return '';
  });

  // Update currentBranch with translation when language changes (only if no saved branch)
  useEffect(() => {
    const savedBranch = typeof window !== 'undefined' ? localStorage.getItem('current_branch') : null;
    if (!savedBranch) {
      setCurrentBranch(t('sidebar.mainBranch'));
    } else if (currentBranch === 'الفرع الرئيسي' || currentBranch === 'Main Branch') {
      // Update if it's the old default value
      setCurrentBranch(t('sidebar.mainBranch'));
    }
  }, [t]); // Only depend on t to avoid infinite loop

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

  // Use the current company from props (which comes from settings)
  // For now, we'll just show the current company as the only option
  // In the future, you can add multiple companies/institutions support
  const companies = useMemo(() => {
    if (currentCompany) {
      return [{ id: 'current', name: currentCompany }];
    }
    // Fallback to default
    return [{ id: 'current', name: t('sidebar.companies.alamal') }];
  }, [currentCompany, t]);

  const menuSections = useMemo(() => {
    const allSections = [
      {
        id: 'main',
        label: t('sidebar.sections.main'),
        items: [
          { id: 'dashboard', label: t('sidebar.menu.dashboard'), icon: LayoutDashboard },
        ]
      },
      {
        id: 'accounting',
        label: t('sidebar.sections.accounting'),
        icon: Calculator,
        expandable: true,
        items: [
          { id: 'accounting', label: t('sidebar.menu.accounting'), icon: Receipt },
          { id: 'chart-of-accounts', label: t('sidebar.menu.chartOfAccounts'), icon: BookOpen },
          { id: 'account-statements', label: t('sidebar.menu.accountStatements'), icon: FileText },
          { id: 'receipt-vouchers', label: t('sidebar.menu.receiptVouchers'), icon: TrendingUp },
          { id: 'payment-vouchers', label: t('sidebar.menu.paymentVouchers'), icon: TrendingDown },
          { id: 'trial-balance', label: t('sidebar.menu.trialBalance'), icon: Calculator },
          { id: 'balance-sheet', label: t('sidebar.menu.balanceSheet'), icon: Receipt },
        ]
      },
      {
        id: 'sales',
        label: t('sidebar.sections.sales'),
        icon: ShoppingCart,
        expandable: true,
        items: [
          { id: 'purchases', label: t('sidebar.menu.purchases'), icon: ShoppingBag },
          { id: 'pos', label: t('sidebar.menu.pos'), icon: Store },
          { id: 'pos-management', label: t('sidebar.menu.posManagement'), icon: Wallet },
          { id: 'quotations', label: t('sidebar.menu.quotations'), icon: FileText },
          { id: 'price-inquiry', label: t('sidebar.menu.priceInquiry'), icon: Package },
        ]
      },
      {
        id: 'hr',
        label: t('sidebar.sections.hr'),
        icon: Users2,
        expandable: true,
        items: [
          { id: 'hr', label: t('sidebar.menu.hr'), icon: Briefcase },
          { id: 'employees', label: t('sidebar.menu.employees'), icon: UserCircle },
          { id: 'shifts', label: t('sidebar.menu.shifts'), icon: CalendarClock },
        ]
      },
      {
        id: 'warehouses',
        label: t('sidebar.sections.warehouses'),
        icon: Warehouse,
        expandable: true,
        items: [
          { id: 'warehouses', label: t('sidebar.menu.warehouses'), icon: Warehouse },
          { id: 'opening-inventory', label: t('sidebar.menu.openingInventory'), icon: Package },
          { id: 'products', label: t('sidebar.menu.products'), icon: Package },
          { id: 'services', label: t('sidebar.menu.services'), icon: Briefcase },
        ]
      },
      {
        id: 'financial-accounts',
        label: t('sidebar.sections.financialAccounts'),
        icon: DollarSign,
        expandable: true,
        items: [
          { id: 'safes', label: t('sidebar.menu.safes'), icon: DollarSign },
          { id: 'banks-pos', label: t('sidebar.menu.banksPos'), icon: Landmark },
        ]
      },
      {
        id: 'companies',
        label: t('sidebar.sections.companies'),
        icon: Building2,
        expandable: true,
        items: [
          { id: 'companies', label: t('sidebar.menu.companies'), icon: Building2 },
          { id: 'branches', label: t('sidebar.menu.branches'), icon: MapPin },
        ]
      },
      {
        id: 'customers',
        label: t('sidebar.sections.customers'),
        icon: Users,
        expandable: true,
        items: [
          { id: 'customers', label: t('sidebar.menu.customers'), icon: Users },
          { id: 'customer-statements', label: t('sidebar.menu.customerStatements'), icon: FileText },
          { id: 'suppliers', label: t('sidebar.menu.suppliers'), icon: Users2 },
          { id: 'vendor-statements', label: t('sidebar.menu.vendorStatements'), icon: FileText },
        ]
      },
      {
        id: 'reports',
        label: t('sidebar.sections.reports'),
        icon: BarChart3,
        expandable: true,
        items: [
          { id: 'invoices', label: t('sidebar.menu.invoices'), icon: FileText },
          { id: 'financial-reports', label: t('sidebar.menu.financialReports'), icon: Calculator },
          { id: 'profit-loss', label: t('sidebar.menu.profitLoss'), icon: TrendingUp },
          { id: 'cash-flow', label: t('sidebar.menu.cashFlow'), icon: Wallet },
          { id: 'purchase-reports', label: t('sidebar.menu.purchaseReports'), icon: ShoppingBag },
          { id: 'inventory-reports', label: t('sidebar.menu.inventoryReports'), icon: PackageCheck },
          { id: 'customer-reports', label: t('sidebar.menu.customerReports'), icon: Users },
          { id: 'supplier-reports', label: t('sidebar.menu.supplierReports'), icon: Users2 },
          { id: 'tax-reports', label: t('sidebar.menu.taxReports'), icon: CreditCard },
        ]
      },
      {
        id: 'settings',
        label: t('sidebar.sections.settings'),
        icon: SettingsIcon,
        expandable: true,
        items: [
          { id: 'settings', label: t('sidebar.menu.settingsGeneral'), icon: SettingsIcon },
          { id: 'system-setup', label: t('sidebar.menu.systemSetup'), icon: SettingsIcon },
          { id: 'permissions', label: t('sidebar.menu.permissions'), icon: UserCircle },
        ]
      }
    ];

    // Filter by search query if provided
    let filteredSections = allSections;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredSections = allSections
        .map(section => {
          const matchingItems = section.items?.filter(item =>
            item.label.toLowerCase().includes(query) ||
            section.label.toLowerCase().includes(query)
          ) || [];

          return {
            ...section,
            items: matchingItems
          };
        })
        .filter(section =>
          section.items && section.items.length > 0 ||
          section.label.toLowerCase().includes(query)
        );
    }

    return filteredSections;
  }, [t, searchQuery]);

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


      {/* Institution Selector (for super admin) or Company Display */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          {isSuperAdmin && institutions.length > 0 ? (
            <>
              <label className="text-sm text-gray-600 mb-2 block">{t('sidebar.currentInstitution') || 'المؤسسة الحالية'}</label>
              <Select 
                value={currentInstitution ? String(currentInstitution.id) : ''} 
                onValueChange={(value) => {
                  if (onInstitutionChange) {
                    onInstitutionChange(value ? Number(value) : null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={String(institution.id)}>
                      {language === 'ar' ? institution.name_ar : institution.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : currentInstitution ? (
            <>
              <label className="text-sm text-gray-600 mb-2 block">{t('sidebar.currentCompany') || 'الشركة الحالية'}</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium">
                {(() => {
                  // Priority: 1. Company name from settings, 2. Institution name, 3. Default
                  if (currentCompany) return currentCompany;
                  const institutionName = language === 'ar' ? currentInstitution.name_ar : currentInstitution.name_en;
                  if (institutionName) return institutionName;
                  return t('sidebar.companies.alamal');
                })()}
              </div>
            </>
          ) : (
            <>
              <label className="text-sm text-gray-600 mb-2 block">{t('sidebar.currentCompany') || 'الشركة الحالية'}</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium">
                {currentCompany || t('sidebar.companies.alamal')}
              </div>
            </>
          )}
        </div>
      )}

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
            <Input
              type="text"
              placeholder={t('sidebar.search') || 'ابحث في القائمة...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${direction === 'rtl' ? (searchQuery ? 'pr-10 pl-10' : 'pr-10') : (searchQuery ? 'pl-10 pr-10' : 'pl-10')}`}
              dir={direction}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 ${direction === 'rtl' ? 'left-3' : 'right-3'}`}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <nav className={`${isCollapsed ? 'px-2 py-3 overflow-visible' : 'p-4'} ${currentUser ? (isCollapsed ? 'pb-16' : 'pb-20') : ''}`}>
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
          // Auto-expand sections when searching
          const shouldExpand = searchQuery.trim() ? true : isExpanded;

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
                  <ChevronDown className={`w-4 h-4 transition-transform ${shouldExpand ? 'rotate-180' : ''}`} />
                </button>
              ) : null}

              {(!section.expandable || shouldExpand) && (
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

      {/* Logout Button */}
      {currentUser && (
        <div className={`absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            aria-label={t('sidebar.logout')}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">{t('sidebar.logout')}</span>}
          </button>
        </div>
      )}
    </div>
  );
});
