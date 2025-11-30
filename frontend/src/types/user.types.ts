export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  roles?: Array<{ id: string; name: string; code: string }>;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserRoleAssignment {
  user_id: string;
  role_ids: string[];
}

export interface UserRoleRemoval {
  user_id: string;
  role_ids: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ToggleUserStatusRequest {
  is_active: boolean;
}

