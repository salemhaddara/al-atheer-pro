/**
 * Central Journal Entries Management
 * This file manages all journal entries (both manual and automatic) across the entire system
 */

import { dataCache } from '../utils/dataCache';

// Lazy import chartOfAccounts functions to avoid circular dependencies and improve load time
const getAccountCodeByName = (name: string): string => {
  const { getAccountCodeByName } = require('./chartOfAccounts');
  return getAccountCodeByName(name);
};

const getAccountNameByCode = (code: string): string => {
  const { getAccountNameByCode } = require('./chartOfAccounts');
  return getAccountNameByCode(code);
};

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string; // Can be account code or name (for backward compatibility)
  creditAccount: string; // Can be account code or name (for backward compatibility)
  amount: number;
  reference: string;
  status: 'مُعتمد' | 'قيد المراجعة' | 'ملغي';
  type: 'manual' | 'auto';
  operationType?: 'بيع' | 'شراء' | 'مخزون_توريد' | 'مخزون_صرف' | 'مخزون_تسوية' | 'سند_قبض' | 'سند_صرف' | 'مخزون_أول_مدة' | 'افتتاحي' | 'مرتجع_مبيعات' | 'مرتجع_مشتريات';
  sourceReference?: string; // رابط للعملية الأصلية
  createdAt: string;
}

// Helper function to normalize account reference (convert name to code if needed)
export const normalizeAccountReference = (accountRef: string): string => {
  // If it's already a code (numeric), return as is
  if (/^\d+$/.test(accountRef)) {
    return accountRef;
  }
  // Try to convert name to code
  const code = getAccountCodeByName(accountRef);
  return code !== accountRef ? code : accountRef;
};

// Helper function to get account display name (code or name)
export const getAccountDisplayName = (accountRef: string): string => {
  // If it's a code, get the name
  if (/^\d+$/.test(accountRef)) {
    const name = getAccountNameByCode(accountRef);
    return name !== accountRef ? name : accountRef;
  }
  return accountRef;
};

// Storage key for localStorage
const STORAGE_KEY = 'journal_entries';

// Initialize with default entries
const defaultEntries: JournalEntry[] = [
  {
    id: 'JE-001',
    date: '2025-01-15',
    description: 'قيد افتتاحي - رأس المال',
    debitAccount: 'الصندوق',
    creditAccount: 'رأس المال',
    amount: 500000,
    reference: 'REF-001',
    status: 'مُعتمد',
    type: 'manual',
    operationType: 'افتتاحي',
    createdAt: '2025-01-15T10:00:00'
  },
  {
    id: 'JE-002',
    date: '2025-01-20',
    description: 'شراء معدات مكتبية',
    debitAccount: 'المعدات',
    creditAccount: 'البنك',
    amount: 15000,
    reference: 'REF-002',
    status: 'مُعتمد',
    type: 'manual',
    createdAt: '2025-01-20T10:00:00'
  }
];

// Load entries from cache/localStorage or use defaults
export const loadJournalEntries = (): JournalEntry[] => {
  return dataCache.getFromLocalStorage(STORAGE_KEY, defaultEntries);
};

// Save entries to localStorage and update cache
export const saveJournalEntries = (entries: JournalEntry[]): void => {
  dataCache.saveToLocalStorage(STORAGE_KEY, entries);
};

