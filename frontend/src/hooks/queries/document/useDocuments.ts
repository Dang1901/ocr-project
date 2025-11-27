import { useQuery } from '@tanstack/react-query';
import { documentApi } from '@/api/document.api';

interface UseDocumentsParams {
  q?: string;
  department_id?: string;
  document_type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function getQueryKey(handles: any[]) {
  return ['documents', ...handles];
}

export const useDocuments = ({ q, department_id, document_type, status, page, pageSize }: UseDocumentsParams = {}, enabled: boolean = true) => {
  const documents = useQuery({
    queryKey: getQueryKey([page, pageSize, q, department_id, document_type, status]),
    queryFn: async () => {
      const response = await documentApi.getDocuments({
        q,
        department_id,
        document_type,
        status,
        page,
        page_size: pageSize,
      });
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response;
    },
    enabled: enabled,
    staleTime: 30000,
  });

  const responseData = documents?.data?.data as any;

  return {
    refetch: documents.refetch,
    total: responseData?.total || 0,
    isLoading: documents.isLoading,
    isError: documents.isError,
    error: documents.error,
    data: responseData?.items || [],
  };
};

