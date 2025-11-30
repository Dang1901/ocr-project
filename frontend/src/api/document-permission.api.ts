import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  DocumentPermission,
  DocumentPermissionListResponse,
  DocumentPermissionPayload,
  DocumentPermissionUpdatePayload,
} from '../types/document-permission.types';

export const DocumentPermissionAPI = {
  list: async (q?: string, role_code?: string, page = 1, pageSize = 10): Promise<APIResponse<DocumentPermissionListResponse>> => {
    return httpClient.get('/document-permissions', {
      q,
      role_code,
      page,
      page_size: pageSize,
    });
  },

  get: async (id: string): Promise<APIResponse<DocumentPermission>> => {
    return httpClient.get(`/document-permissions/${id}`);
  },

  create: async (data: DocumentPermissionPayload): Promise<APIResponse<DocumentPermission>> => {
    return httpClient.post('/document-permissions', data);
  },

  update: async (id: string, data: DocumentPermissionUpdatePayload): Promise<APIResponse<DocumentPermission>> => {
    return httpClient.put(`/document-permissions/${id}`, data);
  },

  delete: async (id: string): Promise<APIResponse<{ message: string }>> => {
    return httpClient.delete(`/document-permissions/${id}`);
  },
};
