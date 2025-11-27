import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionApi, type CreatePermissionRequest } from '@/api/permission.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseUpdatePermissionOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUpdatePermission = (options?: UseUpdatePermissionOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async ({ permissionId, permissionData }: { permissionId: string; permissionData: Partial<CreatePermissionRequest> }) => {
      return await permissionApi.updatePermission(permissionId, permissionData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      
      if (showToast) {
        dispatch(
          addToast(
            createToast.success(
              'Permission updated',
              'Permission has been updated successfully',
              3000
            )
          )
        );
      }
      
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to update permission';
        dispatch(
          addToast(
            createToast.error(
              'Error updating permission',
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

