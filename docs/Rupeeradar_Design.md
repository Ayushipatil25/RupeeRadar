# RupeeRadar — UI/UX Design Document

**Project:** RupeeRadar  
**Tagline:** *Know your money. Predict your next move.*  
**Platform:** Responsive web application  
**Frontend:** React + TypeScript + Vite + Tailwind CSS  
**Charts:** Recharts  
**Icons:** Lucide React  
**State Management:** Zustand or centralized React state  
**Storage:** Browser localStorage  
**Design Direction:** Premium, modern fintech dashboard

---

## 1. UI/UX Vision

RupeeRadar helps users manage a limited budget of ₹10,000 over 30 days and understand how everyday spending decisions affect their financial future.

The interface should feel like a modern financial intelligence dashboard rather than a basic expense tracker.

The user should be able to:

- Understand their current financial position at a glance.
- Track spending, savings, bills and subscriptions.
- Visualize how their balance changes over time.
- Identify their biggest spending categories.
- Check their financial health.
- Simulate a purchase before deciding whether to make it.
- Compare their financial future before and after a hypothetical purchase.

**Core UX principle:** Every important financial decision should have a clear visual explanation.

## 2. Visual Design System

### 2.1 Color palette

| Purpose | Color |
|---|---|
| Main background | Warm ivory `#F7F7F2` |
| Primary brand | Forest green `#123D2D` |
| Accent/highlight | Lime `#C8F169` |
| Cards | White `#FFFFFF` |
| Primary text | Deep charcoal `#202720` |
| Secondary text | Muted grey `#747B74` |
| Positive status | Green `#21865B` |
| Warning status | Amber `#E6A23C` |
| Negative status | Red `#D9534F` |
| Borders | Soft grey `#E7E9E2` |

Use forest green for primary actions and important financial values. Use lime sparingly for highlights, selected states and key insights. Red and amber should communicate meaningful financial risk, not act as decoration.

### 2.2 Typography

- **Font:** Inter
- Large balances: 32–40 px desktop, 26–32 px mobile.
- Section headings: 20–24 px.
- Card headings: 15–17 px.
- Body text: 14–16 px.
- Supporting labels: 12–13 px.

Use clear number formatting, including the Indian rupee symbol and Indian number grouping where appropriate.

### 2.3 Layout and components

- Desktop: fixed left sidebar and flexible main content.
- Tablet: collapsible sidebar or compact navigation.
- Mobile: bottom navigation and vertically stacked cards.
- Cards: white backgrounds, subtle borders, 16–20 px corner radius.
- Buttons: rounded corners, clear labels and visible hover/focus states.
- Charts: responsive, readable and equipped with tooltips.
- Motion: subtle transitions for navigation, chart updates and simulation results.

Avoid excessive gradients, excessive glassmorphism, unnecessary animations and cluttered layouts.

---

## 3. Application Navigation

### Desktop sidebar

1. Dashboard
2. FutureCast
3. Transactions
4. Savings Goals
5. Bills & Subscriptions

The sidebar should also show the RupeeRadar logo, the current budget period and a reset/demo-data action near the bottom.

### Mobile navigation

Use a compact bottom navigation with:

- Home
- FutureCast
- Transactions
- Savings
- More

Bills & Subscriptions and settings can be placed under More.

The active navigation item must be visually distinct.

---

## 4. Screen 1 — Dashboard

**Purpose:** Give users a complete financial overview without requiring them to open multiple screens.

### 4.1 Header

Display:

- Greeting such as “Your money, in focus.”
- Current budget period: Day X of 30.
- A small progress indicator for the budget period.
- A reset/demo-data action accessible through a confirmation dialog.

### 4.2 Primary balance card

Create a prominent forest-green card displaying:

- **Starting budget:** ₹10,000
- **Available balance:** current spendable money
- **Spent so far:** total completed expenses
- **Reserved amount:** money allocated to upcoming bills or commitments
- **Projected month-end balance:** forecast based on current spending and planned commitments

Use a subtle balance trend in the background if it does not reduce readability.

All values must be calculated from the shared application state. Do not hardcode example values into the finished dashboard.

### 4.3 Quick-stat cards

Display four compact cards:

**Daily Allowance**
- Suggested spending limit for the remaining days.
- Show the calculation basis.

**Total Spent**
- Completed expenses during the current budget period.

**Upcoming Bills**
- Total amount due from unpaid commitments.
- Show the nearest due date.

**Savings Progress**
- Amount saved against the user's savings goals.

