import React from 'react';
import { Wallet, Calendar, ArrowUpRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FinancialSummary } from '../../types';
import { formatINR } from '../../utils/financial';

interface BalanceCardProps {
  summary: FinancialSummary;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ summary }) => {
  const isProjectedPositive = summary.projectedMonthEnd >= 0;

  return (
    <Card className="bg-[#151C18] border-[#29352D] relative overflow-hidden p-6 md:p-7 shadow-sm">
      {/* Background ambient glow */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-[#123D2D]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-10 -bottom-20 w-56 h-56 bg-[#C8F169]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full gap-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#A0ADA3]">
                Available Safe Balance
              </span>
              <p className="text-[11px] text-[#6F7C72]">
                After deducting committed bills & locked savings
              </p>
            </div>
          </div>

          <Badge variant="accent">
            <Calendar className="w-3 h-3 mr-1" />
            Day {summary.currentDay} of 30
          </Badge>
        </div>

        {/* Hero Amount */}
        <div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#C8F169] font-sans">
              {formatINR(summary.availableBalance)}
            </span>
            <span className="text-xs sm:text-sm text-[#A0ADA3]">
              safe to spend freely
            </span>
          </div>
          <p className="text-xs text-[#6F7C72] mt-1">
            Total in account: <strong className="text-[#F2F5F0]">{formatINR(summary.currentBalance)}</strong> · Starting budget: <strong className="text-[#F2F5F0]">{formatINR(summary.startingBudget)}</strong>
          </p>
        </div>

        {/* Sub Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#29352D]">
          <div className="p-3 rounded-xl bg-[#1B241E] border border-[#29352D]/80">
            <span className="text-[11px] text-[#6F7C72] uppercase tracking-wider block font-medium">
              Total Spent
            </span>
            <span className="text-base font-bold text-[#F2F5F0] mt-0.5 block">
              {formatINR(summary.totalExpenses)}
            </span>
            <span className="text-[10px] text-[#A0ADA3]">
              {((summary.totalExpenses / summary.startingBudget) * 100).toFixed(0)}% of ₹10k budget
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1B241E] border border-[#29352D]/80">
            <span className="text-[11px] text-[#6F7C72] uppercase tracking-wider block font-medium">
              Daily Safe Allowance
            </span>
            <span className="text-base font-bold text-[#C8F169] mt-0.5 block">
              {formatINR(summary.dailyAllowance)}
              <span className="text-xs font-normal text-[#A0ADA3]"> / day</span>
            </span>
            <span className="text-[10px] text-[#A0ADA3]">
              For next {summary.daysRemaining} days
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1B241E] border border-[#29352D]/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#6F7C72] uppercase tracking-wider font-medium">
                Forecast Day 30
              </span>
              <ArrowUpRight className="w-3 h-3 text-[#A0ADA3]" />
            </div>
            <span
              className={`text-base font-bold mt-0.5 block ${
                isProjectedPositive ? 'text-[#8FE388]' : 'text-[#F08080]'
              }`}
            >
              {formatINR(summary.projectedMonthEnd)}
            </span>
            <span className="text-[10px] text-[#6F7C72]">
              Estimated month-end runway
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
