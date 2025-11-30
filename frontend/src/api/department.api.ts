import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  Department,
  DepartmentListResponse,
  DepartmentBase,
  DepartmentType,
  DepartmentTypeListResponse,
} from '../types/department.types';

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