Each card should include a simple icon, value, short label and optional trend indicator.

### 4.4 Money Pulse — Stock-style balance chart

Create a prominent interactive line/area chart that visually resembles a stock-market balance chart.

**Chart title:** Money Pulse  
**Subtitle:** “See where your money is heading.”

The chart should show:

- X-axis: Day 1 to Day 30.
- Y-axis: projected remaining balance in rupees.
- Solid line: actual balance history, where recorded.
- Dashed line: projected balance for the remaining days.
- Reference line: zero balance or the selected minimum safety buffer.
- A marker for the current day.
- Tooltips showing the date, balance and whether the point is actual or projected.

Use forest green for the main balance trend and a lighter green fill beneath it. Use amber or red only when the projection indicates a warning.

Provide an accessible legend and an informative empty state when no history exists.

**Important calculation rule:** Do not invent historical balances. Use the initial budget and dated transactions to reconstruct balances where possible. Mark estimated future points as projections.

### 4.5 Spending Breakdown — Donut chart

**Chart title:** Where Your Money Goes

Create an interactive donut chart showing spending by category, for example:

- Food
- Transport
- Shopping
- Bills
- Entertainment
- Other

The chart should display:

- Total spending in the centre.
- Category colors and labels.
- Amount spent per category.
- Percentage of total spending.
- Tooltips on hover or tap.
- A linked category legend.

Clicking a category should open or filter the Transactions screen for that category.

If there are no expenses, show a friendly empty state instead of misleading percentages.

### 4.6 Financial Health Pulse

Create a compact circular gauge or radial progress visualization with a score from 0 to 100.

**Example layout:** `78 / 100 — Good`

The score should be derived from transparent, deterministic rules based on factors such as:

- Spending pace relative to elapsed days.
- Upcoming bills and commitment coverage.
- Savings-goal progress.
- Remaining budget or safety buffer.

Display a short explanation beneath the score, such as:

“Your spending is slightly ahead of your planned pace.”

Use green, amber and red ranges to distinguish healthy, cautionary and high-risk conditions. Explain the score through a tooltip or “How is this calculated?” link.

Do not present this score as a professional credit score or financial assessment.

### 4.7 Your Next Move — Insight card

Show one or two useful, rule-based insights, for example:

- “You have spent more on food than any other category.”
- “At your current spending pace, your balance may fall below your safety buffer.”
- “You are ₹300 away from reaching your savings goal.”

Each insight must be derived from the user's current data. Do not generate random financial advice or display unsupported claims.

### 4.8 Dashboard layout

Recommended desktop arrangement:

1. Header and budget-period indicator.
2. Primary balance card.
3. Four quick-stat cards.
4. Money Pulse chart as the main visualization.
5. Spending Breakdown donut chart alongside Financial Health Pulse.
6. Your Next Move insight card and upcoming bills.

On mobile, stack all cards vertically and prioritize the balance, daily allowance and FutureCast access.

---

## 5. Screen 2 — FutureCast Purchase Simulator

**Purpose:** Help users understand the financial consequences of a possible purchase before confirming it.

This is the signature feature of RupeeRadar.

### 5.1 Entry point

Place a prominent “Simulate a Purchase” button on the Dashboard and a dedicated FutureCast page in navigation.

### 5.2 Purchase form

Include:

- Purchase name.
- Purchase amount in rupees.
- Spending category.
- Purchase date, defaulting to today.
- Optional note.
- Buttons: “Preview Impact” and “Cancel”.

Validate required fields, positive amounts and sensible currency precision.

The user must not be forced to create a real transaction to preview a purchase.

### 5.3 FutureCast preview

After the user enters a purchase, show a comparison between the current financial plan and the hypothetical plan.

**Before vs. After comparison cards:**

- Available balance.
- Daily spending allowance.
- Projected month-end balance.
- Savings-goal impact.
- Financial Health Pulse score.
- Risk level.

Include a visual comparison of the projected balance trend before and after the hypothetical purchase. Make it clear which line represents the current plan and which represents the simulated plan.

Use a summary such as:

“Your purchase would reduce your projected month-end balance by ₹X.”

The amount and wording must be calculated from the user's actual current state and simulation inputs.

### 5.4 Risk indicator

Display one of the following:

- **Low impact:** the purchase remains within the selected safety limits.
- **Moderate impact:** the purchase reduces the financial buffer.
- **High impact:** the purchase may exceed the remaining budget or create a shortfall.

The risk rules must be deterministic and documented. Clearly distinguish an estimated warning from a guaranteed outcome.

