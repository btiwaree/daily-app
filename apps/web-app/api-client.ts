import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { useEffect } from 'react';

export function useApiClient() {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => apiClient.interceptors.request.eject(interceptor);
  }, [getToken]);

  return apiClient;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  withCredentials: true,
});
