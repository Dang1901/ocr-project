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
  updated_at?: string | null;
  total_pages?: number;
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

export interface OcrPage {
  page_number: number;
  status: string;
  llm_json: any | null;
  llm_json_alt: any | null;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentResult {
  document: Document;
  total_pages_count: number;
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
    has_previous: boolean;
  };
  pages: OcrPage[];
  processing_status: {
    completed: number;
    processing: number;
    pending: number;
    failed: number;
  };
}

