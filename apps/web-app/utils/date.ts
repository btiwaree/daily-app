import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { default as isTodayPlugin } from 'dayjs/plugin/isToday';

dayjs.extend(utc);
dayjs.extend(isTodayPlugin);

export const isToday = (date: Date | undefined) => dayjs(date).isToday();
export const isWeekend = (date: Date | undefined) =>
  dayjs(date).day() === 0 || dayjs(date).day() === 6;

export const formatDate = (date: Date | undefined, format: string) => {
  if (!date) return '';
  // Use UTC mode to avoid timezone conversion issues when displaying dates
  // This ensures dates stored as "Dec 28 23:59:59 UTC" display as "Dec 28" not "Dec 29"
  return dayjs.utc(date).format(format);
};
