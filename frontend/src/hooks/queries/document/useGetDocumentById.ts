import { useQuery } from '@tanstack/react-query';
import { documentApi } from '@/api/document.api';

export const useGetDocumentById = (documentId: string | null, enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      if (!documentId) {
        throw new Error('Document ID is required');
      }
      const response = await documentApi.getDocument(documentId);
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response.data;
    },
    enabled: enabled && !!documentId,
  });

  return query;
};

