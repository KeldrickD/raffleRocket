import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create base axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from local storage if it exists
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Optionally clear tokens and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      
      if (typeof window !== 'undefined') {
        // Only redirect in browser environment
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API client wrapper with typed methods
export const apiClient = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.get<T>(url, config);
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.post<T>(url, data, config);
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.put<T>(url, data, config);
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.delete<T>(url, config);
  },
  
  // File upload with progress tracking
  upload<T = any>(
    url: string, 
    file: File, 
    onProgress?: (percentage: number) => void,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const axiosConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    };
    
    return axiosInstance.post<T>(url, formData, axiosConfig);
  },
};

// Export the instance for advanced use cases
export default axiosInstance; 