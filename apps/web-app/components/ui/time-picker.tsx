'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string; // Format: "HH:mm"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  className,
  disabled,
}: TimePickerProps) {
  const timeValue = value || '09:00';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value;
    onChange(timeString);
  };

  return (
    <Input
      type="time"
      value={timeValue}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        'bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none max-w-xs',
        className,
      )}
    />
  );
}
