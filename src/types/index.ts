export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Health'
  | 'Education'
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number; // Positive number in INR
  type: TransactionType;
  category: ExpenseCategory;
  day: number; // Simulation Day 1 to 30
  date: string;
  note?: string;
  createdAt?: number;
}

export interface Commitment {
  id: string;
  title: string;
  amount: number; // Positive number in INR
  type: 'bill' | 'subscription';
  dueDay: number; // Simulation Day 1 to 30
  isPaid: boolean;
  category?: ExpenseCategory;
  paidTransactionId?: string; // Links to expense transaction if recorded upon payment
  recurrence?: 'monthly' | 'weekly' | 'one-time';
  createdAt?: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number; // Positive number in INR
  currentAmount: number; // Non-negative saved amount in INR
  targetDay?: number; // Optional target day within cycle
  createdAt?: number;
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface FinancialSummary {
  startingBudget: number;
  currentBalance: number; // Ledger balance: startingBudget + totalIncome - totalExpenses
  availableBalance: number; // Spendable runway: currentBalance - committedBills - savedAmount
  totalExpenses: number;
  totalIncome: number;
  committedBills: number; // Unpaid bills due in this cycle
  savedAmount: number; // Cumulative saved across active goals
  daysRemaining: number; // Total cycle days - currentDay + 1 (min 1)
  currentDay: number; // 1 to 30
  dailyAllowance: number; // Safe spend per day for remaining days
  projectedMonthEnd: number; // Forecast balance on Day 30
  burnRatePerDay: number; // Average daily spend so far
  healthScore: number; // 0 to 100
  riskLevel: RiskLevel;
}

export interface CategoryBreakdownItem {
  name: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface DayBalancePoint {
  day: string;
  dayNumber: number;
  label: string;
  actual: number | null;
  projected: number | null;
}

export interface SimulationState {
  title: string;
  amount: number;
  category: ExpenseCategory;
  isActive: boolean;
}
