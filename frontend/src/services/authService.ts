import { apiClient } from './api';

export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: AuthData;
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

/**
 * API Service: Authenticate user credentials
 */
export const loginUserApi = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
};

/**
 * API Service: Register a new enterprise user account
 */
export const registerUserApi = async (payload: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.post<{ success: boolean; message?: string }>('/auth/register', payload);
  return response.data;
};

/**
 * API Service: Retrieve current logged-in user profile from active JWT session
 */
export const getMeApi = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>('/auth/me');
  return response.data;
};
