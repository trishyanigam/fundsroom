import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import challanRoutes from './routes/challanRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Mini ERP CRM API is running'
  });
});

// Authentication Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Customer CRM Routes
app.use('/api/v1/customers', customerRoutes);
app.use('/api/customers', customerRoutes);

// Product Management Routes
app.use('/api/v1/products', productRoutes);
app.use('/api/products', productRoutes);

// Inventory & Stock Movement Routes
app.use('/api/v1/inventory/movements', inventoryRoutes);
app.use('/api/inventory/movements', inventoryRoutes);

// Sales Challan Routes
app.use('/api/v1/challans', challanRoutes);
app.use('/api/challans', challanRoutes);

// 404 Unmatched Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Global Error Handler Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    }
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Mini ERP + CRM Backend running on port ${PORT}`);
    console.log(`🏥 Health Check available at http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth Endpoints mounted at http://localhost:${PORT}/api/v1/auth`);
    console.log(`👥 Customer CRM Endpoints mounted at http://localhost:${PORT}/api/v1/customers`);
    console.log(`📦 Product Catalog Endpoints mounted at http://localhost:${PORT}/api/v1/products`);
    console.log(`🏭 Inventory Endpoints mounted at http://localhost:${PORT}/api/v1/inventory/movements`);
    console.log(`📄 Sales Challan Endpoints mounted at http://localhost:${PORT}/api/v1/challans`);
  });
}

export default app;