// Generate unique ID for new entries
export const generateEntryId = (type: 'manual' | 'auto'): string => {
  const prefix = type === 'auto' ? 'AUTO' : 'JE';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Create automatic journal entry from sales (POS)
 */
export const createSalesJournalEntry = (
  invoiceNumber: string,
  amount: number,
  paymentMethod: 'cash' | 'card' | 'credit',
  customerId?: string,
  customerName?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  let debitAccount = getAccountCodeByName('الصندوق'); // '1010'
  if (paymentMethod === 'card') {
    debitAccount = getAccountCodeByName('البنك'); // '1020'
  } else if (paymentMethod === 'credit') {
    debitAccount = getAccountCodeByName('العملاء'); // '1030'
  }

  const description = customerName
    ? `بيع ${paymentMethod === 'credit' ? 'على الحساب' : paymentMethod === 'card' ? 'بطاقة' : 'نقدي'} - ${customerName}`
    : `بيع ${paymentMethod === 'credit' ? 'على الحساب' : paymentMethod === 'card' ? 'بطاقة' : 'نقدي'}`;

  return {
    id: generateEntryId('auto'),
    date: today,
    description,
    debitAccount,
    creditAccount: getAccountCodeByName('إيرادات المبيعات'), // '4010'
    amount,
    reference: invoiceNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'بيع',
    sourceReference: invoiceNumber,
    createdAt: now
  };
};

/**
 * Create automatic journal entry from purchases
 */
export const createPurchaseJournalEntry = (
  purchaseOrderNumber: string,
  amount: number,
  paymentMethod: 'cash' | 'credit' | 'bankWithdrawal',
  supplierId?: string,
  supplierName?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  let creditAccount = getAccountCodeByName('الصندوق'); // '1010'
  if (paymentMethod === 'credit') {
    creditAccount = getAccountCodeByName('الموردين'); // '2010'
  } else if (paymentMethod === 'bankWithdrawal') {
    creditAccount = getAccountCodeByName('البنك'); // '1020'
  }

  const paymentMethodText = paymentMethod === 'cash' ? 'نقداً'
    : paymentMethod === 'credit' ? 'على الحساب'
      : 'صرف من بنك';

  const description = supplierName
    ? `شراء بضاعة ${paymentMethodText} - ${supplierName}`
    : `شراء بضاعة ${paymentMethodText}`;

  return {
    id: generateEntryId('auto'),
    date: today,
    description,
    debitAccount: getAccountCodeByName('المخزون'), // '1040'
    creditAccount,
    amount,
    reference: purchaseOrderNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'شراء',
    sourceReference: purchaseOrderNumber,
    createdAt: now
  };
};

/**
 * Create complete purchase journal entries with mixed payment methods
 * Supports cash, credit, transfer, and bankWithdrawal payments in any combination
 * Returns array of entries: [purchase entries for each payment method]
 */
export const createMixedPaymentPurchaseJournalEntries = (
  purchaseOrderNumber: string,
  amount: number,
  paymentBreakdown: {
    cash: number;
    credit: number;
    bankWithdrawal: number;
  },
  supplierId?: string,
  supplierName?: string,
  selectedBankId?: string
): JournalEntry[] => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const entries: JournalEntry[] = [];

  const supplierInfo = supplierName ? ` - ${supplierName}` : '';

  // Create entry for cash payment
  if (paymentBreakdown.cash > 0) {
    entries.push({
      id: generateEntryId('auto'),
      date: today,
      description: `شراء بضاعة نقداً${supplierInfo}`,
      debitAccount: getAccountCodeByName('المخزون'), // '1040'
      creditAccount: getAccountCodeByName('الصندوق'), // '1010'
      amount: paymentBreakdown.cash,
      reference: purchaseOrderNumber,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'شراء',
      sourceReference: purchaseOrderNumber,
      createdAt: now
    });
  }

  // Create entry for credit payment
  if (paymentBreakdown.credit > 0) {
    entries.push({
      id: generateEntryId('auto'),
      date: today,
      description: `شراء بضاعة على الحساب${supplierInfo}`,
      debitAccount: getAccountCodeByName('المخزون'), // '1040'
      creditAccount: getAccountCodeByName('الموردين'), // '2010'
      amount: paymentBreakdown.credit,
      reference: purchaseOrderNumber,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'شراء',
      sourceReference: purchaseOrderNumber,
      createdAt: now
    });
  }

  // Create entry for bank withdrawal payment
  if (paymentBreakdown.bankWithdrawal > 0) {
    const bankInfo = selectedBankId ? ` - بنك: ${selectedBankId}` : '';
    entries.push({
      id: generateEntryId('auto'),
      date: today,
      description: `شراء بضاعة صرف من بنك${bankInfo}${supplierInfo}`,
      debitAccount: getAccountCodeByName('المخزون'), // '1040'
      creditAccount: getAccountCodeByName('البنك'), // '1020'
      amount: paymentBreakdown.bankWithdrawal,
      reference: purchaseOrderNumber,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'شراء',
      sourceReference: purchaseOrderNumber,
      createdAt: now
    });
  }

  return entries;
};

