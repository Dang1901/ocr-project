import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentPermissionAPI } from '@/api/document-permission.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseDeleteDocumentPermissionOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useDeleteDocumentPermission = (options?: UseDeleteDocumentPermissionOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async (permissionId: string) => {
      return await DocumentPermissionAPI.delete(permissionId);
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['document-permissions'] });

        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Document Permission deleted',
                response?.data?.message || 'Document permission has been deleted successfully',
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
              'Failed to delete document permission',
              response?.error || 'Unexpected error occurred',
              5000,
            ),
          ),
        );
      }
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to delete document permission';
        dispatch(
          addToast(
            createToast.error('Error deleting document permission', errorMessage, 5000),
          ),
        );
      }
      options?.onError?.(error);
    },
  });
};

