import { useQuery } from '@tanstack/react-query';
import { activityLogApi } from '@/api/activity-log.api';
import type { ActivityLogListParams } from '@/types/activity-log.types';

export function getActivityLogsQueryKey(params: ActivityLogListParams = {}) {
  return ['activity-logs', params];
}

export const useActivityLogs = (
  params: ActivityLogListParams = {},
  enabled: boolean = true
) => {
  const activityLogs = useQuery({
    queryKey: getActivityLogsQueryKey(params),
    queryFn: async () => {
      const response = await activityLogApi.getActivityLogs(params);
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response;
    },
    enabled: enabled,
    staleTime: 30000,
  });

  const responseData = activityLogs?.data?.data as any;

  return {
    refetch: activityLogs.refetch,
    total: responseData?.total || 0,
    count: responseData?.count || 0,
    isLoading: activityLogs.isLoading,
    isError: activityLogs.isError,
    error: activityLogs.error,
    data: responseData?.data || [],
  };
};


