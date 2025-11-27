import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/api/document.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseCreateDocumentOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useCreateDocument = (options?: UseCreateDocumentOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await documentApi.createDocument(formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      if (showToast) {
        dispatch(
          addToast(
            createToast.success(
              'Document created',
              'Document has been created successfully',
              3000
            )
          )
        );
      }
      
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to create document';
        dispatch(
          addToast(
            createToast.error(
              'Error creating document',
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

