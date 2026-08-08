import { MovementType } from '@prisma/client';

export interface CreateStockMovementInput {
  productId?: string;
  quantity?: number | string;
  movementType?: MovementType;
  reason?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates payload data for creating a new Stock Movement.
 */
export const validateCreateStockMovement = (input: CreateStockMovementInput): ValidationResult => {
  const { productId, quantity, movementType, reason } = input;

  if (!productId || typeof productId !== 'string' || productId.trim() === '') {
    return { isValid: false, message: 'Product ID is required.' };
  }

  const parsedQty = parseInt(String(quantity), 10);
  if (quantity === undefined || isNaN(parsedQty) || parsedQty <= 0) {
    return { isValid: false, message: 'Quantity is required and must be a positive integer greater than 0.' };
  }

  if (!movementType || !Object.values(MovementType).includes(movementType)) {
    return { isValid: false, message: `Movement type must be one of: ${Object.values(MovementType).join(', ')}` };
  }

  if (!reason || typeof reason !== 'string' || reason.trim() === '') {
    return { isValid: false, message: 'Reason for stock movement is required.' };
  }

  return { isValid: true };
};
