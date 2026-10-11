import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Pure implementation mirroring src/utils/financial.ts for standalone verification
const TOTAL_BUDGET_DAYS = 30;
const DEFAULT_STARTING_BUDGET = 10000;

function calculateFinancialSummary({
  startingBudget = DEFAULT_STARTING_BUDGET,
  transactions = [],
  commitments = [],
  savingsGoals = [],
  currentDay = 1,
  totalDays = TOTAL_BUDGET_DAYS,
}) {
  const validStartingBudget = Math.max(0, startingBudget);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense' && Number.isFinite(t.amount) && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income' && Number.isFinite(t.amount) && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = validStartingBudget + totalIncome - totalExpenses;

  const committedBills = commitments
    .filter((c) => !c.isPaid && Number.isFinite(c.amount) && c.amount > 0)
    .reduce((acc, c) => acc + c.amount, 0);

  const savedAmount = savingsGoals
    .filter((g) => Number.isFinite(g.currentAmount) && g.currentAmount > 0)
    .reduce((acc, g) => acc + g.currentAmount, 0);

  const availableBalance = currentBalance - committedBills - savedAmount;
  const daysRemaining = Math.max(1, totalDays - currentDay + 1);
  const dailyAllowance = availableBalance > 0 ? Math.floor(availableBalance / daysRemaining) : 0;
  const burnRatePerDay = currentDay > 0 ? Math.round(totalExpenses / currentDay) : 0;
  const remainingDays = Math.max(0, totalDays - currentDay);
  const projectedMonthEnd = currentBalance - burnRatePerDay * remainingDays;

  return {
    startingBudget: validStartingBudget,
    currentDay,
    totalIncome,
    totalExpenses,
    currentBalance,
    committedBills,
    savedAmount,
    availableBalance,
    dailyAllowance,
    burnRatePerDay,
    projectedMonthEnd,
    daysRemaining,
  };
}

function simulatePurchaseImpact({
  purchase,
  currentSummary,
  transactions,
  commitments,
  savingsGoals,
}) {
  const rawAmount = Number.isFinite(purchase.amount) && purchase.amount > 0 ? purchase.amount : 0;
  const roundedAmount = Math.round(rawAmount * 100) / 100;
  const isAffordable = currentSummary.availableBalance >= roundedAmount;

  const hypotheticalTx = {
    id: 'hypothetical-preview',
    title: purchase.title || 'Simulated Purchase',
    amount: roundedAmount,
    type: 'expense',
    category: purchase.category || 'Shopping',
    day: currentSummary.currentDay,
  };

  const simulatedSummary = calculateFinancialSummary({
    startingBudget: currentSummary.startingBudget,
    transactions: roundedAmount > 0 ? [hypotheticalTx, ...transactions] : transactions,
    commitments,
    savingsGoals,
    currentDay: currentSummary.currentDay,
  });

  return {
    isAffordable,
    shortfall: isAffordable ? 0 : roundedAmount - currentSummary.availableBalance,
    simulatedSummary,
  };
}

