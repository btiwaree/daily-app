'use client';

import { CalendarIcon, ExternalLinkIcon, LogOutIcon } from 'lucide-react';
import * as React from 'react';

import { CheckInModal } from '@/components/check-in-modal';
import { CheckOutModal } from '@/components/check-out-modal';
import { NewTodo } from '@/components/new-todo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCheckInStatus } from '@/hooks/useCheckIn';
import { useGetTodos } from '@/hooks/useGetTodos';
import { formatDate, isToday } from '@/utils/date';
import {
  getLinkTypeBadgeVariant,
  getLinkTypeDisplayName,
} from '@/utils/linkType';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  linkUrl: string;
  linkType: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const Test = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { data: todos, isLoading: isTodosLoading } = useGetTodos(date);
  const [checkInModalOpen, setCheckInModalOpen] = React.useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = React.useState(false);

  const isDateToday = isToday(date);
  const today = new Date();
  const { data: checkInStatus, isLoading: isCheckInStatusLoading } =
    useCheckInStatus(today);

  const hasCheckedIn = checkInStatus?.hasCheckedIn ?? false;
  const hasCheckedOut = checkInStatus?.hasCheckedOut ?? false;

  // Check if current time is after 4 PM
  const isAfter4PM = React.useMemo(() => {
    if (!isDateToday) return false;
    const now = new Date();
    return now.getHours() >= 16; // 4 PM = 16:00
  }, [isDateToday]);

  React.useEffect(() => {
    if (!isCheckInStatusLoading && !hasCheckedIn && isDateToday) {
      setCheckInModalOpen(true);
    }
  }, [isCheckInStatusLoading, hasCheckedIn, isDateToday]);

  const handleCheckInComplete = () => {
    setCheckInModalOpen(false);
  };

  const handleCheckOutComplete = () => {
    setCheckOutModalOpen(false);
  };

  return (
    <div className="flex flex-col justify-center gap-4 p-4 relative">
      {/* Blur overlay when check-in not complete */}
      {!hasCheckedIn && isDateToday && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 pointer-events-none" />
      )}

      <div className="flex items-start gap-8 p-4">
        <div className="flex-1 p-4 border rounded-sm shadow-sm relative">
          <div className="flex justify-between items-center mb-4">
            <h2>
              My Todos for{' '}
              <span className="font-bold">
                {isDateToday ? 'Today' : formatDate(date, 'MMM D, YYYY')}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <NewTodo />
              {/* Check-out button */}
              {hasCheckedIn && !hasCheckedOut && isDateToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCheckOutModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Check Out
                </Button>
              )}
            </div>
          </div>

          {isTodosLoading ? (
            <div className="space-y-4">
              {[1].map((i) => (
                <div
                  key={i}
                  className="p-5 border rounded-lg shadow-sm bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>

                  <div className="space-y-2 mb-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : !todos || (Array.isArray(todos) && todos.length === 0) ? (
            <div className="text-muted-foreground">
              No todos yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {(todos as Todo[]).map((todo) => (
                <div
                  key={todo.id}
                  className={`p-5 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-card ${
                    !hasCheckedOut &&
                    isDateToday &&
                    !todo.completed &&
                    isAfter4PM
                      ? 'border-red-500 border-2'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-foreground">
                      {todo.title}
                    </h3>
                    <Badge variant={getLinkTypeBadgeVariant(todo.linkType)}>
                      {getLinkTypeDisplayName(todo.linkType)}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {todo.description}
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        Due: {formatDate(new Date(todo.dueDate), 'MMM D, YYYY')}
                      </span>
                    </div>

                    {todo.linkUrl && (
                      <a
                        href={todo.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <span>View Link</span>
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Check-in Modal */}
      <CheckInModal
        open={checkInModalOpen}
        onOpenChange={setCheckInModalOpen}
        onComplete={handleCheckInComplete}
      />

      {/* Check-out Modal */}
      <CheckOutModal
        open={checkOutModalOpen}
        onOpenChange={setCheckOutModalOpen}
        onComplete={handleCheckOutComplete}
      />
    </div>
  );
};

export default Test;
