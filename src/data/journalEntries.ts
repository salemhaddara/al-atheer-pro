/**
 * Central Journal Entries Management
 * This file manages all journal entries (both manual and automatic) across the entire system
 */

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  reference: string;
  status: 'مُعتمد' | 'قيد المراجعة' | 'ملغي';
  type: 'manual' | 'auto';
  operationType?: 'بيع' | 'شراء' | 'مخزون_توريد' | 'مخزون_صرف' | 'مخزون_تسوية' | 'سند_قبض' | 'سند_صرف' | 'مخزون_أول_مدة' | 'افتتاحي' | 'مرتجع_مبيعات';
  sourceReference?: string; // رابط للعملية الأصلية
  createdAt: string;
}

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

// Load entries from localStorage or use defaults
export const loadJournalEntries = (): JournalEntry[] => {
  if (typeof window === 'undefined') return defaultEntries;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading journal entries:', error);
  }
  
  return defaultEntries;
};

// Save entries to localStorage
export const saveJournalEntries = (entries: JournalEntry[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving journal entries:', error);
  }
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
  
  let debitAccount = 'الصندوق';
  if (paymentMethod === 'card') {
    debitAccount = 'البنك';
  } else if (paymentMethod === 'credit') {
    debitAccount = 'العملاء';
  }
  
  const description = customerName 
    ? `بيع ${paymentMethod === 'credit' ? 'على الحساب' : paymentMethod === 'card' ? 'بطاقة' : 'نقدي'} - ${customerName}`
    : `بيع ${paymentMethod === 'credit' ? 'على الحساب' : paymentMethod === 'card' ? 'بطاقة' : 'نقدي'}`;
  
  return {
    id: generateEntryId('auto'),
    date: today,
    description,
    debitAccount,
    creditAccount: 'إيرادات المبيعات',
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
  paymentMethod: 'cash' | 'credit',
  supplierId?: string,
  supplierName?: string
): JournalEntry => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  
  const creditAccount = paymentMethod === 'cash' ? 'الصندوق' : 'الموردين';
  
  const description = supplierName 
    ? `شراء بضاعة ${paymentMethod === 'cash' ? 'نقداً' : 'على الحساب'} - ${supplierName}`
    : `شراء بضاعة ${paymentMethod === 'cash' ? 'نقداً' : 'على الحساب'}`;
  
  return {
    id: generateEntryId('auto'),
    date: today,
    description,
    debitAccount: 'المخزون',
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
  
  const debitAccount = paymentMethod === 'cash' ? 'الصندوق' : 'البنك';
  
  return {
    id: generateEntryId('auto'),
    date: today,
    description: description || `سند قبض ${paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}${customerName ? ` من ${customerName}` : ''}`,
    debitAccount,
    creditAccount: 'العملاء',
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
  
  const creditAccount = paymentMethod === 'cash' ? 'الصندوق' : 'البنك';
  
  return {
    id: generateEntryId('auto'),
    date: today,
    description: description || `سند صرف ${paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}${supplierName ? ` إلى ${supplierName}` : ''}`,
    debitAccount: 'الموردين',
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
  
  let debitAccount = 'الصندوق';
  if (paymentMethod === 'card') {
    debitAccount = 'البنك';
  } else if (paymentMethod === 'credit') {
    debitAccount = 'العملاء';
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
    creditAccount: 'إيرادات المبيعات',
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
    debitAccount: 'تكلفة البضاعة المباعة',
    creditAccount: 'المخزون',
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
  
  let creditAccount = 'الصندوق';
  if (refundMethod === 'card') {
    creditAccount = 'البنك';
  } else if (refundMethod === 'credit') {
    creditAccount = 'العملاء';
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
    debitAccount: 'إيرادات المبيعات',
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
      debitAccount: 'المخزون',
      creditAccount: 'تكلفة البضاعة المباعة',
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

