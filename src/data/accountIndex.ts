/**
 * Account Index Management
 * This file manages employee accounts and links them to accounting system
 */

export interface AccountIndex {
  id: string;
  accountNumber: string; // رقم الحساب
  accountName: string; // اسم الحساب (اسم الموظف)
  employeeId: string; // ربط بالموظف
  accountType: 'employee' | 'customer' | 'supplier' | 'other';
  status: 'active' | 'inactive';
  createdAt: string;
}

// Storage key for localStorage
const STORAGE_KEY = 'account_index';

// Load accounts from localStorage or use defaults
export const loadAccountIndex = (): AccountIndex[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading account index:', error);
  }
  
  return [];
};

// Save accounts to localStorage
export const saveAccountIndex = (accounts: AccountIndex[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Error saving account index:', error);
  }
};

/**
 * Generate unique account number for employee
 */
export const generateEmployeeAccountNumber = (): string => {
  const year = new Date().getFullYear();
  const accounts = loadAccountIndex();
  const employeeAccounts = accounts.filter(a => a.accountType === 'employee');
  const nextNumber = employeeAccounts.length + 1;
  return `EMP-${year}-${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Create account for employee
 */
export const createEmployeeAccount = (employeeId: string, employeeName: string): AccountIndex => {
  const accounts = loadAccountIndex();
  
  // Check if account already exists
  const existing = accounts.find(a => a.employeeId === employeeId && a.accountType === 'employee');
  if (existing) {
    return existing;
  }
  
  const newAccount: AccountIndex = {
    id: `ACC-${Date.now()}`,
    accountNumber: generateEmployeeAccountNumber(),
    accountName: employeeName,
    employeeId,
    accountType: 'employee',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  accounts.push(newAccount);
  saveAccountIndex(accounts);
  return newAccount;
};

/**
 * Get account by employee ID
 */
export const getAccountByEmployeeId = (employeeId: string): AccountIndex | undefined => {
  const accounts = loadAccountIndex();
  return accounts.find(a => a.employeeId === employeeId && a.accountType === 'employee');
};

/**
 * Get all employee accounts
 */
export const getAllEmployeeAccounts = (): AccountIndex[] => {
  const accounts = loadAccountIndex();
  return accounts.filter(a => a.accountType === 'employee');
};

/**
 * Update account
 */
export const updateAccount = (accountId: string, updates: Partial<AccountIndex>): boolean => {
  const accounts = loadAccountIndex();
  const index = accounts.findIndex(a => a.id === accountId);
  
  if (index === -1) return false;
  
  accounts[index] = { ...accounts[index], ...updates };
  saveAccountIndex(accounts);
  return true;
};

