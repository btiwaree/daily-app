import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useApiClient } from '@/api-client';

interface GoogleCalendarStatus {
  connected: boolean;
  scopes: string[];
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
}

interface ListEventsParams {
  timeMin: string; // ISO 8601 date string
  timeMax: string; // ISO 8601 date string
  maxResults?: number;
}

/**
 * Hook to get Google Calendar connection status
 */
export const useGoogleCalendarStatus = () => {
  const apiClient = useApiClient();

  const { data, isLoading, error } = useQuery<GoogleCalendarStatus>({
    queryKey: ['googleCalendar', 'status'],
    queryFn: async () => {
      const response = await apiClient.get(
        '/integrations/google-calendar/status',
      );
      return response.data;
    },
  });

  if (error) {
    // Only show error toast if it's not a 401/403 (user just not connected)
    const status = (error as any)?.response?.status;
    if (status !== 401 && status !== 403) {
      toast.error('Failed to fetch Google Calendar status', {
        description:
          (error as any)?.response?.data?.message || (error as Error).message,
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
    }
  }

  return {
    status: data,
    isLoading,
    isConnected: data?.connected ?? false,
  };
};

/**
 * Hook to list Google Calendar events
 */
export const useGoogleCalendarEvents = (params: ListEventsParams) => {
  const apiClient = useApiClient();

  const { data, isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: ['googleCalendar', 'events', params],
    queryFn: async () => {
      const response = await apiClient.get(
        '/integrations/google-calendar/events',
        {
          params,
        },
      );
      return response.data;
    },
    enabled: !!params.timeMin && !!params.timeMax,
  });

  if (error) {
    toast.error('Failed to fetch calendar events', {
      description:
        (error as any)?.response?.data?.message || (error as Error).message,
      duration: 5000,
      position: 'bottom-right',
      className: 'bg-destructive text-destructive-foreground',
    });
  }

  return {
    events: data ?? [],
    isLoading,
    error,
  };
};

/**
 * Hook to disconnect Google Calendar
 */
export const useDisconnectGoogleCalendar = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        '/integrations/google-calendar/disconnect',
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['googleCalendar'] });
      toast.success('Google Calendar disconnected successfully', {
        duration: 3000,
        position: 'bottom-right',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to disconnect Google Calendar', {
        description: error.response?.data?.message || error.message,
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
    },
  });

  return {
    disconnect: disconnectMutation.mutate,
    disconnectAsync: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
};

/**
 * Hook to connect Google Calendar
 * Makes an authenticated API call to get the OAuth URL, then redirects
 */
export const useConnectGoogleCalendar = () => {
  const apiClient = useApiClient();

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.get(
        '/integrations/google-calendar/connect',
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Google OAuth consent screen
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: (error: any) => {
      toast.error('Failed to initiate Google Calendar connection', {
        description: error.response?.data?.message || error.message,
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
    },
  });

  return {
    connect: connectMutation.mutate,
    connectAsync: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
  };
};
