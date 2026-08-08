import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer
} from '../controllers/customerController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Protect all customer routes with JWT Authentication
router.use(authenticateToken);

// Read / Search / Filter Endpoints (ADMIN, SALES, ACCOUNTS allowed; WAREHOUSE forbidden)
router.get('/', authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS), getCustomers);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS), getCustomerById);

// Create & Update Endpoints (ADMIN and SALES allowed; ACCOUNTS & WAREHOUSE forbidden)
router.post('/', authorizeRoles(Role.ADMIN, Role.SALES), createCustomer);
router.put('/:id', authorizeRoles(Role.ADMIN, Role.SALES), updateCustomer);

export default router;
