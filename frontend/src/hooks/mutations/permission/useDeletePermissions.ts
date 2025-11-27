import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionApi } from '@/api/permission.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseDeletePermissionsOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useDeletePermissions = (options?: UseDeletePermissionsOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return await permissionApi.deletePermissions(ids);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      
      if (showToast) {
        dispatch(
          addToast(
            createToast.success(
              'Permissions deleted',
              'Permissions have been deleted successfully',
              3000
            )
          )
        );
      }
      
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to delete permissions';
        dispatch(
          addToast(
            createToast.error(
              'Error deleting permissions',
              errorMessage,
              5000
            )
          )
        );
      }
      
      options?.onError?.(error);
    },
  });
};

