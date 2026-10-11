import React, { useState } from 'react';
import {
  PiggyBank,
  PlusCircle,
  Target,
  Edit2,
  Trash2,
  Plus,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatINR, TOTAL_BUDGET_DAYS } from '../utils/financial';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SavingsGoal } from '../types';

export const SavingsPage: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    depositToSavingsGoal,
    getSummary,
  } = useFinanceStore();

  const summary = getSummary();

  // Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalInitialSaved, setGoalInitialSaved] = useState('');
  const [goalTargetDay, setGoalTargetDay] = useState(30);
  const [goalFormError, setGoalFormError] = useState<string | null>(null);

  // Deposit Modal State
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Computed overview metrics
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPercentage =
    totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const openAddGoalModal = () => {
    setEditingGoal(null);
    setGoalTitle('');
    setGoalTargetAmount('');
    setGoalInitialSaved('0');
    setGoalTargetDay(30);
    setGoalFormError(null);
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalTargetAmount(goal.targetAmount.toString());
    setGoalInitialSaved(goal.currentAmount.toString());
    setGoalTargetDay(goal.targetDay || 30);
    setGoalFormError(null);
    setIsGoalModalOpen(true);
  };

  const handleGoalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalFormError(null);

    const parsedTarget = parseFloat(goalTargetAmount);
    const parsedInitial = parseFloat(goalInitialSaved) || 0;

    if (!goalTitle.trim()) {
      setGoalFormError('Please enter a goal title.');
      return;
    }
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setGoalFormError('Please enter a target amount greater than ₹0.');
      return;
    }
    if (parsedInitial < 0) {
      setGoalFormError('Saved amount cannot be negative.');
      return;
    }

    if (editingGoal) {
      const success = updateSavingsGoal(editingGoal.id, {
        title: goalTitle.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedInitial,
        targetDay: goalTargetDay,
      });
      if (success) {
        setIsGoalModalOpen(false);
      } else {
        setGoalFormError('Failed to update goal. Check your inputs.');
      }
    } else {
      const success = addSavingsGoal({
        title: goalTitle.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedInitial,
        targetDay: goalTargetDay,
        createdAt: Date.now(),
      });
      if (success) {
        setIsGoalModalOpen(false);
      } else {
        setGoalFormError('Failed to create goal. Check your inputs.');
      }
    }
  };

  const openDepositModal = (goal: SavingsGoal) => {
    setDepositGoal(goal);
    setDepositAmount('');
    setDepositError(null);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);

    if (!depositGoal) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Please enter a deposit amount greater than ₹0.');
      return;
    }

    if (amount > summary.availableBalance) {
      setDepositError(
        `Cannot deposit ${formatINR(amount)}. You only have ${formatINR(
          summary.availableBalance
        )} available in safe spendable funds.`
      );
      return;
    }

    const success = depositToSavingsGoal(depositGoal.id, amount);
    if (success) {
      setDepositGoal(null);
      setDepositAmount('');
    } else {
      setDepositError('Deposit failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F5F0]">
            Savings Goals
          </h2>
          <p className="text-xs md:text-sm text-[#A0ADA3] mt-0.5">
            Turn your savings plans into measurable progress and lock away rainy-day cushions.
          </p>
        </div>
        <Button variant="accent" onClick={openAddGoalModal}>
          <PlusCircle className="w-4 h-4" />
          Add Savings Goal
        </Button>
      </div>

      {/* 2. Overview Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Total Saved So Far
            </span>
            <div className="text-2xl font-bold text-[#8FE388] mt-1">
              {formatINR(totalSaved)}
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              {overallPercentage}% of total target reached
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#132A1C] border border-[#29352D] flex items-center justify-center text-[#8FE388]">
            <PiggyBank className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Cumulative Target
            </span>
            <div className="text-2xl font-bold text-[#F2F5F0] mt-1">
              {formatINR(totalTarget)}
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              Across {savingsGoals.length} active goal{savingsGoals.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1B241E] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
            <Target className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Available For Deposit
            </span>
            <div className="text-2xl font-bold text-[#C8F169] mt-1">
              {formatINR(summary.availableBalance)}
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              Free cash remaining in budget
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. Goal Cards Grid */}
      {savingsGoals.length === 0 ? (
        <Card className="p-12 text-center text-[#6F7C72] bg-[#151C18] border-[#29352D] space-y-3">
          <PiggyBank className="w-12 h-12 mx-auto opacity-40 mb-2" />
          <h4 className="text-base font-semibold text-[#F2F5F0]">
            No savings goals established yet
          </h4>
          <p className="text-xs max-w-md mx-auto text-[#A0ADA3]">
            Start building your emergency cushion or plan for a milestone purchase by creating your first savings target.
          </p>
          <Button variant="accent" size="sm" onClick={openAddGoalModal} className="mt-2">
            <PlusCircle className="w-3.5 h-3.5" />
            Create Your First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((goal) => {
            const percent =
              goal.targetAmount > 0
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <Card
                key={goal.id}
                className="bg-[#151C18] border-[#29352D] p-5 flex flex-col justify-between hover:border-[#3B4B40] transition-colors"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
                        <PiggyBank className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#F2F5F0]">
                          {goal.title}
                        </h4>
                        {goal.targetDay && (
                          <span className="text-[10px] text-[#6F7C72] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            Target: Day {goal.targetDay} of 30
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge variant={isCompleted ? 'positive' : 'accent'}>
                      {isCompleted ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        `${percent}% Saved`
                      )}
                    </Badge>
                  </div>

                  {/* Amounts */}
                  <div className="my-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-[#6F7C72] uppercase block font-medium">
                        Current Saved
                      </span>
                      <span className="text-xl font-extrabold text-[#8FE388]">
                        {formatINR(goal.currentAmount)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#6F7C72] uppercase block font-medium">
                        Goal Target
                      </span>
                      <span className="text-sm font-bold text-[#F2F5F0]">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="w-full h-2.5 rounded-full bg-[#1B241E] border border-[#29352D] overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-[#8FE388]' : 'bg-[#C8F169]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#A0ADA3]">
                      <span>{formatINR(goal.currentAmount)} locked</span>
                      <span>
                        {remaining > 0 ? `${formatINR(remaining)} to go` : 'Goal fulfilled!'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#29352D] flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => openDepositModal(goal)}
                    disabled={isCompleted}
                    className="flex-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Deposit Funds
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditGoalModal(goal)}
                      className="p-2 rounded-lg text-[#6F7C72] hover:text-[#C8F169] hover:bg-[#1B241E] transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingGoalId(goal.id)}
                      className="p-2 rounded-lg text-[#6F7C72] hover:text-[#F08080] hover:bg-[#381B1B]/40 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
        subtitle={
          editingGoal
            ? 'Adjust your savings milestone target.'
            : 'Establish a new target to reserve funds toward your future needs.'
        }
      >
        <form onSubmit={handleGoalFormSubmit} className="space-y-4">
          {goalFormError && (
            <div className="p-3 rounded-xl bg-[#331818] border border-[#4D2424] text-xs text-[#F08080]">
              {goalFormError}
            </div>
          )}

          <div>
            <label htmlFor="goal-title" className="block text-xs font-medium text-[#A0ADA3] mb-1">
              Goal Name *
            </label>
            <input
              id="goal-title"
              type="text"
              placeholder="e.g. Emergency Cushion, Course Tuition, Weekend Trip"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              maxLength={80}
              className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] placeholder-[#6F7C72] focus:outline-none focus:border-[#C8F169]/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-target" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                Target Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A0ADA3]">
                  ₹
                </span>
                <input
                  id="goal-target"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="1000"
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal-day" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                Target Day (1–30)
              </label>
              <input
                id="goal-day"
                type="number"
                min="1"
                max={TOTAL_BUDGET_DAYS}
                value={goalTargetDay}
                onChange={(e) => setGoalTargetDay(parseInt(e.target.value) || 30)}
                className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="goal-saved" className="block text-xs font-medium text-[#A0ADA3] mb-1">
              Currently Saved Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A0ADA3]">
                ₹
              </span>
              <input
                id="goal-saved"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={goalInitialSaved}
                onChange={(e) => setGoalInitialSaved(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
              />
            </div>
            <p className="text-[11px] text-[#6F7C72] mt-1">
              Funds reserved in savings goals are protected from your available safe daily allowance.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29352D]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGoalModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm">
              {editingGoal ? 'Update Goal' : 'Save Goal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. Deposit Funds Action Modal */}
      <Modal
        isOpen={depositGoal !== null}
        onClose={() => setDepositGoal(null)}
        title="Deposit Into Savings"
        subtitle={`Allocate funds toward ${depositGoal?.title}`}
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          {depositError && (
            <div className="p-3 rounded-xl bg-[#331818] border border-[#4D2424] text-xs text-[#F08080]">
              {depositError}
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#1B241E] border border-[#29352D] text-xs space-y-1">
            <div className="flex items-center justify-between text-[#A0ADA3]">
              <span>Available to allocate:</span>
              <span className="font-bold text-[#C8F169]">
                {formatINR(summary.availableBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#6F7C72]">
              <span>Current saved in this goal:</span>
              <span>{formatINR(depositGoal?.currentAmount || 0)}</span>
            </div>
          </div>

          <div>
            <label htmlFor="deposit-amount" className="block text-xs font-medium text-[#A0ADA3] mb-1">
              Deposit Amount (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A0ADA3]">
                ₹
              </span>
              <input
                id="deposit-amount"
                type="number"
                min="1"
                step="any"
                placeholder="250"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50 font-semibold"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29352D]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDepositGoal(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm">
              Confirm Deposit
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Delete Goal Confirmation Dialog */}
      <Modal
        isOpen={deletingGoalId !== null}
        onClose={() => setDeletingGoalId(null)}
        title="Delete Savings Goal"
        subtitle="Are you sure you want to delete this savings goal?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#A0ADA3] leading-relaxed">
            Removing this goal will release any locked saved amounts back into your general available spendable balance.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29352D]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingGoalId(null)}
            >
              Keep Goal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (deletingGoalId) {
                  deleteSavingsGoal(deletingGoalId);
                  setDeletingGoalId(null);
                }
              }}
            >
              Delete Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
