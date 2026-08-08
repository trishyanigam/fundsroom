export interface ChallanItemInput {
  productId?: string;
  quantity?: number | string;
}

export interface CreateChallanInput {
  customerId?: string;
  items?: ChallanItemInput[];
  status?: string;
}

export interface UpdateChallanInput {
  customerId?: string;
  items?: ChallanItemInput[];
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates payload data for creating a new Sales Challan.
 */
export const validateCreateChallan = (input: CreateChallanInput): ValidationResult => {
  const { customerId, items, status } = input;

  if (status === 'CONFIRMED') {
    return {
      isValid: false,
      message: 'Direct creation of confirmed challans is restricted. Confirmation must be executed through the dedicated confirmation endpoint.'
    };
  }

  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    return { isValid: false, message: 'Customer ID is required.' };
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { isValid: false, message: 'Challan must contain at least one line item product.' };
  }

  // Check for duplicate product IDs in line items
  const productIds = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId || typeof item.productId !== 'string' || item.productId.trim() === '') {
      return { isValid: false, message: `Item #${i + 1}: Product ID is required.` };
    }

    if (productIds.has(item.productId)) {
      return { isValid: false, message: `Duplicate product in items array is not allowed (Product ID: ${item.productId}). Combine quantities instead.` };
    }
    productIds.add(item.productId);

    const qty = parseInt(String(item.quantity), 10);
    if (item.quantity === undefined || isNaN(qty) || qty <= 0) {
      return { isValid: false, message: `Item #${i + 1}: Quantity must be a positive integer greater than 0.` };
    }
  }

  return { isValid: true };
};

/**
 * Validates payload data for updating an existing DRAFT Sales Challan.
 */
export const validateUpdateChallan = (input: UpdateChallanInput): ValidationResult => {
  const { customerId, items } = input;

  if (customerId !== undefined) {
    if (typeof customerId !== 'string' || customerId.trim() === '') {
      return { isValid: false, message: 'Customer ID cannot be empty.' };
    }
  }

  if (items !== undefined) {
    if (!Array.isArray(items) || items.length === 0) {
      return { isValid: false, message: 'Challan must contain at least one line item product.' };
    }

    const productIds = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || typeof item.productId !== 'string' || item.productId.trim() === '') {
        return { isValid: false, message: `Item #${i + 1}: Product ID is required.` };
      }

      if (productIds.has(item.productId)) {
        return { isValid: false, message: `Duplicate product in items array is not allowed (Product ID: ${item.productId}).` };
      }
      productIds.add(item.productId);

      const qty = parseInt(String(item.quantity), 10);
      if (item.quantity === undefined || isNaN(qty) || qty <= 0) {
        return { isValid: false, message: `Item #${i + 1}: Quantity must be a positive integer greater than 0.` };
      }
    }
  }

  return { isValid: true };
};
