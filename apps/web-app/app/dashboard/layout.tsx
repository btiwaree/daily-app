'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  if (!userId) {
    return null; // will redirect via useEffect
  }

  return <>{children}</>;
}
