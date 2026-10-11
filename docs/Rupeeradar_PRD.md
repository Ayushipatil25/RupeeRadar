# Product Requirements Document (PRD)

## RupeeRadar — Your 30-Day Financial Decision Simulator

**Version:** 1.0
**Product Type:** Responsive Web Application
**Hackathon:** PROMPT RUN
**Development Model:** Individual / Solo
**Target Build Time:** 5 Hours

---

## 1. Product Overview

RupeeRadar is an interactive personal finance web application that helps Gen Z users manage a limited budget of ₹10,000 over 30 days.

Unlike traditional expense trackers, RupeeRadar allows users to simulate financial decisions before committing to them. It demonstrates how purchases, recurring subscriptions, savings contributions, bills, and unexpected expenses affect their available balance, daily spending allowance, savings goals, projected month-end balance, financial risk, and overall financial health.

The product aims to turn financial tracking into proactive, understandable decision-making.

**Product tagline:** Know your money. Predict your next move.

## 2. Problem Statement

Young adults and students often manage limited monthly funds without a clear understanding of how individual spending decisions affect their future financial stability.

Traditional expense trackers primarily record past spending. They may not clearly explain whether a purchase is affordable, whether upcoming commitments can be covered, or how an unexpected expense could affect savings and the remaining monthly budget.

Users need a simple, interactive experience that connects their current finances with future outcomes and helps them make informed decisions before spending.

## 3. Target Users

### Primary users

- College students managing pocket money or a limited monthly allowance.
- Young adults with fixed income and recurring expenses.
- Gen Z users who want to develop budgeting and saving habits.

### User needs

- Understand how much money is genuinely available to spend.
- Avoid running out of money before the end of the month.
- Plan for bills, subscriptions, savings, and emergencies.
- Compare financial choices before making them.
- Receive clear, practical guidance without complex financial terminology.

## 4. Product Goals

1. Help users manage a ₹10,000 budget across a 30-day period.
2. Provide an accurate, real-time view of their financial position.
3. Enable users to simulate and compare financial decisions.
4. Show how decisions affect daily allowance, savings, risk, and month-end projections.
5. Deliver a visually engaging, responsive, accessible experience.
6. Demonstrate all essential features without requiring a backend or external financial integrations.

### Non-goals

- Providing regulated financial advice.
- Connecting to real bank accounts or processing payments.
- Predicting real-world financial outcomes with machine learning.
- Building a complete commercial banking platform.

## 5. Core Features

### F1. Financial Overview Dashboard — P0

Display the user's key financial information in one place:

- Starting budget and current balance.
- Total spending and available balance.
- Essential commitments and planned savings.
- Daily safe-to-spend allowance.
- Projected balance at the end of day 30.
- Financial health score and risk status.
- Recent transactions and spending breakdown.

All metrics must derive from a shared financial state.

### F2. FutureCast Decision Simulator — P0

The primary differentiating feature.

Users can enter a purchase amount, name, and category and preview its impact before confirming.

The preview must show:

- Balance before and after the proposed decision.
- Updated daily spending allowance.
- Savings goal impact.
- Projected month-end balance.
- Financial health and risk changes.
- A short explanation of the consequences.

Users can confirm or cancel the proposed action. A preview must never alter actual financial data.

### F3. Transactions and Spending Categories — P0

Users can:

- Add expenses and income.
- Select transaction categories.
- View transaction history.
- Correct or remove transactions.
- View category-wise spending.

All relevant financial metrics must update after a transaction is confirmed.

### F4. Commitments and Savings Goals — P1

Users can manage essential bills, subscriptions, and savings targets.

The application should display upcoming commitments, track savings progress, and allow users to simulate changes to subscriptions or savings contributions.

Changes must be reflected in the available balance and financial forecast without double-counting expenses.

### F5. Financial Health and Risk — P1

Calculate an illustrative score out of 100 using understandable factors such as:

