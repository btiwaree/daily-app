import { useCheckInStatus } from '@/hooks/useCheckIn';
import { isWeekend } from '@/utils/date';
import { isFuture } from 'date-fns';
import dayjs from 'dayjs';
import { Skeleton } from './ui/skeleton';

export const CheckInBlock = ({
  selectedDate = new Date(),
}: {
  selectedDate?: Date;
}) => {
  const { data: checkInStatus, isLoading: isCheckInStatusLoading } =
    useCheckInStatus(selectedDate);
  const isWeekendDate = isWeekend(selectedDate);
  const isDateInFuture = isFuture(selectedDate);

  if (isWeekendDate || isDateInFuture) {
    return null;
  }

  if (isCheckInStatusLoading || !checkInStatus) {
    return (
      <CheckInBlockWrapper>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
        </div>
      </CheckInBlockWrapper>
    );
  }

  if (!checkInStatus.hasCheckedIn) {
    return (
      <CheckInBlockWrapper>
        <span className="font-mono text-md font-bold tabular-nums tracking-wider text-foreground">
          Not Checked In
        </span>
      </CheckInBlockWrapper>
    );
  }

  return (
    <CheckInBlockWrapper>
      <div className="font-mono text-5xl md:text-7xl font-bold tabular-nums tracking-wider text-green-300">
        {dayjs(checkInStatus.checkInTime).format('HH:mm')}
      </div>
    </CheckInBlockWrapper>
  );
};

const CheckInBlockWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-muted-foreground">Check-in</div>
      {children}
    </div>
  );
};
