import { useQuery } from '@tanstack/react-query';
import { currentUserApi } from '@/api/currentUser.api';

/**
 * Hook để lấy tất cả permissions của user hiện tại
 * Cache lâu hơn vì permissions ít thay đổi
 * @param enabled - Có enable query không (default: true)
 * @returns Object với permissions (grouped by feature), isLoading, error
 */
export const useGetUserPermissions = (enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const response = await currentUserApi.getPermissions();
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response.data;
    },
    enabled: enabled,
    staleTime: 10 * 60 * 1000, // Cache 10 minutes
    retry: 1,
  });

  return {
    permissions: query.data || {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Helper function để check permission từ permissions object
 */
export const hasPermission = (
  permissions: { [featureCode: string]: string[] },
  featureCode: string,
  operation: string
): boolean => {
  if (!permissions || !featureCode || !operation) {
    return false;
  }

  const featurePermissions = permissions[featureCode] || [];
  return featurePermissions.includes(operation);
};

