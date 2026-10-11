# System Architecture Document (SAD)
## RupeeRadar — Your 30-Day Financial Decision Simulator

**Version:** 1.0  
**Project:** PROMPT RUN Hackathon  
**Architecture Type:** Frontend-first, modular web application  
**Deployment Target:** Vercel  
**Primary Currency:** Indian Rupee (INR)  
**Development Constraint:** 5-hour solo build

---

## 1. Purpose and Scope

This document describes the recommended technical architecture for RupeeRadar, a personal finance application that helps Gen Z users manage a ₹10,000 budget over 30 days.

The system allows users to:
- Track income, expenses, savings, and upcoming commitments.
- View their current and available balance.
- Simulate purchases before confirming them.
- Forecast their month-end financial position.
- Understand their financial health and spending risks.

The architecture prioritizes fast implementation, correct calculations, responsive UI, reliable local persistence, and straightforward deployment.

### Architecture principles

1. Keep the MVP simple enough to build and test in five hours.
2. Separate the UI, financial calculations, and data persistence.
3. Use one source of truth for financial data.
4. Keep simulations isolated from actual financial state.
5. Avoid unnecessary backend services and external dependencies.
6. Make future backend integration possible without requiring a rewrite of the entire UI.

---

## 2. High-Level Architecture

<escape>
┌───────────────────────────────────────────────┐
│                 User / Browser                │
│           Desktop · Tablet · Mobile           │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│              React Presentation Layer         │
│ Dashboard · Transactions · FutureCast         │
│ Savings · Commitments · Forecast · Insights   │
└──────────────────────┬────────────────────────┘
                       │ User actions / UI state
                       ▼
┌───────────────────────────────────────────────┐
│              Application Logic Layer          │
│ Input Validation · State Management           │
│ Transaction Actions · Simulation Controller  │
└──────────────────────┬────────────────────────┘
                       │
              ┌────────┴─────────┐
              ▼                  ▼
┌─────────────────────┐  ┌──────────────────────┐
│ Financial Engine    │  │ Persistence Adapter  │
│ Balance Calculations│  │ localStorage         │
│ Forecast · Risk     │  │ Load · Save · Reset  │
│ Health · Insights   │  │ Schema Validation    │
└──────────┬──────────┘  └──────────┬───────────┘
           │                        │
           └───────────┬────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│          Derived UI State and Results         │
│ Balance · Allowance · Forecast · Risk         │
└───────────────────────────────────────────────┘
</escape>

**External infrastructure:** Vercel serves the compiled frontend. No application server or external database is required for the initial MVP.

---

## 3. Recommended Technology Stack

| Layer | Recommended technology | Purpose |
|---|---|---|
| Frontend framework | React | Build reusable, interactive UI components |
| Language | TypeScript | Catch type and data-shape errors during development |
| Build tool | Vite | Fast development and production builds |
| Styling | Tailwind CSS | Responsive layouts and consistent visual design |
| UI components | shadcn/ui, if setup time permits | Accessible forms, dialogs, cards, and controls |
| Icons | Lucide React | Consistent interface icons |
| Charts | Recharts, optional | Spending breakdown and forecast visualization |
| State management | Zustand or centralized React state | Maintain consistent application state |
| Local persistence | localStorage | Save confirmed financial data across refreshes |
| Hosting | Vercel | Build and deploy the frontend |
| Version control | Git and GitHub | Track changes and maintain a backup |

**Recommendation:** Use React + TypeScript + Vite + Tailwind CSS + localStorage. Add Zustand if it speeds up state sharing. Use charts only after the dashboard and simulator work correctly.

Do not introduce a separate backend or database during the five-hour MVP unless a required feature genuinely needs one.

---

## 4. Frontend Architecture

### 4.1 Main UI Modules

**A. Dashboard**
- Starting budget and actual balance.
- Available balance and daily safe-to-spend allowance.
- Total spending and upcoming commitments.
- Month-end forecast.
- Financial health score and risk status.
- Recent transactions and spending categories.

**B. FutureCast Simulator**
- Purchase description, amount, and category.
- Current versus projected financial metrics.
- Risk and affordability explanation.
- Confirm and cancel actions.

