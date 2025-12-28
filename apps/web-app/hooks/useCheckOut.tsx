import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useApiClient } from '@/api-client';

interface CheckOutResponse {
  checkInOut: {
    id: string;
    userId: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
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

export const useCheckOut = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<CheckOutResponse>(
        '/check-in-out/check-out',
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkInStatus'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Check-out complete!', {
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
            : 'Failed to check out';
      toast.error('Failed to check out', {
        description: errorMessage,
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
    },
  });

  return {
    checkOut: checkOutMutation.mutate,
    checkOutAsync: checkOutMutation.mutateAsync,
    isCheckingOut: checkOutMutation.isPending,
  };
};
