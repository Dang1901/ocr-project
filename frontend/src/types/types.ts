export interface UserType {
  id: string;
  username: string;
  email: string;
  fullname?: string;
  department_id?: string;
  first_name?: string;
  last_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  roles?: RoleType[];
  total?: number;
}

export interface DepartmentType {
  id: string;
  name: string;
}

export interface RoleType {
  id: string;
  name?: string;
  code: string;
  level?: string;
  level_int?: number;
  department_id?: string;
  department?: DepartmentType | null;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrgType {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface ActivityLogType {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  status: string;
  ip_address?: string;
  created_at: string;
}
