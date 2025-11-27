import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';

export interface DepartmentSummary {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  code: string;
  name?: string;
  level?: string;
  level_int?: number;
  department_id?: string;
  department?: DepartmentSummary | null;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoleListResponse {
  items: Role[];
  total: number;
  page: number;
  page_size: number;
}

export interface RolePayload {
  name: string;
  code: string;
  level?: string;
  level_int?: number;
  department_id?: string;
  is_active?: number;
}

export type RoleUpdatePayload = Partial<RolePayload>;

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

