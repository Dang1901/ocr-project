export interface Permission {
  id: string;
  role_id: string;
  role_code: string;
  feature_id: string;
  feature_code: string;
  operation: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionGroup {
  feature_code: string;
  permissions: Permission[];
  own: boolean;
}

export interface PermissionListResponse {
  items: PermissionGroup[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreatePermissionRequest {
  role_id: string;
  feature_id: string;
  operation: string;
}

