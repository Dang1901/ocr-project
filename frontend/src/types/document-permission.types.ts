export interface DocumentPermission {
  id: string;
  role_code: string;
  document_type: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface DocumentPermissionListResponse {
  items: DocumentPermission[];
  total: number;
  page: number;
  page_size: number;
}

export interface DocumentPermissionPayload {
  role_code: string;
  document_type: string;
  can_view?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
}

export type DocumentPermissionUpdatePayload = Partial<DocumentPermissionPayload>;

