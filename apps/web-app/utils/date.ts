import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { default as isTodayPlugin } from 'dayjs/plugin/isToday';

dayjs.extend(utc);
dayjs.extend(isTodayPlugin);

export const isToday = (date: Date | undefined) => dayjs(date).isToday();
export const isWeekend = (date = new Date()) =>
  dayjs(date).day() === 0 || dayjs(date).day() === 6;

export const formatDate = (date: Date | undefined, format: string) => {
  if (!date) return dayjs().format(format);

  return dayjs(date).format(format);
};
