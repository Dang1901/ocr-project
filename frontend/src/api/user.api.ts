import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  User,
  UserListResponse,
  UserRoleAssignment,
  UserRoleRemoval,
  CreateUserRequest,
} from '../types/user.types';


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
  resetPassword: async (userId: string): Promise<APIResponse<{ status: string; message: string; data: null }>> => {
    return httpClient.put(`/users/${userId}/reset-password`);
  },

  // Get user roles
  getUserRoles: async (userId: string): Promise<APIResponse<{ roles: Array<{ id: string; name: string; code: string }> }>> => {
    return httpClient.get(`/users/${userId}/roles`);
  },

  // Assign roles to user
  assignRoles: async (assignment: UserRoleAssignment): Promise<APIResponse<{ status: string; message: string }>> => {
    return httpClient.post('/users/assign-roles', assignment);
  },

  // Remove roles from user
  removeRoles: async (removal: UserRoleRemoval): Promise<APIResponse<{ status: string; message: string }>> => {
    return httpClient.delete('/users/remove-roles', { data: removal });
  },

  // Update user roles (replace all)
  updateRoles: async (userId: string, roleIds: string[]): Promise<APIResponse<{ status: string; message: string }>> => {
    return httpClient.put(`/users/${userId}/roles`, roleIds);
  },
};

