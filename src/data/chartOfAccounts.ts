/**
 * Chart of Accounts Management
 * إدارة شجرة الحسابات
 */

import { dataCache } from '../utils/dataCache';

export type AccountType = 'أصول' | 'خصوم' | 'حقوق_ملكية' | 'إيرادات' | 'مصروفات';
export type AccountNature = 'مدين' | 'دائن'; // طبيعة الحساب

export interface Account {
  id: string;
  code: string; // رمز الحساب (مثل: 1010, 1020)
  name: string; // اسم الحساب
  parentId: string | null; // الحساب الأب (null للحسابات الرئيسية)
  type: AccountType; // نوع الحساب
  nature: AccountNature; // طبيعة الحساب
  level: number; // المستوى في الشجرة (0 للحسابات الرئيسية)
  isActive: boolean; // نشط/معطل
  openingBalance: number; // الرصيد الافتتاحي
  description?: string; // وصف الحساب
  createdAt: string;
  updatedAt: string;
}

// Storage key
const STORAGE_KEY = 'chart_of_accounts';

// Default Chart of Accounts Structure
const defaultAccounts: Account[] = [
  // الأصول (Assets) - 1000
  {
    id: 'acc-1000',
    code: '1000',
    name: 'الأصول',
    parentId: null,
    type: 'أصول',
    nature: 'مدين',
    level: 0,
    isActive: true,
    openingBalance: 0,
    description: 'حسابات الأصول',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-1010',
    code: '1010',
    name: 'الصندوق',
    parentId: 'acc-1000',
    type: 'أصول',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 100000,
    description: 'النقدية في الصندوق',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-1020',
    code: '1020',
    name: 'البنك',
    parentId: 'acc-1000',
    type: 'أصول',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 500000,
    description: 'الحسابات البنكية',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-1030',
    code: '1030',
    name: 'العملاء',
    parentId: 'acc-1000',
    type: 'أصول',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'ذمم العملاء',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-1040',
    code: '1040',
    name: 'المخزون',
    parentId: 'acc-1000',
    type: 'أصول',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'المخزون السلعي',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-1050',
    code: '1050',
    name: 'المعدات',
    parentId: 'acc-1000',
    type: 'أصول',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 15000,
    description: 'المعدات والأجهزة',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // الخصوم (Liabilities) - 2000
  {
    id: 'acc-2000',
    code: '2000',
    name: 'الخصوم',
    parentId: null,
    type: 'خصوم',
    nature: 'دائن',
    level: 0,
    isActive: true,
    openingBalance: 0,
    description: 'حسابات الخصوم',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-2010',
    code: '2010',
    name: 'الموردين',
    parentId: 'acc-2000',
    type: 'خصوم',
    nature: 'دائن',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'ذمم الموردين',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-2020',
    code: '2020',
    name: 'القروض',
    parentId: 'acc-2000',
    type: 'خصوم',
    nature: 'دائن',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'القروض والالتزامات',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // حقوق الملكية (Equity) - 3000
  {
    id: 'acc-3000',
    code: '3000',
    name: 'حقوق الملكية',
    parentId: null,
    type: 'حقوق_ملكية',
    nature: 'دائن',
    level: 0,
    isActive: true,
    openingBalance: 0,
    description: 'حقوق الملكية',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-3010',
    code: '3010',
    name: 'رأس المال',
    parentId: 'acc-3000',
    type: 'حقوق_ملكية',
    nature: 'دائن',
    level: 1,
    isActive: true,
    openingBalance: 500000,
    description: 'رأس المال الأساسي',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // الإيرادات (Revenue) - 4000
  {
    id: 'acc-4000',
    code: '4000',
    name: 'الإيرادات',
    parentId: null,
    type: 'إيرادات',
    nature: 'دائن',
    level: 0,
    isActive: true,
    openingBalance: 0,
    description: 'حسابات الإيرادات',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-4010',
    code: '4010',
    name: 'إيرادات المبيعات',
    parentId: 'acc-4000',
    type: 'إيرادات',
    nature: 'دائن',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'إيرادات بيع المنتجات',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-4020',
    code: '4020',
    name: 'إيرادات الخدمات',
    parentId: 'acc-4000',
    type: 'إيرادات',
    nature: 'دائن',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'إيرادات تقديم الخدمات',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // المصروفات (Expenses) - 5000
  {
    id: 'acc-5000',
    code: '5000',
    name: 'المصروفات',
    parentId: null,
    type: 'مصروفات',
    nature: 'مدين',
    level: 0,
    isActive: true,
    openingBalance: 0,
    description: 'حسابات المصروفات',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-5010',
    code: '5010',
    name: 'تكلفة البضاعة المباعة',
    parentId: 'acc-5000',
    type: 'مصروفات',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'تكلفة البضاعة المباعة',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-5020',
    code: '5020',
    name: 'مصروفات الإيجار',
    parentId: 'acc-5000',
    type: 'مصروفات',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'مصروفات الإيجار',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-5030',
    code: '5030',
    name: 'مصروفات الرواتب',
    parentId: 'acc-5000',
    type: 'مصروفات',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'مصروفات الرواتب والمرتبات',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-5040',
    code: '5040',
    name: 'مصروفات الاستهلاك',
    parentId: 'acc-5000',
    type: 'مصروفات',
    nature: 'مدين',
    level: 1,
    isActive: true,
    openingBalance: 0,
    description: 'مصروفات الاستهلاك',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Load accounts from cache/localStorage with lazy initialization
export const loadAccounts = (): Account[] => {
  return dataCache.get(STORAGE_KEY, () => {
    if (typeof window === 'undefined') return defaultAccounts;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const accounts = JSON.parse(stored);
        // Merge with defaults to ensure all default accounts exist
        const existingIds = new Set(accounts.map((a: Account) => a.id));
        const missingDefaults = defaultAccounts.filter(a => !existingIds.has(a.id));
        return [...accounts, ...missingDefaults].sort((a, b) => a.code.localeCompare(b.code));
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
    
    return defaultAccounts;
  });
};

// Save accounts to localStorage and update cache
export const saveAccounts = (accounts: Account[]): void => {
  dataCache.saveToLocalStorage(STORAGE_KEY, accounts);
};

// Get account by code
export const getAccountByCode = (code: string): Account | undefined => {
  const accounts = loadAccounts();
  return accounts.find(acc => acc.code === code);
};

// Get account by ID
export const getAccountById = (id: string): Account | undefined => {
  const accounts = loadAccounts();
  return accounts.find(acc => acc.id === id);
};

// Get account by name (for backward compatibility)
export const getAccountByName = (name: string): Account | undefined => {
  const accounts = loadAccounts();
  return accounts.find(acc => acc.name === name);
};

// Get account code by name (for backward compatibility with journal entries)
export const getAccountCodeByName = (name: string): string => {
  const account = getAccountByName(name);
  return account?.code || name; // Return code if found, otherwise return name for compatibility
};

// Extend Account interface to include children for tree structure
export interface AccountWithChildren extends Account {
  children?: AccountWithChildren[];
  balance?: number; // Calculated balance
}

// Get account name by code
export const getAccountNameByCode = (code: string): string => {
  const account = getAccountByCode(code);
  return account?.name || code;
};

// Build account tree structure
export const buildAccountTree = (accounts: Account[]): Account[] => {
  const accountMap = new Map<string, Account>();
  const rootAccounts: Account[] = [];

  // Create map
  accounts.forEach(account => {
    accountMap.set(account.id, { ...account });
  });

  // Build tree
  accounts.forEach(account => {
    if (account.parentId === null) {
      rootAccounts.push(accountMap.get(account.id)!);
    } else {
      const parent = accountMap.get(account.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(accountMap.get(account.id)!);
      }
    }
  });

  return rootAccounts;
};

// Get all child accounts (recursive)
export const getChildAccounts = (parentId: string, accounts: Account[]): Account[] => {
  const children = accounts.filter(acc => acc.parentId === parentId);
  const allChildren: Account[] = [...children];
  
  children.forEach(child => {
    allChildren.push(...getChildAccounts(child.id, accounts));
  });
  
  return allChildren;
};

// Check if account code is unique
export const isAccountCodeUnique = (code: string, excludeId?: string): boolean => {
  const accounts = loadAccounts();
  return !accounts.some(acc => acc.code === code && acc.id !== excludeId);
};

// Generate next account code for a parent
export const generateNextAccountCode = (parentId: string | null): string => {
  const accounts = loadAccounts();
  
  if (parentId === null) {
    // Find highest main account code
    const mainAccounts = accounts.filter(acc => acc.level === 0);
    const codes = mainAccounts.map(acc => parseInt(acc.code)).filter(c => !isNaN(c));
    const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
    return String((Math.floor(maxCode / 1000) + 1) * 1000);
  }
  
  const parent = accounts.find(acc => acc.id === parentId);
  if (!parent) return '1000';
  
  const siblings = accounts.filter(acc => acc.parentId === parentId);
  const codes = siblings.map(acc => parseInt(acc.code)).filter(c => !isNaN(c));
  const maxCode = codes.length > 0 ? Math.max(...codes) : parseInt(parent.code);
  
  return String(maxCode + 10);
};

// Add new account
export const addAccount = (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account => {
  const accounts = loadAccounts();
  
  // Validate code uniqueness
  if (!isAccountCodeUnique(account.code)) {
    throw new Error('رمز الحساب موجود مسبقاً');
  }
  
  const newAccount: Account = {
    ...account,
    id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  accounts.push(newAccount);
  saveAccounts(accounts);
  
  return newAccount;
};

// Update account
export const updateAccount = (id: string, updates: Partial<Account>): Account => {
  const accounts = loadAccounts();
  const index = accounts.findIndex(acc => acc.id === id);
  
  if (index === -1) {
    throw new Error('الحساب غير موجود');
  }
  
  // Validate code uniqueness if code is being changed
  if (updates.code && updates.code !== accounts[index].code) {
    if (!isAccountCodeUnique(updates.code, id)) {
      throw new Error('رمز الحساب موجود مسبقاً');
    }
  }
  
  accounts[index] = {
    ...accounts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveAccounts(accounts);
  return accounts[index];
};

// Delete account (soft delete by setting isActive to false)
export const deleteAccount = (id: string): void => {
  const accounts = loadAccounts();
  const account = accounts.find(acc => acc.id === id);
  
  if (!account) {
    throw new Error('الحساب غير موجود');
  }
  
  // Check if account has children
  const children = getChildAccounts(id, accounts);
  if (children.length > 0) {
    throw new Error('لا يمكن حذف الحساب لأنه يحتوي على حسابات فرعية');
  }
  
  // Soft delete
  updateAccount(id, { isActive: false });
};

// Calculate account balance from journal entries
export const calculateAccountBalance = (accountCode: string, journalEntries: any[]): number => {
  const account = getAccountByCode(accountCode);
  if (!account) return 0;
  
  const accountName = account.name;
  let balance = account.openingBalance || 0;
  
  journalEntries.forEach(entry => {
    // Support both account codes and names for backward compatibility
    const isDebit = entry.debitAccount === accountName || entry.debitAccount === accountCode;
    const isCredit = entry.creditAccount === accountName || entry.creditAccount === accountCode;
    
    if (isDebit) {
      // Debit increases assets/expenses, decreases liabilities/revenue
      if (account.nature === 'مدين') {
        balance += entry.amount;
      } else {
        balance -= entry.amount;
      }
    }
    
    if (isCredit) {
      // Credit decreases assets/expenses, increases liabilities/revenue
      if (account.nature === 'مدين') {
        balance -= entry.amount;
      } else {
        balance += entry.amount;
      }
    }
  });
  
  return balance;
};

// Validate account data
export const validateAccount = (account: Partial<Account>, excludeId?: string): string[] => {
  const errors: string[] = [];
  
  // Validate code format (should be numeric, 4 digits recommended)
  if (account.code && !/^\d+$/.test(account.code)) {
    errors.push('رمز الحساب يجب أن يكون أرقام فقط');
  }
  
  // Validate code uniqueness
  if (account.code && !isAccountCodeUnique(account.code, excludeId)) {
    errors.push('رمز الحساب موجود مسبقاً');
  }
  
  // Validate name
  if (account.name && account.name.trim().length < 2) {
    errors.push('اسم الحساب يجب أن يكون على الأقل حرفين');
  }
  
  // Validate parent account exists
  if (account.parentId) {
    const parent = getAccountById(account.parentId);
    if (!parent) {
      errors.push('الحساب الأب غير موجود');
    } else if (parent.level >= 2) {
      errors.push('لا يمكن إضافة حسابات فرعية أكثر من مستويين');
    }
  }
  
  // Validate type and nature consistency
  if (account.type && account.nature) {
    const expectedNature = account.type === 'أصول' || account.type === 'مصروفات' ? 'مدين' : 'دائن';
    if (account.nature !== expectedNature) {
      errors.push(`طبيعة الحساب يجب أن تكون ${expectedNature} للحسابات من نوع ${account.type}`);
    }
  }
  
  return errors;
};

// Check if account is used in journal entries
export const isAccountUsed = (accountCode: string, journalEntries: any[]): boolean => {
  const account = getAccountByCode(accountCode);
  if (!account) return false;
  
  return journalEntries.some(entry => 
    entry.debitAccount === account.code || 
    entry.debitAccount === account.name ||
    entry.creditAccount === account.code ||
    entry.creditAccount === account.name
  );
};


