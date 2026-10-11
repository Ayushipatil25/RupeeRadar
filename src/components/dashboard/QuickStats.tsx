import React from 'react';
import { TrendingUp, Receipt, CalendarCheck2, PiggyBank } from 'lucide-react';
import { Card } from '../common/Card';
import { FinancialSummary, Commitment, SavingsGoal } from '../../types';
import { formatINR } from '../../utils/financial';

interface QuickStatsProps {
  summary: FinancialSummary;
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  summary,
  commitments,
  savingsGoals,
}) => {
  const unpaidBills = commitments.filter((c) => !c.isPaid);
  const totalSavingsTarget = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const savingsPercent =
    totalSavingsTarget > 0
      ? Math.min(100, Math.round((summary.savedAmount / totalSavingsTarget) * 100))
      : 0;

  const stats = [
    {
      label: 'Daily Safe Allowance',
      value: `${formatINR(summary.dailyAllowance)}`,
      subtext: `${summary.daysRemaining} days remaining in cycle`,
      icon: TrendingUp,
      accentColor: 'text-[#C8F169]',
      iconBg: 'bg-[#123D2D]',
    },
    {
      label: 'Total Cycle Spend',
      value: formatINR(summary.totalExpenses),
      subtext: `${((summary.totalExpenses / summary.startingBudget) * 100).toFixed(1)}% of ₹10,000 budget`,
      icon: Receipt,
      accentColor: 'text-[#F2F5F0]',
      iconBg: 'bg-[#1B241E]',
    },
    {
      label: 'Upcoming Unpaid Bills',
      value: formatINR(summary.committedBills),
      subtext: `${unpaidBills.length} unpaid bill${unpaidBills.length === 1 ? '' : 's'} scheduled`,
      icon: CalendarCheck2,
      accentColor: summary.committedBills > 0 ? 'text-[#F2C66D]' : 'text-[#8FE388]',
      iconBg: 'bg-[#1B241E]',
    },
    {
      label: 'Savings Cushion',
      value: formatINR(summary.savedAmount),
      subtext: `${savingsPercent}% of ${formatINR(totalSavingsTarget)} target`,
      icon: PiggyBank,
      accentColor: 'text-[#8FE388]',
      iconBg: 'bg-[#123D2D]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            className="bg-[#151C18] border-[#29352D] p-4 flex flex-col justify-between hover:border-[#3B4B40] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A0ADA3] tracking-wide">
                {stat.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${stat.iconBg} border border-[#29352D] flex items-center justify-center text-[#C8F169] shrink-0`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className={`text-xl font-bold tracking-tight ${stat.accentColor}`}>
                {stat.value}
              </div>
              <p className="text-[11px] text-[#6F7C72] mt-0.5 truncate">
                {stat.subtext}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
