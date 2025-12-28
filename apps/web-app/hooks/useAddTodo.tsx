import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/api-client';

export interface CreateTodoDto {
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  linkUrl: string;
  linkType: string;
  userId: string;
}

export const useAddTodo = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todo: CreateTodoDto) => {
      const response = await apiClient.post('/todos', todo);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
