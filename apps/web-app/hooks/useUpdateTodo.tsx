import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';

import { useApiClient } from '@/api-client';

interface UpdateTodoParams {
  id: string;
  completed?: boolean;
  dueDate?: Date;
}

export const useUpdateTodo = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, completed, dueDate }: UpdateTodoParams) => {
      // Format date as YYYY-MM-DD to avoid timezone issues
      const dateString = dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : undefined;
      const response = await apiClient.patch(`/todos/${id}`, {
        completed,
        dueDate: dateString,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['checkInStatus'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update todo', {
        description: error.response?.data?.message || error.message,
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
    },
  });

  return {
    updateTodo: updateMutation.mutate,
    updateTodoAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

