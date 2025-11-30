/**
 * Central Banks Management
 * This file manages bank account balances across the entire system
 */

import { dataCache } from '../utils/dataCache';

export interface Bank {
    id: string;
    name: string;
    balance: number;
}

// Storage key for localStorage
const STORAGE_KEY = 'banks_balance';

// Initialize with default banks (matching the Banks component)
const defaultBanks: Record<string, Bank> = {
    '1': { id: '1', name: 'البنك الأهلي السعودي', balance: 450000 },
    '2': { id: '2', name: 'بنك الراجحي', balance: 320000 },
    '3': { id: '3', name: 'البنك السعودي الفرنسي', balance: 180000 },
};

// Load banks from cache/localStorage or use defaults
export const loadBanks = (): Record<string, Bank> => {
    return dataCache.getFromLocalStorage(STORAGE_KEY, defaultBanks);
};

// Save banks to localStorage and update cache
export const saveBanks = (banks: Record<string, Bank>): void => {
    dataCache.saveToLocalStorage(STORAGE_KEY, banks);
};

/**
 * Add amount to bank account (for card payments/network money)
 */
export const addToBank = (bankId: string, amount: number): boolean => {
    const banks = loadBanks();
    const bank = banks[bankId];

    if (!bank) {
        console.error(`Bank ${bankId} not found`);
        return false;
    }

    banks[bankId] = {
        ...bank,
        balance: bank.balance + amount
    };

    saveBanks(banks);
    return true;
};

/**
 * Deduct amount from bank account (for payments or transfers)
 */
export const deductFromBank = (bankId: string, amount: number): boolean => {
    const banks = loadBanks();
    const bank = banks[bankId];

    if (!bank) {
        console.error(`Bank ${bankId} not found`);
        return false;
    }

    if (bank.balance < amount) {
        console.error(`Insufficient balance in bank ${bankId}. Available: ${bank.balance}, Requested: ${amount}`);
        return false;
    }

    banks[bankId] = {
        ...bank,
        balance: bank.balance - amount
    };

    saveBanks(banks);
    return true;
};

/**
 * Get bank balance
 */
export const getBankBalance = (bankId: string): number => {
    const banks = loadBanks();
    return banks[bankId]?.balance ?? 0;
};

/**
 * Add amount to default/main bank account (used for card payments)
 * If no bankId is provided, uses the first available bank
 */
export const addToMainBank = (amount: number): boolean => {
    const banks = loadBanks();
    const bankIds = Object.keys(banks);

    if (bankIds.length === 0) {
        console.error('No banks available');
        return false;
    }

    // Use the first bank as default, or you can specify a default bank ID
    const defaultBankId = bankIds[0];
    return addToBank(defaultBankId, amount);
};