### 5.5 Simulation actions

Provide three actions:

**Cancel**
- Closes the preview.
- Discards the hypothetical purchase.
- Leaves all financial data unchanged.

**Edit Purchase**
- Returns to the form with the existing inputs preserved.

**Confirm Purchase**
- Shows a final confirmation.
- Adds exactly one expense transaction when confirmed.
- Updates the balance, spending breakdown, projections, insights and financial health score.
- Persists the updated state to localStorage.

Prevent duplicate transactions from repeated clicks.

**Critical business rule:** Previewing a purchase must never mutate the real application state. Only the explicit confirmation action may create the transaction.

---

## 6. Screen 3 — Transactions

**Purpose:** Let users inspect and manage their financial activity.

### Features

- Transaction list with date, name, category and amount.
- Income and expense indicators.
- Search by transaction name.
- Filters by category, transaction type and date.
- Add transaction button.
- Edit and delete actions.
- Empty state when no transactions exist.

### Add/Edit Transaction form

Fields:

- Transaction name.
- Amount.
- Type: Income or Expense.
- Category.
- Date.
- Optional note.

Validate all required fields and reject invalid amounts.

Updating or deleting a transaction must refresh every dependent dashboard calculation. A deleted transaction must not continue affecting charts or projections.

---

## 7. Screen 4 — Savings Goals

**Purpose:** Help users allocate money toward personal goals.

### Goal cards

Each card should show:

- Goal name.
- Target amount.
- Current saved amount.
- Progress bar and percentage.
- Remaining amount.
- Optional target date.

### Actions

- Create a goal.
- Edit a goal.
- Add to savings.
- Remove or delete a goal with confirmation.

Use clear progress indicators and positive feedback when a goal is reached.

**Data consistency:** If savings contributions affect the spendable balance, represent them consistently in the application's financial model. Do not count the same contribution twice as both an expense and a separate deduction.

---

## 8. Screen 5 — Bills & Subscriptions

**Purpose:** Track recurring costs and upcoming financial commitments.

### Bill cards or list

Display:

- Bill or subscription name.
- Amount.
- Due date.
- Frequency.
- Status: Upcoming, Paid or Overdue.
- Optional category.

### Actions

- Add a bill.
- Edit a bill.
- Mark a bill as paid.
- Delete a bill with confirmation.

Show the total of upcoming unpaid bills on the Dashboard.

**Important:** Distinguish reserved or expected commitments from completed transactions. Do not deduct an unpaid bill from the available balance and then deduct it a second time when marked paid.

---

## 9. Data Visualization Requirements

All charts must reflect the same shared financial data.

| Visualization | Purpose | Data source |
|---|---|---|
| Money Pulse line/area chart | Actual and projected balance | Starting budget and dated financial activity |
| Spending Breakdown donut | Spending by category | Completed expense transactions |
| Financial Health Pulse gauge | Financial health indicator | Defined health-score rules |
| Savings progress bar | Goal progress | Savings-goal state |
| FutureCast comparison | Purchase impact | Current state plus temporary simulation |
| Daily allowance indicator | Planned spending limit | Remaining budget and remaining days |

### Chart behavior

- Charts must resize to their container.
- Tooltips must show meaningful rupee values.
- Legends must be readable on desktop and mobile.
- Empty data must produce a helpful message, not a broken chart.
- Color must not be the only way information is communicated.
- Do not use fabricated historical data or fake real-time stock prices.
- Clearly label estimates and projections.

Use Recharts for the line/area chart, donut chart and radial or gauge-style visualization.

---

## 10. Shared Financial Calculation Rules

Use one central calculation layer for all financial values.

At minimum, define consistent calculations for:

- Starting budget.
- Completed income and expenses.
- Available balance.
- Reserved upcoming commitments.
- Daily spending allowance.
- Projected month-end balance.
- Category totals and percentages.
- Savings-goal progress.
- Financial Health Pulse score.
- FutureCast impact.

Document whether the available balance excludes reserved commitments. Use the same definition across every screen.

For the 30-day budget:

- Calculate the remaining days consistently.
- Avoid division by zero at the end of the period.
- Treat future transactions separately from completed activity.
- Keep the projection formula consistent across the Dashboard and FutureCast.
- Recalculate derived values whenever relevant data changes.

A projection is an estimate based on the chosen assumptions, not a guarantee of future spending.

---

## 11. Interaction and Feedback

Every visible interactive element must work.

