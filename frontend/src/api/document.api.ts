import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';
import type {
  Document,
  DocumentListResponse,
  DocumentUpdatePayload,
  DocumentResult,
} from '../types/document.types';

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

  getDocument: async (documentId: string): Promise<APIResponse<DocumentResult>> => {
    return httpClient.get(`/ocr/documents/${documentId}/result`);
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

