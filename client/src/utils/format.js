/**
 * Formats a numeric price into Indian Rupee currency string.
 * Example: 18999 -> ₹18,999
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};
