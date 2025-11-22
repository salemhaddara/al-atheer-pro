/**
 * Centralized Data Cache Manager
 * Prevents repeated localStorage reads and improves performance
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

  /**
   * Get data from cache or load it using the provided loader function
   */
  get<T>(key: string, loader: () => T): T {
    const cached = this.cache.get(key);
    
    // Check if cache is valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }

    // Load fresh data
    const data = loader();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate cache for a specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get data from localStorage with caching
   */
  getFromLocalStorage<T>(storageKey: string, defaultValue: T): T {
    return this.get<T>(storageKey, () => {
      if (typeof window === 'undefined') return defaultValue;

      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error(`Error loading ${storageKey} from localStorage:`, error);
      }

      return defaultValue;
    });
  }

  /**
   * Save data to localStorage and update cache
   */
  saveToLocalStorage<T>(storageKey: string, data: T): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      this.set(storageKey, data);
    } catch (error) {
      console.error(`Error saving ${storageKey} to localStorage:`, error);
    }
  }
}

// Singleton instance
export const dataCache = new DataCache();

// Export helper functions for common use cases
export const getCachedData = <T>(key: string, loader: () => T): T => dataCache.get(key, loader);
export const invalidateCache = (key: string): void => dataCache.invalidate(key);
export const clearAllCache = (): void => dataCache.clear();