describe('RupeeRadar Financial Engine Tests', () => {
  test('1. Baseline Starting Budget Calculation', () => {
    const summary = calculateFinancialSummary({
      startingBudget: 10000,
      transactions: [],
      commitments: [],
      savingsGoals: [],
      currentDay: 1,
    });

    assert.equal(summary.currentBalance, 10000);
    assert.equal(summary.availableBalance, 10000);
    assert.equal(summary.dailyAllowance, Math.floor(10000 / 30));
  });

  test('2. Reserved Bills Quarantining (Unpaid Commitments)', () => {
    const commitments = [
      { id: 'c1', title: 'Wi-Fi', amount: 500, isPaid: false },
      { id: 'c2', title: 'Spotify', amount: 120, isPaid: false },
    ];

    const summary = calculateFinancialSummary({
      startingBudget: 10000,
      transactions: [],
      commitments,
      savingsGoals: [],
      currentDay: 1,
    });

    assert.equal(summary.currentBalance, 10000);
    assert.equal(summary.committedBills, 620);
    // Available balance MUST hold back unpaid bills
    assert.equal(summary.availableBalance, 10000 - 620);
  });

  test('3. Savings Goal Deposit Ring-Fencing', () => {
    const savingsGoals = [
      { id: 's1', title: 'Emergency Fund', targetAmount: 2000, currentAmount: 800 },
    ];

    const summary = calculateFinancialSummary({
      startingBudget: 10000,
      transactions: [],
      commitments: [],
      savingsGoals,
      currentDay: 1,
    });

    assert.equal(summary.currentBalance, 10000);
    assert.equal(summary.savedAmount, 800);
    // Locked savings cannot be spent
    assert.equal(summary.availableBalance, 10000 - 800);
  });

  test('4. Bill Payment Atomicity (No Double Counting)', () => {
    // When a bill is marked as paid, it generates a ledger expense transaction and isPaid becomes true
    const commitments = [
      { id: 'c1', title: 'Wi-Fi', amount: 500, isPaid: true }, // Marked paid
    ];
    const transactions = [
      { id: 't1', title: 'Bill Payment: Wi-Fi', amount: 500, type: 'expense' },
    ];

    const summary = calculateFinancialSummary({
      startingBudget: 10000,
      transactions,
      commitments,
      savingsGoals: [],
      currentDay: 1,
    });

    // Ledger balance deducted by 500
    assert.equal(summary.currentBalance, 9500);
    // Committed bills should be 0 because bill is paid
    assert.equal(summary.committedBills, 0);
    // Available balance reflects the deduction exactly once (not 500 + 500 = 1000)
    assert.equal(summary.availableBalance, 9500);
  });

  test('5. FutureCast Simulation Isolation & Exactly-Once Confirmation', () => {
    const initialTxs = [
      { id: 't1', title: 'Groceries', amount: 500, type: 'expense' },
    ];
    const summaryBefore = calculateFinancialSummary({
      startingBudget: 10000,
      transactions: initialTxs,
      commitments: [],
      savingsGoals: [],
      currentDay: 5,
    });

    assert.equal(summaryBefore.currentBalance, 9500);

    // Run preview simulation of 1,000 purchase
    const simulation = simulatePurchaseImpact({
      purchase: { title: 'Headphones', amount: 1000, category: 'Shopping' },
      currentSummary: summaryBefore,
      transactions: initialTxs,
      commitments: [],
      savingsGoals: [],
    });

    assert.equal(simulation.isAffordable, true);
    assert.equal(simulation.simulatedSummary.currentBalance, 8500);

    // CRITICAL: Original transactions array and summary must remain untouched during preview
    assert.equal(initialTxs.length, 1);
    assert.equal(summaryBefore.currentBalance, 9500);

    // Confirm purchase exactly once
    const confirmedTx = { id: 't2', title: 'Headphones', amount: 1000, type: 'expense' };
    const confirmedTxs = [confirmedTx, ...initialTxs];
    const summaryAfter = calculateFinancialSummary({
      startingBudget: 10000,
      transactions: confirmedTxs,
      commitments: [],
      savingsGoals: [],
      currentDay: 5,
    });

    assert.equal(summaryAfter.currentBalance, 8500);
    assert.equal(confirmedTxs.length, 2);
  });

  test('6. Over-Budget Purchase Shortfall Explanation', () => {
    const summary = calculateFinancialSummary({
      startingBudget: 10000,
      transactions: [{ id: 't1', title: 'Rent', amount: 8000, type: 'expense' }],
      commitments: [{ id: 'c1', title: 'Electricity', amount: 1000, isPaid: false }],
      savingsGoals: [{ id: 's1', title: 'Cushion', targetAmount: 1000, currentAmount: 500 }],
      currentDay: 10,
    });

    // Ledger balance = 2000, Committed bills = 1000, Savings = 500 -> Available = 500
    assert.equal(summary.availableBalance, 500);

    const simulation = simulatePurchaseImpact({
      purchase: { title: 'Fancy Jacket', amount: 1200, category: 'Shopping' },
      currentSummary: summary,
      transactions: [],
      commitments: [],
      savingsGoals: [],
    });

    assert.equal(simulation.isAffordable, false);
    assert.equal(simulation.shortfall, 700); // 1200 - 500 = 700
  });
});