/**
 * Create automatic journal entry from inventory receipt (transfer between warehouses)
 */
export const createInventoryReceiptEntry = (
  receiptNumber: string,
  amount: number,
  fromWarehouse?: string,
  toWarehouse?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const description = fromWarehouse && toWarehouse
    ? `توريد مخزون من ${fromWarehouse} إلى ${toWarehouse}`
    : `توريد مخزون - ${toWarehouse || 'مستودع'}`;

  return {
    id: generateEntryId('auto'),
    date: today,
    description,
    debitAccount: toWarehouse ? `المخزون - ${toWarehouse}` : 'المخزون',
    creditAccount: fromWarehouse ? `المخزون - ${fromWarehouse}` : 'المخزون',
    amount,
    reference: receiptNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'مخزون_توريد',
    sourceReference: receiptNumber,
    createdAt: now
  };
};

/**
 * Create journal entry for inventory receipt (from external source)
 * Used when receiving inventory from suppliers, cash, or other accounts
 */
export const createInventoryReceiptFromAccountEntry = (
  receiptNumber: string,
  amount: number,
  creditAccount: string, // الحساب الدائن (مورد، صندوق، بنك، حساب مخصص)
  warehouse?: string,
  description?: string,
  includeTax: boolean = false,
  taxAmount: number = 0
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const totalAmount = includeTax ? amount + taxAmount : amount;
  const desc = description || `توريد مخزون${warehouse ? ` إلى ${warehouse}` : ''}${includeTax ? ' (شامل الضريبة)' : ' (بدون ضريبة)'}`;

  return {
    id: generateEntryId('auto'),
    date: today,
    description: desc,
    debitAccount: warehouse ? `المخزون - ${warehouse}` : 'المخزون',
    creditAccount,
    amount: totalAmount,
    reference: receiptNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'مخزون_توريد',
    sourceReference: receiptNumber,
    createdAt: now
  };
};

/**
 * Create automatic journal entry from inventory issue (for consumption)
 */
export const createInventoryIssueEntry = (
  issueNumber: string,
  amount: number,
  purpose: string,
  warehouse?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  return {
    id: generateEntryId('auto'),
    date: today,
    description: `صرف مخزون - ${purpose}${warehouse ? ` من ${warehouse}` : ''}`,
    debitAccount: 'مصروفات الاستهلاك',
    creditAccount: warehouse ? `المخزون - ${warehouse}` : 'المخزون',
    amount,
    reference: issueNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'مخزون_صرف',
    sourceReference: issueNumber,
    createdAt: now
  };
};

/**
 * Create journal entry for inventory issue (to specific account)
 * Used when issuing inventory to expenses, losses, company account, etc.
 */
export const createInventoryIssueToAccountEntry = (
  issueNumber: string,
  amount: number,
  debitAccount: string, // الحساب المدين (مصروفات، خسائر، حساب الشركة، حساب مخصص)
  warehouse?: string,
  description?: string,
  reason?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const desc = description || `صرف مخزون${warehouse ? ` من ${warehouse}` : ''}${reason ? ` - ${reason}` : ''}`;

  return {
    id: generateEntryId('auto'),
    date: today,
    description: desc,
    debitAccount,
    creditAccount: warehouse ? `المخزون - ${warehouse}` : 'المخزون',
    amount,
    reference: issueNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'مخزون_صرف',
    sourceReference: issueNumber,
    createdAt: now
  };
};

/**
 * Create automatic journal entry from inventory adjustment
 */
export const createInventoryAdjustmentEntry = (
  adjustmentNumber: string,
  amount: number,
  adjustmentType: 'increase' | 'decrease',
  reason: string,
  warehouse?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  if (adjustmentType === 'increase') {
    return {
      id: generateEntryId('auto'),
      date: today,
      description: `تسوية مخزون - زيادة - ${reason}${warehouse ? ` في ${warehouse}` : ''}`,
      debitAccount: warehouse ? `المخزون - ${warehouse}` : 'المخزون',
      creditAccount: 'مخزون أول المدة',
      amount,
      reference: adjustmentNumber,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'مخزون_تسوية',
      sourceReference: adjustmentNumber,
      createdAt: now
    };
  } else {
    return {
      id: generateEntryId('auto'),
      date: today,
      description: `تسوية مخزون - نقص - ${reason}${warehouse ? ` في ${warehouse}` : ''}`,
      debitAccount: 'مصروفات نقص المخزون',
      creditAccount: warehouse ? `المخزون - ${warehouse}` : 'المخزون',
      amount,
      reference: adjustmentNumber,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'مخزون_تسوية',
      sourceReference: adjustmentNumber,
      createdAt: now
    };
  }
};

