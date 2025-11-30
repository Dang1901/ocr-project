/**
 * Centralized error handling utilities
 */

export interface ApiError {
  status?: number;
  message?: string;
  error?: string;
  details?: any;
}

export class AppError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends AppError {
  constructor(message: string = 'Permission denied', details?: any) {
    super(message, 403, details);
    this.name = 'PermissionError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, details);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: any): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: any): boolean {
  if (error instanceof PermissionError) {
    return true;
  }
  
  if (error?.statusCode === 403 || error?.status === 403) {
    return true;
  }
  
  if (error?.error?.includes('permission') || error?.error?.includes('Permission')) {
    return true;
  }
  
  return false;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: any): boolean {
  if (error instanceof NotFoundError) {
    return true;
  }
  
  if (error?.statusCode === 404 || error?.status === 404) {
    return true;
  }
  
  return false;
}

/**
 * Check if error is an unauthorized error
 */
export function isUnauthorizedError(error: any): boolean {
  if (error instanceof UnauthorizedError) {
    return true;
  }
  
  if (error?.statusCode === 401 || error?.status === 401) {
    return true;
  }
  
  return false;
}

