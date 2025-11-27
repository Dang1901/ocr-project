import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '@/api/department.api';

interface UseDepartmentsParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export function getQueryKey(handles: any[]) {
  return ['departments', ...handles];
}

export const useDepartments = ({ q, page, pageSize }: UseDepartmentsParams = {}, enabled: boolean = true) => {
  const departments = useQuery({
    queryKey: getQueryKey([page, pageSize, q]),
    queryFn: async () => {
      const response = await departmentApi.getDepartments({
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
  });

  const responseData = departments?.data?.data as any;

  return {
    refetch: departments.refetch,
    total: responseData?.total || 0,
    isLoading: departments.isLoading,
    isError: departments.isError,
    error: departments.error,
    data: responseData?.items || [],
  };
};

