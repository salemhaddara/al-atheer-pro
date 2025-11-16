import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Customers } from './components/Customers';
import { Employees } from './components/Employees';
import { EmployeeDetails } from './components/EmployeeDetails';
import { Shifts } from './components/Shifts';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { Toaster } from './components/ui/sonner';
import { Accounting } from './components/Accounting';
import { Purchases } from './components/Purchases';
import { HR } from './components/HR';
import { Warehouses } from './components/Warehouses';
import { Branches } from './components/Branches';
import { Companies } from './components/Companies';
import { Suppliers } from './components/Suppliers';
import { SystemSetup } from './components/SystemSetup';
import { Permissions } from './components/Permissions';
import { POS } from './components/POS';
import { Invoices } from './components/Invoices';
import { Safes } from './components/Safes';
import { BanksPOS } from './components/BanksPOS';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
// Report Pages
import { FinancialReports } from './components/reports/FinancialReports';
import { ProfitLoss } from './components/reports/ProfitLoss';
import { BalanceSheet } from './components/reports/BalanceSheet';
import { CashFlow } from './components/reports/CashFlow';
import { PurchaseReports } from './components/reports/PurchaseReports';
import { InventoryReports } from './components/reports/InventoryReports';
import { CustomerReports } from './components/reports/CustomerReports';
import { SupplierReports } from './components/reports/SupplierReports';
import { TaxReports } from './components/reports/TaxReports';
import { Services } from './components/Services';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentCompany, setCurrentCompany] = useState('شركة الأمل للتجارة');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const { direction } = useLanguage();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;

      // المحاسبة والمالية
      case 'accounting':
        return <Accounting />;
      case 'invoices':
        return <Invoices />;

      // المشتريات والمبيعات
      case 'purchases':
        return <Purchases />;
      case 'pos':
        return <POS />;

      // الموارد البشرية
      case 'hr':
        return <HR />;
      case 'employees':
        if (selectedEmployeeId) {
          return <EmployeeDetails employeeId={selectedEmployeeId} onBack={() => {
            setSelectedEmployeeId(null);
            setCurrentPage('employees');
          }} />;
        }
        return <Employees onViewEmployee={(id) => {
          setSelectedEmployeeId(id);
          setCurrentPage('employees');
        }} />;
      case 'shifts':
        return <Shifts />;

      // المستودعات
      case 'warehouses':
        return <Warehouses />;
      case 'products':
        return <Products />;
      case 'services':
        return <Services />;

      // الحسابات المالية
      case 'safes':
        return <Safes />;
      case 'banks-pos':
        return <BanksPOS />;

      // الفروع والشركات
      case 'companies':
        return <Companies />;
      case 'branches':
        return <Branches />;

      // العملاء والموردين
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Suppliers />;

      // التقارير
      case 'reports':
        return <Reports />;
      case 'financial-reports':
        return <FinancialReports />;
      case 'profit-loss':
        return <ProfitLoss />;
      case 'balance-sheet':
        return <BalanceSheet />;
      case 'cash-flow':
        return <CashFlow />;
      case 'purchase-reports':
        return <PurchaseReports />;
      case 'inventory-reports':
        return <InventoryReports />;
      case 'customer-reports':
        return <CustomerReports />;
      case 'supplier-reports':
        return <SupplierReports />;
      case 'tax-reports':
        return <TaxReports />;

      // الإعدادات
      case 'settings':
        return <Settings />;
      case 'system-setup':
        return <SystemSetup />;
      case 'permissions':
        return <Permissions />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          currentCompany={currentCompany}
          onCompanyChange={setCurrentCompany}
        />
        <main
          className="flex-1"
          style={{
            marginLeft: direction === 'ltr' ? '16rem' : '0',
            marginRight: direction === 'rtl' ? '16rem' : '0'
          }}
          dir={direction}
        >
          <div className="p-8">
            {renderPage()}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
