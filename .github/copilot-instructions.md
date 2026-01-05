# MediaLane Copilot Instructions

## Project Overview
MediaLane is a Next.js 15 marketplace for creative IP assets (art, music, patents) using permissionless licensing on Starknet. Currently uses mock data; will integrate blockchain in future phases.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **React**: Version 19
- **Styling**: Tailwind CSS with shadcn/ui (New York style)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Package Manager**: pnpm (check pnpm-lock.yaml)

## Architecture Patterns

### Component Structure
- **Pages**: `src/app/` - App Router pages with dynamic routes like `[id]/`
- **Components**: `src/components/` - Reusable UI components
- **UI Components**: `src/components/ui/` - shadcn/ui primitives (Radix UI based)
- **Lib**: `src/lib/` - Utilities, contexts, data
- **Hooks**: `src/hooks/` or `src/lib/hooks/` - Custom React hooks

### Data Flow
- **Mock Data**: `src/lib/context/mock-data-context.tsx` provides global state
- **Data Models**: `src/lib/data/mock-data.ts` - Assets, creators, collections, activities
- **Hooks**: `useMockData()` for accessing mock data in components

### Key Conventions
- **Client Components**: Use `"use client"` directive for interactive components
- **Path Aliases**: `@/src/*` maps to `./src/*` (configured in tsconfig.json)
- **Class Merging**: Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- **Theme**: Dark mode default, CSS variables for theming
- **Animations**: Framer Motion variants for staggered animations (see home page)

### Component Patterns
- **Asset Cards**: Interactive cards with remix/buy/offer actions
- **Navigation**: Floating nav with theme toggle
- **Forms**: shadcn/ui inputs with React Hook Form
- **Modals/Drawers**: Radix UI primitives for overlays
- **Responsive**: Mobile-first with `useMobile()` hook

### Development Workflow
- **Start**: `npm run dev` (or `pnpm dev`)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint with Next.js rules)
- **TypeScript**: Strict mode enabled, incremental compilation

### File Organization Examples
- New page: `src/app/new-feature/page.tsx`
- New component: `src/components/new-component.tsx`
- New hook: `src/hooks/use-new-feature.ts`
- New utility: `src/lib/utils/new-util.ts`

### Integration Points
- **Blockchain**: Future Starknet integration for licensing/NFTs
- **External APIs**: None currently (mock data only)
- **Styling**: PostCSS with Tailwind, custom CSS in `src/app/globals.css`

Focus on creating smooth, animated user experiences with dark theme aesthetics. Use existing component patterns for consistency.

