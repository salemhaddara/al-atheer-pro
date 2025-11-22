/**
 * Vouchers Management
 * إدارة سندات القبض والصرف
 */

import { dataCache } from '../utils/dataCache';

export interface ReceiptVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  paymentMethod: 'cash' | 'card';
  fromType: 'customer' | 'other';
  fromId?: string;
  fromName: string;
  amount: number;
  description: string;
  safeId?: string;
  bankAccount?: string;
  status: 'مُعتمد' | 'قيد المراجعة' | 'ملغي';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  paymentMethod: 'cash' | 'card';
  toType: 'supplier' | 'other';
  toId?: string;
  toName: string;
  amount: number;
  description: string;
  safeId?: string;
  bankAccount?: string;
  status: 'مُعتمد' | 'قيد المراجعة' | 'ملغي';
  createdAt: string;
  updatedAt: string;
}

// Storage keys
const RECEIPT_VOUCHERS_KEY = 'receipt_vouchers';
const PAYMENT_VOUCHERS_KEY = 'payment_vouchers';

// Load receipt vouchers from cache/localStorage
export const loadReceiptVouchers = (): ReceiptVoucher[] => {
  return dataCache.getFromLocalStorage(RECEIPT_VOUCHERS_KEY, []);
};

// Save receipt vouchers to localStorage and update cache
export const saveReceiptVouchers = (vouchers: ReceiptVoucher[]): void => {
  dataCache.saveToLocalStorage(RECEIPT_VOUCHERS_KEY, vouchers);
};

// Load payment vouchers from cache/localStorage
export const loadPaymentVouchers = (): PaymentVoucher[] => {
  return dataCache.getFromLocalStorage(PAYMENT_VOUCHERS_KEY, []);
};

// Save payment vouchers to localStorage and update cache
export const savePaymentVouchers = (vouchers: PaymentVoucher[]): void => {
  dataCache.saveToLocalStorage(PAYMENT_VOUCHERS_KEY, vouchers);
};

// Add receipt voucher
export const addReceiptVoucher = (voucher: Omit<ReceiptVoucher, 'id' | 'createdAt' | 'updatedAt'>): ReceiptVoucher => {
  const vouchers = loadReceiptVouchers();
  const newVoucher: ReceiptVoucher = {
    ...voucher,
    id: `rcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  vouchers.push(newVoucher);
  saveReceiptVouchers(vouchers);
  
  return newVoucher;
};

// Update receipt voucher
export const updateReceiptVoucher = (id: string, updates: Partial<ReceiptVoucher>): ReceiptVoucher | null => {
  const vouchers = loadReceiptVouchers();
  const index = vouchers.findIndex(v => v.id === id);
  
  if (index === -1) return null;
  
  vouchers[index] = {
    ...vouchers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveReceiptVouchers(vouchers);
  return vouchers[index];
};

// Delete receipt voucher
export const deleteReceiptVoucher = (id: string): boolean => {
  const vouchers = loadReceiptVouchers();
  const filtered = vouchers.filter(v => v.id !== id);
  
  if (filtered.length === vouchers.length) return false;
  
  saveReceiptVouchers(filtered);
  return true;
};

// Add payment voucher
export const addPaymentVoucher = (voucher: Omit<PaymentVoucher, 'id' | 'createdAt' | 'updatedAt'>): PaymentVoucher => {
  const vouchers = loadPaymentVouchers();
  const newVoucher: PaymentVoucher = {
    ...voucher,
    id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  vouchers.push(newVoucher);
  savePaymentVouchers(vouchers);
  
  return newVoucher;
};

// Update payment voucher
export const updatePaymentVoucher = (id: string, updates: Partial<PaymentVoucher>): PaymentVoucher | null => {
  const vouchers = loadPaymentVouchers();
  const index = vouchers.findIndex(v => v.id === id);
  
  if (index === -1) return null;
  
  vouchers[index] = {
    ...vouchers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  savePaymentVouchers(vouchers);
  return vouchers[index];
};

// Delete payment voucher
export const deletePaymentVoucher = (id: string): boolean => {
  const vouchers = loadPaymentVouchers();
  const filtered = vouchers.filter(v => v.id !== id);
  
  if (filtered.length === vouchers.length) return false;
  
  savePaymentVouchers(filtered);
  return true;
};

// Generate voucher number
export const generateReceiptVoucherNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  return `RCP-${year}-${String(timestamp).slice(-6)}`;
};

export const generatePaymentVoucherNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  return `PAY-${year}-${String(timestamp).slice(-6)}`;
};

