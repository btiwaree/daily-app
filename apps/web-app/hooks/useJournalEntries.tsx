import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { useApiClient } from '@/api-client';

export interface JournalEntry {
  id: string;
  userId: string;
  description: string;
  date: string;
  createdAt: string;
  deletedAt: string | null;
}

export const useJournalEntries = (date?: Date) => {
  const apiClient = useApiClient();
  const dateString = date
    ? dayjs(date).format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD');

  return useQuery<JournalEntry[]>({
    queryKey: ['journalEntries', dateString],
    queryFn: async () => {
      const response = await apiClient.get('/journal', {
        params: { date: dateString },
      });
      return response.data;
    },
    enabled: !!dateString,
  });
};
