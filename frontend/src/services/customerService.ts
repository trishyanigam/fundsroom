import { apiClient } from './api';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export interface CustomersApiResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerSingleResponse {
  success: boolean;
  data: Customer;
  message?: string;
}

export interface CreateCustomerPayload {
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {}

/**
 * API Service: Fetch paginated customers with search & filter parameters
 */
export const getCustomersApi = async (params?: CustomerQueryParams): Promise<CustomersApiResponse> => {
  const response = await apiClient.get<CustomersApiResponse>('/customers', { params });
  return response.data;
};

/**
 * API Service: Fetch customer details by unique ID
 */
export const getCustomerByIdApi = async (id: string): Promise<CustomerSingleResponse> => {
  const response = await apiClient.get<CustomerSingleResponse>(`/customers/${id}`);
  return response.data;
};

/**
 * API Service: Create a new Customer
 */
export const createCustomerApi = async (payload: CreateCustomerPayload): Promise<CustomerSingleResponse> => {
  const response = await apiClient.post<CustomerSingleResponse>('/customers', payload);
  return response.data;
};

/**
 * API Service: Update an existing Customer
 */
export const updateCustomerApi = async (
  id: string,
  payload: UpdateCustomerPayload
): Promise<CustomerSingleResponse> => {
  const response = await apiClient.put<CustomerSingleResponse>(`/customers/${id}`, payload);
  return response.data;
};