/**
 * Create automatic journal entry from opening inventory
 */
export const createOpeningInventoryEntry = (
  entryNumber: string,
  amount: number,
  warehouse?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  return {
    id: generateEntryId('auto'),
    date: today,
    description: `مخزون أول المدة${warehouse ? ` - ${warehouse}` : ''}`,
    debitAccount: warehouse ? `المخزون - ${warehouse}` : 'المخزون',
    creditAccount: 'مخزون أول المدة',
    amount,
    reference: entryNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'مخزون_أول_مدة',
    sourceReference: entryNumber,
    createdAt: now
  };
};

/**
 * Create automatic journal entry from cash receipt voucher
 */
export const createCashReceiptEntry = (
  receiptNumber: string,
  amount: number,
  paymentMethod: 'cash' | 'card',
  customerId?: string,
  customerName?: string,
  description?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const debitAccount = paymentMethod === 'cash'
    ? getAccountCodeByName('الصندوق') // '1010'
    : getAccountCodeByName('البنك'); // '1020'

  return {
    id: generateEntryId('auto'),
    date: today,
    description: description || `سند قبض ${paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}${customerName ? ` من ${customerName}` : ''}`,
    debitAccount,
    creditAccount: getAccountCodeByName('العملاء'), // '1030'
    amount,
    reference: receiptNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'سند_قبض',
    sourceReference: receiptNumber,
    createdAt: now
  };
};

/**
 * Create automatic journal entry from payment voucher
 */
export const createPaymentVoucherEntry = (
  voucherNumber: string,
  amount: number,
  paymentMethod: 'cash' | 'card',
  supplierId?: string,
  supplierName?: string,
  description?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const creditAccount = paymentMethod === 'cash'
    ? getAccountCodeByName('الصندوق') // '1010'
    : getAccountCodeByName('البنك'); // '1020'

  return {
    id: generateEntryId('auto'),
    date: today,
    description: description || `سند صرف ${paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}${supplierName ? ` إلى ${supplierName}` : ''}`,
    debitAccount: getAccountCodeByName('الموردين'), // '2010'
    creditAccount,
    amount,
    reference: voucherNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'سند_صرف',
    sourceReference: voucherNumber,
    createdAt: now
  };
};

/**
 * Create sales journal entries (revenue + COGS)
 * Returns array of entries: [revenue entry, COGS entry]
 */
export const createCompleteSalesJournalEntries = (
  invoiceNumber: string,
  revenueAmount: number,
  cogsAmount: number,
  paymentMethod: 'cash' | 'card' | 'credit',
  customerId?: string,
  customerName?: string
): JournalEntry[] => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  let debitAccount = getAccountCodeByName('الصندوق'); // '1010'
  if (paymentMethod === 'card') {
    debitAccount = getAccountCodeByName('البنك'); // '1020'
  } else if (paymentMethod === 'credit') {
    debitAccount = getAccountCodeByName('العملاء'); // '1030'
  }

  const description = customerName
    ? `بيع ${paymentMethod === 'credit' ? 'على الحساب' : paymentMethod === 'card' ? 'بطاقة' : 'نقدي'} - ${customerName}`
    : `بيع ${paymentMethod === 'credit' ? 'على الحساب' : paymentMethod === 'card' ? 'بطاقة' : 'نقدي'}`;

  // Revenue entry
  const revenueEntry: JournalEntry = {
    id: generateEntryId('auto'),
    date: today,
    description,
    debitAccount,
    creditAccount: getAccountCodeByName('إيرادات المبيعات'), // '4010'
    amount: revenueAmount,
    reference: invoiceNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'بيع',
    sourceReference: invoiceNumber,
    createdAt: now
  };

  // COGS entry (only for products, not services)
  const cogsEntry: JournalEntry = {
    id: generateEntryId('auto'),
    date: today,
    description: `تكلفة البضاعة المباعة - ${invoiceNumber}`,
    debitAccount: getAccountCodeByName('تكلفة البضاعة المباعة'), // '5010'
    creditAccount: getAccountCodeByName('المخزون'), // '1040'
    amount: cogsAmount,
    reference: `${invoiceNumber}-COGS`,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'بيع',
    sourceReference: invoiceNumber,
    createdAt: now
  };

  return cogsAmount > 0 ? [revenueEntry, cogsEntry] : [revenueEntry];
};

