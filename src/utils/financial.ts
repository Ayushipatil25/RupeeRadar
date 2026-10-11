import {
  Transaction,
  Commitment,
  SavingsGoal,
  FinancialSummary,
  RiskLevel,
  CategoryBreakdownItem,
  DayBalancePoint,
  ExpenseCategory,
} from '../types';

export const TOTAL_BUDGET_DAYS = 30;
export const DEFAULT_STARTING_BUDGET = 10000;

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Food & Dining': '#C8F169',
  'Groceries': '#8FE388',
  'Transportation': '#60A5FA',
  'Entertainment': '#F2C66D',
  'Shopping': '#E879F9',
  'Bills & Utilities': '#F08080',
  'Health': '#34D399',
  'Education': '#A78BFA',
  'Other': '#94A3B8',
};

/**
 * Format any numeric amount into Indian Rupee presentation (e.g. ₹10,000, -₹450).
 * Handles NaN, non-finite values safely by defaulting to ₹0.
 */
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('en-IN').format(absAmount);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Validates a proposed transaction before committing it to state.
 * Returns error string or null if valid.
 */
export function validateTransactionInput(tx: Partial<Transaction>): string | null {
  if (!tx.title || tx.title.trim().length === 0) {
    return 'Transaction title or merchant name is required.';
  }
  if (typeof tx.amount !== 'number' || !Number.isFinite(tx.amount) || tx.amount <= 0) {
    return 'Transaction amount must be a positive number greater than ₹0.';
  }
  if (tx.day !== undefined && (tx.day < 1 || tx.day > TOTAL_BUDGET_DAYS)) {
    return `Transaction day must be between Day 1 and Day ${TOTAL_BUDGET_DAYS}.`;
  }
  if (tx.type !== 'expense' && tx.type !== 'income') {
    return 'Transaction type must be either expense or income.';
  }
  return null;
}

/**
 * Validates a proposed commitment (bill or subscription).
 * Returns error string or null if valid.
 */
export function validateCommitmentInput(comm: Partial<Commitment>): string | null {
  if (!comm.title || comm.title.trim().length === 0) {
    return 'Commitment title is required.';
  }
  if (typeof comm.amount !== 'number' || !Number.isFinite(comm.amount) || comm.amount <= 0) {
    return 'Commitment amount must be a positive number greater than ₹0.';
  }
  if (comm.dueDay !== undefined && (comm.dueDay < 1 || comm.dueDay > TOTAL_BUDGET_DAYS)) {
    return `Due day must be between Day 1 and Day ${TOTAL_BUDGET_DAYS}.`;
  }
  return null;
}

/**
 * Validates a savings goal input.
 * Returns error string or null if valid.
 */
export function validateSavingsGoalInput(goal: Partial<SavingsGoal>): string | null {
  if (!goal.title || goal.title.trim().length === 0) {
    return 'Savings goal title is required.';
  }
  if (
    typeof goal.targetAmount !== 'number' ||
    !Number.isFinite(goal.targetAmount) ||
    goal.targetAmount <= 0
  ) {
    return 'Savings target amount must be a positive number greater than ₹0.';
  }
  if (
    goal.currentAmount !== undefined &&
    (typeof goal.currentAmount !== 'number' ||
      !Number.isFinite(goal.currentAmount) ||
      goal.currentAmount < 0)
  ) {
    return 'Saved amount cannot be negative.';
  }
  return null;
}

/**
 * Central deterministic calculation of the entire financial position.
 * Single source of truth across Dashboard, FutureCast, Transactions, and Reports.
 */
