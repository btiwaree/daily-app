import GoogleMeetLogo from '@/app/logos/google-meet';
import {
  CalendarEvent,
  useGoogleCalendarEvents,
} from '@/hooks/useGoogleCalendar';
import { cn } from '@/lib/utils';
import { formatEventTime } from '@/utils/date';
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Timer,
  Users,
} from 'lucide-react';
import React from 'react';
import { Skeleton } from './ui/skeleton';

export const MyTodayEvents = ({
  className,
  isDateToday,
  date = new Date(),
}: {
  className?: string;
  isDateToday: boolean;
  date: Date;
}) => {
  const [isEventsExpanded, setIsEventsExpanded] = React.useState(true);

  // Calculate today's start and end times for calendar events
  const todayEventsParams = React.useMemo(() => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return {
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      maxResults: 10,
    };
  }, [isDateToday]);

  const { events: todayEvents, isLoading: isEventsLoading } =
    useGoogleCalendarEvents(todayEventsParams || { timeMin: '', timeMax: '' });

  return (
    <div className={cn('border rounded-lg shadow-sm bg-card', className)}>
      <button
        onClick={() => setIsEventsExpanded(!isEventsExpanded)}
        className={`w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors mb-4`}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Your Meetings ({todayEvents?.length})
          </h3>
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
                <MyTodayEventItem key={event.id} event={event} />
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

const MyTodayEventItem = ({ event }: { event: CalendarEvent }) => {
  const { startTime, duration, isPast } = formatEventTime(event);

  return (
    <div
      key={event.id}
      className={cn(
        'p-3 border border-green-300 rounded-lg hover:shadow-md transition-shadow',
        isPast && 'opacity-50 border-red-300',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="">
          <div className="flex items-center gap-2 mb-1">
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
            {event.numParticipants > 0 && (
              <>
                <span className="text-xs text-muted-foreground/70">
                  <Users size={16} />
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {event.numParticipants}
                </span>
              </>
            )}
          </div>
          <h4 className="font-semibold text-sm mb-1">{event.summary}</h4>
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 max-w-40 truncate">
              {event.description}
            </p>
          )}
          {event.location && (
            <p className="text-xs text-muted-foreground mt-1 max-w-40 truncate">
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
            <GoogleMeetLogo className="h-5 w-5" />
          </a>
        )}
      </div>
    </div>
  );
};
