'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { ActivityLogItem } from '@/components/activity-log-item';

interface ActivityLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityLogSheet({
  open,
  onOpenChange,
}: ActivityLogSheetProps) {
  const today = new Date();
  const { data: logs, isLoading } = useActivityLogs(today);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Today&apos;s Activity</SheetTitle>
          <SheetDescription>View all your actions from today</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity yet today.</p>
              <p className="text-sm mt-2">Your actions will appear here.</p>
            </div>
          ) : (
            logs.map((log) => <ActivityLogItem key={log.id} log={log} />)
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
