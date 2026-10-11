# RupeeRadar 🧭

> **Your 30-Day Financial Decision Simulator & Intelligent Budget Companion**

RupeeRadar is a personal finance web application tailored for students, early-career professionals, and young earners managing fixed monthly allowances or entry-level stipends (modeled around a ₹10,000 budget over a 30-day billing cycle).

Unlike traditional backward-looking expense trackers, RupeeRadar introduces **FutureCast** — a signature purchase impact simulator that lets users test hypothetical purchases against their real burn rate and commitments *before* spending a single rupee.

---

## 📚 Complete Project Documentation

For exhaustive technical blueprints and specifications, refer to:
- [System Architecture Document (SAD)](docs/ARCHITECTURE.md)
- [Product Requirements Document (PRD)](docs/Rupeeradar_PRD.md)
- [Design System & UI Guidelines](docs/Rupeeradar_Design.md)
- [Extended Architecture Notes](docs/Rupeeradar_Architecture.md)

---

## 🌟 Distinctive Value & Key Features

1. **FutureCast Decision Simulator (Signature Innovation)**:
   - Run pure in-memory simulations of hypothetical purchases without touching real balances.
   - Contrasts the baseline 30-day cash trajectory with simulated post-purchase runway.
   - Real-time risk assessment (*Comfortable*, *Caution*, or *High Risk*) with deterministic explanation.
   - Live shortfall calculation for unaffordable purchases (protecting funds needed for bills and savings).
   - Atomic exactly-once confirmation to active ledger, or instant discard with zero side-effects.
2. **True "Safe Available Balance" Engine**:
   - Differentiates between raw ledger cash and actual spendable cash.
   - Automatically quarantines funds for upcoming unpaid bills/subscriptions and locked savings goals.
   - Prevents accidental bill defaults by keeping committed funds untouched.
3. **Dynamic Safe Daily Allowance**:
   - Calculates exact daily discretionary spending allowance based on remaining days in the cycle.
4. **Interactive Financial Pulse & Trend Charts**:
   - Dual-trajectory area and line charts powered by Recharts with custom accessible tooltips.
   - Visual category spending breakdowns with interactive donut visualizations.
5. **Bills, Subscriptions & Savings Commitments**:
   - Atomic bill payments that automatically generate linked ledger transactions.
   - Goal-based savings cushions with validated progress tracking and quick deposits.
