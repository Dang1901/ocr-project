import { useMemo } from 'react';
import { checkPermissionFromError } from '@/utils/permissionUtils';

/**
 * Hook để check xem có lỗi permission không từ error object
 * @param error - Error object từ React Query hoặc API call
 * @returns Object với hasPermission, isPermissionDenied, errorMessage
 */
export const usePermissionError = (error: any) => {
  return useMemo(() => {
    return checkPermissionFromError(error);
  }, [error]);
};

