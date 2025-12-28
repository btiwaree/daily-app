import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';

import { useApiClient } from '@/api-client';

interface CheckInStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
}

interface CheckInResponse {
  checkInOut: {
    id: string;
    userId: string;
    date: string;
    checkInTime: string;
    checkOutTime: string | null;
  };
  incompleteTodos: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    linkUrl: string;
    linkType: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export const useCheckIn = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<CheckInResponse>(
        '/check-in-out/check-in',
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkInStatus'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Check-in complete!', {
        duration: 3000,
        position: 'bottom-right',
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : error instanceof Error
            ? error.message
            : 'Failed to check in';
      toast.error('Failed to check in', {
        description: errorMessage,
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
    },
  });

  return {
    checkIn: checkInMutation.mutate,
    checkInAsync: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
  };
};

export const useCheckInStatus = (date?: Date) => {
  const apiClient = useApiClient();
  const dateString = date
    ? dayjs(date).format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD');

  return useQuery<CheckInStatus>({
    queryKey: ['checkInStatus', dateString],
    queryFn: async () => {
      const response = await apiClient.get('/check-in-out/status', {
        params: { date: dateString },
      });
      return response.data;
    },
  });
};
