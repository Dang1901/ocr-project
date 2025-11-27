import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, API_PATH, AUTH_MODE, DOMAIN } from '../utils/constants';
import { refreshToken, validateToken } from './auth.api';
import type { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
type RetryAxiosRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_PATH}`,
      timeout: 10000,
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      (config) => {
        config.headers = config.headers || {};

        // Don't set Content-Type for FormData, let browser set it with boundary
        if (!(config.data instanceof FormData)) {
          if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
          }
        }
        config.headers['Accept'] = 'application/json';

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.status >= 200 && response.status < 300 && !('success' in response.data)) {
          return {
            ...response,
            data: {
              success: true,
              data: response.data,
            },
          };
        }
        return response;
      },
      async (error: AxiosError) => {
        if (!error.response) {
          return Promise.reject({
            success: false,
            error: 'Network error. Please check your connection.',
          } as APIResponse);
        }

        if (error.response.status === 0) {
          return Promise.reject({
            success: false,
            error: 'CORS error. Please check server configuration.',
          } as APIResponse);
        }

        const originalRequest = error.config as RetryAxiosRequestConfig | undefined;

        if (!originalRequest) {
          return Promise.reject({
            success: false,
            error: 'No original request found.',
          } as APIResponse);
        }

        const authMode = AUTH_MODE;
        if (authMode) {
          const handleIfNoAuthenticated = () => {
            window.location.href = `${DOMAIN}/login`;
          };

          const handleRefreshToken = async () => {
            const refreshResponse = await refreshToken();
            if (refreshResponse && refreshResponse.data) {

              return true; 
            } else {
              handleIfNoAuthenticated();
              return false;
            }
          };

          if (error.response.status === 403) {
            return Promise.reject({
              success: false,
              error: 'Access denied. You do not have permission to perform this action.',
            } as APIResponse);
          }

          if (error.response.status === 401) {
            const result = await validateToken();
            
            if (result?.data?.detail === "TOKEN_INVALID") {
              try {
                const refreshed = await handleRefreshToken();
                if (!refreshed) {
                  handleIfNoAuthenticated();
                  return;
                }
              } catch (err) {
                handleIfNoAuthenticated();
                return;
              }
            } else if (result?.data?.detail === "TOKEN_VALID") {
              originalRequest._retry = true;
              return this.client.request(originalRequest as AxiosRequestConfig);
            } else {
              handleIfNoAuthenticated();
              return;
            }
            
            originalRequest._retry = true;
            return this.client.request(originalRequest as AxiosRequestConfig);
          }
        }

        const errorResponse = error.response?.data as { error?: string };
        const message = errorResponse?.error || error.message;
        return Promise.reject({
          success: false,
          error: message,
        } as APIResponse);
      }
    );
  }

  async get<T = any>(url: string, params?: any, headers?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.client.get<APIResponse<T>>(url, {
        params,
        headers,
      });
      return response.data;
    } catch (error) {
      return error as APIResponse;
    }
  }

  async post<T = any>(url: string, data?: any, params?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.client.post<APIResponse<T>>(url, data, { params });
      return response.data;
    } catch (error) {
      return error as APIResponse;
    }
  }

  async put<T = any>(url: string, data?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.client.put<APIResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return error as APIResponse;
    }
  }

  async delete<T = any>(url: string, data?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.client.delete<APIResponse<T>>(url, { data });
      return response.data;
    } catch (error) {
      return error as APIResponse;
    }
  }
}

export const httpClient = new HttpClient();
export default HttpClient;

