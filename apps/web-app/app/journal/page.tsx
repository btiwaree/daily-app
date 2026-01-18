'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useJournalEntries, JournalEntry } from '@/hooks/useJournalEntries';
import { useAddJournalEntry } from '@/hooks/useAddJournalEntry';
import { JournalEntryItem } from '@/components/journal-entry';
import { formatDate, isToday } from '@/utils/date';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import {
  MiniCalendar,
  MiniCalendarNavigation,
  MiniCalendarDays,
  MiniCalendarDay,
} from '@/components/ui/mini-calendar';

export default function JournalPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [description, setDescription] = React.useState('');
  const [isFormCollapsed, setIsFormCollapsed] = React.useState(true);
  const { data: entries, isLoading } = useJournalEntries(date);
  const { mutate: addEntry, isPending } = useAddJournalEntry();
  const isDateToday = isToday(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const dateString = date
      ? dayjs(date).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');

    addEntry(
      {
        description: description.trim(),
        date: dateString,
      },
      {
        onSuccess: () => {
          setDescription('');
          setIsFormCollapsed(true);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4 p-4">
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
      <div className="flex items-start gap-8 mt-4">
        <div className="flex-1">
          <div className="mb-6">
            <h2
              className="text-2xl font-bold mb-2 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
            >
              {isFormCollapsed ? (
                <Plus className="h-5 w-5" />
              ) : (
                <Minus className="h-5 w-5" />
              )}
              Add Journal{' '}
              {isDateToday ? (
                <span className="text-muted-foreground font-normal">
                  (Today)
                </span>
              ) : (
                <span className="text-muted-foreground font-normal">
                  ({formatDate(date, 'MMM D, YYYY')})
                </span>
              )}
            </h2>
            {!isFormCollapsed && (
              <>
                <p className="text-sm text-muted-foreground">
                  Write your thoughts, ideas, or anything you want to
                  remember...
                </p>
                <form onSubmit={handleSubmit} className="mt-4">
                  <Textarea
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write your thoughts..."
                    className="font-kalam text-2xl md:text-3xl leading-10 min-h-100 resize-none p-4 border-0 shadow-none bg-transparent"
                    disabled={isPending}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-muted-foreground">
                      Press Cmd + Enter to save
                    </p>
                    <Button
                      type="submit"
                      disabled={!description.trim() || isPending}
                    >
                      {isPending ? 'Adding...' : 'Add Entry'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Journal Entries</h3>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="mb-6 pb-6 border-b">
                    <Skeleton className="h-20 w-full mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : !entries || entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No entries yet</p>
                <p className="text-sm mt-2">
                  {isDateToday
                    ? 'Start writing to create your first journal entry.'
                    : 'No entries recorded for this date.'}
                </p>
              </div>
            ) : (
              <div>
                {entries.map((entry: JournalEntry) => (
                  <JournalEntryItem key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
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
          className="border rounded-lg shadow-sm h-fit hidden md:block"
        />
      </div>
    </div>
  );
}