6. **Zero Backend, Complete Privacy**:
   - 100% client-side execution with type-safe `localStorage` persistence and schema migration.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 18.3](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Bundler & Dev Server** | [Vite 6.0](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) (Custom Emerald/Forest Dark Fintech Palette) |
| **State Management** | [Zustand 5.0](https://zustand-demo.pmnd.rs/) with LocalStorage Persistence |
| **Data Visualizations** | [Recharts 2.15](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Test Runner** | Node.js Native Test Runner (`node:test`, zero extra dependencies) |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/Ayushipatil25/RupeeRadar.git
cd RupeeRadar

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Available Scripts

- `npm run dev` — Starts Vite development server with HMR.
- `npm run build` — Runs TypeScript compiler (`tsc -b`) and bundles production assets with Vite.
- `npm run lint` — Runs TypeScript strict type-checking across the repository.
- `npm test` — Executes the focused financial engine unit test suite via Node's native test runner.
- `npm run preview` — Locally serves the optimized production build (`dist/`).

---

## 📁 Project Structure

```
rupeeradar/
├── docs/                         # Detailed specifications & PRD documentation
│   ├── ARCHITECTURE.md           # System Architecture Document (SAD) with Mermaid diagrams
│   ├── README.md                 # Documentation mirror
│   ├── Rupeeradar_PRD.md         # Product requirements document
│   ├── Rupeeradar_Architecture.md# Architectural decision records
│   └── Rupeeradar_Design.md      # UI/UX design tokens & guidelines
├── public/                       # Static public assets (favicon.svg)
├── src/
│   ├── components/
│   │   ├── common/               # Reusable UI primitives (Button, Card, Badge, Modal)
│   │   ├── dashboard/            # Dashboard widgets (BalanceCard, MoneyPulseChart, QuickStats)
│   │   └── layout/               # App layout (Sidebar, MobileNav, Header)
│   ├── pages/
│   │   ├── DashboardShell.tsx    # Primary KPI overview & visual charts
│   │   ├── TransactionsPage.tsx  # Full transaction ledger with filters & CRUD
│   │   ├── BillsPage.tsx         # Bills & subscriptions manager with linked payments
│   │   ├── SavingsPage.tsx       # Savings goals with interactive deposit allocations
│   │   └── FutureCastPage.tsx    # Purchase impact simulator & runway comparator
│   ├── store/
│   │   └── useFinanceStore.ts    # Centralized Zustand store with persistence & validation
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces, domain types & models
│   ├── utils/
│   │   └── financial.ts          # Pure deterministic financial math calculation engine
│   ├── App.tsx                   # Main application router shell & tab navigation
│   ├── index.css                 # Global Tailwind design tokens & dark styling
│   └── main.tsx                  # React 18 DOM mount point
├── tests/
│   └── financial-engine.test.mjs # Unit tests for financial calculations & FutureCast
├── index.html                    # Single-page application entry point
├── package.json                  # Dependencies & npm scripts
├── tailwind.config.js            # Custom fintech theme color extensions
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite bundler configuration with vendor chunking
```

---

## 🧠 Financial Engine & Calculation Rules

All metrics are deterministically computed in `src/utils/financial.ts` using the single source of truth:

```
1. Ledger Balance       = Starting Budget (₹10,000) + Total Income - Total Expenses
2. Committed Bills      = Sum of unpaid commitments (bills & subscriptions)
3. Locked Savings       = Sum of all current deposits in savings goals
4. Available Balance    = Ledger Balance - Committed Bills - Locked Savings
5. Days Remaining       = Total Budget Days (30) - Current Day + 1
6. Safe Daily Allowance  = Available Balance / Days Remaining
7. Burn Rate / Day      = Total Expenses / Current Day
8. Projected Month-End  = Current Balance - (Burn Rate * Remaining Days)
9. Health Score (0-100) = Weighted composite of Runway (50%), Savings Buffer (30%), and Bill Readiness (20%)
```

### FutureCast Simulation Flow
1. **Simulation Isolation**: When testing a purchase, an in-memory clone of transactions is created with the hypothetical expense. Real ledger records remain 100% untouched.
2. **Delta Computation**: The financial engine evaluates both current and simulated states in parallel, generating before-and-after trajectories.
3. **Zero State Mutation**: Previews do not modify the real ledger or localStorage until the user explicitly clicks **Confirm Purchase**.
4. **Discard**: Resets the simulation and clears transient state with zero side-effects.

---

## 🔒 Security & Data Integrity

- **Client-Side Privacy**: All financial records remain strictly within the user's browser; no external telemetry or backend leakage.
- **Strict Input Clamping**: Text fields are bounded with `maxLength` guards (80 chars for titles, 200 for notes) to prevent memory allocation abuse.
- **Type-Safe Persistence**: Store rehydration validates structure using `unknown` guards and versioned migration.
- **Atomic Operations**: Marking bills as paid atomically generates a linked expense transaction in the ledger.

---

## ⚡ Performance & Accessibility Optimizations

- **Rollup Chunk Splitting**: Configured manual vendor chunks (`vendor-react`, `vendor-charts`, `vendor-icons`), eliminating monolithic bundles and keeping all assets below 500 kB.
- **Modal Focus Management**: Implements focus trapping (Tab / Shift+Tab), initial focus routing (`autoFocus`), Escape-key dismissal, and focus restoration to the triggering button.
- **Accessible Data Visualizations**: Recharts canvases feature `role="img"` wrappers with live, dynamic `aria-label` text articulating exact numeric values for screen readers.
- **Semantic HTML**: All form inputs are strictly bound to `<label htmlFor>` tags with unique IDs.

---

## 🧪 Verification & Testing

Verify the project locally using:

```bash
# Run unit tests
npm test

# Run TypeScript compilation check
npx tsc --noEmit

# Run linting check
npm run lint

# Build production distribution
npm run build
```

---

## ⚠️ Known Limitations

1. **Single-Month Scope**: The application is tailored for a single 30-day budget cycle (Day 1 to 30) of ₹10,000. Multi-cycle archival navigation is planned for future releases.
2. **Deterministic Modeling**: Future projections are based on actual historical burn rate and known upcoming commitments. They are deterministic financial forecasts, not speculative AI or probabilistic estimates.
3. **Build-time Dev Advisories**: `npm audit` reports 7 dev-dependency advisories in Tailwind v3 file-watcher dependencies (`chokidar`, `braces`). These do not affect client runtime security and are locked to preserve Tailwind CSS v3 compatibility.
