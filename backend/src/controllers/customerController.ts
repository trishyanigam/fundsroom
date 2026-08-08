import { Request, Response } from 'express';
import { validateCreateCustomer, validateUpdateCustomer } from '../validators/customerValidator';
import {
  createCustomerService,
  getCustomersService,
  getCustomerByIdService,
  updateCustomerService
} from '../services/customerService';

/**
 * Controller: Create a new Customer
 * POST /api/v1/customers (and /api/customers)
 */
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  const validation = validateCreateCustomer(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.message || 'Invalid customer creation payload.'
      }
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
    });
    return;
  }

  try {
    const newCustomer = await createCustomerService(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (error) {
    console.error('Create Customer Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while creating the customer.'
      }
    });
  }
};

/**
 * Controller: Get paginated, searchable, filterable Customers list
 * GET /api/v1/customers (and /api/customers)
 */
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getCustomersService(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching customers.'
      }
    });
  }
};

/**
 * Controller: Get Customer details by ID
 * GET /api/v1/customers/:id (and /api/customers/:id)
 */
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const customer = await getCustomerByIdService(id);

    if (!customer) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found.'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get Customer By ID Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while retrieving customer details.'
      }
    });
  }
};

/**
 * Controller: Update Customer details (including notes & followUpDate)
 * PUT /api/v1/customers/:id (and /api/customers/:id)
 */
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const validation = validateUpdateCustomer(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.message || 'Invalid customer update payload.'
      }
    });
    return;
  }

  try {
    const updatedCustomer = await updateCustomerService(id, req.body);

    if (!updatedCustomer) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found.'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Update Customer Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while updating the customer.'
      }
    });
  }
};
