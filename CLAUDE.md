# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

```bash
# Development
~/.bun/bin/bun dev          # watch mode (localhost:3000)
~/.bun/bin/bun run build    # production build — must pass clean before deploy
~/.bun/bin/bun run lint     # ESLint

# No test runner is configured.
```

Always verify `bun run build` passes (0 errors, 0 TS issues) after any significant change.

---

## Repository Role

`medialane-xyz` is the **public-facing developer portal** for the Medialane platform.
It is a Next.js 15 App Router site — mostly static/server-rendered pages.

**Do not confuse it with:**
- `medialane-io` — the consumer creator launchpad (invisible wallet, ChipiPay)
- `medialane-backend` — the Hono REST API + indexer service
- `medialane-sdk` — the TypeScript SDK (`medialane-sdk` npm package)

---

## Site Map

| Route | Purpose | Touch? |
|---|---|---|
| `/` | Hero + feature chips + mini pricing teaser + events | Yes |
| `/features` | API surface, AI agents, webhooks | Yes |
| `/pricing` | FREE vs PREMIUM table | Yes |
| `/connect` | Community links + contact form | Yes |
| `/docs` | Getting started guide | Yes |
| `/docs/api` | Full REST endpoint reference | Yes |
| `/docs/sdk` | medialane-sdk quickstart | Yes |
| `/changelog` | Static release timeline | Yes |
| `/terms` | Placeholder TOS | Yes |
| `/privacy` | Placeholder privacy policy | Yes |
| `/account` | Portal dashboard (Clerk auth) | **DO NOT TOUCH** |
| `/mint` | NFT mint page | **DO NOT TOUCH** |
| `/workshop` | Workshop event page | **DO NOT TOUCH** |

---

## Architecture

### Server vs Client Components

Next.js 15 App Router defaults everything to **server components**.
Only add `"use client"` when a component uses hooks, browser APIs, or event listeners.

Current client components (must have `"use client"`):
- `src/components/floating-nav.tsx` — uses `useState`, `usePathname`, framer-motion
- `src/components/logo-medialane.tsx` — uses `useMobile()` hook
- `src/components/docs/sidebar.tsx` — uses `usePathname`
- `src/app/connect/page.tsx` — contact form state

Current server components (no `"use client"`):
- `src/components/footer.tsx`
- `src/components/background-gradients.tsx`
- `src/components/docs/typography.tsx`
- All static page files (`/features`, `/pricing`, `/docs`, `/changelog`, etc.)

**Rule**: If a component renders a hook-using child, the child must own `"use client"` — not the parent. The `logo-medialane.tsx` bug (missing `"use client"`) was a real example of this.

### Layout hierarchy

```
src/app/layout.tsx          ← Root layout: ClerkProvider + FloatingNav + Footer
  src/app/docs/layout.tsx   ← Docs layout: 2-col (DocsSidebar + content)
    src/app/docs/page.tsx   ← Getting started
    src/app/docs/api/page.tsx
    src/app/docs/sdk/page.tsx
```

Footer is rendered in root layout — visible on all pages except those that override it (mint/workshop use their own layouts).

---

## Key Shared Components

| Component | Path | Purpose |
|---|---|---|
| `BackgroundGradients` | `src/components/background-gradients.tsx` | Fixed purple/cyan gradient blobs — import on full-page routes |
| `DocH2` / `DocH3` / `DocCodeBlock` | `src/components/docs/typography.tsx` | Consistent heading/code styling in docs + legal pages |
| `DocsSidebar` | `src/components/docs/sidebar.tsx` | Sticky left nav for `/docs/*` routes |
| `FloatingNav` | `src/components/floating-nav.tsx` | Top navigation — logo, nav links, account button |
| `Footer` | `src/components/footer.tsx` | 3-column footer + social row |
| `LogoMedialane` | `src/components/logo-medialane.tsx` | Responsive logo (different sizes mobile/desktop) |

### Adding a new page

1. Does it need the full-bleed background? → `import { BackgroundGradients } from "@/src/components/background-gradients"`
2. Is it a doc-style page? → Use `DocH2`, `DocH3`, `DocCodeBlock` from `@/src/components/docs/typography`
3. Is it inside `/docs`? → It automatically gets the sidebar via `src/app/docs/layout.tsx`

---

## Contact Form (SMTP)

`src/app/connect/page.tsx` → POST `src/app/api/contact/route.ts` → `src/lib/mailer.ts`

Env vars required (fill from medialane-dapp `.env`):

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=dao@medialane.org
SMTP_PASS=                     # from medialane-dapp .env
CONTACT_TO_EMAIL=dao@medialane.org
CONTACT_FROM_EMAIL=dao@medialane.org
```

The contact route uses Zod for validation. Honeypot field `_hp` blocks bot submissions.

---

## Design Conventions

- **Dark theme only** — all pages use a dark background, `text-white` / `text-muted-foreground`
- **Glass nav** — `.glass-effect` in `src/app/globals.css` (blur + dark bg/60)
- **Tailwind** — utility-first, no CSS modules. `cn()` from `src/lib/utils.ts` for conditional classes
- **Radix UI** — used for interactive primitives (Collapsible in sidebar, etc.)
- **Framer Motion** — used only in `floating-nav.tsx` for mobile menu animation
- **No custom fonts beyond Next.js defaults** — standard system font stack

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | Bun (`~/.bun/bin/bun`) |
| UI | React 19 + Tailwind v3 + Radix UI |
| Animation | Framer Motion |
| Auth | Clerk 6 (`@clerk/nextjs`) — only on `/account` |
| Email | nodemailer v8 (SMTP, contact form only) |
| Validation | Zod v3 (contact API route) |
| Path alias | `@/*` → repo root, `@/src/*` → `src/` |

---

## Common Pitfalls

- **`"use client"` missing on hook-using components** — causes build errors when the component tree is server-rendered. Add it at the component that owns the hook, not at the parent.
- **macOS `sed` backreferences** — BSD sed doesn't support `\1`/`\2` in replacement with `-i`. Use Python3 or the Edit tool instead.
- **`bun` not in PATH** — always use `~/.bun/bin/bun` explicitly or the Bash tool with full path.
- **Footer not rendered** — confirm `<Footer />` is uncommented in `src/app/layout.tsx`.
