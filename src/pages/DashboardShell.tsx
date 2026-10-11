import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { QuickStats } from '../components/dashboard/QuickStats';
import { MoneyPulseChart } from '../components/dashboard/MoneyPulseChart';
import { SpendingBreakdown } from '../components/dashboard/SpendingBreakdown';
import { HealthPulseCard } from '../components/dashboard/HealthPulseCard';
import { NextMoveCard } from '../components/dashboard/NextMoveCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Calendar, PlusCircle, Sparkles } from 'lucide-react';

interface DashboardShellProps {
  onNavigateToTab?: (tab: string) => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ onNavigateToTab }) => {
  const {
    currentDay,
    setCurrentDay,
    addTransaction,
    getSummary,
    commitments,
    savingsGoals,
    transactions,
  } = useFinanceStore();

  const summary = getSummary();

  const handleNextDay = () => {
    if (currentDay < 30) {
      setCurrentDay(currentDay + 1);
    }
  };

  const handleAddQuickExpense = () => {
    addTransaction({
      title: 'Chai & Snacks',
      amount: 40,
      type: 'expense',
      category: 'Food & Dining',
      day: currentDay,
      date: `Day ${currentDay}`,
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* 1. Main Balance Hero Card */}
      <BalanceCard summary={summary} />

      {/* 2. Quick Statistics Grid (4 compact metrics) */}
      <QuickStats
        summary={summary}
        commitments={commitments}
        savingsGoals={savingsGoals}
      />

      {/* 3. Core Visualizations Grid: Trend line chart & Spending donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <MoneyPulseChart summary={summary} transactions={transactions} />
        </div>
        <div className="lg:col-span-5">
          <SpendingBreakdown transactions={transactions} />
        </div>
      </div>

      {/* 4. Financial Health & Next Move Actionable Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthPulseCard summary={summary} />
        <NextMoveCard
          summary={summary}
          commitments={commitments}
          transactions={transactions}
          onOpenFutureCast={() => onNavigateToTab?.('futurecast')}
        />
      </div>

      {/* 5. Simulation Sandbox Controls (Preserved from foundation for live testing) */}
      <Card className="bg-[#151C18] border-[#29352D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F2F5F0]">
              Interactive Simulation Controls
            </h4>
            <p className="text-[11px] text-[#6F7C72]">
              Advance the 30-day timeline or log quick test spends to verify live reactivity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleNextDay}
            disabled={currentDay >= 30}
          >
            <Calendar className="w-3.5 h-3.5" />
            Advance to Day {Math.min(30, currentDay + 1)}
          </Button>

          <Button size="sm" variant="accent" onClick={handleAddQuickExpense}>
            <PlusCircle className="w-3.5 h-3.5" />
            Add ₹40 Chai Spend
          </Button>
        </div>
      </Card>
    </div>
  );
};
