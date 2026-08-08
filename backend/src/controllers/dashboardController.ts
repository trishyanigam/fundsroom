import { Request, Response } from 'express';
import { getDashboardSummaryService } from '../services/dashboardService';

/**
 * Controller: Get Admin Dashboard Summary
 * GET /api/v1/dashboard/summary (and /api/dashboard/summary)
 */
export const getDashboardSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getDashboardSummaryService();

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get Dashboard Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while retrieving dashboard statistics.'
    });
  }
};
