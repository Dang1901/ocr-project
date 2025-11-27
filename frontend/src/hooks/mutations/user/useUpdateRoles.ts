import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseUpdateRolesOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUpdateRoles = (options?: UseUpdateRolesOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (data: { user_id: string; role_ids: string[] }) => {
      return await userApi.updateRoles(data.user_id, data.role_ids);
    },
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user-roles'] });
        
        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Roles updated',
                data.data?.message || 'Roles have been updated successfully',
                3000
              )
            )
          );
        }
        
        options?.onSuccess?.();
      } else {
        if (showToast) {
          dispatch(
            addToast(
              createToast.error(
                'Failed to update roles',
                data?.error || 'Unknown error occurred',
                5000
              )
            )
          );
        }
      }
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to update roles';
        dispatch(
          addToast(
            createToast.error(
              'Error updating roles',
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

