import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';

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

export const departmentApi = {
  getDepartments: async (params?: {
    q?: string;
    page?: number;
    page_size?: number;
  }): Promise<APIResponse<DepartmentListResponse>> => {
    return httpClient.get('/departments', params);
  },

  getDepartment: async (departmentId: string): Promise<APIResponse<Department>> => {
    return httpClient.get(`/departments/${departmentId}`);
  },

  createDepartment: async (departmentData: DepartmentBase): Promise<APIResponse<Department>> => {
    return httpClient.post('/departments', departmentData);
  },

  updateDepartment: async (departmentId: string, departmentData: Partial<DepartmentBase>): Promise<APIResponse<Department>> => {
    return httpClient.put(`/departments/${departmentId}`, departmentData);
  },

  deleteDepartment: async (departmentId: string): Promise<APIResponse<{ message: string }>> => {
    return httpClient.delete(`/departments/${departmentId}`);
  },

  getDepartmentTypes: async (params?: {
    q?: string;
    page?: number;
    page_size?: number;
  }): Promise<APIResponse<DepartmentTypeListResponse>> => {
    return httpClient.get('/department-types', params);
  },
};

