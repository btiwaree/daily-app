import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';

import { useApiClient } from '@/api-client';

export interface CreateJournalEntryDto {
  description: string;
  date?: string;
}

export const useAddJournalEntry = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: CreateJournalEntryDto) => {
      const response = await apiClient.post('/journal', entry);
      return response.data;
    },
    onSuccess: (_, variables) => {
      const dateString = variables.date || dayjs().format('YYYY-MM-DD');
      queryClient.invalidateQueries({
        queryKey: ['journalEntries', dateString],
      });
      toast.success('Journal entry added', {
        duration: 2000,
        position: 'bottom-right',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to add journal entry', {
        description: error.response?.data?.message || error.message,
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
    },
  });
};
