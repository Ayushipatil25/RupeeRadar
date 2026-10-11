import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FinancialSummary } from '../../types';
import { formatINR } from '../../utils/financial';
import { ShieldCheck, Flame, PiggyBank, CalendarCheck } from 'lucide-react';

interface HealthPulseCardProps {
  summary: FinancialSummary;
}

export const HealthPulseCard: React.FC<HealthPulseCardProps> = ({ summary }) => {
  const { healthScore, riskLevel, dailyAllowance, committedBills, savedAmount } = summary;

  // Gauge colors and label
  let scoreColor = '#8FE388';
  let interpretation = 'Strong Stability';
  let badgeVariant: 'positive' | 'warning' | 'negative' = 'positive';

  if (healthScore < 50 || riskLevel === 'high') {
    scoreColor = '#F08080';
    interpretation = 'High Burn Risk';
    badgeVariant = 'negative';
  } else if (healthScore < 70 || riskLevel === 'moderate') {
    scoreColor = '#F2C66D';
    interpretation = 'Moderate Runway';
    badgeVariant = 'warning';
  }

  // Circular gauge math (radius = 40)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <Card className="bg-[#151C18] border-[#29352D] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F2F5F0]">Financial Health Pulse</h3>
            <p className="text-[11px] text-[#6F7C72]">Algorithm stability index</p>
          </div>
        </div>
        <Badge variant={badgeVariant}>{riskLevel.toUpperCase()} RISK</Badge>
      </div>

      {/* Center Gauge and Score */}
      <div className="flex items-center gap-5 my-2">
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-24 h-24 -rotate-90">
            {/* Background track */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#1B241E"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress arc */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={scoreColor}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-[#F2F5F0] leading-none">
              {healthScore}
            </span>
            <span className="text-[9px] text-[#6F7C72] mt-0.5">/ 100</span>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-[#F2F5F0]">{interpretation}</div>
          <p className="text-xs text-[#A0ADA3] mt-1 leading-relaxed">
            {riskLevel === 'low'
              ? 'Budget pace is well within safe thresholds for the 30-day cycle.'
              : riskLevel === 'moderate'
              ? 'Safe allowance is tightening. Moderate discretionary spends.'
              : 'Available balance is depleted or approaching critical limit.'}
          </p>
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#29352D] text-[11px]">
        <div className="p-2 rounded-lg bg-[#1B241E] border border-[#29352D]/60 flex items-center gap-1.5 truncate">
          <Flame className="w-3.5 h-3.5 text-[#C8F169] shrink-0" />
          <div className="truncate">
            <span className="text-[#6F7C72] block text-[9px] uppercase">Daily Cap</span>
            <span className="font-semibold text-[#F2F5F0]">{formatINR(dailyAllowance)}</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-[#1B241E] border border-[#29352D]/60 flex items-center gap-1.5 truncate">
          <CalendarCheck className="w-3.5 h-3.5 text-[#F2C66D] shrink-0" />
          <div className="truncate">
            <span className="text-[#6F7C72] block text-[9px] uppercase">Committed</span>
            <span className="font-semibold text-[#F2F5F0]">{formatINR(committedBills)}</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-[#1B241E] border border-[#29352D]/60 flex items-center gap-1.5 truncate">
          <PiggyBank className="w-3.5 h-3.5 text-[#8FE388] shrink-0" />
          <div className="truncate">
            <span className="text-[#6F7C72] block text-[9px] uppercase">Locked</span>
            <span className="font-semibold text-[#F2F5F0]">{formatINR(savedAmount)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
