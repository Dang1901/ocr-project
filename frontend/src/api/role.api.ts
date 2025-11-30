import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  Role,
  RoleListResponse,
  RolePayload,
  RoleUpdatePayload,
} from '../types/role.types';

export const roleApi = {
  getRoles: async (params?: {
    q?: string;
    page?: number;
    page_size?: number;
  }): Promise<APIResponse<RoleListResponse>> => {
    return httpClient.get('/roles', params);
  },

  getRole: async (roleId: string): Promise<APIResponse<Role>> => {
    return httpClient.get(`/roles/${roleId}`);
  },

  createRole: async (roleData: RolePayload): Promise<APIResponse<Role>> => {
    return httpClient.post('/roles', roleData);
  },

  updateRole: async (roleId: string, roleData: RoleUpdatePayload): Promise<APIResponse<Role>> => {
    return httpClient.put(`/roles/${roleId}`, roleData);
  },

  deleteRole: async (roleId: string): Promise<APIResponse<{ message: string }>> => {
    return httpClient.delete(`/roles/${roleId}`);
  },
};

