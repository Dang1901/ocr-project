import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/api/document.api';
import type { DocumentUpdatePayload } from '@/types/document.types';
import { useAppDispatch } from '@/store';
import { addToast, createToast } from '@/store/slices/toast_slice';

interface UseUpdateDocumentOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUpdateDocument = (options?: UseUpdateDocumentOptions) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false;

  return useMutation({
    mutationFn: async ({ documentId, documentData }: { documentId: string; documentData: DocumentUpdatePayload }) => {
      return await documentApi.updateDocument(documentId, documentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document'] });

      if (showToast) {
        dispatch(
          addToast(
            createToast.success(
              'Document updated',
              'Document has been updated successfully',
              3000
            )
          )
        );
      }
      
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      if (showToast) {
        const errorMessage = error?.error || error?.message || 'Failed to update document';
        dispatch(
          addToast(
            createToast.error(
              'Error updating document',
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

