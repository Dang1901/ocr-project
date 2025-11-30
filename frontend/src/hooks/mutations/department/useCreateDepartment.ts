import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '@/api/department.api';
import type { DepartmentBase } from '@/types/department.types';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseCreateDepartmentOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useCreateDepartment = (options?: UseCreateDepartmentOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (departmentData: DepartmentBase) => {
      return await departmentApi.createDepartment(departmentData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      
      if (showToast) {
        dispatch(
          addToast(
            createToast.success(
              'Department created',
              'Department has been created successfully',
              3000
            )
          )
        );
      }
      
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to create department';
        dispatch(
          addToast(
            createToast.error(
              'Error creating department',
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

