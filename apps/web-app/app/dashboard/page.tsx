'use client';

import { CheckIcon, ExternalLinkIcon, LogOutIcon } from 'lucide-react';
import * as React from 'react';

import { CheckInBlock } from '@/components/check-in-block';
import { CheckInModal } from '@/components/check-in-modal';
import { CheckOutBlock } from '@/components/check-out-block';
import { CheckOutModal } from '@/components/check-out-modal';
import { MyTodayEvents } from '@/components/my-today-events';
import { NewTodo } from '@/components/new-todo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from '@/components/ui/mini-calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCheckInStatus } from '@/hooks/useCheckIn';
import { useGetTodos } from '@/hooks/useGetTodos';
import { useUpdateTodo } from '@/hooks/useUpdateTodo';
import { formatDate, isToday, isWeekend } from '@/utils/date';
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

const TodosDashboard = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const { data: todos, isLoading: isTodosLoading } = useGetTodos(date);
  const [checkInModalOpen, setCheckInModalOpen] = React.useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = React.useState(false);
  const [updatingTodoId, setUpdatingTodoId] = React.useState<string | null>(
    null,
  );
  const { updateTodoAsync, isUpdating } = useUpdateTodo();

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

  const handleToggleComplete = async (
    todoId: string,
    currentStatus: boolean,
  ) => {
    setUpdatingTodoId(todoId);
    try {
      await updateTodoAsync({ id: todoId, completed: !currentStatus });
    } catch {
      // Error is already handled by the hook's onError callback
    } finally {
      // Clear updating state after a short delay to allow for smooth transition
      setTimeout(() => {
        setUpdatingTodoId(null);
      }, 300);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4 p-4 relative">
      {/* Blur overlay when check-in not complete */}
      {!hasCheckedIn && isDateToday && !isDateWeekend && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 pointer-events-none" />
      )}

      {isDateToday && (
        <MyTodayEvents className="block md:hidden" isDateToday={isDateToday} />
      )}

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

      <h2>
        My Todos for{' '}
        <span className="font-bold">
          {isDateToday ? 'Today' : formatDate(date, 'MMM D, YYYY')}
        </span>
      </h2>

      <div className="flex items-start gap-8">
        <div className="flex-1 rounded-sm shadow-sm relative">
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
              {(todos as Todo[]).map((todo) => {
                const isUpdatingThisTodo = updatingTodoId === todo.id;

                // Show skeleton loading state for the todo being updated
                if (isUpdatingThisTodo) {
                  return (
                    <div
                      key={todo.id}
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
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={todo.id}
                    className={`p-5 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-card ${
                      !hasCheckedOut &&
                      isDateToday &&
                      !todo.completed &&
                      isAfter4PM
                        ? 'border-red-500 border-2'
                        : ''
                    } ${todo.completed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 w-6 p-0 rounded-md ${
                            todo.completed
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border hover:bg-accent'
                          }`}
                          onClick={() =>
                            handleToggleComplete(todo.id, todo.completed)
                          }
                          disabled={isUpdating}
                          aria-label={
                            todo.completed
                              ? 'Mark as incomplete'
                              : 'Mark as complete'
                          }
                        >
                          {todo.completed && <CheckIcon className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-semibold text-lg ${
                                todo.completed
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {todo.title}
                            </h3>
                            {todo.linkUrl && (
                              <a
                                href={todo.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={getLinkTypeBadgeVariant(todo.linkType)}>
                        {getLinkTypeDisplayName(todo.linkType)}
                      </Badge>
                    </div>

                    <p
                      className={`mb-4 leading-relaxed ${
                        todo.completed
                          ? 'line-through text-muted-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {todo.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex-col gap-4 hidden md:flex">
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

          {isDateToday && (
            <MyTodayEvents
              className="hidden md:block"
              isDateToday={isDateToday}
            />
          )}

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