/**
 * Create complete sales journal entries with mixed payment methods
 * Supports cash, card, and credit payments in any combination
 * Returns array of entries: [revenue entries for each payment method, COGS entry]
 */
export const createMixedPaymentSalesJournalEntries = (
  invoiceNumber: string,
  revenueAmount: number,
  cogsAmount: number,
  paymentBreakdown: { cash: number; card: number; credit: number },
  customerId?: string,
  customerName?: string,
  cashierName?: string
): JournalEntry[] => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const entries: JournalEntry[] = [];

  const cashierInfo = cashierName ? ` - كاشير: ${cashierName}` : '';

  // Create revenue entry for cash payment
  if (paymentBreakdown.cash > 0) {
    entries.push({
      id: generateEntryId('auto'),
      date: today,
      description: customerName
        ? `بيع نقدي - ${customerName}${cashierInfo}`
        : `بيع نقدي${cashierInfo}`,
      debitAccount: getAccountCodeByName('الصندوق'), // '1010'
      creditAccount: getAccountCodeByName('إيرادات المبيعات'), // '4010'
      amount: paymentBreakdown.cash,
      reference: invoiceNumber,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'بيع',
      sourceReference: invoiceNumber,
      createdAt: now
    });
  }

  // Create revenue entry for card payment
  if (paymentBreakdown.card > 0) {
    entries.push({
      id: generateEntryId('auto'),
      date: today,
      description: customerName
        ? `بيع بطاقة - ${customerName}${cashierInfo}`
        : `بيع بطاقة${cashierInfo}`,
      debitAccount: getAccountCodeByName('البنك'), // '1020'
      creditAccount: getAccountCodeByName('إيرادات المبيعات'), // '4010'
      amount: paymentBreakdown.card,
      reference: invoiceNumber,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'بيع',
      sourceReference: invoiceNumber,
      createdAt: now
    });
  }

  // Create revenue entry for credit payment
  if (paymentBreakdown.credit > 0) {
    entries.push({
      id: generateEntryId('auto'),
      date: today,
      description: customerName
        ? `بيع على الحساب - ${customerName}${cashierInfo}`
        : `بيع على الحساب${cashierInfo}`,
      debitAccount: getAccountCodeByName('العملاء'), // '1030'
      creditAccount: getAccountCodeByName('إيرادات المبيعات'), // '4010'
      amount: paymentBreakdown.credit,
      reference: invoiceNumber,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'بيع',
      sourceReference: invoiceNumber,
      createdAt: now
    });
  }

  // COGS entry (only for products, not services)
  if (cogsAmount > 0) {
    entries.push({
      id: generateEntryId('auto'),
      date: today,
      description: `تكلفة البضاعة المباعة - ${invoiceNumber}${cashierInfo}`,
      debitAccount: getAccountCodeByName('تكلفة البضاعة المباعة'), // '5010'
      creditAccount: getAccountCodeByName('المخزون'), // '1040'
      amount: cogsAmount,
      reference: `${invoiceNumber}-COGS`,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'بيع',
      sourceReference: invoiceNumber,
      createdAt: now
    });
  }

  return entries;
};

/**
 * Create sales return journal entries (reverse of sales)
 * Returns array of entries: [revenue reversal, COGS reversal, refund]
 */
