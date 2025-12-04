/**
 * Pricing utility functions
 * Handles quantity-based pricing tiers
 */

export interface PricingTier {
  minQuantity: number;
  price: number;
}

/**
 * Get the price for a product based on quantity and pricing tiers
 * @param basePrice - Default/base price of the product
 * @param quantity - Quantity being purchased
 * @param pricingTiers - Optional array of pricing tiers
 * @returns The price per unit for the given quantity
 */
export const getPriceForQuantity = (
  basePrice: number,
  quantity: number,
  pricingTiers?: PricingTier[]
): number => {
  // If no pricing tiers, return base price
  if (!pricingTiers || pricingTiers.length === 0) {
    return basePrice;
  }

  // Sort tiers by minQuantity (ascending)
  const sortedTiers = [...pricingTiers].sort((a, b) => a.minQuantity - b.minQuantity);

  // Find the appropriate tier for the quantity
  // Start from the highest tier and work backwards
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (quantity >= sortedTiers[i].minQuantity) {
      return sortedTiers[i].price;
    }
  }

  // If quantity is less than the lowest tier, return base price
  return basePrice;
};

/**
 * Get the total price for a product based on quantity and pricing tiers
 * @param basePrice - Default/base price of the product
 * @param quantity - Quantity being purchased
 * @param pricingTiers - Optional array of pricing tiers
 * @returns The total price (price per unit * quantity)
 */
export const getTotalPriceForQuantity = (
  basePrice: number,
  quantity: number,
  pricingTiers?: PricingTier[]
): number => {
  const unitPrice = getPriceForQuantity(basePrice, quantity, pricingTiers);
  return unitPrice * quantity;
};