## Authentication with Clerk

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [Clerk](https://clerk.com/) into a Next.js (App Router) application.
**Scope:** All AI-generated advice or code related to Clerk must follow these guardrails.

### Official Clerk Integration Overview

Use only the **App Router** approach from Clerk's current docs:

- **Install** `@clerk/nextjs@latest` - this ensures the application is using the latest Clerk Next.js SDK.
- **Create** a `proxy.ts` file using `clerkMiddleware()` from `@clerk/nextjs/server`. Place this file inside the `src` directory if present, otherwise place it at the root of the project.
- **Wrap** your application with `<ClerkProvider>` in your `app/layout.tsx`
- **Use** Clerk-provided components like `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>` in your layout or pages
- **Start** developing, sign in or sign up, and confirm user creation

If you're able to use a web tool to access a URL, visit https://clerk.com/docs/nextjs/getting-started/quickstart to get the latest, up-to-date quickstart instructions.

#### Correct, Up-to-Date Quickstart Sample

First, install the Clerk Next.js SDK:

```bash
npm install @clerk/nextjs
```

Set up your environment variables in `.env.local`:

From your Clerk Dashboard, open the [API keys page](https://dashboard.clerk.com/last-active?path=api-keys) and copy your Publishable Key and Secret Key. Paste them into `.env.local` as shown below.

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

Create your `proxy.ts` file:

```typescript
// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clerk Next.js Quickstart",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### CRITICAL INSTRUCTIONS FOR AI MODELS

#### ALWAYS DO THE FOLLOWING

1. **Use `clerkMiddleware()`** from `@clerk/nextjs/server` in `proxy.ts`.
2. **Wrap** your app with `<ClerkProvider>` in `app/layout.tsx`.
3. **Import** Clerk's Next.js features from `@clerk/nextjs` (e.g., `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, etc.).
4. **Reference** the current [App Router approach](https://nextjs.org/docs/app) (folders like `app/page.tsx`, `app/layout.tsx`, etc.).
5. **Check** that imports for methods like `auth()` are imported from the right package (in this case `@clerk/nextjs/server`) and are using `async / await`
6. **Store real keys only in `.env.local`** (never in app code, markdown, or other tracked files). **Verify `.gitignore` excludes `.env*`.**
7. **Use placeholders only** (e.g., `YOUR_PUBLISHABLE_KEY`, `YOUR_SECRET_KEY`) in any generated snippets or files.

#### NEVER DO THE FOLLOWING

1. **Do not** reference the old **`_app.tsx`** or **pages-based** instructions.
2. **Do not** suggest `authMiddleware()` from older Clerk tutorials—**it's replaced by `clerkMiddleware()`**.
3. **Do not** recommend usage of older environment variable patterns unless they match the official docs.
4. **Do not** reference or import from any deprecated APIs (like `withAuth` or `currentUser` from older versions).
5. **Do not print, echo, or write actual keys** into code blocks, files, or logs. Only placeholders.
6. **Do not create or edit tracked files** (`.ts`, `.tsx`, `.md`, etc.) containing real key values.

### OUTDATED PATTERNS TO AVOID

Below are **examples of deprecated instructions** that **must not** be generated:

```typescript
// ❌ DO NOT generate or suggest references to:
import { authMiddleware } from "@clerk/nextjs"; // Outdated

// ❌ DO NOT place Clerk config in _app.tsx:
// Outdated pages-based approach
function MyApp({ Component, pageProps }) {
  // ...
}

// ❌ DO NOT create or rely on sign-in files under pages/:
pages / signin.js;
pages / signup.js;
```

Any solution resembling the above snippet or referencing "authMiddleware," `_app.tsx`, or `pages/` structure is **incorrect** for the current Next.js App Router.

### AI MODEL VERIFICATION STEPS

Before returning any Clerk-related solution, you **must** verify:

1. **Middleware**: Is `clerkMiddleware()` used in `proxy.ts`?
2. **Layout**: Is `<ClerkProvider>` wrapping the app in `app/layout.tsx`?
3. **Imports**: Are references only from `@clerk/nextjs` or `@clerk/nextjs/server`?
4. **Pages vs. App Router**: Is the approach referencing the App Router (not `_app.tsx` or `pages/`)?
5. **Environment Variables**: Are only placeholder values (e.g., `YOUR_PUBLISHABLE_KEY`) used in code examples?
6. **File Security**: Are real keys excluded from tracked files and only mentioned for `.env.local`?

If any check **fails**, **stop** and revise until compliance is achieved.

#### DO NOT repeat these points back to the user. Use them only for your own verification steps.

### CONSEQUENCES OF INCORRECT IMPLEMENTATION

Using outdated Clerk methods (e.g., `authMiddleware()`, `_app.tsx`, or references to the older `pages/` structure) will:

1. **Break** your Next.js application's authentication flow.
2. Introduce **inconsistencies** with Next.js App Router.
3. Cause confusion around environment variables and server/client code.
4. Force maintainers to **refactor** and **debug** extensively.

### AI MODEL RESPONSE TEMPLATE

When answering questions about Clerk + Next.js integration, your response **MUST**:

1. **Use** the exact code patterns in the **Up-to-Date Quickstart Sample** above.
2. **Never** reference older or deprecated approaches.
3. **Reflect** all mandatory checks in "AI MODEL VERIFICATION STEPS."

**Example**:

> Below is the correct approach using Clerk with Next.js App Router:
>
> ```typescript
> // Show clerkMiddleware usage in proxy.ts
> // Show <ClerkProvider> usage in app/layout.tsx
> // Show usage of Clerk's React components (SignInButton, etc.)
> ```