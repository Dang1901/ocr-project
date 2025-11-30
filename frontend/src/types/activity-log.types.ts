export interface ActivityLogUser {
  id: string;
  username: string;
  email: string;
  fullname?: string | null;
}

export interface ActivityLog {
  id: number;
  user_id?: string | null;
  user?: ActivityLogUser | null;
  method: string;
  response_status: number;
  path: string;
  name?: string | null;
  created_at: string;
  deleted_at?: string | null;
}

export interface ActivityLogListResponse {
  total: number;
  count: number;
  data: ActivityLog[];
}

export interface ActivityLogListParams {
  user_id?: string;
  path?: string;
  status?: number;
  page?: number;
  size?: number;
}

