import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi, type DepartmentBase } from '@/api/department.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseUpdateDepartmentOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUpdateDepartment = (options?: UseUpdateDepartmentOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async ({ departmentId, departmentData }: { departmentId: string; departmentData: Partial<DepartmentBase> }) => {
      return await departmentApi.updateDepartment(departmentId, departmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      if (showToast) {
        dispatch(
          addToast(
            createToast.success(
              'Department updated',
              'Department has been updated successfully',
              3000
            )
          )
        );
      }
      
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to update department';
        dispatch(
          addToast(
            createToast.error(
              'Error updating department',
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

