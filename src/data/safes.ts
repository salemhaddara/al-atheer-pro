/**
 * Central Safes Management
 * This file manages cash safes across the entire system
 */

import { dataCache } from '../utils/dataCache';

export interface Safe {
    id: string;
    name: string;
    balance: number;
}

// Storage key for localStorage
const STORAGE_KEY = 'safes_balance';

// Initialize with default safes
const defaultSafes: Record<string, Safe> = {
    'main': { id: 'main', name: 'الخزينة الرئيسية', balance: 100000 },
    'pos': { id: 'pos', name: 'خزينة نقاط البيع', balance: 5000 },
};

// Load safes from cache/localStorage or use defaults
export const loadSafes = (): Record<string, Safe> => {
    return dataCache.getFromLocalStorage(STORAGE_KEY, defaultSafes);
};

// Save safes to localStorage and update cache
export const saveSafes = (safes: Record<string, Safe>): void => {
    dataCache.saveToLocalStorage(STORAGE_KEY, safes);
};

/**
 * Add amount to safe (for sales)
 */
export const addToSafe = (safeId: string, amount: number): boolean => {
    const safes = loadSafes();
    const safe = safes[safeId];

    if (!safe) {
        console.error(`Safe ${safeId} not found`);
        return false;
    }

    safes[safeId] = {
        ...safe,
        balance: safe.balance + amount
    };

    saveSafes(safes);
    return true;
};

/**
 * Deduct amount from safe (for returns or payments)
 */
export const deductFromSafe = (safeId: string, amount: number): boolean => {
    const safes = loadSafes();
    const safe = safes[safeId];

    if (!safe) {
        console.error(`Safe ${safeId} not found`);
        return false;
    }

    if (safe.balance < amount) {
        console.error(`Insufficient balance in safe ${safeId}. Available: ${safe.balance}, Requested: ${amount}`);
        return false;
    }

    safes[safeId] = {
        ...safe,
        balance: safe.balance - amount
    };

    saveSafes(safes);
    return true;
};

/**
 * Get safe balance
 */
export const getSafeBalance = (safeId: string): number => {
    const safes = loadSafes();
    return safes[safeId]?.balance ?? 0;
};

