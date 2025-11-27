import { useQuery } from '@tanstack/react-query';
import { permissionApi } from '@/api/permission.api';

export const useGetOperationsByFeature = (featureId: string) => {
  const operations = useQuery({
    queryKey: ['operations-by-feature', featureId],
    queryFn: () => permissionApi.getOperationsByFeature(featureId),
    enabled: !!featureId,
    staleTime: 30000,
    retry: 1,
  });

  return {
    data: operations?.data?.data || [],
    isLoading: operations.isLoading,
    isError: operations.isError,
    error: operations.error,
    refetch: operations.refetch,
  };
};

