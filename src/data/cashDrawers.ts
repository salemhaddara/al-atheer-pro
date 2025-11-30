/**
 * Cash Drawer Management System
 * Manages cash drawers for multiple POS terminals across branches
 */

import { dataCache } from '../utils/dataCache';

export interface CashDrawer {
  posId: string;              // POS terminal ID (e.g., 'pos-1', 'pos-2')
  branchId: string;           // Branch ID
  branchName: string;         // Branch name
  employeeId?: string;        // Assigned employee ID
  employeeName?: string;       // Assigned employee name
  currentBalance: number;     // Current balance in drawer
  openingBalance: number;     // Opening balance for current day
  lastReconciliationDate: string; // Last close date (YYYY-MM-DD)
  lastReconciliationId?: string;  // Last reconciliation record ID
  status: 'open' | 'closed';  // Current status
  createdAt: string;          // Creation date
  updatedAt: string;          // Last update date
}

export interface DrawerReconciliation {
  id: string;
  posId: string;
  date: string;               // Reconciliation date (YYYY-MM-DD)
  openingBalance: number;     // Opening balance for that day
  salesCash: number;          // Cash from sales during day
  expectedBalance: number;    // openingBalance + salesCash
  actualCounted: number;      // Actual money counted
  discrepancy: number;        // actualCounted - expectedBalance
  discrepancyReason?: string; // Reason for discrepancy
  closedBy: string;           // User ID who closed
  closedByName: string;        // User name who closed
  status: 'closed' | 'discrepancy'; // Reconciliation status
  notes?: string;             // Additional notes
  createdAt: string;          // Record creation time
}

export interface DrawerTransaction {
  id: string;
  posId: string;
  type: 'opening' | 'sale' | 'return' | 'manual_add' | 'manual_deduct' | 'closing';
  amount: number;             // Positive for add, negative for deduct
  description: string;
  reference?: string;          // Invoice number, etc.
  userId: string;
  userName: string;
  date: string;               // Transaction date
  createdAt: string;          // Record creation time
}

// Storage keys
const DRAWERS_STORAGE_KEY = 'cash_drawers';
const RECONCILIATIONS_STORAGE_KEY = 'drawer_reconciliations';
const TRANSACTIONS_STORAGE_KEY = 'drawer_transactions';

