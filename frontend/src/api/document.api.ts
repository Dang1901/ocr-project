import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';

export interface DepartmentSummary {
  id: string;
  name: string;
}

export interface Document {
  id: string;
  filename: string;
  file_path: string;
  department_id?: string | null;
  status?: string | null;
  document_type?: string | null;
  created_by?: string | null;
  owner?: string | null;
  created_at?: string | null;
  department?: DepartmentSummary | null;
}

export interface DocumentListResponse {
  items: Document[];
  total: number;
  page: number;
  page_size: number;
}

export interface DocumentPayload {
  filename: string;
  file_path: string;
  department_id?: string | null;
  status?: string | null;
  document_type?: string | null;
}

export type DocumentUpdatePayload = Partial<DocumentPayload>;

export const documentApi = {
  getDocuments: async (params?: {
    q?: string;
    department_id?: string;
    document_type?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<APIResponse<DocumentListResponse>> => {
    return httpClient.get('/documents', params);
  },

  getDocument: async (documentId: string): Promise<APIResponse<Document>> => {
    return httpClient.get(`/documents/${documentId}`);
  },

  createDocument: async (formData: FormData): Promise<APIResponse<Document>> => {
    return httpClient.post('/documents', formData, undefined);
  },

  updateDocument: async (documentId: string, documentData: DocumentUpdatePayload): Promise<APIResponse<Document>> => {
    return httpClient.put(`/documents/${documentId}`, documentData);
  },

  deleteDocument: async (documentId: string): Promise<APIResponse<{ message: string }>> => {
    return httpClient.delete(`/documents/${documentId}`);
  },
};

