import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import type { CreateUserRequest } from '@/types/user.types';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseCreateUserOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useCreateUser = (options?: UseCreateUserOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      return await userApi.createUser(userData);
    },
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        
        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'User created successfully',
                data.data?.message || 'User has been created',
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
                'Failed to create user',
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
        const errorMessage = error?.error || error?.message || 'Failed to create user';
        dispatch(
          addToast(
            createToast.error(
              'Error creating user',
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



