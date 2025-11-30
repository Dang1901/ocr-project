/**
 * Permission check utilities
 */
import { hasPermission as checkPermissionFromHook } from '@/hooks/common/useGetUserPermissions';

export interface PermissionCheckResult {
  isPermissionDenied: boolean;
  errorMessage?: string;
}

export function checkPermission(
  permissions: { [featureCode: string]: string[] } | undefined,
  featureCode: string,
  operation: string
): boolean {
  if (!permissions) return false;
  return checkPermissionFromHook(permissions, featureCode, operation);
}

export function hasPermission(
  permissions: { [featureCode: string]: string[] } | undefined,
  featureCode: string,
  operation: string
): boolean {
  return checkPermission(permissions, featureCode, operation);
}

export function checkPermissionFromError(error: any, fallbackMessage = "You don't have permission to access this resource"): PermissionCheckResult {
  if (!error) {
    return { isPermissionDenied: false };
  }

  // Check for 403 status
  if (error?.status === 403 || error?.statusCode === 403) {
    return {
      isPermissionDenied: true,
      errorMessage: error?.message || error?.error || fallbackMessage
    };
  }

  // Check for permission-related error messages
  const errorMessage = error?.message || error?.error || '';
  if (errorMessage.toLowerCase().includes('permission') || 
      errorMessage.toLowerCase().includes('forbidden') ||
      errorMessage.toLowerCase().includes('access denied')) {
    return {
      isPermissionDenied: true,
      errorMessage: errorMessage || fallbackMessage
    };
  }

  return { isPermissionDenied: false };
}

export function checkMultiplePermissions(errors: any[], fallbackMessage = "You don't have permission to access this resource"): PermissionCheckResult {
  for (const error of errors) {
    const result = checkPermissionFromError(error, fallbackMessage);
    if (result.isPermissionDenied) {
      return result;
    }
  }
  return { isPermissionDenied: false };
}
