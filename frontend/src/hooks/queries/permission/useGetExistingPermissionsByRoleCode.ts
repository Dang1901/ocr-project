import { useQuery } from '@tanstack/react-query';
import { permissionApi } from '@/api/permission.api';

export const useGetExistingPermissionsByRoleCode = (roleCode: string, page: number, pageSize: number, featureId?: string) => {
  const permissions = useQuery({
    queryKey: ['existing-permissions', roleCode, featureId, page, pageSize],
    queryFn: () =>
      permissionApi.getPermissions({
        role_code: roleCode,
        feature_code: undefined, // We'll filter by feature_id in the response
        page: page,
        page_size: pageSize,
      }),
    enabled: !!roleCode,
    staleTime: 30000,
    retry: 1,
  });

  const responseData = permissions?.data?.data as any;
  const allPermissions = responseData?.items || [];
  
  // Flatten permissions from groups and filter by feature_id if provided
  let existingPermissions: any[] = [];
  allPermissions.forEach((group: any) => {
    if (group.permissions && Array.isArray(group.permissions)) {
      group.permissions.forEach((perm: any) => {
        if (!featureId || perm.feature_id === featureId) {
          existingPermissions.push(perm);
        }
      });
    }
  });

  return {
    data: existingPermissions,
    isLoading: permissions.isLoading,
    isError: permissions.isError,
    error: permissions.error,
    refetch: permissions.refetch,
  };
};

