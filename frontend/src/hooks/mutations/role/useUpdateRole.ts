import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi, type RoleUpdatePayload, type Role } from '@/api/role.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseUpdateRoleOptions {
  showToast?: boolean;
  onSuccess?: (role?: Role) => void;
  onError?: (error: any) => void;
}

export const useUpdateRole = (options?: UseUpdateRoleOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async ({ roleId, payload }: { roleId: string; payload: RoleUpdatePayload }) => {
      return await roleApi.updateRole(roleId, payload);
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['roles'] });

        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Role updated',
                response?.message || 'Role has been updated successfully',
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
              'Failed to update role',
              response?.error || 'Unexpected error occurred',
              5000,
            ),
          ),
        );
      }
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to update role';
        dispatch(
          addToast(
            createToast.error('Error updating role', errorMessage, 5000),
          ),
        );
      }
      options?.onError?.(error);
    },
  });
};

