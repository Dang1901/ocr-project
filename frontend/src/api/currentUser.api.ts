import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  CheckPermissionResponse,
  UserPermissionsResponse,
  CurrentUserInfo,
} from '../types/currentUser.types';

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

