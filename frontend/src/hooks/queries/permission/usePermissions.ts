import { useQuery } from '@tanstack/react-query';
import { permissionApi } from '@/api/permission.api';

interface UsePermissionsParams {
  q?: string;
  role_code?: string;
  feature_code?: string;
  operation?: string;
  page?: number;
  pageSize?: number;
}

export function getQueryKey(handles: any[]) {
  return ['permissions', ...handles];
}

export const usePermissions = ({ q, role_code, feature_code, operation, page, pageSize }: UsePermissionsParams = {}, enabled: boolean = true) => {
  const permissions = useQuery({
    queryKey: getQueryKey([page, pageSize, q, role_code, feature_code, operation]),
    queryFn: async () => {
      const response = await permissionApi.getPermissions({
        q,
        role_code,
        feature_code,
        operation,
        page,
        page_size: pageSize,
      });
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response;
    },
    enabled: enabled,
    staleTime: 30000,
  });

  const responseData = permissions?.data?.data as any;

  return {
    refetch: permissions.refetch,
    total: responseData?.total || 0,
    isLoading: permissions.isLoading,
    isError: permissions.isError,
    error: permissions.error,
    data: responseData?.items || [],
  };
};

