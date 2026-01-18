'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient();

export const Providers = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={cn(className)}>{children}</div>
    </QueryClientProvider>
  );
};
