import { apiClient } from './api';

export interface DashboardRecentChallan {
  id: string;
  challanNumber: string;
  customerName: string;
  businessName: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  totalQuantity: number;
  createdAt: string;
}

export interface DashboardLowStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
}

export interface DashboardSummaryData {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  recentChallans: DashboardRecentChallan[];
  lowStockItems: DashboardLowStockItem[];
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummaryData;
}

/**
 * API Service: Fetch real-time Admin Dashboard summary metrics
 */
export const getDashboardSummaryApi = async (): Promise<DashboardSummaryResponse> => {
  const response = await apiClient.get<DashboardSummaryResponse>('/dashboard/summary');
  return response.data;
};
