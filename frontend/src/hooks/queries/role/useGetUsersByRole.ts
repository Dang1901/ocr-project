import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import type { APIResponse } from '@/api/httpClient';
import type { UserListResponse } from '@/api/user.api';

interface UseGetUsersByRoleParams {
  roleId: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export const useGetUsersByRole = ({ roleId, q, page, pageSize }: UseGetUsersByRoleParams) => {
  const users = useQuery({
    queryKey: ['users-by-role', roleId, page, pageSize, q],
    queryFn: () =>
      httpClient.get<APIResponse<UserListResponse>>(`/roles/${roleId}/users`, {
        q,
        page,
        page_size: pageSize,
      }),
    enabled: !!roleId,
    staleTime: 30000,
    retry: 1,
  });

  const responseData = users?.data?.data as any;

  return {
    data: responseData?.data || [],
    total: responseData?.total || 0,
    isLoading: users.isLoading,
    isError: users.isError,
    error: users.error,
    refetch: users.refetch,
  };
};

