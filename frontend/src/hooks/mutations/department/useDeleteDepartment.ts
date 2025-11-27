import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '@/api/department.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseDeleteDepartmentOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useDeleteDepartment = (options?: UseDeleteDepartmentOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (departmentId: string) => {
      return await departmentApi.deleteDepartment(departmentId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      
      if (showToast) {
        dispatch(
          addToast(
            createToast.success(
              'Department deleted',
              'Department has been deleted successfully',
              3000
            )
          )
        );
      }
      
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to delete department';
        dispatch(
          addToast(
            createToast.error(
              'Error deleting department',
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

