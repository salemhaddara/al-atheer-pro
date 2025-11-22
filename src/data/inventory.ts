/**
 * Central Inventory Management
 * This file manages inventory stock across the entire system
 */

import { dataCache } from '../utils/dataCache';

export interface InventoryItem {
  productId: string;
  warehouseId: string;
  quantity: number;
  costPrice: number;
}

// Storage key for localStorage
const STORAGE_KEY = 'inventory_stock';

// Initialize with default inventory
const defaultInventory: Record<string, InventoryItem> = {
  '1-1': { productId: '1', warehouseId: '1', quantity: 15, costPrice: 2500 }, // كمبيوتر محمول HP
  '2-1': { productId: '2', warehouseId: '1', quantity: 8, costPrice: 1500 }, // طابعة Canon
  '3-1': { productId: '3', warehouseId: '1', quantity: 12, costPrice: 1000 }, // شاشة Samsung
  '4-1': { productId: '4', warehouseId: '1', quantity: 25, costPrice: 200 }, // لوحة مفاتيح
  '5-1': { productId: '5', warehouseId: '1', quantity: 30, costPrice: 100 }, // ماوس
  '6-1': { productId: '6', warehouseId: '1', quantity: 10, costPrice: 350 }, // كاميرا ويب
};

// Load inventory from cache/localStorage or use defaults
export const loadInventory = (): Record<string, InventoryItem> => {
  return dataCache.getFromLocalStorage(STORAGE_KEY, defaultInventory);
};

// Save inventory to localStorage and update cache
export const saveInventory = (inventory: Record<string, InventoryItem>): void => {
  dataCache.saveToLocalStorage(STORAGE_KEY, inventory);
};

// Get inventory key
const getInventoryKey = (productId: string, warehouseId: string): string => {
  return `${productId}-${warehouseId}`;
};

/**
 * Get current stock for a product in a warehouse
 */
export const getStock = (productId: string, warehouseId: string): number => {
  const inventory = loadInventory();
  const key = getInventoryKey(productId, warehouseId);
  return inventory[key]?.quantity ?? 0;
};

/**
 * Get cost price for a product
 */
export const getCostPrice = (productId: string, warehouseId: string): number => {
  const inventory = loadInventory();
  const key = getInventoryKey(productId, warehouseId);
  return inventory[key]?.costPrice ?? 0;
};

/**
 * Reduce stock (for sales)
 */
export const reduceStock = (productId: string, warehouseId: string, quantity: number): boolean => {
  const inventory = loadInventory();
  const key = getInventoryKey(productId, warehouseId);
  const current = inventory[key];

  if (!current) {
    console.error(`Product ${productId} not found in warehouse ${warehouseId}`);
    return false;
  }

  if (current.quantity < quantity) {
    console.error(`Insufficient stock. Available: ${current.quantity}, Requested: ${quantity}`);
    return false;
  }

  inventory[key] = {
    ...current,
    quantity: current.quantity - quantity
  };

  saveInventory(inventory);
  return true;
};

/**
 * Increase stock (for returns or purchases)
 */
export const increaseStock = (productId: string, warehouseId: string, quantity: number, costPrice?: number): void => {
  const inventory = loadInventory();
  const key = getInventoryKey(productId, warehouseId);
  const current = inventory[key];

  if (current) {
    inventory[key] = {
      ...current,
      quantity: current.quantity + quantity,
      costPrice: costPrice ?? current.costPrice
    };
  } else {
    inventory[key] = {
      productId,
      warehouseId,
      quantity,
      costPrice: costPrice ?? 0
    };
  }

  saveInventory(inventory);
};

/**
 * Initialize inventory item
 */
export const initializeInventoryItem = (
  productId: string,
  warehouseId: string,
  quantity: number,
  costPrice: number
): void => {
  const inventory = loadInventory();
  const key = getInventoryKey(productId, warehouseId);

  if (!inventory[key]) {
    inventory[key] = {
      productId,
      warehouseId,
      quantity,
      costPrice
    };
    saveInventory(inventory);
  }
};

/**
 * Adjust stock (for inventory adjustments)
 * Sets the stock to a specific quantity
 */
export const adjustStock = (productId: string, warehouseId: string, newQuantity: number): boolean => {
  const inventory = loadInventory();
  const key = getInventoryKey(productId, warehouseId);
  const current = inventory[key];

  if (!current) {
    console.error(`Product ${productId} not found in warehouse ${warehouseId}`);
    return false;
  }

  inventory[key] = {
    ...current,
    quantity: newQuantity
  };

  saveInventory(inventory);
  return true;
};

/**
 * Get all products in a warehouse
 */
export const getWarehouseProducts = (warehouseId: string): InventoryItem[] => {
  const inventory = loadInventory();
  return Object.values(inventory).filter(item => item.warehouseId === warehouseId);
};

