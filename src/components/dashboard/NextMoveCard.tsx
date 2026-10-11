import React from 'react';
import { Card } from '../common/Card';
import { Sparkles, ArrowRight, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FinancialSummary, Commitment, Transaction } from '../../types';
import { formatINR } from '../../utils/financial';

interface NextMoveCardProps {
  summary: FinancialSummary;
  commitments: Commitment[];
  transactions: Transaction[];
  onOpenFutureCast?: () => void;
}

export const NextMoveCard: React.FC<NextMoveCardProps> = ({
  summary,
  commitments,
  transactions,
  onOpenFutureCast,
}) => {
  const { availableBalance, dailyAllowance, daysRemaining, committedBills, projectedMonthEnd } = summary;
  const unpaidBills = commitments.filter((c) => !c.isPaid);

  // Determine the highest expense category
  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const catSums = expenseTxs.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const topCategoryEntry = Object.entries(catSums).sort((a, b) => b[1] - a[1])[0];

  // Rule-based decision recommendation
  let recommendation = {
    title: 'Runway is Healthy',
    badge: 'Safe Pacing',
    badgeVariant: 'bg-[#123D2D] text-[#8FE388] border-[#29352D]',
    icon: CheckCircle2,
    iconColor: 'text-[#8FE388]',
    description: `You have ${formatINR(availableBalance)} available. Keeping daily spend at or below ${formatINR(dailyAllowance)} guarantees a surplus of ${formatINR(projectedMonthEnd)} by Day 30.`,
    actionText: 'Simulate next purchase in FutureCast',
  };

  if (availableBalance < committedBills && committedBills > 0) {
    recommendation = {
      title: 'Protect Upcoming Bills First',
      badge: 'Action Required',
      badgeVariant: 'bg-[#331818] text-[#F08080] border-[#4D2424]',
      icon: AlertTriangle,
      iconColor: 'text-[#F08080]',
      description: `You have ${formatINR(committedBills)} in unpaid commitments (${unpaidBills.map((b) => b.title).join(', ')}) due soon. Pause non-essential spending.`,
      actionText: 'Review Bills & Subscriptions',
    };
  } else if (dailyAllowance < 150) {
    recommendation = {
      title: 'Tight Daily Allowance',
      badge: 'Caution',
      badgeVariant: 'bg-[#2D2412] text-[#F2C66D] border-[#44381C]',
      icon: AlertTriangle,
      iconColor: 'text-[#F2C66D]',
      description: `Your daily safe allowance is down to ${formatINR(dailyAllowance)} for the remaining ${daysRemaining} days. Avoid dining out and discretionary shopping.`,
      actionText: 'Simulate spending cuts in FutureCast',
    };
  } else if (topCategoryEntry && topCategoryEntry[1] > summary.startingBudget * 0.25) {
    recommendation = {
      title: `High Burn in ${topCategoryEntry[0]}`,
      badge: 'Category Alert',
      badgeVariant: 'bg-[#2D2412] text-[#F2C66D] border-[#44381C]',
      icon: ShieldCheck,
      iconColor: 'text-[#F2C66D]',
      description: `${topCategoryEntry[0]} accounts for ${formatINR(topCategoryEntry[1])} (${Math.round((topCategoryEntry[1] / summary.startingBudget) * 100)}% of initial budget). Cap this category for the next week.`,
      actionText: 'Simulate category limit in FutureCast',
    };
  }

  const Icon = recommendation.icon;

  return (
    <Card className="bg-[#151C18] border-[#29352D] p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F2F5F0]">Your Next Move</h3>
              <p className="text-[11px] text-[#6F7C72]">Rule-based budget guidance</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${recommendation.badgeVariant}`}
          >
            {recommendation.badge}
          </span>
        </div>

        {/* Suggestion content */}
        <div className="p-3.5 rounded-xl bg-[#1B241E] border border-[#29352D] my-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 shrink-0 ${recommendation.iconColor}`} />
            <span className="text-xs font-bold text-[#F2F5F0]">
              {recommendation.title}
            </span>
          </div>
          <p className="text-xs text-[#A0ADA3] leading-relaxed">
            {recommendation.description}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        <button
          onClick={onOpenFutureCast}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#123D2D] border border-[#29352D] text-xs font-semibold text-[#C8F169] hover:bg-[#1B523D] transition-colors"
        >
          <span>{recommendation.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
