import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { default as isTodayPlugin } from 'dayjs/plugin/isToday';
import { isPast } from 'date-fns';

dayjs.extend(utc);
dayjs.extend(isTodayPlugin);

export const isToday = (date: Date | undefined) => dayjs(date).isToday();
export const isWeekend = (date = new Date()) =>
  dayjs(date).day() === 0 || dayjs(date).day() === 6;

export const formatDate = (date: Date | undefined, format: string) => {
  if (!date) return dayjs().format(format);

  return dayjs(date).format(format);
};

export const formatEventTime = (event: {
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}): { startTime: string; duration: string | null; isPast?: boolean } => {
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

      // check if meeting is in the past, we want to gray out the ca
      if (isPast(event.start.dateTime)) {
        return {
          startTime: event.start.dateTime,
          duration,
          isPast: true,
        };
      }

      return { startTime, duration, isPast: false };
    }

    // check if meeting is in the past, we want to gray out the ca
    if (isPast(event.start.dateTime)) {
      return {
        startTime,
        duration: null,
        isPast: true,
      };
    }

    return { startTime, duration: null, isPast: false };
  }
  if (event.start.date) {
    return { startTime: 'All day', duration: null, isPast: false };
  }
  return { startTime: '', duration: null, isPast: false };
};
