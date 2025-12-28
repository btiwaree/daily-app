'use client';

import { useAuth, UserButton } from '@clerk/nextjs';
import { Skeleton } from './ui/skeleton';

export function UserHeader() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <Skeleton className="w-8 h-8 rounded-full" />;
  }

  return <UserButton />;
}
