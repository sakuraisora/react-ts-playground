import { ApiRequestConfig, ApiResponse, ApiError } from './types';

export interface RequestInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  onRequestError?: (error: ApiError) => Promise<ApiError>;
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onResponseError?: (error: ApiError) => Promise<ApiError>;
}

export interface Interceptors {
  request: RequestInterceptor;
  response: ResponseInterceptor;
} 