import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  Permission,
  PermissionGroup,
  PermissionListResponse,
  CreatePermissionRequest,
} from '../types/permission.types';

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

