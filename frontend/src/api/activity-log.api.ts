import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  ActivityLog,
  ActivityLogListResponse,
  ActivityLogListParams,
} from '../types/activity-log.types';

export const activityLogApi = {
  getActivityLogs: async (
    params?: ActivityLogListParams
  ): Promise<APIResponse<ActivityLogListResponse>> => {
    return httpClient.get('/activity_log/list', params);
  },
};