**C. Transactions**
- Add income and expenses.
- Edit and delete records.
- View transaction history and categories.

**D. Savings and Commitments**
- Create savings goals.
- Track savings progress.
- Add bills and subscriptions.
- Mark commitments as paid.

**E. Insights and Forecast**
- Spending pace warnings.
- Commitment coverage warnings.
- Savings progress insights.
- Projected end-of-period balance.

### 4.2 Suggested Folder Structure

<escape>
src/
├── app/
│   ├── App.tsx
│   └── routes.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── transactions/
│   ├── futurecast/
│   ├── savings/
│   └── commitments/
├── features/
│   ├── dashboard/
│   ├── transactions/
│   ├── simulator/
│   └── insights/
├── store/
│   └── financeStore.ts
├── lib/
│   ├── calculations.ts
│   ├── forecast.ts
│   ├── healthScore.ts
│   ├── validation.ts
│   └── formatCurrency.ts
├── services/
│   └── storageService.ts
├── types/
│   └── finance.ts
├── data/
│   └── demoData.ts
├── App.css
└── main.tsx
</escape>

This structure separates reusable UI from financial logic. For a very short build, folders can be combined where practical, but the calculation functions should remain separate from UI components.

---

## 5. Application Logic and State Management

### 5.1 Central Financial Store

The application shall maintain one central state containing:

- Financial profile and planning dates.
- Starting funds and expected income.
- Transactions.
- Savings goals and transfers.
- Bills and subscriptions.
- Demo configuration and state version.

The financial store should expose controlled actions such as:

- `addTransaction()`
- `updateTransaction()`
- `deleteTransaction()`
- `addCommitment()`
- `markCommitmentPaid()`
- `addSavingsContribution()`
- `previewPurchase()`
- `confirmPurchase()`
- `cancelPurchase()`
- `resetDemo()`

Components should call these actions instead of independently modifying financial arrays.

### 5.2 Financial Calculation Engine

The financial engine shall be implemented as deterministic functions that accept data and return results.

Required calculations include:
- Actual balance.
- Available balance.
- Total spending by category.
- Daily safe-to-spend allowance.
- Projected day-30 balance.
- Financial health score.
- Risk status and insight triggers.

These functions should be testable without rendering the UI.

### 5.3 Simulation Isolation

FutureCast must operate on a temporary copy or derived projection of the current state.

**Preview flow:**

1. Read the current financial state.
2. Validate the proposed purchase.
3. Calculate the hypothetical result.
4. Display before-and-after metrics.
5. Wait for the user's decision.
6. On cancel, discard the temporary result.
7. On confirm, create one transaction and recalculate.

The simulator must not write hypothetical transactions to localStorage before confirmation.

If the underlying financial state changes while a preview is open, the simulator should refresh the projection or ask the user to review it again.

---

## 6. Backend Architecture

### MVP: No Backend

The initial version does not require a backend because it has:
- No user accounts.
- No live bank integrations.
- No multi-device synchronization.
- No shared financial records.
- No external service requiring protected credentials.

Vercel will host the frontend, but hosting is not the same as an application backend.

### Future Backend Option

If the product later requires accounts, cloud backup, or synchronization, introduce:

- **Backend:** Node.js with Express.
- **API style:** REST.
- **Database:** PostgreSQL.
- **Authentication:** Managed authentication provider or secure server-side session system.

Keep the frontend dependent on a small data-access interface so local storage can later be replaced by API-backed persistence.

Do not build this future infrastructure for the hackathon MVP.

---

## 7. Database and Storage Design

### 7.1 MVP Storage

Use browser `localStorage` to persist the confirmed application state.

Suggested storage key:

`rupeeradar:v1:finance-state`

Store:
- Financial profile.
- Transactions.
- Savings goals.
- Commitments.
- Schema version.

Do not store derived dashboard metrics as the authoritative financial record. Recalculate them from source data after loading.

### 7.2 Storage Workflow

**Initial launch**
1. Check whether saved state exists.
2. Parse and validate the stored data.
3. If valid, restore it.
4. Otherwise, initialize the demo scenario.

**After a confirmed change**
1. Validate the operation.
2. Update the application state.
3. Recalculate dependent values.
4. Persist the updated source state.
5. Display updated metrics.

