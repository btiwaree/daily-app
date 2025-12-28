// FALLBACK OPTION: If removing middleware causes errors, try this minimal version
// This attempts to use clerkMiddleware but may still fail in Edge Runtime
// due to Node.js API dependencies

import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};

// NOTE: This will likely still fail with Edge Runtime errors.
// If this happens, you may need to:
// 1. Wait for Clerk to release an Edge-compatible version
// 2. Contact Clerk support for guidance
// 3. Consider using a different authentication solution
// 4. Use only client-side protection (current approach)