// Initialize with default drawers
const defaultDrawers: Record<string, CashDrawer> = {
  'pos-1': {
    posId: 'pos-1',
    branchId: 'branch-1',
    branchName: 'الفرع الرئيسي',
    employeeId: undefined,
    employeeName: undefined,
    currentBalance: 0,
    openingBalance: 0,
    lastReconciliationDate: new Date().toISOString().split('T')[0],
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Load drawers from cache/localStorage
export const loadDrawers = (): Record<string, CashDrawer> => {
  return dataCache.getFromLocalStorage(DRAWERS_STORAGE_KEY, defaultDrawers);
};

// Save drawers to localStorage
export const saveDrawers = (drawers: Record<string, CashDrawer>): void => {
  dataCache.saveToLocalStorage(DRAWERS_STORAGE_KEY, drawers);
};

// Load reconciliations
export const loadReconciliations = (): DrawerReconciliation[] => {
  return dataCache.getFromLocalStorage(RECONCILIATIONS_STORAGE_KEY, []);
};

// Save reconciliations
export const saveReconciliations = (reconciliations: DrawerReconciliation[]): void => {
  dataCache.saveToLocalStorage(RECONCILIATIONS_STORAGE_KEY, reconciliations);
};

// Load transactions
export const loadTransactions = (): DrawerTransaction[] => {
  return dataCache.getFromLocalStorage(TRANSACTIONS_STORAGE_KEY, []);
};

// Save transactions
export const saveTransactions = (transactions: DrawerTransaction[]): void => {
  dataCache.saveToLocalStorage(TRANSACTIONS_STORAGE_KEY, transactions);
};

/**
 * Get drawer by POS ID
 */
export const getDrawer = (posId: string): CashDrawer | null => {
  const drawers = loadDrawers();
  return drawers[posId] || null;
};

/**
 * Get all drawers for a specific employee
 */
export const getDrawersByEmployee = (employeeId: string): CashDrawer[] => {
  const drawers = loadDrawers();
  return Object.values(drawers).filter(d => d.employeeId === employeeId);
};

/**
 * Get all drawers for a specific branch
 */
export const getDrawersByBranch = (branchId: string): CashDrawer[] => {
  const drawers = loadDrawers();
  return Object.values(drawers).filter(d => d.branchId === branchId);
};

/**
 * Check if drawer needs daily opening (new day started)
 */
export const checkAndOpenDrawer = (posId: string): CashDrawer | null => {
  const drawers = loadDrawers();
  const drawer = drawers[posId];
  
  if (!drawer) return null;

  const today = new Date().toISOString().split('T')[0];
  const lastDate = drawer.lastReconciliationDate;

  // If it's a new day and drawer was closed, auto-open it
  if (today > lastDate && drawer.status === 'closed') {
    // Carry over the balance from previous day as opening balance
    const carryOverBalance = drawer.currentBalance;
    
    drawer.openingBalance = carryOverBalance;
    drawer.currentBalance = carryOverBalance;
    drawer.status = 'open';
    drawer.lastReconciliationDate = today;
    drawer.updatedAt = new Date().toISOString();

    // Record opening transaction
    addTransaction({
      posId,
      type: 'opening',
      amount: carryOverBalance,
      description: `فتح الدرج - رصيد محمول من اليوم السابق`,
      userId: 'system',
      userName: 'النظام',
      date: today
    });

    saveDrawers(drawers);
    return drawer;
  }

  // If drawer is already open for today, just return it
  if (drawer.status === 'open' && lastDate === today) {
    return drawer;
  }

  return drawer;
};

/**
 * Add money to drawer (opening, manual add, or sales)
 */
export const addToDrawer = (
  posId: string,
  amount: number,
  type: 'opening' | 'sale' | 'manual_add',
  userId: string,
  userName: string,
  description?: string,
  reference?: string
): boolean => {
  const drawers = loadDrawers();
  const drawer = drawers[posId];

  if (!drawer) {
    console.error(`Drawer ${posId} not found`);
    return false;
  }

  // Auto-open drawer if needed
  checkAndOpenDrawer(posId);

  // Update balance
  drawer.currentBalance += amount;
  
  // If it's opening, update opening balance
  if (type === 'opening') {
    drawer.openingBalance += amount;
  }

  drawer.updatedAt = new Date().toISOString();
  drawer.status = 'open';

  // Record transaction
  addTransaction({
    posId,
    type,
    amount,
    description: description || `إضافة نقدية - ${type === 'opening' ? 'فتح الدرج' : type === 'sale' ? 'بيع' : 'إضافة يدوية'}`,
    reference,
    userId,
    userName,
    date: new Date().toISOString().split('T')[0]
  });

  saveDrawers(drawers);
  return true;
};

/**
 * Deduct money from drawer (returns, manual deduct)
 */
export const deductFromDrawer = (
  posId: string,
  amount: number,
  type: 'return' | 'manual_deduct',
  userId: string,
  userName: string,
  description?: string,
  reference?: string
): boolean => {
  const drawers = loadDrawers();
  const drawer = drawers[posId];

  if (!drawer) {
    console.error(`Drawer ${posId} not found`);
    return false;
  }

  if (drawer.currentBalance < amount) {
    console.error(`Insufficient balance in drawer ${posId}. Available: ${drawer.currentBalance}, Requested: ${amount}`);
    return false;
  }

  drawer.currentBalance -= amount;
  drawer.updatedAt = new Date().toISOString();

  // Record transaction
  addTransaction({
    posId,
    type,
    amount: -amount,
    description: description || `خصم نقدي - ${type === 'return' ? 'مرتجع' : 'خصم يدوي'}`,
    reference,
    userId,
    userName,
    date: new Date().toISOString().split('T')[0]
  });

  saveDrawers(drawers);
  return true;
};

/**
 * Close drawer (reconciliation)
 */
export const closeDrawer = (
  posId: string,
  actualCounted: number,
  userId: string,
  userName: string,
  discrepancyReason?: string,
  notes?: string
): { success: boolean; reconciliation?: DrawerReconciliation; error?: string } => {
  const drawers = loadDrawers();
  const drawer = drawers[posId];

  if (!drawer) {
    return { success: false, error: 'Drawer not found' };
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Calculate expected balance
  const salesCash = drawer.currentBalance - drawer.openingBalance;
  const expectedBalance = drawer.openingBalance + salesCash;
  const discrepancy = actualCounted - expectedBalance;

  // Create reconciliation record
  const reconciliation: DrawerReconciliation = {
    id: `REC-${posId}-${Date.now()}`,
    posId,
    date: today,
    openingBalance: drawer.openingBalance,
    salesCash,
    expectedBalance,
    actualCounted,
    discrepancy,
    discrepancyReason: discrepancy !== 0 ? discrepancyReason : undefined,
    closedBy: userId,
    closedByName: userName,
    status: discrepancy === 0 ? 'closed' : 'discrepancy',
    notes,
    createdAt: new Date().toISOString()
  };

  // Save reconciliation
  const reconciliations = loadReconciliations();
  reconciliations.push(reconciliation);
  saveReconciliations(reconciliations);

  // Update drawer
  drawer.currentBalance = 0; // Reset to 0 (money taken)
  drawer.openingBalance = 0;
  drawer.status = 'closed';
  drawer.lastReconciliationDate = today;
  drawer.lastReconciliationId = reconciliation.id;
  drawer.updatedAt = new Date().toISOString();

  // Record closing transaction
  addTransaction({
    posId,
    type: 'closing',
    amount: -actualCounted,
    description: `إغلاق الدرج - ${discrepancy === 0 ? 'مطابق' : `فارق: ${discrepancy > 0 ? '+' : ''}${discrepancy}`}`,
    userId,
    userName,
    date: today
  });

  saveDrawers(drawers);

  return { success: true, reconciliation };
};

/**
 * Add transaction record
 */
const addTransaction = (transaction: Omit<DrawerTransaction, 'id' | 'createdAt'>): void => {
  const transactions = loadTransactions();
  transactions.push({
    ...transaction,
    id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  });
  saveTransactions(transactions);
};

/**
 * Get drawer transactions
 */
export const getDrawerTransactions = (posId: string, date?: string): DrawerTransaction[] => {
  const transactions = loadTransactions();
  let filtered = transactions.filter(t => t.posId === posId);
  
  if (date) {
    filtered = filtered.filter(t => t.date === date);
  }
  
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Get drawer reconciliations
 */
export const getDrawerReconciliations = (posId: string): DrawerReconciliation[] => {
  const reconciliations = loadReconciliations();
  return reconciliations
    .filter(r => r.posId === posId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Create or update POS drawer
 */
export const createOrUpdateDrawer = (
  posId: string,
  branchId: string,
  branchName: string,
  employeeId?: string,
  employeeName?: string
): CashDrawer => {
  const drawers = loadDrawers();
  const existing = drawers[posId];

  if (existing) {
    // Update existing
    existing.branchId = branchId;
    existing.branchName = branchName;
    existing.employeeId = employeeId;
    existing.employeeName = employeeName;
    existing.updatedAt = new Date().toISOString();
    saveDrawers(drawers);
    return existing;
  } else {
    // Create new
    const newDrawer: CashDrawer = {
      posId,
      branchId,
      branchName,
      employeeId,
      employeeName,
      currentBalance: 0,
      openingBalance: 0,
      lastReconciliationDate: new Date().toISOString().split('T')[0],
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    drawers[posId] = newDrawer;
    saveDrawers(drawers);
    return newDrawer;
  }
};