export const createSalesReturnJournalEntries = (
  returnNumber: string,
  originalInvoiceNumber: string,
  revenueAmount: number,
  cogsAmount: number,
  refundMethod: 'cash' | 'card' | 'credit',
  customerId?: string,
  customerName?: string
): JournalEntry[] => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  let creditAccount = getAccountCodeByName('الصندوق'); // '1010'
  if (refundMethod === 'card') {
    creditAccount = getAccountCodeByName('البنك'); // '1020'
  } else if (refundMethod === 'credit') {
    creditAccount = getAccountCodeByName('العملاء'); // '1030'
  }

  const description = customerName
    ? `مرتجع مبيعات ${refundMethod === 'credit' ? 'على الحساب' : refundMethod === 'card' ? 'بطاقة' : 'نقدي'} - ${customerName}`
    : `مرتجع مبيعات ${refundMethod === 'credit' ? 'على الحساب' : refundMethod === 'card' ? 'بطاقة' : 'نقدي'}`;

  const entries: JournalEntry[] = [];

  // Revenue reversal entry
  entries.push({
    id: generateEntryId('auto'),
    date: today,
    description: `إلغاء إيرادات - ${description}`,
    debitAccount: getAccountCodeByName('إيرادات المبيعات'), // '4010'
    creditAccount,
    amount: revenueAmount,
    reference: returnNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'مرتجع_مبيعات',
    sourceReference: originalInvoiceNumber,
    createdAt: now
  });

  // COGS reversal entry (restore inventory value)
  if (cogsAmount > 0) {
    entries.push({
      id: generateEntryId('auto'),
      date: today,
      description: `إعادة تكلفة البضاعة المرجعة - ${returnNumber}`,
      debitAccount: getAccountCodeByName('المخزون'), // '1040'
      creditAccount: getAccountCodeByName('تكلفة البضاعة المباعة'), // '5010'
      amount: cogsAmount,
      reference: `${returnNumber}-COGS`,
      status: 'مُعتمد',
      type: 'auto',
      operationType: 'مرتجع_مبيعات',
      sourceReference: originalInvoiceNumber,
      createdAt: now
    });
  }

  return entries;
};

/**
 * Create purchase return journal entries (reverse of purchases)
 * Returns array of entries: [inventory reversal entry]
 */
export const createPurchaseReturnJournalEntries = (
  returnNumber: string,
  originalPurchaseOrderNumber: string,
  amount: number,
  refundMethod: 'cash' | 'credit',
  supplierId?: string,
  supplierName?: string
): JournalEntry[] => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  // For purchase return, we reduce inventory and either:
  // - reduce liability to supplier (الموردين) if credit
  // - increase cash (الصندوق) if cash refund
  const debitAccount =
    refundMethod === 'cash'
      ? getAccountCodeByName('الصندوق') // '1010'
      : getAccountCodeByName('الموردين'); // '2010'

  const description = supplierName
    ? `مرتجع مشتريات ${refundMethod === 'credit' ? 'على الحساب' : 'نقداً'} - ${supplierName}`
    : `مرتجع مشتريات ${refundMethod === 'credit' ? 'على الحساب' : 'نقداً'}`;

  const entry: JournalEntry = {
    id: generateEntryId('auto'),
    date: today,
    description,
    debitAccount,
    creditAccount: getAccountCodeByName('المخزون'), // '1040'
    amount,
    reference: returnNumber,
    status: 'مُعتمد',
    type: 'auto',
    operationType: 'مرتجع_مشتريات',
    sourceReference: originalPurchaseOrderNumber,
    createdAt: now
  };

  return [entry];
};

/**
 * Add a new journal entry
 */
export const addJournalEntry = (entry: JournalEntry): void => {
  const entries = loadJournalEntries();
  entries.push(entry);
  saveJournalEntries(entries);
};

/**
 * Add multiple journal entries at once
 */
export const addJournalEntries = (entries: JournalEntry[]): void => {
  const allEntries = loadJournalEntries();
  allEntries.push(...entries);
  saveJournalEntries(allEntries);
};

/**
 * Get all journal entries
 */
export const getAllJournalEntries = (): JournalEntry[] => {
  return loadJournalEntries();
};

/**
 * Get entries by type
 */
export const getEntriesByType = (type: 'auto' | 'manual'): JournalEntry[] => {
  return loadJournalEntries().filter(entry => entry.type === type);
};

/**
 * Get entries by operation type
 */
export const getEntriesByOperationType = (operationType: JournalEntry['operationType']): JournalEntry[] => {
  return loadJournalEntries().filter(entry => entry.operationType === operationType);
};

