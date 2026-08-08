export interface CreateProductInput {
  name?: string;
  sku?: string;
  category?: string;
  unitPrice?: number | string;
  currentStock?: number | string;
  minimumStock?: number | string;
  warehouseLocation?: string;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  category?: string;
  unitPrice?: number | string;
  minimumStock?: number | string;
  warehouseLocation?: string;
  currentStock?: any; // To detect and reject attempt to edit stock on product update
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates payload data for creating a new Product.
 */
export const validateCreateProduct = (input: CreateProductInput): ValidationResult => {
  const { name, sku, category, unitPrice, currentStock, minimumStock, warehouseLocation } = input;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { isValid: false, message: 'Product name is required and must be at least 2 characters long.' };
  }

  if (!sku || typeof sku !== 'string' || sku.trim().length < 2) {
    return { isValid: false, message: 'Product SKU/code is required.' };
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return { isValid: false, message: 'Product category is required.' };
  }

  const parsedPrice = parseFloat(String(unitPrice));
  if (unitPrice === undefined || isNaN(parsedPrice) || parsedPrice < 0) {
    return { isValid: false, message: 'Unit price is required and must be greater than or equal to 0.' };
  }

  const parsedStock = parseInt(String(currentStock), 10);
  if (currentStock === undefined || isNaN(parsedStock) || parsedStock < 0) {
    return { isValid: false, message: 'Current initial stock is required and cannot be negative.' };
  }

  const parsedMinStock = parseInt(String(minimumStock), 10);
  if (minimumStock === undefined || isNaN(parsedMinStock) || parsedMinStock < 0) {
    return { isValid: false, message: 'Minimum stock alert quantity is required and cannot be negative.' };
  }

  if (!warehouseLocation || typeof warehouseLocation !== 'string' || warehouseLocation.trim() === '') {
    return { isValid: false, message: 'Warehouse location is required.' };
  }

  return { isValid: true };
};

/**
 * Validates payload data for updating an existing Product (rejects currentStock edits).
 */
export const validateUpdateProduct = (input: UpdateProductInput): ValidationResult => {
  const { name, sku, category, unitPrice, minimumStock, warehouseLocation, currentStock } = input;

  if (currentStock !== undefined) {
    return {
      isValid: false,
      message: 'Direct stock modification via product update is restricted. Stock changes must be managed through the Inventory module.'
    };
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return { isValid: false, message: 'Product name must be at least 2 characters long.' };
    }
  }

  if (sku !== undefined) {
    if (typeof sku !== 'string' || sku.trim().length < 2) {
      return { isValid: false, message: 'Product SKU/code must be at least 2 characters long.' };
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim() === '') {
      return { isValid: false, message: 'Product category cannot be empty.' };
    }
  }

  if (unitPrice !== undefined) {
    const parsedPrice = parseFloat(String(unitPrice));
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return { isValid: false, message: 'Unit price must be a valid number greater than or equal to 0.' };
    }
  }

  if (minimumStock !== undefined) {
    const parsedMinStock = parseInt(String(minimumStock), 10);
    if (isNaN(parsedMinStock) || parsedMinStock < 0) {
      return { isValid: false, message: 'Minimum stock alert quantity must be an integer greater than or equal to 0.' };
    }
  }

  if (warehouseLocation !== undefined) {
    if (typeof warehouseLocation !== 'string' || warehouseLocation.trim() === '') {
      return { isValid: false, message: 'Warehouse location cannot be empty.' };
    }
  }

  return { isValid: true };
};
