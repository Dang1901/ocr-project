export interface Department {
  id: string;
  name: string;
}

export interface DepartmentListResponse {
  items: Department[];
  total: number;
  page: number;
  page_size: number;
}

export interface DepartmentBase {
  name: string;
}

export interface DepartmentType {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface DepartmentTypeListResponse {
  items: DepartmentType[];
  total: number;
  page: number;
  page_size: number;
}

