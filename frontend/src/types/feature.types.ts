export interface Feature {
  id: string;
  code: string;
  name: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FeatureListResponse {
  items: Feature[];
  total: number;
  page: number;
  page_size: number;
}

export interface FeatureBase {
  name: string;
  code: string;
  url?: string;
}

