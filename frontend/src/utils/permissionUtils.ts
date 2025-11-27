/**
 * Utility functions để check permission
 */

export interface PermissionCheckResult {
  hasPermission: boolean;
  isPermissionDenied: boolean;
  errorMessage?: string;
}

/**
 * Check permission từ error object
 */
export function checkPermissionFromError(error: any, fallbackMessage = "You don't have permission to access this resource"): PermissionCheckResult {
  if (!error) {
    return { hasPermission: true, isPermissionDenied: false };
  }

  // Check error từ React Query (có thể là APIResponse với error field)
  const errorMessage = error?.error || error?.message;
  const errorStatus = error?.response?.status || error?.status;
  
  const isPermissionDenied = 
    errorMessage?.includes("Access denied") || 
    errorMessage?.includes("Permission denied") ||
    errorMessage?.includes("do not have permission") ||
    errorStatus === 403;

  return {
    hasPermission: !isPermissionDenied,
    isPermissionDenied,
    errorMessage: errorMessage || fallbackMessage
  };
}

/**
 * Check permission từ multiple errors
 */
export function checkMultiplePermissions(errors: any[], fallbackMessage = "You don't have permission to access this resource"): PermissionCheckResult {
  const results = errors.map(error => checkPermissionFromError(error, fallbackMessage));
  
  const hasAllPermissions = results.every(result => result.hasPermission);
  const hasAnyPermissionDenied = results.some(result => result.isPermissionDenied);
  
  return {
    hasPermission: hasAllPermissions,
    isPermissionDenied: hasAnyPermissionDenied,
    results,
    errorMessage: results.find(r => r.isPermissionDenied)?.errorMessage || fallbackMessage
  };
}

/**
 * Check permission từ API response
 */
export function checkPermissionFromResponse(response: any, fallbackMessage = "You don't have permission to access this resource"): PermissionCheckResult {
  // Check nếu response có error
  if (response?.error) {
    return checkPermissionFromError(response.error, fallbackMessage);
  }

  // Check nếu response có status 403
  if (response?.status === 403) {
    return {
      hasPermission: false,
      isPermissionDenied: true,
      errorMessage: response?.message || fallbackMessage
    };
  }

  return { hasPermission: true, isPermissionDenied: false };
}

/**
 * Tạo permission check function cho specific feature/operation
 */
export function createPermissionChecker(feature: string, operation: string) {
  return (error: any) => {
    const result = checkPermissionFromError(error);
    return {
      ...result,
      feature,
      operation,
      context: `${feature}:${operation}`
    };
  };
}
