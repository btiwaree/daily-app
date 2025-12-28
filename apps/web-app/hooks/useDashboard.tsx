import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '@/api-client';

export const useDashboard = () => {
  const apiClient = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/me');
      return response.data;
    },
    enabled: true,
  });

  return { data, isLoading };
};
