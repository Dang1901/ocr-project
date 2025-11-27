import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';

interface Role {
  id: string;
  name?: string;
  code: string;
}

export const useGetUserRoles = (userId: string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await userApi.getUserRoles(userId);
      return (response.data as { roles: Role[] })?.roles || [];
    },
    enabled: !!userId,
  });
};

