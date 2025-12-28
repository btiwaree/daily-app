import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { useApiClient } from '@/api-client';

export interface ActivityLog {
  id: string;
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string | null;
  entityTitle: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export const useActivityLogs = (date?: Date) => {
  const apiClient = useApiClient();
  const dateString = date
    ? dayjs(date).format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD');

  return useQuery<ActivityLog[]>({
    queryKey: ['activityLogs', dateString],
    queryFn: async () => {
      const response = await apiClient.get('/activity-logs', {
        params: { date: dateString },
      });
      return response.data;
    },
    enabled: !!dateString,
  });
};

