import {
  getLinkTypeBadgeVariant,
  getLinkTypeDisplayName,
} from '@/utils/linkType';
import { CheckIcon, ExternalLinkIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUpdateTodo } from '@/hooks/useUpdateTodo';
import { Badge } from '@/components/ui/badge';

export interface Todo {
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

export const TodoCard = ({
  todo,
  updatingTodoId,
  setUpdatingTodoId,
  hasCheckedOut,
  isDateToday,
  isAfter4PM,
}: {
  todo: Todo;
  updatingTodoId: string | null;
  setUpdatingTodoId: (todoId: string | null) => void;
  hasCheckedOut: boolean;
  isDateToday: boolean;
  isAfter4PM: boolean;
}) => {
  const isUpdatingThisTodo = updatingTodoId === todo.id;

  const { updateTodoAsync, isUpdating } = useUpdateTodo();

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

  // Show skeleton loading state for the todo being updated
  if (isUpdatingThisTodo) {
    return (
      <div key={todo.id} className="p-5 border rounded-lg shadow-sm bg-card">
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
        !hasCheckedOut && isDateToday && !todo.completed && isAfter4PM
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
            onClick={() => handleToggleComplete(todo.id, todo.completed)}
            disabled={isUpdating}
            aria-label={
              todo.completed ? 'Mark as incomplete' : 'Mark as complete'
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
};

export const TodoCardSkeleton = () => {
  return (
    <div className="p-5 border rounded-lg shadow-sm bg-card">
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
  );
};
