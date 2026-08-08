import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all dashboard routes with JWT Authentication (All authenticated roles allowed)
router.use(authenticateToken);

router.get('/summary', getDashboardSummary);

export default router;
