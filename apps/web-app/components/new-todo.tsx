'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Calendar } from './ui/calendar';
import { Plus } from 'lucide-react';
import { useAddTodo } from '@/hooks/useAddTodo';
import { LinkType } from '@/utils/linkType';
import dayjs from 'dayjs';

interface TodoFormData {
  title: string;
  description: string;
  dueDate: Date | undefined;
  linkUrl: string;
  linkType: LinkType;
}

export const NewTodo = () => {
  const [open, setOpen] = useState(false);
  const { userId } = useAuth();
  const { mutate: addTodo, isPending } = useAddTodo();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TodoFormData>({
    defaultValues: {
      title: '',
      description: '',
      dueDate: undefined,
      linkUrl: '',
      linkType: LinkType.UNKNOWN,
    },
  });

  const onSubmit = (data: TodoFormData) => {
    if (!userId || !data.dueDate) {
      return;
    }

    // Format date as YYYY-MM-DD to avoid timezone issues
    // The backend will set it to 23:59:59 UTC for that date
    const dateString = dayjs(data.dueDate).format('YYYY-MM-DD');

    addTodo(
      {
        title: data.title,
        description: data.description,
        completed: false,
        dueDate: dateString,
        linkUrl: data.linkUrl,
        linkType: data.linkType,
        userId,
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon-sm">
          <Plus />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-4">
        <SheetHeader>
          <SheetTitle>New Todo</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter todo title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              {...register('description', {
                required: 'Description is required',
              })}
              placeholder="Enter todo description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium">
              Due Date
            </label>
            <Controller
              name="dueDate"
              control={control}
              rules={{ required: 'Due date is required' }}
              render={({ field }) => (
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  className="rounded-md border"
                />
              )}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="linkType" className="text-sm font-medium">
              Link Type
            </label>
            <Controller
              name="linkType"
              control={control}
              render={({ field }) => (
                <Select
                  id="linkType"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value as LinkType)}
                >
                  <option value={LinkType.FIGMA}>Figma</option>
                  <option value={LinkType.LINEAR}>Linear</option>
                  <option value={LinkType.NOTION}>Notion</option>
                  <option value={LinkType.SLACK}>Slack</option>
                  <option value={LinkType.GITHUB}>GitHub</option>
                  <option value={LinkType.UNKNOWN}>Unknown</option>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="linkUrl" className="text-sm font-medium">
              Link URL
            </label>
            <Input
              id="linkUrl"
              type="url"
              {...register('linkUrl', { required: 'Link URL is required' })}
              placeholder="https://example.com"
            />
            {errors.linkUrl && (
              <p className="text-sm text-destructive">
                {errors.linkUrl.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Todo'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
