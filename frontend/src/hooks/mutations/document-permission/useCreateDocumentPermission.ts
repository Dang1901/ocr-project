import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentPermissionAPI, type DocumentPermissionPayload } from '@/api/document-permission.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseCreateDocumentPermissionOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useCreateDocumentPermission = (options?: UseCreateDocumentPermissionOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (data: DocumentPermissionPayload) => {
      return await DocumentPermissionAPI.create(data);
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['document-permissions'] });

        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Document Permission created',
                'Document permission has been created successfully',
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
              'Failed to create document permission',
              response?.error || 'Unexpected error occurred',
              5000,
            ),
          ),
        );
      }
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to create document permission';
        dispatch(
          addToast(
            createToast.error('Error creating document permission', errorMessage, 5000),
          ),
        );
      }
      options?.onError?.(error);
    },
  });
};

