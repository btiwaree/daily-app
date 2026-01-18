import { useCheckInStatus } from '@/hooks/useCheckIn';
import dayjs from 'dayjs';
import { Skeleton } from './ui/skeleton';
import { isWeekend } from '@/utils/date';
import { isFuture } from 'date-fns';

export const CheckOutBlock = ({
  selectedDate = new Date(),
}: {
  selectedDate?: Date;
}) => {
  const { data: checkOutStatus, isLoading } = useCheckInStatus(selectedDate);
  const isWeekendDate = isWeekend(selectedDate);
  const isDateInFuture = isFuture(selectedDate);

  if (isWeekendDate || isDateInFuture) {
    return null;
  }

  if (isLoading || !checkOutStatus) {
    return (
      <CheckOutBlockWrapper>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
        </div>
      </CheckOutBlockWrapper>
    );
  }

  if (!checkOutStatus.hasCheckedOut) {
    return (
      <CheckOutBlockWrapper>
        <span className="font-mono text-md font-bold tabular-nums tracking-wider text-foreground">
          Not Checked Out
        </span>
      </CheckOutBlockWrapper>
    );
  }

  return (
    <CheckOutBlockWrapper>
      <div className="font-mono text-5xl md:text-7xl font-bold tabular-nums tracking-wider text-red-300">
        {dayjs(checkOutStatus.checkOutTime).format('HH:mm')}
      </div>
    </CheckOutBlockWrapper>
  );
};

const CheckOutBlockWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-muted-foreground">Check Out</div>
      {children}
    </div>
  );
};
