import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';

export interface CheckPermissionResponse {
  allowed: boolean;
  reason?: string;
}

export interface UserPermissionsResponse {
  [featureCode: string]: string[]; // e.g., { "ROLE": ["list_roles", "create_role"], "USER": ["list_users"] }
}

export interface CurrentUserInfo {
  id: string;
  username: string;
  email: string;
  fullname?: string;
  account_id: string;
  department_id?: string;
}

export const currentUserApi = {
  checkPermission: async (
    featureCode: string,
    operation: string
  ): Promise<APIResponse<CheckPermissionResponse>> => {
    return httpClient.get('/check-permission', {
      feature_code: featureCode,
      operation: operation,
    });
  },

  getPermissions: async (): Promise<APIResponse<UserPermissionsResponse>> => {
    return httpClient.get('/check');
  },

  getCurrentUserInfo: async (): Promise<APIResponse<CurrentUserInfo>> => {
    return httpClient.get('/me');
  },
};

