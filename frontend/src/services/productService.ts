import { apiClient } from './api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number | string;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
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

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  warehouseLocation?: string;
  lowStock?: boolean | string;
}

export interface ProductsApiResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductSingleResponse {
  success: boolean;
  data: Product;
  message?: string;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  category?: string;
  unitPrice?: number;
  minimumStock?: number;
  warehouseLocation?: string;
}

/**
 * API Service: Fetch paginated products with search & filter parameters
 */
export const getProductsApi = async (params?: ProductQueryParams): Promise<ProductsApiResponse> => {
  const response = await apiClient.get<ProductsApiResponse>('/products', { params });
  return response.data;
};

/**
 * API Service: Fetch product details by unique ID
 */
export const getProductByIdApi = async (id: string): Promise<ProductSingleResponse> => {
  const response = await apiClient.get<ProductSingleResponse>(`/products/${id}`);
  return response.data;
};

/**
 * API Service: Create a new Product
 */
export const createProductApi = async (payload: CreateProductPayload): Promise<ProductSingleResponse> => {
  const response = await apiClient.post<ProductSingleResponse>('/products', payload);
  return response.data;
};

/**
 * API Service: Update an existing Product (excluding currentStock)
 */
export const updateProductApi = async (
  id: string,
  payload: UpdateProductPayload
): Promise<ProductSingleResponse> => {
  const response = await apiClient.put<ProductSingleResponse>(`/products/${id}`, payload);
  return response.data;
};
