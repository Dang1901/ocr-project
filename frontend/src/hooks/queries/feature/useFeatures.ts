import { useQuery } from '@tanstack/react-query';
import { featureApi } from '@/api/feature.api';

interface UseFeaturesParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export function getQueryKey(handles: any[]) {
  return ['features', ...handles];
}

export const useFeatures = ({ q, page, pageSize }: UseFeaturesParams = {}, enabled: boolean = true) => {
  const features = useQuery({
    queryKey: getQueryKey([page, pageSize, q]),
    queryFn: async () => {
      const response = await featureApi.getFeatures({
        q,
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
    retry: 1,
  });

  const responseData = features?.data?.data as any;

  return {
    refetch: features.refetch,
    total: responseData?.total || 0,
    isLoading: features.isLoading,
    isError: features.isError,
    error: features.error,
    data: responseData?.items || [],
  };
};

