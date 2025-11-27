import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';

export interface Permission {
  id: string;
  role_id: string;
  role_code: string;
  feature_id: string;
  feature_code: string;
  operation: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionGroup {
  feature_code: string;
  permissions: Permission[];
  own: boolean;
}

export interface PermissionListResponse {
  items: PermissionGroup[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreatePermissionRequest {
  role_id: string;
  feature_id: string;
  operation: string;
}

export const permissionApi = {
  getPermissions: async (params?: {
    q?: string;
    role_code?: string;
    feature_code?: string;
    operation?: string;
    page?: number;
    page_size?: number;
  }): Promise<APIResponse<PermissionListResponse>> => {
    return httpClient.get('/permissions', params);
  },

  getPermission: async (permissionId: string): Promise<APIResponse<Permission>> => {
    return httpClient.get(`/permissions/${permissionId}`);
  },

  createPermissions: async (permissions: CreatePermissionRequest[]): Promise<APIResponse<Permission[]>> => {
    return httpClient.post('/permissions', permissions);
  },

  updatePermission: async (permissionId: string, permissionData: Partial<CreatePermissionRequest>): Promise<APIResponse<Permission>> => {
    return httpClient.put(`/permissions/${permissionId}`, permissionData);
  },

  deletePermissions: async (ids: string[]): Promise<APIResponse<{ message: string }>> => {
    return httpClient.delete('/permissions', { ids });
  },

  getOperationsByFeature: async (featureId: string): Promise<APIResponse<Array<{ operation: string; feature_code: string }>>> => {
    return httpClient.get(`/permissions/operations/by-feature/${featureId}`);
  },
};

