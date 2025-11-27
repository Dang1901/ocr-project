import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseAssignRolesOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useAssignRoles = (options?: UseAssignRolesOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (assignment: { user_id: string; role_ids: string[] }) => {
      return await userApi.assignRoles(assignment);
    },
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user-roles'] });
        
        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Roles assigned',
                data.data?.message || 'Roles have been assigned successfully',
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
                'Failed to assign roles',
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
        const errorMessage = error?.error || error?.message || 'Failed to assign roles';
        dispatch(
          addToast(
            createToast.error(
              'Error assigning roles',
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

