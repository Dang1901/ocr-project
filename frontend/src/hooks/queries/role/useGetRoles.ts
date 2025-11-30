import { useQuery } from '@tanstack/react-query';
import { roleApi } from '@/api/role.api';
import type { RoleListResponse } from '@/types/role.types';

interface UseGetRolesParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export const useGetRoles = (params?: UseGetRolesParams, enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ['roles', params],
    queryFn: async () => {
      const response = await roleApi.getRoles({
        q: params?.q,
        page: params?.page,
        page_size: params?.pageSize,
      });
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response.data as RoleListResponse;
    },
    enabled: enabled,
  });

  return {
    ...query,
    data: query.data,
    items: query.data?.items || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    page_size: query.data?.page_size || 10,
  };
};