- Buttons show clear hover, focus and disabled states.
- Forms display inline validation messages.
- Successful changes display concise confirmation feedback.
- Destructive actions require confirmation.
- Charts update when the underlying data changes.
- Navigation clearly indicates the active page.
- Loading and empty states are designed intentionally.
- Keyboard focus remains visible.
- Mobile controls are comfortable to tap.

Avoid decorative buttons that do nothing.

---

## 12. Responsive Design

### Desktop

- Persistent sidebar.
- Multi-column dashboard.
- Large Money Pulse chart.
- Donut chart and Financial Health Pulse displayed together where space allows.

### Tablet

- Compact navigation.
- Two-column cards where practical.
- Charts sized to avoid crowded labels.

### Mobile

- Bottom navigation.
- Single-column layout.
- Stacked comparison cards.
- Touch-friendly filters and forms.
- No horizontal page overflow.
- Chart tooltips usable by touch.
- Important values visible without excessive scrolling.

---

## 13. Empty, Error and Edge States

Design explicit states for:

- No transactions.
- No savings goals.
- No bills.
- No spending categories yet.
- Invalid or zero purchase amounts.
- Purchase larger than the available balance.
- No remaining days in the budget period.
- Missing or corrupted localStorage data.
- Failed persistence or invalid stored values.

When stored data cannot be parsed, show a safe recovery option instead of crashing.

A purchase larger than the available balance should display a clear warning. The app should follow its defined business rules rather than silently changing the purchase amount.

---

## 14. Privacy and Data Persistence

For the hackathon MVP:

- Store data in localStorage.
- Do not collect bank credentials or payment-card information.
- Do not imply that transactions are synced with a real bank.
- Provide a reset option with confirmation.
- Use a demo-data option for presentations.
- Keep demo data distinct from user-created transactions.
- Avoid claiming that browser-local storage is encrypted or suitable for sensitive financial records.

Authentication, cloud synchronization and backend integration are outside the MVP scope.

---

## 15. Implementation Priority for the Five-Hour Build

### Priority 1 — Functional foundation

- Create the React + TypeScript + Vite project.
- Set up Tailwind CSS, Lucide React and Recharts.
- Implement shared financial state and localStorage persistence.
- Build the responsive layout and navigation.

### Priority 2 — Dashboard

- Primary balance card.
- Daily allowance and quick-stat cards.
- Money Pulse line/area chart.
- Spending Breakdown donut chart.
- Financial Health Pulse gauge.
- Data-driven insight card.

### Priority 3 — Core interactions

- Add, edit and delete transactions.
- Create and update savings goals.
- Manage bills and subscriptions.
- Verify that all calculations update consistently.

### Priority 4 — FutureCast

- Purchase input form.
- Temporary simulation state.
- Before/after comparison.
- Projected balance comparison.
- Cancel, edit and confirm actions.
- Duplicate-confirmation protection.

### Priority 5 — Polish and testing

- Responsive mobile layout.
- Empty and error states.
- Form validation.
- Browser refresh and persistence tests.
- Final deployment and demo walkthrough.

If time becomes limited, prioritize a working Dashboard and FutureCast over building every optional feature.

---

## 16. Acceptance Criteria

The UI is ready for demonstration when:

1. The initial ₹10,000 budget is represented consistently.
2. Dashboard values are calculated from shared state rather than hardcoded.
3. Money Pulse distinguishes historical activity from projections.
4. Spending Breakdown totals match completed expense transactions.
5. The health gauge follows documented calculation rules.
6. FutureCast preview does not alter real data.
7. Canceling a preview leaves the app unchanged.
8. Confirming a purchase creates exactly one transaction.
9. Editing or deleting a transaction updates all affected visuals.
10. Savings and unpaid bills are not double-counted.
11. Data persists after a page refresh.
12. The interface works on desktop and mobile.
13. All visible controls perform their advertised actions.
14. Empty and invalid states are handled gracefully.
15. The deployed application can be demonstrated without relying on a live backend.

---

## 17. Final Design Goal

RupeeRadar should combine the clarity of a personal finance dashboard with the visual appeal of a modern fintech product.

The Dashboard answers: **“Where does my money stand right now?”**

Money Pulse answers: **“Where is my money heading?”**

Spending Breakdown answers: **“Where is my money going?”**

Financial Health Pulse answers: **“How healthy is my current plan?”**

FutureCast answers: **“What happens if I make this purchase?”**

Together, these experiences should make RupeeRadar feel polished, interactive, useful and credible during the PROMPT RUN hackathon demo.
