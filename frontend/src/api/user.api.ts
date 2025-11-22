import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  roles?: Array<{ id: string; name: string; code: string }>;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserRoleAssignment {
  user_id: string;
  role_ids: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ToggleUserStatusRequest {
  is_active: boolean;
}

export interface ResetPasswordResponse {
  new_password: string;
}

export const userApi = {
  
  getUsers: async (params?: {
    q?: string;
    page?: number;
    page_size?: number;
  }): Promise<APIResponse<UserListResponse>> => {
    return httpClient.get('/users', params);
  },

  // Sync users from API
  syncUsers: async (): Promise<APIResponse<{ status: string; message: string }>> => {
    return httpClient.post('/users/sync-users');
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<APIResponse<{ data: User; status: string; message: string }>> => {
    return httpClient.post('/users', userData);
  },

  // Toggle user active/inactive status
  toggleUserStatus: async (userId: string, isActive: boolean): Promise<APIResponse<{ status: string; message: string }>> => {
    return httpClient.put(`/users/${userId}/toggle-status`, { is_active: isActive });
  },

  // Reset user password
  resetPassword: async (userId: string): Promise<APIResponse<{ data: ResetPasswordResponse; status: string; message: string }>> => {
    return httpClient.put(`/users/${userId}/reset-password`);
  },
};

