import { Request, Response } from 'express';
import { validateCreateProduct, validateUpdateProduct } from '../validators/productValidator';
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService
} from '../services/productService';

/**
 * Controller: Create a new Product
 * POST /api/v1/products (and /api/products)
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const validation = validateCreateProduct(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      message: validation.message || 'Invalid product creation payload.'
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
    const result = await createProductService(req.body, req.user.id);

    if (!result.success) {
      if (result.isDuplicateSku) {
        res.status(409).json({
          success: false,
          message: 'Product SKU already exists'
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to create product.'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while creating the product.'
    });
  }
};

/**
 * Controller: Get paginated, searchable, filterable Products list (includes lowStock filter)
 * GET /api/v1/products (and /api/products)
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getProductsService(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching products.'
    });
  }
};

/**
 * Controller: Get Product details by ID
 * GET /api/v1/products/:id (and /api/products/:id)
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const product = await getProductByIdService(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while retrieving product details.'
    });
  }
};

/**
 * Controller: Update Product details (excluding currentStock)
 * PUT /api/v1/products/:id (and /api/products/:id)
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const validation = validateUpdateProduct(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      message: validation.message || 'Invalid product update payload.'
    });
    return;
  }

  try {
    const result = await updateProductService(id, req.body);

    if (!result.success) {
      if (result.isDuplicateSku) {
        res.status(409).json({
          success: false,
          message: 'Product SKU already exists'
        });
        return;
      }
      res.status(404).json({
        success: false,
        message: result.message || 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while updating the product.'
    });
  }
};
