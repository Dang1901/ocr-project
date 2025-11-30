import { useQuery } from '@tanstack/react-query';
import { currentUserApi } from '@/api/currentUser.api';
import type { CurrentUserInfo } from '@/types/currentUser.types';

export const useCurrentUserInfo = (enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ['current-user-info'],
    queryFn: async () => {
      const response = await currentUserApi.getCurrentUserInfo();
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response.data as CurrentUserInfo;
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    retry: 1,
  });

  return {
    userInfo: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

