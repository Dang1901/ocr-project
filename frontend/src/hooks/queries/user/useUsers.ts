import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { getUsersFilterParams } from '@/utils/user/userFilters';

interface UseUsersParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export function getQueryKey(handles: any[]) {
  return ['users', ...handles];
}

export const useUsers = ({ q, page, pageSize }: UseUsersParams = {}, enabled: boolean = true) => {   

  const users = useQuery({
    queryKey: getQueryKey([page, pageSize, q]),
    queryFn: async () => {
      const response = await userApi.getUsers(
        getUsersFilterParams({ q, page, pageSize }),
      );
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response;
    },
    enabled: enabled,
    staleTime: 30000,
  });

  const responseData = users?.data?.data as any;

  return {
    refetch: users.refetch,
    total: responseData?.total || 0,
    isLoading: users.isLoading,
    isError: users.isError,
    error: users.error,
    data: responseData?.data || [],
  };
};

