import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../common/Card';
import { Transaction } from '../../types';
import { formatINR, calculateCategoryBreakdown } from '../../utils/financial';
import { PieChart as PieIcon, AlertCircle } from 'lucide-react';

interface SpendingBreakdownProps {
  transactions: Transaction[];
}

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({ transactions }) => {
  const chartData = calculateCategoryBreakdown(transactions);
  const totalExpense = chartData.reduce((sum, item) => sum + item.amount, 0);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#1B241E] border border-[#29352D] p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-[#F2F5F0]">{item.name}</p>
          <p className="text-[#C8F169] font-medium">{formatINR(item.amount)}</p>
          <p className="text-[#A0ADA3] text-[10px]">
            {item.percentage.toFixed(1)}% of total spends
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#151C18] border-[#29352D] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
          <PieIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#F2F5F0]">Spending Breakdown</h3>
          <p className="text-[11px] text-[#6F7C72]">
            Category distribution across all cycle transactions
          </p>
        </div>
      </div>

      {totalExpense === 0 || chartData.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-[#6F7C72]">
          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-medium text-[#A0ADA3]">No expenses recorded yet</p>
          <p className="text-[11px]">Expenses will populate this breakdown chart.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Donut Chart with Center Label */}
          <div className="relative w-full h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="amount"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#151C18"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-[#6F7C72] uppercase tracking-wider font-semibold">
                Total
              </span>
              <span className="text-sm font-bold text-[#F2F5F0]">
                {formatINR(totalExpense)}
              </span>
            </div>
          </div>

          {/* Category Legend list */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {chartData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#1B241E]/50 border border-[#29352D]/50"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#F2F5F0] truncate font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#A0ADA3] text-[11px]">
                    {item.percentage.toFixed(0)}%
                  </span>
                  <span className="font-semibold text-[#F2F5F0]">
                    {formatINR(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
