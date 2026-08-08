import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createStockMovement,
  getStockMovements,
  getStockMovementById
} from '../controllers/inventoryController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Protect all inventory routes with JWT Authentication
router.use(authenticateToken);

// Read / Search / Filter Audit Log Endpoints (ADMIN, WAREHOUSE, SALES, ACCOUNTS allowed)
router.get('/', authorizeRoles(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS), getStockMovements);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS), getStockMovementById);

// Create Stock Movement Endpoint (ADMIN and WAREHOUSE allowed; SALES & ACCOUNTS return 403 Forbidden)
router.post('/', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), createStockMovement);

// NOTE: Intentionally NO PUT or DELETE routes. Stock Movements are immutable audit records.

export default router;
