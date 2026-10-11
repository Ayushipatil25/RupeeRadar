import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '../common/Card';
import { FinancialSummary, Transaction } from '../../types';
import { formatINR, calculateTrendHistoryAndProjection } from '../../utils/financial';
import { Activity } from 'lucide-react';

interface TooltipPayload {
  value: number;
  payload: {
    label: string;
    actual: number | null;
    projected: number | null;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-[#1B241E] border border-[#29352D] p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-[#F2F5F0]">{dataPoint.label}</p>
        {dataPoint.actual !== null && (
          <div className="flex items-center gap-2 text-[#C8F169]">
            <span className="w-2 h-2 rounded-full bg-[#C8F169]" />
            <span>Actual: {formatINR(dataPoint.actual)}</span>
          </div>
        )}
        {dataPoint.projected !== null && dataPoint.actual === null && (
          <div className="flex items-center gap-2 text-[#A0ADA3]">
            <span className="w-2 h-2 rounded-full bg-[#A0ADA3]" />
            <span>Forecast: {formatINR(dataPoint.projected)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};


interface MoneyPulseChartProps {
  summary: FinancialSummary;
  transactions: Transaction[];
}

export const MoneyPulseChart: React.FC<MoneyPulseChartProps> = ({
  summary,
  transactions,
}) => {
  const { currentDay } = summary;
  const chartData = calculateTrendHistoryAndProjection(summary, transactions);

  return (
    <Card className="bg-[#151C18] border-[#29352D] p-5 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F2F5F0]">
              Money Pulse — 30-Day Balance Trajectory
            </h3>
            <p className="text-[11px] text-[#6F7C72]">
              Actual ledger balance up to Day {currentDay} with projected month-end runway
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#C8F169] rounded-full" />
            <span className="text-[#A0ADA3] text-[11px]">Actual Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#A0ADA3]" />
            <span className="text-[#6F7C72] text-[11px]">Forecast Runway</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div
        className="w-full h-64"
        role="img"
        aria-label={`30-day balance trajectory chart. Current balance on Day ${currentDay}: ${formatINR(summary.currentBalance)}. Projected month-end: ${formatINR(summary.projectedMonthEnd)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#29352D"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="#6F7C72"
              tick={{ fontSize: 10, fill: '#6F7C72' }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              stroke="#6F7C72"
              tick={{ fontSize: 10, fill: '#6F7C72' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Actual balance line up to currentDay */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#C8F169"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#C8F169' }}
              activeDot={{ r: 5, fill: '#C8F169', stroke: '#0B0F0E', strokeWidth: 2 }}
              isAnimationActive={false}
            />

            {/* Projected balance line */}
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#A0ADA3"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
