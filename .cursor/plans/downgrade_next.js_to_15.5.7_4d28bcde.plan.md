---
name: Downgrade Next.js to 15.5.7
overview: Downgrade Next.js from 16.1.1 to 15.5.7, including related dependencies and fixing the broken middleware file. The main changes involve package versions, potential Tailwind CSS v4 to v3 migration, and middleware fixes.
todos:
  - id: update-package-json
    content: "Update package.json: downgrade next to 15.5.7, eslint-config-next to 15.5.7"
    status: completed
  - id: fix-middleware
    content: Restore middleware.ts - uncomment clerkMiddleware() import and export, remove broken export default middleware line
    status: completed
  - id: test-tailwind
    content: Test if Tailwind CSS v4 works with Next.js 15.5.7, or migrate to v3 if needed
    status: completed
    dependencies:
      - update-package-json
  - id: install-dependencies
    content: Run pnpm install to update all dependencies
    status: completed
    dependencies:
      - update-package-json
  - id: verify-build
    content: Test build and dev server, verify Clerk auth and Tailwind styles work
    status: completed
    dependencies:
      - install-dependencies
      - fix-middleware
      - test-tailwind
---

# Downgrade Next.js from 16.1.1 to 15.5.7

## Assessment Summary

**Impact Level: Medium** - Requires package downgrades, potential Tailwind CSS migration, and middleware fix.

### Key Findings:

- React 19 is compatible with Next.js 15.5.7 ✓
- No Next.js 16-specific code features detected ✓
- Tailwind CSS v4 likely needs downgrade to v3 (v4 may be Next.js 16-specific)
- Middleware file has a bug that needs fixing
- Clerk should be compatible (needs verification)

## Required Changes

### 1. Package Dependencies ([apps/web-app/package.json](apps/web-app/package.json))

**Must Change:**

- `next`: `16.1.1` → `15.5.7`
- `eslint-config-next`: `16.1.1` → `15.5.7`

**Likely Need to Change (Tailwind CSS v4 → v3):**

- `tailwindcss`: `^4` → `^3.4.0` (or latest v3)
- `@tailwindcss/postcss`: Remove (v4-specific) or downgrade if available
- May need to add `tailwindcss` v3 config file

**No Change Needed:**

- `react`: `19.2.3` (compatible with Next.js 15.5.7)
- `react-dom`: `19.2.3` (compatible)
- `@clerk/nextjs`: `^6.36.5` (should work, verify after downgrade)

### 2. Restore Middleware File ([apps/web-app/middleware.ts](apps/web-app/middleware.ts))

**Current Issue:**

```typescript
// import { clerkMiddleware } from '@clerk/nextjs/server';
// export default clerkMiddleware();
export default middleware; // ❌ 'middleware' is not defined
```

**Required Fix:**

- Uncomment the `clerkMiddleware` import and export
- Remove the broken `export default middleware;` line
- Restore the proper Clerk middleware setup:
```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
```


**Note**: Next.js 15.5.7 supports Node.js middleware runtime, which may help with the Clerk Edge Runtime compatibility issue we encountered in Next.js 16.

### 3. Tailwind CSS Configuration

**Current Setup:**

- Using `@tailwindcss/postcss` (Tailwind v4)
- No `tailwind.config.js` file (v4 uses CSS-based config)

**If Tailwind v4 doesn't work with Next.js 15.5.7:**

- Remove `@tailwindcss/postcss` from dependencies
- Create `tailwind.config.js` with v3 configuration
- Update `postcss.config.mjs` to use standard Tailwind PostCSS plugin
- Verify `globals.css` uses v3 directives

### 4. ESLint Configuration ([apps/web-app/eslint.config.mjs](apps/web-app/eslint.config.mjs))

**No changes needed** - The flat config format works with Next.js 15.5.7, just need to match the version.

### 5. Next.js Config ([apps/web-app/next.config.ts](apps/web-app/next.config.ts))

**No changes needed** - Current config is compatible.

## Migration Steps

1. **Update package.json dependencies**
2. **Restore middleware.ts** (uncomment clerkMiddleware import and export, remove broken export line)
3. **Test Tailwind CSS compatibility** - If v4 works, keep it; if not, migrate to v3
4. **Run `pnpm install`** to update dependencies
5. **Test build**: `pnpm build`
6. **Test dev server**: `pnpm dev`
7. **Verify Clerk authentication** still works
8. **Check for any runtime errors**

## Risk Assessment

**Low Risk:**

- Next.js version downgrade (15.5.7 is stable)
- React 19 compatibility (confirmed)

**Medium Risk:**

- Tailwind CSS v4 → v3 migration (if needed) - may require CSS/config changes
- Clerk compatibility verification needed

**High Risk:**

- None identified

## Verification Checklist

- [ ] App builds successfully (`pnpm build`)
- [ ] Dev server starts without errors (`pnpm dev`)
- [ ] Clerk authentication works (sign in/out)
- [ ] Tailwind styles render correctly
- [ ] No console errors in browser
- [ ] All routes accessible (/, /dashboard, /settings)
- [ ] Middleware executes (if kept)

## Notes