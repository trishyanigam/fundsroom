import { apiClient } from './api';

export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    minimumStock: number;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  productId?: string;
  movementType?: string;
  fromDate?: string;
  toDate?: string;
}

export interface MovementsApiResponse {
  success: boolean;
  data: StockMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MovementSingleResponse {
  success: boolean;
  data: StockMovement;
  message?: string;
}

export interface CreateMovementPayload {
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason: string;
}

/**
 * API Service: Fetch paginated stock movements audit log with filters
 */
export const getMovementsApi = async (params?: InventoryQueryParams): Promise<MovementsApiResponse> => {
  const response = await apiClient.get<MovementsApiResponse>('/inventory/movements', { params });
  return response.data;
};

/**
 * API Service: Fetch stock movement record by unique ID
 */
export const getMovementByIdApi = async (id: string): Promise<MovementSingleResponse> => {
  const response = await apiClient.get<MovementSingleResponse>(`/inventory/movements/${id}`);
  return response.data;
};

/**
 * API Service: Create a new Stock Movement (IN or OUT)
 */
export const createMovementApi = async (payload: CreateMovementPayload): Promise<MovementSingleResponse> => {
  const response = await apiClient.post<MovementSingleResponse>('/inventory/movements', payload);
  return response.data;
};
