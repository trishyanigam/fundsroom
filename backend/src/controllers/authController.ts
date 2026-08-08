import { Request, Response } from 'express';
import { validateLoginInput } from '../validators/authValidator';
import { loginUser, getUserProfile } from '../services/authService';

/**
 * Controller: User Login Endpoint
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const validation = validateLoginInput(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.message || 'Invalid login request payload.'
      }
    });
    return;
  }

  const { email, password } = req.body;

  try {
    const result = await loginUser(email, password);

    if (!result) {
      // Generic authentication error - prevents user email enumeration
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during authentication.'
      }
    });
  }
};

/**
 * Controller: Get Current Authenticated User Profile
 * GET /api/v1/auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      }
    });
    return;
  }

  try {
    const userProfile = await getUserProfile(req.user.id);

    if (!userProfile) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User profile not found.'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user profile.'
      }
    });
  }
};

// ==========================================
// DEVELOPMENT / RBAC VERIFICATION TEST ENDPOINTS
// ==========================================

export const testAdminRoute = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Dev Test: ADMIN role authorization verified successfully',
    user: req.user
  });
};

export const testSalesRoute = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Dev Test: SALES role authorization verified successfully',
    user: req.user
  });
};

export const testWarehouseRoute = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Dev Test: WAREHOUSE role authorization verified successfully',
    user: req.user
  });
};

export const testAccountsRoute = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Dev Test: ACCOUNTS role authorization verified successfully',
    user: req.user
  });
};
