'use client';

import * as React from 'react';
import {
  CheckIcon,
  ClockIcon,
  PlusIcon,
  SettingsIcon,
  CalendarIcon,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ActivityLog } from '@/hooks/useActivityLogs';

dayjs.extend(relativeTime);

interface ActivityLogItemProps {
  log: ActivityLog;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'CREATE':
      return <PlusIcon className="h-4 w-4" />;
    case 'UPDATE_COMPLETED':
      return <CheckIcon className="h-4 w-4" />;
    case 'UPDATE_DUE_DATE':
      return <CalendarIcon className="h-4 w-4" />;
    case 'CHECK_IN':
    case 'CHECK_OUT':
      return <ClockIcon className="h-4 w-4" />;
    case 'UPDATE_SETTINGS':
      return <SettingsIcon className="h-4 w-4" />;
    default:
      return <ClockIcon className="h-4 w-4" />;
  }
};

const getActionDescription = (log: ActivityLog): string => {
  switch (log.actionType) {
    case 'CREATE':
      return `Created "${log.entityTitle || 'todo'}"`;
    case 'UPDATE_COMPLETED':
      const completed = log.metadata?.newValue;
      return `Marked "${log.entityTitle || 'todo'}" as ${
        completed ? 'complete' : 'incomplete'
      }`;
    case 'UPDATE_DUE_DATE':
      return `Updated due date for "${log.entityTitle || 'todo'}"`;
    case 'CHECK_IN':
      return 'Checked in';
    case 'CHECK_OUT':
      return 'Checked out';
    case 'UPDATE_SETTINGS':
      return 'Updated settings';
    default:
      return `Performed ${log.actionType}`;
  }
};

export function ActivityLogItem({ log }: ActivityLogItemProps) {
  const timeAgo = dayjs(log.createdAt).fromNow();

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
      <div className="mt-0.5 text-muted-foreground">
        {getActionIcon(log.actionType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {getActionDescription(log)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
      </div>
    </div>
  );
}

