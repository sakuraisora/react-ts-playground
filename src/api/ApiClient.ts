// Pinchlab sponsored
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiClient, ApiRequestConfig, ApiResponse } from './types';
import { Interceptors } from './interceptors';

const baseUrl = 'https://jsonplaceholder.typicode.com/';
export class BaseApiClient implements ApiClient {
  private axiosInstance: AxiosInstance;
  private interceptors: Interceptors;

  constructor(baseURL: string, interceptors: Interceptors) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
    });
    this.interceptors = interceptors;
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      // @ts-expect-error - This is a workaround to avoid type errors
      async (config) => {
        if (this.interceptors.request.onRequest) {
          return await this.interceptors.request.onRequest(config);
        }
        return config;
      },
      async (error) => {
        if (this.interceptors.request.onRequestError) {
          return await this.interceptors.request.onRequestError(error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      // @ts-expect-error - This is a workaround to avoid type errors
      async (response) => {
        if (this.interceptors.response.onResponse) {
          return await this.interceptors.response.onResponse(response);
        }
        return response;
      },
      async (error) => {
        if (this.interceptors.response.onResponseError) {
          return await this.interceptors.response.onResponseError(error);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, config as AxiosRequestConfig);
    return this.transformResponse(response);
  }

  //
  async post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data, config as AxiosRequestConfig);
    return this.transformResponse(response);
  }

  async put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data, config as AxiosRequestConfig);
    return this.transformResponse(response);
  }

  async delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url, config as AxiosRequestConfig);
    return this.transformResponse(response);
  }

  private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  }
}

const interceptors: Interceptors = {
  request: {
    onRequest: (config) => {
      // * Modify the request if needed
      return config
    },
  },
  response: {
    onResponse: (response) => {
      // * Modify the response if needed
      return response
    },
  },
}

export const apiClient = new BaseApiClient(baseUrl, interceptors)