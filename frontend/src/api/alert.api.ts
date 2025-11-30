import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  Alert,
  AlertListResponse,
} from '../types/alert.types';

export const alertApi = {
  // Get paginated alerts
  getAlerts: async (params?: {
    q?: string;
    page?: number;
    page_size?: number;
    read?: boolean;
  }): Promise<APIResponse<AlertListResponse>> => {
    return httpClient.get('/alerts', params);
  },

  // Get alert by ID
  getAlertById: async (alertId: string): Promise<APIResponse<Alert>> => {
    return httpClient.get(`/alerts/${alertId}`);
  },

  // Mark alert as read
  markAsRead: async (alertId: string): Promise<APIResponse<void>> => {
    return httpClient.put(`/alerts/${alertId}/read`);
  },

  // Mark all alerts as read
  markAllAsRead: async (): Promise<APIResponse<void>> => {
    return httpClient.put('/alerts/read-all');
  },

  // Delete alert
  deleteAlert: async (alertId: string): Promise<APIResponse<void>> => {
    return httpClient.delete(`/alerts/${alertId}`);
  },
};

