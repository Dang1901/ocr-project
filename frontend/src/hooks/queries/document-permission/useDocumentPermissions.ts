import { useQuery } from '@tanstack/react-query';
import { DocumentPermissionAPI, type DocumentPermissionListResponse } from '@/api/document-permission.api';

interface UseDocumentPermissionsParams {
  q?: string;
  role_code?: string;
  page?: number;
  pageSize?: number;
}

export function getQueryKey(handles: any[]) {
  return ['document-permissions', ...handles];
}

export const useDocumentPermissions = ({ q, role_code, page, pageSize }: UseDocumentPermissionsParams = {}, enabled: boolean = true) => {
  const documentPermissions = useQuery({
    queryKey: getQueryKey([page, pageSize, q, role_code]),
    queryFn: async () => {
      const response = await DocumentPermissionAPI.list(q, role_code, page, pageSize);
      
      // Check if response has error
      if (!response.success || response.error) {
        throw response;
      }
      
      return response.data as DocumentPermissionListResponse;
    },
    enabled: enabled,
    staleTime: 30000,
  });

  return {
    ...documentPermissions,
    items: documentPermissions.data?.items || [],
    total: documentPermissions.data?.total || 0,
    page: documentPermissions.data?.page || 1,
    page_size: documentPermissions.data?.page_size || 10,
    refetch: documentPermissions.refetch,
  };
};

