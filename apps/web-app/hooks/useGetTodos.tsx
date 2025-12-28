import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';

import { useApiClient } from '@/api-client';

export const useGetTodos = (date: Date | undefined) => {
  const apiClient = useApiClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['todos', date],
    queryFn: async () => {
      // Format date as YYYY-MM-DD to avoid timezone issues
      const dateString = date ? dayjs(date).format('YYYY-MM-DD') : undefined;

      const response = await apiClient.get('/todos', {
        params: {
          date: dateString,
        },
      });
      return response.data;
    },
    enabled: !!date,
  });

  if (error) {
    toast.error('Failed to fetch todos', {
      description: error.message,
      duration: 5000,
      position: 'bottom-right',
      className: 'bg-destructive text-destructive-foreground',
    });
  }

  return { data, isLoading };
};
