'use client';

import * as React from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TimePicker } from '@/components/ui/time-picker';

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
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
    </div>
  );
}
