import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  register,
  login,
  getMe,
  testAdminRoute,
  testSalesRoute,
  testWarehouseRoute,
  testAccountsRoute
} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Public Authentication Routes
router.post('/register', register);
router.post('/login', login);

// Protected Auth Profile Route
router.get('/me', authenticateToken, getMe);

// ==========================================
// RBAC DEVELOPMENT / TESTING ENDPOINTS
// ==========================================
router.get('/test/admin', authenticateToken, authorizeRoles(Role.ADMIN), testAdminRoute);
router.get('/test/sales', authenticateToken, authorizeRoles(Role.ADMIN, Role.SALES), testSalesRoute);
router.get('/test/warehouse', authenticateToken, authorizeRoles(Role.ADMIN, Role.WAREHOUSE), testWarehouseRoute);
router.get('/test/accounts', authenticateToken, authorizeRoles(Role.ADMIN, Role.ACCOUNTS), testAccountsRoute);

export default router;
