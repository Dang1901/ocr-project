import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';

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

export const featureApi = {
  getFeatures: async (params?: {
    q?: string;
    page?: number;
    page_size?: number;
  }): Promise<APIResponse<FeatureListResponse>> => {
    return httpClient.get('/features', params);
  },

  getFeature: async (featureId: string): Promise<APIResponse<Feature>> => {
    return httpClient.get(`/features/${featureId}`);
  },

  createFeature: async (featureData: FeatureBase): Promise<APIResponse<Feature>> => {
    return httpClient.post('/features', featureData);
  },

  updateFeature: async (featureId: string, featureData: Partial<FeatureBase>): Promise<APIResponse<Feature>> => {
    return httpClient.put(`/features/${featureId}`, featureData);
  },

  deleteFeature: async (featureId: string): Promise<APIResponse<{ message: string }>> => {
    return httpClient.delete(`/features/${featureId}`);
  },
};

