import {
  useGoogleCalendarEvents,
  useGoogleCalendarStatus,
} from '@/hooks/useGoogleCalendar';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  ExternalLinkIcon,
  Presentation,
  Timer,
} from 'lucide-react';
import React from 'react';
import { Skeleton } from './ui/skeleton';

export const MyTodayEvents = ({
  className,
  isDateToday,
}: {
  className?: string;
  isDateToday: boolean;
}) => {
  const [isEventsExpanded, setIsEventsExpanded] = React.useState(true);
  // Google Calendar integration
  const { isConnected: isCalendarConnected } = useGoogleCalendarStatus();

  // Calculate today's start and end times for calendar events
  const todayEventsParams = React.useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return {
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      maxResults: 10,
    };
  }, [isDateToday]);

  const { events: todayEvents, isLoading: isEventsLoading } =
    useGoogleCalendarEvents(todayEventsParams || { timeMin: '', timeMax: '' });

  // Format event time for display
  const formatEventTime = (event: {
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
  }): { startTime: string; duration: string | null } => {
    if (event.start.dateTime) {
      const startDate = new Date(event.start.dateTime);
      const startTime = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Calculate duration if end time is available
      if (event.end.dateTime) {
        const endDate = new Date(event.end.dateTime);
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));

        let duration: string;
        if (durationMinutes < 60) {
          duration = `${durationMinutes}m`;
        } else {
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          if (minutes === 0) {
            duration = `${hours}h`;
          } else {
            duration = `${hours}h ${minutes}m`;
          }
        }

        return { startTime, duration };
      }

      return { startTime, duration: null };
    }
    if (event.start.date) {
      return { startTime: 'All day', duration: null };
    }
    return { startTime: '', duration: null };
  };

  return (
    <div className={cn('border rounded-lg shadow-sm bg-card', className)}>
      <button
        onClick={() => setIsEventsExpanded(!isEventsExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Your Meetings</h3>
        </div>
        {isEventsExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>
      {isEventsExpanded && (
        <div className="p-4 pt-0 space-y-2 max-h-100 overflow-y-auto">
          {isEventsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : todayEvents && todayEvents.length > 0 ? (
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="">
                      <div className="flex items-center gap-2 mb-1">
                        {(() => {
                          const { startTime, duration } =
                            formatEventTime(event);
                          return (
                            <>
                              <span className="text-sm text-muted-foreground font-medium">
                                {startTime}
                              </span>
                              {duration && (
                                <>
                                  <span className="text-xs text-muted-foreground/70">
                                    <Timer size={16} />
                                  </span>
                                  <span className="text-sm text-muted-foreground font-medium">
                                    {duration}
                                  </span>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {event.summary}
                      </h4>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-32 truncate">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                    {event.meetLink && (
                      <a
                        href={event.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Presentation size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No events scheduled for today.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
