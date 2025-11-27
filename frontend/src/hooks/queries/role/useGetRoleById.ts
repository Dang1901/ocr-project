import { useQuery } from '@tanstack/react-query';
import { roleApi } from '@/api/role.api';

export const useGetRoleById = (roleId: string) => {
  const role = useQuery({
    queryKey: ['role', roleId],
    queryFn: () => roleApi.getRole(roleId),
    enabled: !!roleId,
    staleTime: 30000,
    retry: 1,
  });

  return {
    data: role?.data?.data,
    isLoading: role.isLoading,
    isError: role.isError,
    error: role.error,
    refetch: role.refetch,
  };
};

