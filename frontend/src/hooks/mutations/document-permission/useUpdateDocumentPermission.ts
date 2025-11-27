import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentPermissionAPI, type DocumentPermissionUpdatePayload } from '@/api/document-permission.api';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseUpdateDocumentPermissionOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUpdateDocumentPermission = (options?: UseUpdateDocumentPermissionOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async ({ permissionId, permissionData }: { permissionId: string; permissionData: DocumentPermissionUpdatePayload }) => {
      return await DocumentPermissionAPI.update(permissionId, permissionData);
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['document-permissions'] });

        if (showToast) {
          dispatch(
            addToast(
              createToast.success(
                'Document Permission updated',
                'Document permission has been updated successfully',
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
              'Failed to update document permission',
              response?.error || 'Unexpected error occurred',
              5000,
            ),
          ),
        );
      }
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to update document permission';
        dispatch(
          addToast(
            createToast.error('Error updating document permission', errorMessage, 5000),
          ),
        );
      }
      options?.onError?.(error);
    },
  });
};

