'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '@/api-client';
import { useCheckOut } from '@/hooks/useCheckOut';
import { useUpdateTodo } from '@/hooks/useUpdateTodo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/date';

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

interface CheckOutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function CheckOutModal({
  open,
  onOpenChange,
  onComplete,
}: CheckOutModalProps) {
  const apiClient = useApiClient();
  const { checkOutAsync, isCheckingOut } = useCheckOut();
  const { updateTodoAsync, isUpdating } = useUpdateTodo();
  const [handledTodos, setHandledTodos] = React.useState<Set<string>>(
    new Set(),
  );

  const { data: incompleteTodos, isLoading } = useQuery<Todo[]>({
    queryKey: ['incompleteTodosToday'],
    queryFn: async () => {
      const response = await apiClient.get('/check-in-out/incomplete-today');
      return response.data;
    },
    enabled: open,
  });

  const handleMarkComplete = async (todoId: string) => {
    try {
      await updateTodoAsync({ id: todoId, completed: true });
      setHandledTodos((prev) => new Set(prev).add(todoId));
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleMoveToTomorrow = async (todoId: string) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      await updateTodoAsync({ id: todoId, dueDate: tomorrow });
      setHandledTodos((prev) => new Set(prev).add(todoId));
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleCompleteCheckOut = async () => {
    try {
      await checkOutAsync();
      onComplete();
      onOpenChange(false);
    } catch {
      // Error handling is done in the hook
    }
  };

  const remainingTodos =
    incompleteTodos?.filter((todo) => !handledTodos.has(todo.id)) || [];
  const canComplete = remainingTodos.length === 0 && !isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Check Out for Today</DialogTitle>
          <DialogDescription>
            Review and handle incomplete todos from today before ending your
            day.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading incomplete todos...
            </div>
          ) : incompleteTodos && incompleteTodos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No incomplete todos from today. Great job!
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                {remainingTodos.length} todo
                {remainingTodos.length !== 1 ? 's' : ''} remaining
              </div>
              <div className="space-y-3">
                {incompleteTodos?.map((todo) => {
                  const isHandled = handledTodos.has(todo.id);
                  return (
                    <div
                      key={todo.id}
                      className={`p-4 border rounded-lg ${
                        isHandled
                          ? 'bg-muted opacity-60'
                          : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{todo.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {todo.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due:{' '}
                            {formatDate(new Date(todo.dueDate), 'MMM D, YYYY')}
                          </p>
                        </div>
                        {!isHandled && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkComplete(todo.id)}
                              disabled={isUpdating}
                            >
                              Mark Complete
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMoveToTomorrow(todo.id)}
                              disabled={isUpdating}
                            >
                              Move to Tomorrow
                            </Button>
                          </div>
                        )}
                        {isHandled && (
                          <span className="text-xs text-muted-foreground">
                            Handled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleCompleteCheckOut}
            disabled={!canComplete || isCheckingOut}
          >
            {isCheckingOut ? 'Checking out...' : 'Complete Check-out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
