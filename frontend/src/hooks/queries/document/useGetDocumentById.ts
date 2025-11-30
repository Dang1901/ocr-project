import { useQuery } from '@tanstack/react-query';
import { documentApi } from '@/api/document.api';
import type { DocumentResult } from '@/types/document.types';

export function getQueryKey(handles: any[]) {
  return ['document', ...handles];
}

export const useGetDocumentById = (documentId: string | null, enabled: boolean = true) => {
  const document = useQuery({
    queryKey: getQueryKey([documentId]),
    queryFn: async () => {
      if (!documentId) {
        throw new Error('Document ID is required');
      }
      const response = await documentApi.getDocument(documentId);

      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }

      return response;
    },
    enabled: enabled && !!documentId,
    staleTime: 30000,
    retry: 1,
  });

  const responseData = document?.data?.data;

  let documentResult: DocumentResult | undefined;
  if (responseData && typeof responseData === 'object') {
    if ('status' in responseData && 'data' in responseData) {
      documentResult = (responseData as any).data as DocumentResult;
    } else if ('document' in responseData || 'pages' in responseData) {
      documentResult = responseData as DocumentResult;
    }
  }

  return {
    data: documentResult,
    isLoading: document.isLoading,
    isError: document.isError,
    error: document.error,
    refetch: document.refetch,
  };
};

