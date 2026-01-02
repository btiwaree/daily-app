'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { ActivityLogItem } from '@/components/activity-log-item';
import { formatDate, isToday } from '@/utils/date';

export default function ActivityPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { data: logs, isLoading } = useActivityLogs(date);
  const isDateToday = isToday(date);

  return (
    <div className="flex flex-col justify-center gap-4 p-4">
      <div className="flex items-start gap-8 p-4">
        <div className="flex-1 p-4 border rounded-sm shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Activity Log{' '}
              {isDateToday ? (
                <span className="text-muted-foreground font-normal">
                  (Today)
                </span>
              ) : (
                <span className="text-muted-foreground font-normal">
                  ({formatDate(date, 'MMM D, YYYY')})
                </span>
              )}
            </h2>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
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
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No activity found</p>
                <p className="text-sm mt-2">
                  {isDateToday
                    ? "You haven't performed any actions today yet."
                    : 'No activity recorded for this date.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log) => (
                  <ActivityLogItem key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>
        </div>
        <Calendar
          mode="single"
          defaultMonth={date}
          selected={date}
          onSelect={(selectedDate: Date | undefined) => {
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
          className="border rounded-lg shadow-sm h-fit"
        />
      </div>
    </div>
  );
}
