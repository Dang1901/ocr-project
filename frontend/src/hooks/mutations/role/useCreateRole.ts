import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '@/api/role.api';
import type { RolePayload, Role } from '@/types/role.types';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseCreateRoleOptions {
  showToast?: boolean;
  onSuccess?: (role?: Role) => void;
  onError?: (error: any) => void;
}

export const useCreateRole = (options?: UseCreateRoleOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (payload: RolePayload) => {
      return await roleApi.createRole(payload);
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['roles'] });

        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Role created',
                response?.message || 'Role has been created successfully',
                3000,
              ),
            ),
          );
        }

        options?.onSuccess?.(response.data);
      } else if (showToast) {
        dispatch(
          addToast(
            createToast.error(
              'Failed to create role',
              response?.error || 'Unexpected error occurred',
              5000,
            ),
          ),
        );
      }
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to create role';
        dispatch(
          addToast(
            createToast.error('Error creating role', errorMessage, 5000),
          ),
        );
      }
      options?.onError?.(error);
    },
  });
};

