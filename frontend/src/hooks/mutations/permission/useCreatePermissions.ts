import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionApi } from '@/api/permission.api';
import type { CreatePermissionRequest } from '@/types/permission.types';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseCreatePermissionsOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useCreatePermissions = (options?: UseCreatePermissionsOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (permissions: CreatePermissionRequest[]) => {
      return await permissionApi.createPermissions(permissions);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      
      if (showToast) {
        dispatch(
          addToast(
            createToast.success(
              'Permissions created',
              'Permissions have been created successfully',
              3000
            )
          )
        );
      }
      
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to create permissions';
        dispatch(
          addToast(
            createToast.error(
              'Error creating permissions',
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

