export interface CheckPermissionResponse {
  allowed: boolean;
  reason?: string;
}

export interface UserPermissionsResponse {
  [featureCode: string]: string[]; // e.g., { "ROLE": ["list_roles", "create_role"], "USER": ["list_users"] }
}

export interface CurrentUserInfo {
  id: string;
  username: string;
  email: string;
  fullname?: string;
  account_id: string;
  department_id?: string;
}

