import { Request, Response } from 'express';
import { validateCreateStockMovement } from '../validators/inventoryValidator';
import {
  createStockMovementService,
  getStockMovementsService,
  getStockMovementByIdService
} from '../services/inventoryService';

/**
 * Controller: Create a new Stock Movement (IN or OUT)
 * POST /api/v1/inventory/movements (and /api/inventory/movements)
 */
export const createStockMovement = async (req: Request, res: Response): Promise<void> => {
  const validation = validateCreateStockMovement(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      message: validation.message || 'Invalid stock movement payload.'
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
    return;
  }

  try {
    const result = await createStockMovementService(req.body, req.user.id);

    if (!result.success) {
      if (result.isNotFound) {
        res.status(404).json({
          success: false,
          message: result.message || 'Product not found.'
        });
        return;
      }

      if (result.isInsufficientStock) {
        res.status(409).json({
          success: false,
          message: result.message || 'Insufficient stock for this operation.'
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: result.message || 'Failed to process stock movement.'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Stock movement created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Create Stock Movement Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while creating the stock movement.'
    });
  }
};

/**
 * Controller: Get paginated and filterable Stock Movements audit trail
 * GET /api/v1/inventory/movements (and /api/inventory/movements)
 */
export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getStockMovementsService(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get Stock Movements Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while fetching stock movements.'
    });
  }
};

/**
 * Controller: Get Stock Movement details by ID
 * GET /api/v1/inventory/movements/:id (and /api/inventory/movements/:id)
 */
export const getStockMovementById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const movement = await getStockMovementByIdService(id);

    if (!movement) {
      res.status(404).json({
        success: false,
        message: 'Stock movement record not found.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: movement
    });
  } catch (error) {
    console.error('Get Stock Movement By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while retrieving stock movement details.'
    });
  }
};
