<img width="2972" height="2160" alt="Medialane.xyz — Developer Portal for Programmable IP on Starknet" src="https://github.com/user-attachments/assets/abd42bec-d6b9-4636-a9cf-21fe8ec3ba0d" />

# Medialane.xyz

**Developer Portal + Creator App for Programmable IP on Starknet**

[medialane.xyz](https://medialane.xyz) is the developer-facing gateway to the Medialane platform — API access, SDK documentation, API key management, webhooks, and usage analytics. It also serves as an onboarding hub for creators joining Medialane with an invisible Starknet wallet (passkey-first, PIN fallback).

Everything you need to build Programmable IP on Starknet. One REST API. All the data. No indexer needed.

---

## What is Medialane?

Medialane is infrastructure for the **creative economy on Starknet**. It enables creators, businesses, and AI agents to own, license, and trade intellectual property as NFTs — with programmable licensing terms embedded immutably in IPFS metadata, compliant with the Berne Convention.

The platform operates through two integrated products:

- **[Medialane.io](https://medialane.io)** — Consumer marketplace and creator launchpad. Mint IP assets, trade NFTs, manage collections. No wallet required — gasless transactions via ChipiPay.
- **[Medialane.xyz](https://medialane.xyz)** — Developer portal. API keys, REST endpoint docs, SDK quickstart, webhooks, usage analytics.

Both are powered by the Medialane backend (Starknet indexer + Hono REST API) and the `@medialane/sdk` TypeScript package.

---

## Features

### For Developers
- **REST API access** — Query orders, tokens, collections, activities, search. One API key, all the data.
- **API key management** — Create, view, and revoke keys from the `/account` dashboard
- **Webhooks** — Subscribe to `ORDER_CREATED`, `ORDER_FULFILLED`, `ORDER_CANCELLED`, `TRANSFER` events (PREMIUM)
- **Usage analytics** — 30-day request history by day
- **SDK documentation** — `@medialane/sdk` quickstart, full method reference
- **Full API reference** — Every endpoint, parameter, and response shape documented at `/docs/api`

### For Creators
- **Invisible Starknet wallet** — Created on first use, protected by passkey (Face ID / Touch ID) or a 6-12 digit PIN
- **Gasless transactions** — ChipiPay sponsors gas on Starknet Mainnet
- **Contact form** — Reach the team at `/connect`

### Platform
- **Pricing** — FREE (50 req/month) and PREMIUM (3,000 req/min) tiers
- **Changelog** — Release timeline at `/changelog`
- **Dark-theme UI** — Glass navigation, gradient backgrounds, Framer Motion animations

---

## API Overview

The Medialane REST API indexes Starknet in real time and exposes structured data for any dApp or agent.

| Category | What you get |
|---|---|
| **Orders & Listings** | Open orders, bids, fulfilled listings. Filter by NFT, collection, user, currency, price. |
| **Tokens & Metadata** | On-chain + IPFS metadata for any token. Upload and pin your own metadata. |
| **Collections** | Floor price, total volume, holder count, token inventory for any collection. |
| **Activities** | Mints, transfers, sales, offers, cancellations — indexed in real time. |
| **Intents (SNIP-12)** | Create, sign, and submit structured trade intents using the SNIP-12 typed data standard. |
| **Search** | Full-text search across tokens, collections, and creators. |
| **Portal** | API keys, webhooks, usage — self-service from `/account`. |

Get your API key at [medialane.xyz/account](https://medialane.xyz/account). Full reference at [medialane.xyz/docs/api](https://medialane.xyz/docs/api).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript |
| UI | React 19 + [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Auth | [Clerk 6](https://clerk.com/) (email, social, passkey) |
| Wallet | [ChipiPay](https://chipipay.com/) (`@chipi-stack/nextjs` + `@chipi-stack/chipi-passkey`) |
| Email | nodemailer v8 (SMTP — contact form) |
| Validation | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |
| SDK | [@medialane/sdk](https://www.npmjs.com/package/@medialane/sdk) |

---

## Site Map

| Route | Description |
|---|---|
| `/` | Hero, feature overview, pricing teaser, ecosystem links |
| `/features` | API surface, AI agent support, webhooks, real-time indexing |
| `/pricing` | FREE vs PREMIUM comparison |
| `/connect` | Community links + contact form (SMTP) |
| `/docs` | Getting started guide |
| `/docs/api` | Full REST endpoint reference |
| `/docs/sdk` | `@medialane/sdk` quickstart and method reference |
| `/changelog` | Release timeline |
| `/account` | API portal dashboard (API keys, webhooks, usage) — Clerk auth required |
| `/onboarding` | Wallet setup — passkey-first, PIN fallback |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |

---

## Getting Started (Local Development)

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+

### Setup

```bash
# Clone
git clone https://github.com/medialane-io/medialane-xyz.git
cd medialane-xyz

# Install dependencies
bun install

# Configure environment
cp .env.example .env.local
# Fill in required values (see below)

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

```bash
bun dev          # Development server (localhost:3000)
bun run build    # Production build — must pass clean before deploy
bun lint         # ESLint
```

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `NEXT_PUBLIC_CHIPI_API_KEY` | Yes | ChipiPay API key (wallet creation) |
| `NEXT_PUBLIC_CLERK_TEMPLATE_NAME` | Yes | Clerk JWT template name (must match ChipiPay config) |
| `NEXT_PUBLIC_MEDIALANE_BACKEND_URL` | Yes | Medialane API base URL |
| `NEXT_PUBLIC_MEDIALANE_API_KEY` | Yes | Medialane API key (portal calls) |
| `SMTP_HOST` | Contact form | SMTP hostname (e.g. `smtp.hostinger.com`) |
| `SMTP_PORT` | Contact form | SMTP port (e.g. `465`) |
| `SMTP_USER` | Contact form | SMTP username |
| `SMTP_PASS` | Contact form | SMTP password |
| `CONTACT_TO_EMAIL` | Contact form | Recipient address |
| `CONTACT_FROM_EMAIL` | Contact form | Sender address |

---

## Architecture

### Component model

Next.js 15 App Router — server components by default. Client components (`"use client"`) only where hooks or browser APIs are needed.

```
src/app/layout.tsx              ← Root: ClerkProvider + FloatingNav + Footer
  src/app/(pages)/              ← Marketing pages (server components)
  src/app/docs/layout.tsx       ← Docs: 2-col (DocsSidebar + content)
  src/app/account/              ← Portal dashboard (Clerk auth required)
  src/app/onboarding/           ← Wallet setup (ChipiPay)
```

### Key components

| Component | Purpose |
|---|---|
| `FloatingNav` | Fixed top nav (~70px). Pages need `pt-28` top padding. |
| `Footer` | 3-column footer + social links |
| `BackgroundGradients` | Fixed purple/cyan gradient blobs (full-page routes) |
| `DocsSidebar` | Sticky left nav for `/docs/*` |
| `WalletPinDialog` | Transaction auth — passkey-first, PIN fallback |
| `WalletSummary` | Balance display + receive dialog |

### Wallet flow

1. User signs in with Clerk (email / social / passkey)
2. `/onboarding` — ChipiPay creates an invisible Starknet wallet, encrypted with a passkey or PIN
3. Wallet address stored in `publicMetadata` via Clerk server action
4. Subsequent sessions use SNIP-9 session keys (6-hour validity) for gasless signing

---

## Supported Starknet Tokens

| Token | Address |
|---|---|
| USDC (native) | `0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb` |
| USDC.e (bridged) | `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8` |
| USDT | `0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8` |
| ETH | `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7` |
| STRK | `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` |

---

## SDK Quick Example

```bash
npm install @medialane/sdk starknet
```

```typescript
import { MedialaneClient } from "@medialane/sdk";

const client = new MedialaneClient({
  network: "mainnet",
  backendUrl: "https://medialane-backend-production.up.railway.app",
  apiKey: "ml_live_...", // from medialane.xyz/account
});

// Query active listings
const orders = await client.api.getOrders({ status: "ACTIVE", sort: "recent" });

// Search tokens
const results = await client.api.search("digital art");

// Get token metadata with licensing attributes
const token = await client.api.getToken(contractAddress, tokenId);
console.log(token.data.metadata.licenseType);    // "CC BY-NC-SA"
console.log(token.data.metadata.commercialUse);  // "No"
console.log(token.data.metadata.attributes);     // IpAttribute[]
```

Full reference at [medialane.xyz/docs/sdk](https://medialane.xyz/docs/sdk) and on [npm](https://www.npmjs.com/package/@medialane/sdk).

---

## Contributing

Contributions are welcome. If you have a feature or improvement to suggest:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push the branch (`git push origin feature/my-feature`)
5. Open a Pull Request with the `enhancement` tag

---

## Related Repositories

| Repo | Description |
|---|---|
| [medialane-io](https://github.com/medialane-io/medialane-io) | Consumer dApp — creator launchpad + NFT marketplace |
| [medialane-backend](https://github.com/medialane-io/medialane-backend) | Starknet indexer + Hono REST API |
| [@medialane/sdk](https://github.com/medialane-io/sdk) | TypeScript SDK — `npm install @medialane/sdk` |

---

## License

[MIT](LICENSE)

Powered by **Starknet** · **Mediolano Protocol** · **ChipiPay** · **@medialane/sdk**
