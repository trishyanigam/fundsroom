import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import challanRoutes from './routes/challanRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy'
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

// Admin Dashboard Summary Routes
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
    console.log(`📊 Admin Dashboard Endpoints mounted at http://localhost:${PORT}/api/v1/dashboard`);
  });
}

export default app;
