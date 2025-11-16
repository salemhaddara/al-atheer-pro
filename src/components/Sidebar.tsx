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
  CalendarClock
} from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  currentCompany: string;
  onCompanyChange: (company: string) => void;
}

export function Sidebar({ currentPage, onPageChange, currentCompany, onCompanyChange }: SidebarProps) {
  const { t, direction } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>(['accounting', 'sales']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const companies = [
    { id: 'alamal', name: t('sidebar.companies.alamal') },
    { id: 'alnajah', name: t('sidebar.companies.alnajah') },
    { id: 'alreyada', name: t('sidebar.companies.alreyada') },
    { id: 'altamayoz', name: t('sidebar.companies.altamayoz') }
  ];

  const menuSections = [
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
        { id: 'invoices', label: t('sidebar.menu.invoices'), icon: FileText },
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
        { id: 'banks-pos', label: 'إدارة البنوك والصرافات', icon: Landmark },
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
        { id: 'customer-statements', label: 'كشوف العملاء', icon: FileText },
        { id: 'suppliers', label: t('sidebar.menu.suppliers'), icon: Users2 },
      ]
    },
    {
      id: 'reports',
      label: t('sidebar.sections.reports'),
      icon: BarChart3,
      expandable: true,
      items: [
        { id: 'financial-reports', label: t('sidebar.menu.financialReports'), icon: Calculator },
        { id: 'profit-loss', label: t('sidebar.menu.profitLoss'), icon: TrendingUp },
        { id: 'balance-sheet', label: t('sidebar.menu.balanceSheet'), icon: Receipt },
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
                    const isActive = currentPage === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onPageChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
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
}
