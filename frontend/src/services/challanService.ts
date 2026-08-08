import { apiClient } from './api';

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItemSnapshot {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number | string;
  quantity: number;
  createdAt: string;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  status: ChallanStatus;
  totalQuantity: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    customerName: string;
    businessName: string;
    email: string;
    mobile: string;
    address?: string;
    gstNumber?: string | null;
  };
  items: ChallanItemSnapshot[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ChallanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
}

export interface ChallansApiResponse {
  success: boolean;
  data: Challan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChallanSingleResponse {
  success: boolean;
  data: Challan;
  message?: string;
}

export interface ChallanItemInputPayload {
  productId: string;
  quantity: number;
}

export interface CreateChallanPayload {
  customerId: string;
  items: ChallanItemInputPayload[];
  status?: string;
}

export interface UpdateChallanPayload {
  customerId?: string;
  items?: ChallanItemInputPayload[];
}

/**
 * API Service: Fetch paginated sales challans with search & filters
 */
export const getChallansApi = async (params?: ChallanQueryParams): Promise<ChallansApiResponse> => {
  const response = await apiClient.get<ChallansApiResponse>('/challans', { params });
  return response.data;
};

/**
 * API Service: Fetch challan details by unique ID
 */
export const getChallanByIdApi = async (id: string): Promise<ChallanSingleResponse> => {
  const response = await apiClient.get<ChallanSingleResponse>(`/challans/${id}`);
  return response.data;
};

/**
 * API Service: Create a new Sales Challan (DRAFT)
 */
export const createChallanApi = async (payload: CreateChallanPayload): Promise<ChallanSingleResponse> => {
  const response = await apiClient.post<ChallanSingleResponse>('/challans', payload);
  return response.data;
};

/**
 * API Service: Update a DRAFT Sales Challan
 */
export const updateChallanApi = async (
  id: string,
  payload: UpdateChallanPayload
): Promise<ChallanSingleResponse> => {
  const response = await apiClient.put<ChallanSingleResponse>(`/challans/${id}`, payload);
  return response.data;
};

/**
 * API Service: Cancel a DRAFT Sales Challan (DRAFT -> CANCELLED)
 */
export const cancelChallanApi = async (id: string): Promise<ChallanSingleResponse> => {
  const response = await apiClient.put<ChallanSingleResponse>(`/challans/${id}/cancel`);
  return response.data;
};
