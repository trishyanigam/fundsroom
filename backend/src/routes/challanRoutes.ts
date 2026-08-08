import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallan,
  cancelChallan
} from '../controllers/challanController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Protect all challan routes with JWT Authentication
router.use(authenticateToken);

// Read / Search / Filter Endpoints (ADMIN, SALES, WAREHOUSE, ACCOUNTS allowed)
router.get('/', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), getChallans);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), getChallanById);

// Create, Edit Draft, & Cancel Draft Endpoints (ADMIN and SALES allowed; WAREHOUSE & ACCOUNTS return 403 Forbidden)
router.post('/', authorizeRoles(Role.ADMIN, Role.SALES), createChallan);
router.put('/:id', authorizeRoles(Role.ADMIN, Role.SALES), updateChallan);
router.put('/:id/cancel', authorizeRoles(Role.ADMIN, Role.SALES), cancelChallan);

export default router;
