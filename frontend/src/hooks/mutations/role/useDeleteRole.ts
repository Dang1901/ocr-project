import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '@/api/role.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseDeleteRoleOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useDeleteRole = (options?: UseDeleteRoleOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (roleId: string) => {
      return await roleApi.deleteRole(roleId);
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['roles'] });

        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Role deleted',
                response?.message || 'Role has been deleted successfully',
                3000,
              ),
            ),
          );
        }

        options?.onSuccess?.();
      } else if (showToast) {
        dispatch(
          addToast(
            createToast.error(
              'Failed to delete role',
              response?.error || 'Unexpected error occurred',
              5000,
            ),
          ),
        );
      }
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to delete role';
        dispatch(
          addToast(
            createToast.error('Error deleting role', errorMessage, 5000),
          ),
        );
      }
      options?.onError?.(error);
    },
  });
};

