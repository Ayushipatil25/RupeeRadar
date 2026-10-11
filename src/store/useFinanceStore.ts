import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Transaction,
  Commitment,
  SavingsGoal,
  FinancialSummary,
  SimulationState,
} from '../types';
import {
  calculateFinancialSummary,
  DEFAULT_STARTING_BUDGET,
  TOTAL_BUDGET_DAYS,
  validateTransactionInput,
  validateCommitmentInput,
  validateSavingsGoalInput,
} from '../utils/financial';

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Metro Recharge',
    amount: 400,
    type: 'expense',
    category: 'Transportation',
    day: 2,
    date: 'Day 2',
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'tx-2',
    title: 'Campus Canteen & Snacks',
    amount: 320,
    type: 'expense',
    category: 'Food & Dining',
    day: 4,
    date: 'Day 4',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'tx-3',
    title: 'Monthly Groceries & Milk',
    amount: 980,
    type: 'expense',
    category: 'Groceries',
    day: 6,
    date: 'Day 6',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'tx-4',
    title: 'Freelance Tutoring Gig',
    amount: 1200,
    type: 'income',
    category: 'Other',
    day: 7,
    date: 'Day 7',
    createdAt: Date.now() - 1 * 86400000,
  },
];

const INITIAL_COMMITMENTS: Commitment[] = [
  {
    id: 'cm-1',
    title: 'Wi-Fi Contribution',
    amount: 450,
    type: 'bill',
    dueDay: 15,
    isPaid: false,
    category: 'Bills & Utilities',
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'cm-2',
    title: 'Spotify Student',
    amount: 119,
    type: 'subscription',
    dueDay: 20,
    isPaid: false,
    category: 'Entertainment',
    createdAt: Date.now() - 7 * 86400000,
  },
];

const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-1',
    title: 'Emergency Cushion',
    targetAmount: 1500,
    currentAmount: 600,
    targetDay: 30,
    createdAt: Date.now() - 7 * 86400000,
  },
];

interface FinanceStoreState {
  startingBudget: number;
  currentDay: number;
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  simulation: SimulationState;

  // Actions — Simulation & Budget
  setStartingBudget: (amount: number) => void;
  setCurrentDay: (day: number) => void;
  advanceDay: () => void;

  // Actions — Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => boolean;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => boolean;
  deleteTransaction: (id: string) => void;

  // Actions — Commitments
  addCommitment: (commitment: Omit<Commitment, 'id'>) => boolean;
  updateCommitment: (id: string, updates: Partial<Omit<Commitment, 'id'>>) => boolean;
  deleteCommitment: (id: string) => void;
  toggleCommitmentPaid: (id: string) => void;
  markCommitmentPaid: (id: string, isPaid: boolean) => void;

  // Actions — Savings
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => boolean;
  updateSavingsGoal: (id: string, updates: Partial<Omit<SavingsGoal, 'id'>>) => boolean;
  deleteSavingsGoal: (id: string) => void;
  updateSavingsAmount: (id: string, amount: number) => boolean;
  depositToSavingsGoal: (id: string, amount: number) => boolean;

  // Actions — Simulation & Reset
  setSimulation: (simulation: SimulationState) => void;
  clearSimulation: () => void;
  resetToDefault: () => void;

  // Getters
  getSummary: () => FinancialSummary;
}

