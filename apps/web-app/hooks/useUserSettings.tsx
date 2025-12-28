import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useApiClient } from '@/api-client';

interface UserSettings {
  id: string;
  userId: string;
  preferredCheckInTime: string;
  preferredCheckOutTime: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateSettingsParams {
  preferredCheckInTime?: string;
  preferredCheckOutTime?: string;
}

export const useUserSettings = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<UserSettings>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const response = await apiClient.get('/user-settings');
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: UpdateSettingsParams) => {
      const response = await apiClient.patch('/user-settings', settings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('Settings updated successfully!', {
        duration: 3000,
        position: 'bottom-right',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to update settings', {
        description: error.response?.data?.message || error.message,
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
    },
  });

  if (error) {
    toast.error('Failed to fetch settings', {
      description: error.message,
      duration: 5000,
      position: 'bottom-right',
      className: 'bg-destructive text-destructive-foreground',
    });
  }

  return {
    settings: data,
    isLoading,
    updateSettings: updateMutation.mutate,
    updateSettingsAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

