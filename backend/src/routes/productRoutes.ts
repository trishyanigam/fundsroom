import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct
} from '../controllers/productController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Protect all product routes with JWT Authentication
router.use(authenticateToken);

// Read / Search / Filter / LowStock Endpoints (ADMIN, WAREHOUSE, SALES, ACCOUNTS allowed)
router.get('/', authorizeRoles(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS), getProducts);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS), getProductById);

// Create & Update Endpoints (ADMIN and WAREHOUSE allowed; SALES & ACCOUNTS return 403 Forbidden)
router.post('/', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), createProduct);
router.put('/:id', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), updateProduct);

export default router;
