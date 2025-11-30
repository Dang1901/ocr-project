export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  read: boolean;
}

export interface AlertListResponse {
  items: Alert[];
  total: number;
  page: number;
  page_size: number;
}