export function calculateFinancialSummary(params: {
  startingBudget?: number;
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  currentDay: number;
  totalDays?: number;
}): FinancialSummary {
  const startingBudget =
    params.startingBudget !== undefined && Number.isFinite(params.startingBudget)
      ? Math.max(0, params.startingBudget)
      : DEFAULT_STARTING_BUDGET;

  const totalDays = params.totalDays ?? TOTAL_BUDGET_DAYS;
  const currentDay = Math.min(Math.max(1, Math.round(params.currentDay || 1)), totalDays);

  // 1. Ledger totals (only valid finite positive amounts)
  const totalExpenses = (params.transactions || [])
    .filter((t) => t.type === 'expense' && Number.isFinite(t.amount) && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = (params.transactions || [])
    .filter((t) => t.type === 'income' && Number.isFinite(t.amount) && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  // 2. Current ledger cash in hand
  const currentBalance = startingBudget + totalIncome - totalExpenses;

  // 3. Unpaid commitments hold funds that cannot be safely spent
  // A paid commitment is already recorded as an expense transaction and thus not counted here
  const committedBills = (params.commitments || [])
    .filter((c) => !c.isPaid && Number.isFinite(c.amount) && c.amount > 0)
    .reduce((acc, c) => acc + c.amount, 0);

  // 4. Locked savings contributions
  const savedAmount = (params.savingsGoals || [])
    .filter((g) => Number.isFinite(g.currentAmount) && g.currentAmount > 0)
    .reduce((acc, g) => acc + g.currentAmount, 0);

  // 5. Available safe-to-spend balance:
  // Ledger balance minus unpaid commitments and locked savings
  const availableBalance = currentBalance - committedBills - savedAmount;

  // 6. Remaining cycle days and daily safe allowance
  const daysRemaining = Math.max(1, totalDays - currentDay + 1);
  const dailyAllowance =
    availableBalance > 0 ? Math.floor(availableBalance / daysRemaining) : 0;

  // 7. Average burn rate per day so far
  const burnRatePerDay = currentDay > 0 ? Math.round(totalExpenses / currentDay) : 0;

  // 8. Projected Month-End Balance:
  // Estimates runway by projecting current daily burn rate through the remaining days
  const remainingDaysAfterCurrent = Math.max(0, totalDays - currentDay);
  const projectedRemainingSpend = burnRatePerDay * remainingDaysAfterCurrent;
  const projectedMonthEnd = Math.round(
    currentBalance - projectedRemainingSpend - committedBills
  );

  // 9. Algorithm Health Score (0 - 100)
  let healthScore = 70;
  if (availableBalance <= 0) {
    // Deficit state
    healthScore = Math.max(
      5,
      Math.round(25 + (availableBalance / Math.max(startingBudget, 1)) * 30)
    );
  } else {
    // Healthy or moderate state
    const balanceRatio = availableBalance / Math.max(startingBudget, 1);
    const dayRatio = (totalDays - currentDay + 1) / totalDays;

    if (balanceRatio >= dayRatio * 0.95) {
      healthScore = Math.min(98, Math.round(75 + balanceRatio * 20));
    } else {
      healthScore = Math.max(
        25,
        Math.round((balanceRatio / Math.max(dayRatio, 0.05)) * 65)
      );
    }
  }
  // Clamp between 0 and 100
  healthScore = Math.min(100, Math.max(0, Math.round(healthScore)));

  // 10. Risk Level
  let riskLevel: RiskLevel = 'low';
  if (availableBalance <= 1000 || dailyAllowance <= 120 || healthScore < 50) {
    riskLevel = 'high';
  } else if (availableBalance <= 2500 || dailyAllowance <= 280 || healthScore < 70) {
    riskLevel = 'moderate';
  }

  return {
    startingBudget,
    currentBalance,
    availableBalance,
    totalExpenses,
    totalIncome,
    committedBills,
    savedAmount,
    daysRemaining,
    currentDay,
    dailyAllowance,
    projectedMonthEnd,
    burnRatePerDay,
    healthScore,
    riskLevel,
  };
}

/**
 * Calculates spending breakdown by category sorted by highest spend.
 * Guarantees accurate percentages that always sum to 100% (or 0% when empty).
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[]
): CategoryBreakdownItem[] {
  const expenseTxs = (transactions || []).filter(
    (t) => t.type === 'expense' && Number.isFinite(t.amount) && t.amount > 0
  );

  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  if (totalExpense <= 0) return [];

  const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();
  for (const tx of expenseTxs) {
    const existing = categoryMap.get(tx.category) || { amount: 0, count: 0 };
    categoryMap.set(tx.category, {
      amount: existing.amount + tx.amount,
      count: existing.count + 1,
    });
  }

  return Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
      count: data.count,
      color: CATEGORY_COLORS[name] || '#94A3B8',
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Builds the continuous 30-day timeline chart data.
 * Day 1 to currentDay: actual cumulative balance.
 * currentDay to Day 30: smoothly projected forecast line.
 */
export function calculateTrendHistoryAndProjection(
  summary: FinancialSummary,
  transactions: Transaction[]
): DayBalancePoint[] {
  const { startingBudget, currentDay, projectedMonthEnd } = summary;
  const points: DayBalancePoint[] = [];
  let runningBalance = startingBudget;

  for (let d = 1; d <= TOTAL_BUDGET_DAYS; d++) {
    if (d <= currentDay) {
      const dayTxs = (transactions || []).filter((t) => t.day === d);
      const dayInc = dayTxs
        .filter((t) => t.type === 'income' && Number.isFinite(t.amount))
        .reduce((sum, t) => sum + t.amount, 0);
      const dayExp = dayTxs
        .filter((t) => t.type === 'expense' && Number.isFinite(t.amount))
        .reduce((sum, t) => sum + t.amount, 0);

      runningBalance = runningBalance + dayInc - dayExp;

      points.push({
        day: `D${d}`,
        dayNumber: d,
        label: `Day ${d}`,
        actual: runningBalance,
        // Bridge point at currentDay ensures smooth transition to dashed forecast line
        projected: d === currentDay ? runningBalance : null,
      });
    } else {
      const remainingDays = TOTAL_BUDGET_DAYS - currentDay;
      const progress = remainingDays > 0 ? (d - currentDay) / remainingDays : 1;
      const projectedVal = Math.round(
        runningBalance - (runningBalance - projectedMonthEnd) * progress
      );

      points.push({
        day: `D${d}`,
        dayNumber: d,
        label: `Day ${d} (Forecast)`,
        actual: null,
        projected: projectedVal,
      });
    }
  }

  return points;
}

export interface SimulatedOutcome {
  purchaseAmount: number;
  currentSummary: FinancialSummary;
  simulatedSummary: FinancialSummary;
  diff: {
    ledgerBalanceDiff: number;
    availableBalanceDiff: number;
    dailyAllowanceDiff: number;
    projectedMonthEndDiff: number;
    healthScoreDiff: number;
  };
  affordabilityStatus: 'Comfortable' | 'Caution' | 'High Risk';
  isAffordable: boolean;
  explanation: string;
  simulatedTrendPoints: Array<{
    day: string;
    dayNumber: number;
    label: string;
    baseline: number;
    simulated: number;
  }>;
}

/**
 * Pure in-memory simulation helper for FutureCast.
 * Simulates a hypothetical purchase without mutating or persisting any store state.
 */
export function simulatePurchaseImpact(params: {
  purchase: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    day?: number;
  };
  currentSummary: FinancialSummary;
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
}): SimulatedOutcome {
  const { purchase, currentSummary, transactions, commitments, savingsGoals } = params;
  const rawAmount = Number.isFinite(purchase.amount) && purchase.amount > 0 ? purchase.amount : 0;
  const roundedAmount = Math.round(rawAmount * 100) / 100;
  const simDay = purchase.day || currentSummary.currentDay;

  // 1. Build hypothetical in-memory transaction list
  const hypotheticalTx: Transaction = {
    id: 'hypothetical-purchase-preview',
    title: purchase.title.trim() || 'Simulated Purchase',
    amount: roundedAmount,
    type: 'expense',
    category: purchase.category,
    day: simDay,
    date: `Day ${simDay}`,
    createdAt: Date.now(),
  };

  const hypotheticalTransactions = roundedAmount > 0
    ? [hypotheticalTx, ...transactions]
    : transactions;

  // 2. Compute simulated summary using shared financial engine
  const simulatedSummary = calculateFinancialSummary({
    startingBudget: currentSummary.startingBudget,
    transactions: hypotheticalTransactions,
    commitments,
    savingsGoals,
    currentDay: currentSummary.currentDay,
    totalDays: TOTAL_BUDGET_DAYS,
  });

  // 3. Compute metric deltas
  const ledgerBalanceDiff = simulatedSummary.currentBalance - currentSummary.currentBalance;
  const availableBalanceDiff = simulatedSummary.availableBalance - currentSummary.availableBalance;
  const dailyAllowanceDiff = simulatedSummary.dailyAllowance - currentSummary.dailyAllowance;
  const projectedMonthEndDiff = simulatedSummary.projectedMonthEnd - currentSummary.projectedMonthEnd;
  const healthScoreDiff = simulatedSummary.healthScore - currentSummary.healthScore;

  // 4. Deterministic affordability assessment
  const isAffordable = currentSummary.availableBalance >= roundedAmount;
  let affordabilityStatus: 'Comfortable' | 'Caution' | 'High Risk' = 'Comfortable';
  let explanation = '';

  if (roundedAmount <= 0) {
    affordabilityStatus = 'Comfortable';
    explanation = 'Enter an amount or choose a quick scenario above to simulate the financial impact.';
  } else if (!isAffordable) {
    affordabilityStatus = 'High Risk';
    const shortfall = roundedAmount - currentSummary.availableBalance;
    explanation = `This purchase exceeds your safe spendable balance by ${formatINR(
      shortfall
    )}. Confirming this would encroach on funds needed for upcoming bills (${formatINR(
      currentSummary.committedBills
    )}) or locked savings (${formatINR(currentSummary.savedAmount)}).`;
  } else if (
    simulatedSummary.dailyAllowance < 120 ||
    simulatedSummary.availableBalance < 1000 ||
    simulatedSummary.projectedMonthEnd < 500
  ) {
    affordabilityStatus = 'Caution';
    explanation = `You have enough cash right now, but this drops your daily safe allowance to ${formatINR(
      simulatedSummary.dailyAllowance
    )}/day for the remaining ${currentSummary.daysRemaining} days. Non-essential spending will need to be strictly frozen.`;
  } else {
    affordabilityStatus = 'Comfortable';
    explanation = `You can safely afford this purchase. After spending ${formatINR(
      roundedAmount
    )}, you will retain a comfortable ${formatINR(
      simulatedSummary.dailyAllowance
    )}/day safe allowance and project a surplus of ${formatINR(
      simulatedSummary.projectedMonthEnd
    )} on Day 30.`;
  }

  // 5. Generate dual-trajectory comparison chart points (Day 1 to 30)
  const baselineTrend = calculateTrendHistoryAndProjection(currentSummary, transactions);
  const simulatedTrend = calculateTrendHistoryAndProjection(simulatedSummary, hypotheticalTransactions);

  const simulatedTrendPoints = baselineTrend.map((bPoint, i) => {
    const sPoint = simulatedTrend[i];
    return {
      day: bPoint.day,
      dayNumber: bPoint.dayNumber,
      label: bPoint.label,
      baseline: bPoint.actual !== null ? bPoint.actual : (bPoint.projected ?? 0),
      simulated: sPoint.actual !== null ? sPoint.actual : (sPoint.projected ?? 0),
    };
  });

  return {
    purchaseAmount: roundedAmount,
    currentSummary,
    simulatedSummary,
    diff: {
      ledgerBalanceDiff,
      availableBalanceDiff,
      dailyAllowanceDiff,
      projectedMonthEndDiff,
      healthScoreDiff,
    },
    affordabilityStatus,
    isAffordable,
    explanation,
    simulatedTrendPoints,
  };
}
