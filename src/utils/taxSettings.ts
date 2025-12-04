/**
 * Tax Settings Utility
 * Provides access to system-wide tax settings
 */

/**
 * Check if prices in the system include tax
 * @returns true if prices include tax, false otherwise
 */
export function getPricesIncludeTax(): boolean {
  if (typeof window === 'undefined') {
    return true; // Default for SSR
  }
  
  const setting = localStorage.getItem('prices_include_tax');
  if (setting === null) {
    // Default to true (prices include tax)
    localStorage.setItem('prices_include_tax', 'true');
    return true;
  }
  
  return setting === 'true';
}

/**
 * Set whether prices in the system include tax
 * @param includeTax true if prices should include tax, false otherwise
 */
export function setPricesIncludeTax(includeTax: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prices_include_tax', String(includeTax));
  }
}