**On reset**
1. Ask for confirmation.
2. Restore the demo dataset.
3. Replace the application's saved state.
4. Recalculate and refresh the dashboard.

### 7.3 Storage Limitations

localStorage:
- Is tied to a browser profile and origin.
- Does not automatically synchronize across devices.
- Is not encrypted by default.
- May be cleared by the user or browser.
- Is not suitable as the sole storage layer for a commercial multi-user finance service.

For the MVP, these limitations are acceptable because the application uses simulated financial data.

---

## 8. API Architecture

### 8.1 MVP API Requirements

The MVP requires **no external APIs and no custom HTTP endpoints**.

Financial operations shall be local application functions rather than network requests.

| Operation | Implementation |
|---|---|
| Load demo state | Local initialization function |
| Add expense | Store action |
| Add income | Store action |
| Preview purchase | Financial calculation function |
| Confirm purchase | Store action plus persistence |
| Calculate forecast | Forecast function |
| Calculate health score | Health-score function |
| Save data | Storage service |
| Reset demo | Store and storage action |

### 8.2 Future REST API Design

If a backend is introduced later, the following endpoints are possible:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/finance` | Retrieve the user's financial profile |
| GET | `/api/v1/transactions` | List transactions |
| POST | `/api/v1/transactions` | Create a transaction |
| PATCH | `/api/v1/transactions/:id` | Update a transaction |
| DELETE | `/api/v1/transactions/:id` | Delete a transaction |
| GET | `/api/v1/commitments` | List commitments |
| POST | `/api/v1/commitments` | Create a commitment |
| GET | `/api/v1/savings-goals` | List savings goals |

These endpoints are **future design guidance only**. They are not part of the MVP implementation.

---

## 9. Authentication and Authorization

### MVP
- No login or registration.
- Users enter through the demo application.
- Financial records belong to the current browser's local workspace.
- No account identity or server-side authorization is claimed.

### Future Version
If accounts are added:
- Use a trusted authentication provider or secure backend-managed sessions.
- Require server-side authorization for every financial record.
- Associate every record with a user identifier.
- Prevent users from accessing another user's data.
- Use HTTPS for all network traffic.
- Avoid storing authentication tokens in localStorage when a safer session architecture is practical.

Authentication should not be simulated with a hardcoded username and password merely to make the app appear more complete.

---

## 10. Data Flow

### 10.1 Recording an Expense

1. The user enters an expense.
2. The UI validates the fields.
3. The store checks the operation.
4. A uniquely identified transaction is created.
5. The central financial engine recalculates the balance and forecast.
6. The confirmed source state is saved.
7. Dashboard components display the updated values.

### 10.2 Simulating a Purchase

1. The user enters a hypothetical purchase.
2. The simulator validates the input.
3. The financial engine calculates a projected state.
4. The UI compares current and projected values.
5. The user cancels or confirms.
6. Cancellation discards the projection.
7. Confirmation creates one real transaction, persists it, and refreshes the dependent metrics.

### 10.3 Loading Saved Data

1. The application reads the versioned storage key.
2. It validates the saved schema.
3. Valid data is restored.
4. Derived values are recalculated.
5. The dashboard renders.
6. If data is invalid, the application recovers safely without crashing.

---

## 11. Security and Privacy

The MVP does not process real payments or connect to bank accounts. Its primary security concerns are safe data handling and reliable local state.

Requirements:
- Render user-entered text safely; do not execute it as HTML.
- Validate all financial input before applying changes.
- Keep secrets and private API keys out of frontend code.
- Avoid sending user-entered financial data to external services.
- Do not describe localStorage as encrypted storage.
- Display a short notice that financial data remains in the browser.
- Clear only RupeeRadar's own saved state during reset.
- Avoid exposing raw errors or saved JSON in the interface.
- Clearly label forecasts and health scores as educational estimates.

For a production financial application, local storage alone would not be sufficient for sensitive financial records.

---

## 12. Error Handling and Recovery

| Failure | Expected system response |
|---|---|
| No saved data | Load the sample scenario |
| Invalid saved data | Recover to demo state or offer reset |
| Storage unavailable | Show a warning and preserve in-session usability where possible |
| Invalid form input | Show a field-level error; save nothing |
| Repeated confirmation | Apply the transaction once only |
| Negative available balance | Show shortfall and risk warning |
| Zero remaining days | Avoid division by zero |
| Forecast below zero | Display projected deficit |
| Unexpected runtime error | Avoid a blank page where practical and provide a useful fallback |
| Reset requested | Confirm before discarding local changes |

Financial calculation functions should also be tested with empty arrays, zero balances, large amounts, overdue commitments, and no remaining planning days.

---

## 13. Performance and Scalability

### 13.1 MVP Performance Targets

These are proposed engineering targets to verify during testing, not measured results.

- Initial dashboard should become usable within approximately 2 seconds on a typical modern device and reasonable connection.
- Common local operations should update the UI without noticeable delay.
- Financial calculations should not require network requests.
- The application should remain usable on narrow mobile screens.
- No repeated state updates should create duplicate transactions.
- Charts should not block core transaction and simulation workflows.

Use simple derived calculations and avoid premature optimization.

### 13.2 Scalability

The architecture can support future growth by separating:
- UI components.
- Financial calculation functions.
- Store actions.
- Persistence logic.
- Optional API services.

A future backend can replace local persistence with PostgreSQL-backed APIs. More advanced forecasting or AI-based coaching can be introduced as a separate service without placing those dependencies in the MVP's critical workflow.

---

## 14. Deployment Architecture

### Recommended deployment: Vercel

1. Create the React + TypeScript + Vite project.
2. Build and test locally.
3. Push the working source code to GitHub.
4. Import the repository into Vercel.
5. Use the Vite build command: `npm run build`.
6. Use `dist` as the output directory.
7. Deploy and open the public URL.
8. Test the deployed application on desktop and mobile.
9. Verify refresh persistence, simulation confirmation, cancellation, and reset.
10. Submit the tested URL and required project details.

The deployed application should work without environment variables because the MVP does not use external services.

**Important:** Test the production build before the final hackathon submission. A development server working locally does not guarantee that the deployed application works.

---

## 15. Monitoring and Testing

### MVP monitoring

No dedicated monitoring platform is required for the first version.

Use:
- Browser developer console for runtime errors.
- Vite production build for compilation checks.
- Browser storage inspection for persistence checks.
- Manual testing for primary user workflows.
- Vercel deployment logs for build and deployment failures.

Avoid sending financial data to analytics or logging services.

### Essential test scenarios

1. First launch displays ₹10,000 and the sample planning period.
2. Adding income increases the actual balance.
3. Adding an expense decreases the actual balance.
4. Previewing a purchase does not change saved data.
5. Cancelling a preview leaves the actual state unchanged.
6. Confirming a purchase creates exactly one expense.
7. Marking a bill paid prevents double-counting it as unpaid.
8. Refreshing restores valid saved data.
9. Reset restores the original demo state.
10. Negative balances and zero remaining days are handled safely.
11. Forms work with keyboard navigation and visible focus.
12. The production deployment works on desktop and mobile.

---

## 16. Architecture Acceptance Criteria

The architecture is considered successfully implemented when:

- The application builds and runs without blocking errors.
- All financial metrics derive from a single consistent source of truth.
- The simulator is isolated from actual financial data until confirmation.
- Confirmed operations persist across browser refreshes.
- Invalid or corrupted saved data does not crash the application.
- No backend or external API is required for core functionality.
- Primary workflows work on desktop and mobile.
- The application is deployed and accessible through the submitted URL.
- The UI clearly communicates that financial forecasts are estimates.

---

## 17. Final Recommendation

Build RupeeRadar as a **modular React + TypeScript frontend**, using a centralized store, pure financial calculation functions, and a small localStorage service.

For the five-hour hackathon, prioritize three things:

1. A polished and accurate financial dashboard.
2. A reliable FutureCast simulator with correct preview, cancel, and confirm behavior.
3. A working deployment that demonstrates the complete user journey.

Add charts, extra animations, advanced coaching, and gamification only after those three areas are working and tested.

The architecture should support the product's core promise: **help users understand the consequences of a financial decision before they make it.**