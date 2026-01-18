import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Kalam } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { UserHeader } from '@/components/user-header';
import { Providers } from '@/Providers';
import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const kalam = Kalam({
  weight: ['300', '400', '700'],
  variable: '--font-kalam',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'My Daily Notes',
  description:
    'My Daily Notes is a simple todo list app that helps you manage your daily tasks and stay organized.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${kalam.variable} antialiased h-full flex flex-col`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <Providers className="flex flex-col h-full">
              <header className="flex items-center justify-between h-16 gap-4 py-4 px-6 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                <SignedOut>
                  <Logo />
                  <div className="flex gap-4">
                    <SignInButton />
                    <SignUpButton>
                      <Button variant="outline">Sign Up</Button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-4">
                    <Logo href="/dashboard" />
                    <Link href="/activity">
                      <Button variant="ghost" size="sm">
                        Activity
                      </Button>
                    </Link>
                    <Link href="/journal">
                      <Button variant="ghost" size="sm">
                        Journal
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" size="sm">
                        Settings
                      </Button>
                    </Link>
                  </div>
                  <div className="w-fit flex gap-2">
                    <ThemeToggle />
                    <UserHeader />
                  </div>
                </SignedIn>
              </header>
              <main className="flex-1 overflow-auto">{children}</main>
              <footer className="flex items-center justify-between h-16 gap-4 py-4 px-6 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                <Link href="/privacy-policy">Privacy Policy</Link>
              </footer>
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

const Logo = ({ href = '/' }) => (
  <div className="w-fit">
    <Link href={href}>
      <span className="font-mono font-bold text-black dark:text-white">
        My Daily Notes
      </span>
    </Link>
  </div>
);
