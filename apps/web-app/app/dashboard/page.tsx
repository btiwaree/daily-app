'use client';

import { LogOutIcon } from 'lucide-react';
import * as React from 'react';

import { CheckInBlock } from '@/components/check-in-block';
import { CheckInModal } from '@/components/check-in-modal';
import { CheckOutBlock } from '@/components/check-out-block';
import { CheckOutModal } from '@/components/check-out-modal';
import { MyTodayEvents } from '@/components/my-today-events';
import { NewTodo } from '@/components/new-todo';
import { Todo, TodoCard, TodoCardSkeleton } from '@/components/todo-card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from '@/components/ui/mini-calendar';
import { useCheckInStatus } from '@/hooks/useCheckIn';
import { useGetTodos } from '@/hooks/useGetTodos';
import { formatDate, isToday, isWeekend } from '@/utils/date';

const TodosDashboard = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const { data: todos, isLoading: isTodosLoading } = useGetTodos(date);
  const [checkInModalOpen, setCheckInModalOpen] = React.useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = React.useState(false);
  const [updatingTodoId, setUpdatingTodoId] = React.useState<string | null>(
    null,
  );

  const isDateToday = isToday(date);
  const isDateWeekend = isWeekend(date);
  const { data: checkInStatus, isLoading: isCheckInStatusLoading } =
    useCheckInStatus(date);

  const hasCheckedIn = checkInStatus?.hasCheckedIn ?? false;
  const hasCheckedOut = checkInStatus?.hasCheckedOut ?? false;

  // Check if current time is after 4 PM
  const isAfter4PM = React.useMemo(() => {
    if (!isDateToday) return false;
    const now = new Date();
    return now.getHours() >= 16; // 4 PM = 16:00
  }, [isDateToday]);

  React.useEffect(() => {
    if (
      !isCheckInStatusLoading &&
      !hasCheckedIn &&
      isDateToday &&
      !isDateWeekend
    ) {
      setCheckInModalOpen(true);
    }
  }, [isCheckInStatusLoading, hasCheckedIn, isDateToday, isDateWeekend]);

  const handleCheckInComplete = () => {
    setCheckInModalOpen(false);
  };

  const handleCheckOutComplete = () => {
    setCheckOutModalOpen(false);
  };

  return (
    <div className="flex flex-col justify-center gap-4 p-4 relative">
      {/* Blur overlay when check-in not complete */}
      {!hasCheckedIn && isDateToday && !isDateWeekend && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 pointer-events-none" />
      )}

      {isDateToday && (
        <MyTodayEvents
          className="block lg:hidden"
          isDateToday={isDateToday}
          date={date}
        />
      )}

      <h2 className="my-2 text-2xl font-medium">
        My Todos for{' '}
        <span className="font-bold font-mono">
          {isDateToday ? 'Today' : formatDate(date, 'MMM D, YYYY')}
        </span>
      </h2>

      <MiniCalendar
        className="md:hidden flex justify-center"
        onValueChange={(selectedDate) => {
          if (selectedDate) {
            setDate(selectedDate);
          }
        }}
      >
        <MiniCalendarNavigation direction="prev" />
        <MiniCalendarDays>
          {(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}
        </MiniCalendarDays>
        <MiniCalendarNavigation direction="next" />
      </MiniCalendar>

      <div className="flex items-start gap-8">
        <div className="w-full lg:w-3/4 min-w-0 rounded-sm shadow-sm relative">
          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center gap-2">
              <NewTodo />
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
              {[1, 2, 3].map((i) => (
                <TodoCardSkeleton key={`todo-card-skeleton-${i}`} />
              ))}
            </div>
          ) : !todos || (Array.isArray(todos) && todos.length === 0) ? (
            <div className="text-muted-foreground">
              No todos yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {(todos as Todo[]).map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  updatingTodoId={updatingTodoId}
                  setUpdatingTodoId={setUpdatingTodoId}
                  hasCheckedOut={hasCheckedOut}
                  isDateToday={isDateToday}
                  isAfter4PM={isAfter4PM}
                />
              ))}
            </div>
          )}
        </div>
        {/* SideView for Desktop */}
        <div className="w-1/4 min-w-0 flex-col gap-4 hidden lg:flex">
          <Calendar
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={(selectedDate: Date | undefined) => {
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            className="border rounded-lg shadow-sm h-fit w-full"
            classNames={{
              root: 'w-full',
            }}
          />

          <MyTodayEvents
            className="hidden md:block"
            isDateToday={isDateToday}
            date={date}
          />

          <CheckInBlock selectedDate={date} />
          <CheckOutBlock selectedDate={date} />
        </div>
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

export default TodosDashboard;
