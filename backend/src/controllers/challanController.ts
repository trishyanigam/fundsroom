import { Request, Response } from 'express';
import { validateCreateChallan, validateUpdateChallan } from '../validators/challanValidator';
import {
  createChallanService,
  getChallansService,
  getChallanByIdService,
  updateChallanService,
  cancelChallanService,
  confirmChallanService
} from '../services/challanService';

/**
 * Controller: Create a new Sales Challan (DRAFT)
 * POST /api/v1/challans (and /api/challans)
 */
export const createChallan = async (req: Request, res: Response): Promise<void> => {
  const validation = validateCreateChallan(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      message: validation.message || 'Invalid challan creation payload.'
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
    const result = await createChallanService(req.body, req.user.id);

    if (!result.success) {
      if (result.isCustomerNotFound || result.isProductNotFound) {
        res.status(404).json({
          success: false,
          message: result.message || 'Referenced entity not found.'
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to create challan.'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Challan created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Create Challan Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while creating the challan.'
    });
  }
};

/**
 * Controller: Get paginated, searchable, filterable Sales Challans list
 * GET /api/v1/challans (and /api/challans)
 */
export const getChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getChallansService(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get Challans Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while fetching challans.'
    });
  }
};

/**
 * Controller: Get Sales Challan details by ID
 * GET /api/v1/challans/:id (and /api/challans/:id)
 */
export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const challan = await getChallanByIdService(id);

    if (!challan) {
      res.status(404).json({
        success: false,
        message: 'Challan not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: challan
    });
  } catch (error) {
    console.error('Get Challan By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while retrieving challan details.'
    });
  }
};

/**
 * Controller: Update DRAFT Sales Challan
 * PUT /api/v1/challans/:id (and /api/challans/:id)
 */
export const updateChallan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const validation = validateUpdateChallan(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      message: validation.message || 'Invalid challan update payload.'
    });
    return;
  }

  try {
    const result = await updateChallanService(id, req.body);

    if (!result.success) {
      if (result.isStatusConflict) {
        res.status(409).json({
          success: false,
          message: result.message || 'Challan status conflict.'
        });
        return;
      }

      if (result.isNotFound || result.isCustomerNotFound || result.isProductNotFound) {
        res.status(404).json({
          success: false,
          message: result.message || 'Challan or referenced entity not found.'
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: result.message || 'Failed to update challan.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Challan updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Update Challan Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while updating the challan.'
    });
  }
};

/**
 * Controller: Cancel DRAFT Sales Challan (DRAFT -> CANCELLED)
 * PUT /api/v1/challans/:id/cancel (and /api/challans/:id/cancel)
 */
export const cancelChallan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await cancelChallanService(id);

    if (!result.success) {
      if (result.isStatusConflict) {
        res.status(409).json({
          success: false,
          message: result.message || 'Challan status conflict.'
        });
        return;
      }

      if (result.isNotFound) {
        res.status(404).json({
          success: false,
          message: 'Challan not found'
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: result.message || 'Failed to cancel challan.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Challan cancelled successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Cancel Challan Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while cancelling the challan.'
    });
  }
};

/**
 * Controller: Confirm a DRAFT Sales Challan (DRAFT -> CONFIRMED)
 * Transactionally deducts stock and logs OUT StockMovements.
 * PUT /api/v1/challans/:id/confirm (and /api/challans/:id/confirm)
 */
export const confirmChallan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
    return;
  }

  try {
    const result = await confirmChallanService(id, req.user.id);

    if (!result.success) {
      if (result.isStatusConflict || result.isInsufficientStock) {
        res.status(409).json({
          success: false,
          message: result.message || 'Confirmation conflict.',
          data: result.stockErrorData || undefined
        });
        return;
      }

      if (result.isNotFound || result.isProductNotFound) {
        res.status(404).json({
          success: false,
          message: result.message || 'Challan or product not found.'
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: result.message || 'Failed to confirm challan.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Challan confirmed successfully',
      data: {
        challanNumber: result.data?.challanNumber,
        status: result.data?.status,
        totalQuantity: result.data?.totalQuantity
      }
    });
  } catch (error) {
    console.error('Confirm Challan Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while confirming the challan.'
    });
  }
};