export const useFinanceStore = create<FinanceStoreState>()(
  persist(
    (set, get) => ({
      startingBudget: DEFAULT_STARTING_BUDGET,
      currentDay: 8,
      transactions: INITIAL_TRANSACTIONS,
      commitments: INITIAL_COMMITMENTS,
      savingsGoals: INITIAL_SAVINGS_GOALS,
      simulation: {
        title: '',
        amount: 0,
        category: 'Shopping',
        isActive: false,
      },

      setStartingBudget: (amount) => {
        if (Number.isFinite(amount) && amount >= 0) {
          set({ startingBudget: Math.round(amount) });
        }
      },

      setCurrentDay: (day) => {
        const boundedDay = Math.min(
          Math.max(1, Math.round(day)),
          TOTAL_BUDGET_DAYS
        );
        set({ currentDay: boundedDay });
      },

      advanceDay: () => {
        const state = get();
        if (state.currentDay < TOTAL_BUDGET_DAYS) {
          set({ currentDay: state.currentDay + 1 });
        }
      },

      addTransaction: (txData) => {
        const error = validateTransactionInput(txData);
        if (error) {
          console.warn('[FinanceStore] Rejected invalid transaction:', error, txData);
          return false;
        }

        const id = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newTx: Transaction = {
          ...txData,
          id,
          amount: Math.round(txData.amount * 100) / 100,
          createdAt: txData.createdAt || Date.now(),
        };

        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
        return true;
      },

      updateTransaction: (id, updates) => {
        const state = get();
        const existing = state.transactions.find((t) => t.id === id);
        if (!existing) return false;

        const merged = { ...existing, ...updates };
        const error = validateTransactionInput(merged);
        if (error) {
          console.warn('[FinanceStore] Rejected invalid transaction update:', error);
          return false;
        }

        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? {
                  ...merged,
                  amount: Math.round(merged.amount * 100) / 100,
                }
              : t
          ),
        }));
        return true;
      },

      deleteTransaction: (id) => {
        set((state) => {
          // If deleted transaction was linked to a paid commitment, mark commitment unpaid
          const updatedCommitments = state.commitments.map((c) =>
            c.paidTransactionId === id
              ? { ...c, isPaid: false, paidTransactionId: undefined }
              : c
          );

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            commitments: updatedCommitments,
          };
        });
      },

      addCommitment: (commData) => {
        const error = validateCommitmentInput(commData);
        if (error) {
          console.warn('[FinanceStore] Rejected invalid commitment:', error, commData);
          return false;
        }

        const id = `cm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newComm: Commitment = {
          ...commData,
          id,
          amount: Math.round(commData.amount * 100) / 100,
          createdAt: commData.createdAt || Date.now(),
        };

        set((state) => ({
          commitments: [...state.commitments, newComm],
        }));
        return true;
      },

      updateCommitment: (id, updates) => {
        const state = get();
        const existing = state.commitments.find((c) => c.id === id);
        if (!existing) return false;

        const merged = { ...existing, ...updates };
        const error = validateCommitmentInput(merged);
        if (error) {
          console.warn('[FinanceStore] Rejected invalid commitment update:', error);
          return false;
        }

        set((state) => ({
          commitments: state.commitments.map((c) =>
            c.id === id
              ? { ...merged, amount: Math.round(merged.amount * 100) / 100 }
              : c
          ),
        }));
        return true;
      },

      deleteCommitment: (id) => {
        set((state) => {
          const comm = state.commitments.find((c) => c.id === id);
          // If it had a linked recorded transaction, optionally remove it
          const updatedTxs = comm?.paidTransactionId
            ? state.transactions.filter((t) => t.id !== comm.paidTransactionId)
            : state.transactions;

          return {
            commitments: state.commitments.filter((c) => c.id !== id),
            transactions: updatedTxs,
          };
        });
      },

      toggleCommitmentPaid: (id) => {
        const state = get();
        const comm = state.commitments.find((c) => c.id === id);
        if (!comm) return;

        if (!comm.isPaid) {
          // Marking as PAID:
          // Record an expense transaction so the ledger cash reflects the payment.
          const txId = `tx-bill-${Date.now()}`;
          const paymentTx: Transaction = {
            id: txId,
            title: comm.title,
            amount: comm.amount,
            type: 'expense',
            category: comm.category || 'Bills & Utilities',
            day: state.currentDay,
            date: `Day ${state.currentDay}`,
            note: `Payment for ${comm.title}`,
            createdAt: Date.now(),
          };

          set((s) => ({
            transactions: [paymentTx, ...s.transactions],
            commitments: s.commitments.map((c) =>
              c.id === id ? { ...c, isPaid: true, paidTransactionId: txId } : c
            ),
          }));
        } else {
          // Marking as UNPAID:
          // Remove the linked transaction so money is restored to ledger cash,
          // and the bill becomes an unpaid commitment again.
          const txToRemove = comm.paidTransactionId;
          set((s) => ({
            transactions: txToRemove
              ? s.transactions.filter((t) => t.id !== txToRemove)
              : s.transactions,
            commitments: s.commitments.map((c) =>
              c.id === id ? { ...c, isPaid: false, paidTransactionId: undefined } : c
            ),
          }));
        }
      },

      markCommitmentPaid: (id, isPaid) => {
        const state = get();
        const comm = state.commitments.find((c) => c.id === id);
        if (!comm || comm.isPaid === isPaid) return;
        get().toggleCommitmentPaid(id);
      },

      addSavingsGoal: (goalData) => {
        const error = validateSavingsGoalInput(goalData);
        if (error) {
          console.warn('[FinanceStore] Rejected invalid savings goal:', error, goalData);
          return false;
        }

        const id = `sg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newGoal: SavingsGoal = {
          ...goalData,
          id,
          targetAmount: Math.round(goalData.targetAmount * 100) / 100,
          currentAmount: Math.round((goalData.currentAmount || 0) * 100) / 100,
          createdAt: goalData.createdAt || Date.now(),
        };

        set((state) => ({
          savingsGoals: [...state.savingsGoals, newGoal],
        }));
        return true;
      },

      updateSavingsGoal: (id, updates) => {
        const state = get();
        const existing = state.savingsGoals.find((g) => g.id === id);
        if (!existing) return false;

        const merged = { ...existing, ...updates };
        const error = validateSavingsGoalInput(merged);
        if (error) {
          console.warn('[FinanceStore] Rejected invalid savings goal update:', error);
          return false;
        }

        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id
              ? {
                  ...merged,
                  targetAmount: Math.round(merged.targetAmount * 100) / 100,
                  currentAmount: Math.round(merged.currentAmount * 100) / 100,
                }
              : g
          ),
        }));
        return true;
      },

      deleteSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        }));
      },

      updateSavingsAmount: (id, amount) => {
        if (!Number.isFinite(amount) || amount < 0) return false;
        const validAmount = Math.round(amount * 100) / 100;
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, currentAmount: validAmount } : g
          ),
        }));
        return true;
      },

      depositToSavingsGoal: (id, amount) => {
        if (!Number.isFinite(amount) || amount <= 0) return false;
        const state = get();
        const goal = state.savingsGoals.find((g) => g.id === id);
        if (!goal) return false;

        const summary = state.getSummary();
        if (amount > summary.availableBalance) {
          console.warn('[FinanceStore] Cannot deposit more than available safe balance');
          return false;
        }

        const validAmount = Math.round(amount * 100) / 100;
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) =>
            g.id === id
              ? { ...g, currentAmount: g.currentAmount + validAmount }
              : g
          ),
        }));
        return true;
      },

      setSimulation: (simulation) => set({ simulation }),

      clearSimulation: () =>
        set({
          simulation: {
            title: '',
            amount: 0,
            category: 'Shopping',
            isActive: false,
          },
        }),

      resetToDefault: () => {
        set({
          startingBudget: DEFAULT_STARTING_BUDGET,
          currentDay: 8,
          transactions: INITIAL_TRANSACTIONS,
          commitments: INITIAL_COMMITMENTS,
          savingsGoals: INITIAL_SAVINGS_GOALS,
          simulation: {
            title: '',
            amount: 0,
            category: 'Shopping',
            isActive: false,
          },
        });
      },

      getSummary: () => {
        const state = get();
        return calculateFinancialSummary({
          startingBudget: state.startingBudget,
          transactions: state.transactions,
          commitments: state.commitments,
          savingsGoals: state.savingsGoals,
          currentDay: state.currentDay,
        });
      },
    }),
    {
      name: 'rupeeradar-storage',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0 || !persistedState) {
          return {
            startingBudget: DEFAULT_STARTING_BUDGET,
            currentDay: 8,
            transactions: INITIAL_TRANSACTIONS,
            commitments: INITIAL_COMMITMENTS,
            savingsGoals: INITIAL_SAVINGS_GOALS,
            simulation: {
              title: '',
              amount: 0,
              category: 'Shopping',
              isActive: false,
            },
          };
        }
        return persistedState;
      },
    }
  )
);
