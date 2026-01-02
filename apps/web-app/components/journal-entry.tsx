'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { JournalEntry } from '@/hooks/useJournalEntries';

dayjs.extend(relativeTime);

interface JournalEntryProps {
  entry: JournalEntry;
}

export function JournalEntryItem({ entry }: JournalEntryProps) {
  const timeAgo = dayjs(entry.createdAt).fromNow();

  return (
    <div className="mb-6 pb-6 border-b last:border-b-0 last:mb-0">
      <p className="font-kalam text-lg leading-relaxed text-foreground whitespace-pre-wrap">
        {entry.description}
      </p>
      <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
    </div>
  );
}
