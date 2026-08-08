import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardSummaryResult {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  recentChallans: Array<{
    id: string;
    challanNumber: string;
    customerName: string;
    businessName: string;
    status: string;
    totalQuantity: number;
    createdAt: Date;
  }>;
  lowStockItems: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    minimumStock: number;
    warehouseLocation: string;
  }>;
}

/**
 * Service: Generates real-time Admin Dashboard statistics using efficient Prisma database queries.
 */
export const getDashboardSummaryService = async (): Promise<DashboardSummaryResult> => {
  const [totalCustomers, totalProducts, totalChallans, allProducts, recentChallansRaw] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.challan.count(),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        currentStock: true,
        minimumStock: true,
        warehouseLocation: true
      }
    }),
    prisma.challan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            businessName: true
          }
        }
      }
    })
  ]);

  // Filter low-stock products in memory from selected product list
  const lowStockProductsList = allProducts.filter((p) => p.currentStock <= p.minimumStock);
  const lowStockProductsCount = lowStockProductsList.length;
  const topLowStockItems = lowStockProductsList.slice(0, 5);

  const formattedRecentChallans = recentChallansRaw.map((c) => ({
    id: c.id,
    challanNumber: c.challanNumber,
    customerName: c.customer?.customerName || 'N/A',
    businessName: c.customer?.businessName || '',
    status: c.status,
    totalQuantity: c.totalQuantity,
    createdAt: c.createdAt
  }));

  return {
    totalCustomers,
    totalProducts,
    lowStockProducts: lowStockProductsCount,
    totalChallans,
    recentChallans: formattedRecentChallans,
    lowStockItems: topLowStockItems
  };
};
