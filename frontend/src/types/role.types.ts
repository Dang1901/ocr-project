import type { DepartmentSummary } from './document.types';

export interface Role {
  id: string;
  code: string;
  name?: string;
  level?: string;
  level_int?: number;
  department_id?: string;
  department?: DepartmentSummary | null;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoleListResponse {
  items: Role[];
  total: number;
  page: number;
  page_size: number;
}

export interface RolePayload {
  name: string;
  code: string;
  level?: string;
  level_int?: number;
  department_id?: string;
  is_active?: number;
}

export type RoleUpdatePayload = Partial<RolePayload>;

