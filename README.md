# Winsay Electrodeals

Solar instant quote web application for Zimbabwean homes and businesses. Built with Next.js 15, Supabase, and PayNow Zimbabwe.

## Features

- **Instant Solar Quotes** — Get a quote in under 3 minutes with a 5-step form
- **6 Solar Packages** — From 3.2Kva entry-level to 12Kva maximum power
- **Flexible Payment** — Pay after installation available on qualifying tiers
- **PayNow Integration** — Secure payments via EcoCash, InnBucks, Bank Transfer
- **Admin Dashboard** — Manage leads, installation schedules, pricing, and RBZ rates
- **PWA Ready** — Installable on mobile devices with offline caching
- **Responsive Design** — Mobile-first layout with Tailwind CSS v4

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4, Framer Motion
- **Backend:** Supabase (Auth, Database, Storage)
- **Payments:** PayNow Zimbabwe
- **Rate Limiting:** Upstash Redis
- **Validation:** Zod 4
- **State:** Zustand

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase project (free tier works)
- PayNow merchant account (Zimbabwe)
- Upstash Redis instance (optional, for rate limiting)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seed Database

To load sample packages and RBZ rates into Supabase:

```bash
npx tsx scripts/seed-db.ts
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/            # Admin dashboard (leads, schedule, settings)
│   ├── (customer)/         # Customer pages (packages, quote, payment, confirmation)
│   ├── api/                # API routes (quote, packages, payment, admin)
│   └── login/              # Admin login
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── packages/           # Package card components
│   ├── providers/          # Auth context provider
│   ├── quote/              # Quote flow step components
│   └── ui/                 # Reusable UI components (Button, Card, Table, etc.)
├── lib/
│   ├── admin-auth.ts       # Admin authorization helpers
│   ├── auth.ts             # Supabase auth client & hooks
│   ├── currency.ts         # RBZ exchange rate fetching
│   ├── db.ts               # Supabase database operations
│   ├── fallback-data.ts    # Fallback package data (works without Supabase)
│   ├── offline.ts          # IndexedDB offline caching
│   ├── payments.ts         # PayNow payment integration
│   ├── pricing.ts          # Quote pricing engine (surcharges, discounts)
│   └── rate-limiter.ts     # Upstash Redis rate limiting
├── store/                  # Zustand stores
├── types/                  # TypeScript types & Zod schemas
└── utils/supabase/         # Supabase client (browser, server, middleware)
```

## Deployment

Deploy to Vercel with zero configuration:

```bash
npm run build
```

Set environment variables in your hosting platform. The app runs as a standard Next.js application.

## License

Private — All rights reserved.
