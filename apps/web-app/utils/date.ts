import dayjs from 'dayjs';
import { default as isTodayPlugin } from 'dayjs/plugin/isToday';

dayjs.extend(isTodayPlugin);

export const isToday = (date: Date | undefined) => dayjs(date).isToday();

export const formatDate = (date: Date | undefined, format: string) => {
  if (!date) return '';
  return dayjs(date).format(format);
};
