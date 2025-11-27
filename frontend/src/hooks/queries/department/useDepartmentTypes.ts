import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '@/api/department.api';

interface UseDepartmentTypesParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export function getQueryKey(handles: any[]) {
  return ['department-types', ...handles];
}

export const useDepartmentTypes = ({ q, page, pageSize }: UseDepartmentTypesParams = {}, enabled: boolean = true) => {
  const departmentTypes = useQuery({
    queryKey: getQueryKey([page, pageSize, q]),
    queryFn: async () => {
      const response = await departmentApi.getDepartmentTypes({
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

  const responseData = departmentTypes?.data?.data as any;

  return {
    refetch: departmentTypes.refetch,
    total: responseData?.total || 0,
    isLoading: departmentTypes.isLoading,
    isError: departmentTypes.isError,
    error: departmentTypes.error,
    data: responseData?.items || [],
  };
};