- Spending pace.
- Ability to cover essential commitments.
- Savings progress.
- Emergency buffer readiness.

Show the score, contributing factors, and practical explanations for changes. The score must not be presented as a credit score or professional financial assessment.

### F6. Forecast and Smart Insights — P1

Project the user's end-of-month financial position using current spending pace, remaining days, known commitments, and expected income.

Provide rule-based insights based on calculated values, such as:

- Spending above the planned pace.
- Insufficient funds for an upcoming commitment.
- Savings goals falling behind.
- Potential savings from pausing a subscription.

Insights must respond to actual financial state changes rather than remain hardcoded.

## 6. Minimum Viable Product (MVP) Scope

The MVP prioritizes a complete and demonstrable financial decision-making workflow.

### Must have

- Responsive dashboard with ₹10,000 sample budget.
- Shared financial calculation engine.
- Add and remove transactions.
- FutureCast purchase preview.
- Confirm and cancel decision actions.
- Automatic balance and daily allowance recalculation.
- Month-end forecast.
- Basic savings goals and essential commitments.
- Financial health and risk indicators.
- Local persistence using browser storage.
- Validated forms, error handling, and reset-to-demo functionality.

### Should have, if time permits

- Subscription pause/resume simulation.
- Spending breakdown and forecast charts.
- Dynamic rule-based financial coaching.
- Comparison of two hypothetical purchase scenarios.
- Mobile navigation and subtle animations.

### Could have

- Daily financial challenges.
- Savings streaks and achievements.
- Additional themes and advanced filters.

**MVP boundary:** Complete and test the core dashboard-to-simulation-to-confirmation workflow before implementing optional gamification or decorative features.

## 7. User Stories

| ID    | User story                                                                                                   | Priority |
| ----- | ------------------------------------------------------------------------------------------------------------ | -------- |
| US-01 | As a user, I want to see my balance and remaining budget so I can understand my current financial position.  | P0       |
| US-02 | As a user, I want to record an expense or income so my financial information stays updated.                  | P0       |
| US-03 | As a user, I want to simulate a purchase before confirming it so I can understand its consequences.          | P0       |
| US-04 | As a user, I want to compare my current and projected financial position so I can make informed decisions.   | P0       |
| US-05 | As a user, I want to track savings and essential commitments so I can avoid spending money needed later.     | P1       |
| US-06 | As a user, I want to understand my financial health score so I can identify areas for improvement.           | P1       |
| US-07 | As a user, I want useful financial insights so I can adjust my spending plan.                                | P1       |
| US-08 | As a user, I want my demo data to persist after refreshing the page so I can continue using the application. | P0       |

## 8. Key Business and Product Rules

### Financial calculations

- Actual balance = starting funds + received income − completed expenses − savings transfers.
- Available balance = actual balance − unpaid essential commitments − remaining planned savings contributions.
- Daily safe-to-spend = available balance divided by remaining days, with safe handling of zero or negative values.
- Month-end forecast must account for completed spending, expected future spending, known commitments, and expected income.
- Savings transfers must be distinguished from ordinary consumption.
- A paid commitment must no longer be deducted as an unpaid commitment.
- A hypothetical decision must not change the real financial state until confirmed.
- A confirmed transaction must be applied exactly once.

### Example scenario

With ₹10,000 starting funds, a user simulates a ₹2,000 purchase.

The application previews the proposed expense and recalculates the projected balance, daily allowance, savings impact, and financial risk. If the user cancels, the original values remain unchanged. If the user confirms, the transaction is recorded and all dependent metrics update.

## 9. Success Metrics

The following are proposed prototype acceptance targets, not measured results.

