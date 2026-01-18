'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserSettings } from '@/hooks/useUserSettings';
import {
  useGoogleCalendarStatus,
  useDisconnectGoogleCalendar,
  useConnectGoogleCalendar,
} from '@/hooks/useGoogleCalendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from 'sonner';

function OAuthCallbackHandler() {
  const searchParams = useSearchParams();

  // Handle OAuth callback redirect
  React.useEffect(() => {
    if (!searchParams) return;

    const googleCalendar = searchParams.get('googleCalendar');
    if (googleCalendar === 'connected') {
      toast.success('Google Calendar connected successfully!', {
        duration: 5000,
        position: 'bottom-right',
      });
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    } else if (googleCalendar === 'error') {
      const error = searchParams.get('error');
      toast.error('Failed to connect Google Calendar', {
        description: error || 'An unknown error occurred',
        duration: 5000,
        position: 'bottom-right',
        className: 'bg-destructive text-destructive-foreground',
      });
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }
  }, [searchParams]);

  return null;
}

function SettingsPageContent() {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const {
    status,
    isLoading: isStatusLoading,
    isConnected,
  } = useGoogleCalendarStatus();
  const { disconnect, isDisconnecting } = useDisconnectGoogleCalendar();
  const { connect, isConnecting } = useConnectGoogleCalendar();
  const [checkInTime, setCheckInTime] = React.useState('09:00');
  const [checkOutTime, setCheckOutTime] = React.useState('17:00');

  React.useEffect(() => {
    if (settings) {
      setCheckInTime(settings.preferredCheckInTime || '09:00');
      setCheckOutTime(settings.preferredCheckOutTime || '17:00');
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      preferredCheckInTime: checkInTime,
      preferredCheckOutTime: checkOutTime,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center gap-4 p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center gap-4 p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="checkInTime"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Preferred Check-in Time
          </label>
          <p className="text-sm text-muted-foreground">
            Set your preferred time for daily check-in (24-hour format)
          </p>
          <TimePicker
            value={checkInTime}
            onChange={setCheckInTime}
            disabled={isUpdating}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="checkOutTime"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Preferred Check-out Time
          </label>
          <p className="text-sm text-muted-foreground">
            Set your preferred time for daily check-out (24-hour format)
          </p>
          <TimePicker
            value={checkOutTime}
            onChange={setCheckOutTime}
            disabled={isUpdating}
          />
        </div>

        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>

      {/* Integrations Section */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Integrations</h2>

        {/* Google Calendar Integration */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Google Calendar to view events
              </p>
            </div>
            {isStatusLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : isConnected ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 dark:text-green-400">
                  Connected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => connect()}
                size="sm"
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <OAuthCallbackHandler />
      </Suspense>
      <SettingsPageContent />
    </>
  );
}