| Metric                   | Target                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Core workflow completion | All essential simulation steps work from start to finish.                          |
| Calculation correctness  | 100% of defined financial calculation test cases pass.                             |
| State consistency        | Every affected dashboard metric updates after a confirmed decision.                |
| Preview isolation        | Cancelled simulations produce zero changes to actual financial state.              |
| Duplicate prevention     | Repeated confirmation actions do not create duplicate transactions.                |
| Persistence              | Confirmed data remains available after a page refresh.                             |
| Responsive experience    | Core workflows function on mobile and desktop viewports.                           |
| Runtime reliability      | No blocking compilation errors or uncaught application errors during core testing. |
| Accessibility            | All primary controls have labels, visible focus states, and keyboard support.      |

## 10. Assumptions

- The initial scenario uses ₹10,000 in starting funds and a 30-day planning period.
- Sample financial data is provided so judges can explore the product immediately.
- Users can interact with the application without registration.
- All transactions are simulated and stored locally in the browser.
- Forecasts and financial health scores are illustrative estimates.
- Users manually enter financial information.
- The application must be deployable as a standalone frontend.
- Development and testing must fit the five-hour solo-build constraint.

## 11. Risks and Mitigation

| Risk                                     | Mitigation                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| Inconsistent financial metrics           | Use one shared state and centralized calculation functions.            |
| Double-counted commitments               | Separate unpaid commitments from completed transactions.               |
| Excessive scope for five hours           | Prioritize the core simulator and defer optional features.             |
| Visually attractive but nonfunctional UI | Test every primary action and financial state transition.              |
| Incorrect forecasts                      | Document assumptions and use deterministic calculation rules.          |
| Browser refresh loses data               | Persist confirmed state using localStorage and provide a reset option. |
| Poor mobile usability                    | Use responsive layouts and test narrow viewports.                      |
| Misleading financial health scores       | Explain scoring factors and clearly label estimates as educational.    |
| Deployment or dependency failure         | Keep dependencies minimal and deploy a working version early.          |

## 12. Out-of-Scope Features

The following are excluded from the hackathon MVP:

- Real banking, UPI, or payment integrations.
- Real-money transactions.
- User authentication and cloud synchronization.
- AI/ML model training or paid AI APIs.
- Credit score calculation.
- Investment, loan, tax, or insurance recommendations.
- Multi-user financial management.
- Production-grade banking security infrastructure.
- Complex predictive analytics and financial forecasting models.

## 13. Acceptance Criteria

The MVP is accepted when all of the following conditions are met.

### Dashboard

- The app loads with a coherent ₹10,000, 30-day sample scenario.
- The balance, spending, commitments, savings, allowance, and forecast are visible.
- All values reconcile with the underlying financial state.

### Decision simulator

- Users can enter a valid purchase amount and category.
- The application previews the proposed decision without mutating actual data.
- The before-and-after comparison shows the financial consequences.
- Cancel restores the unchanged state.
- Confirm applies the transaction once and updates all dependent metrics.

### Transactions and commitments

- Users can add and remove transactions.
- Invalid amounts are rejected.
- Paid commitments are not counted again as unpaid commitments.
- Savings contributions are handled separately from consumption.
- Subscription or commitment changes update the relevant calculations.

### Financial health and insights

- The score and risk status respond to relevant financial changes.
- Users can understand why a score or projection changed.
- Forecasts and coaching insights use current data and documented assumptions.

### Persistence and interface

- Confirmed state survives a browser refresh.
- Reset restores the initial demo scenario after confirmation.
- The core experience works on mobile and desktop.
- Primary controls are keyboard accessible.
- No critical errors prevent the user from completing the main workflow.

## 14. Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui or equivalent accessible components
- **State management:** Zustand or React state with a centralized calculation layer
- **Charts:** Recharts
- **Icons:** Lucide
- **Persistence:** localStorage
- **Deployment:** Vercel or another compatible static frontend host

## 15. Final Product Vision

RupeeRadar transforms budgeting from a record of past transactions into an interactive way to evaluate future financial decisions.

Its value lies in the connection between spending, savings, commitments, risk, and projected outcomes—not in the number of dashboard cards or optional features.

**The MVP succeeds when a user can test a financial decision, understand its consequences, and make a more informed choice within seconds.**
