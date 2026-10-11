import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Activity,
  Check,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  formatINR,
  simulatePurchaseImpact,
} from '../utils/financial';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ExpenseCategory } from '../types';

const CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Education',
  'Other',
];

const QUICK_SCENARIOS = [
  { label: '₹100 Coffee / Snack', amount: 100 },
  { label: '₹500 Weekend Dinner', amount: 500 },
  { label: '₹1,000 Party / Outing', amount: 1000 },
  { label: '₹2,000 New Gadget / Shoes', amount: 2000 },
];

interface ChartTooltipPayload {
  value?: number;
  payload?: {
    day: string;
    baseline: number;
    simulated: number;
  };
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
  showSimulated?: boolean;
}

const CustomChartTooltip: React.FC<CustomChartTooltipProps> = ({
  active,
  payload,
  label,
  showSimulated,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1B241E] border border-[#29352D] p-3 rounded-xl shadow-xl text-xs space-y-1.5">
        <p className="font-semibold text-[#F2F5F0]">{label}</p>
        <div className="flex items-center justify-between gap-4 text-[#C8F169]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C8F169]" />
            Baseline Runway:
          </span>
          <span className="font-bold">{formatINR(payload[0]?.value ?? 0)}</span>
        </div>
        {showSimulated && payload[1] && (
          <div className="flex items-center justify-between gap-4 text-[#F2C66D]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F2C66D]" />
              Simulated Runway:
            </span>
            <span className="font-bold">{formatINR(payload[1]?.value ?? 0)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface FutureCastPageProps {
  onNavigateToTab?: (tab: string) => void;
}

export const FutureCastPage: React.FC<FutureCastPageProps> = ({ onNavigateToTab }) => {
  const {
    currentDay,
    transactions,
    commitments,
    savingsGoals,
    addTransaction,
    getSummary,
  } = useFinanceStore();

  const currentSummary = getSummary();

  // Simulated purchase input state (purely in-memory, zero store mutation)
  const [purchaseTitle, setPurchaseTitle] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState<ExpenseCategory>('Shopping');
  const [purchaseNote, setPurchaseNote] = useState('');

  // Confirmation feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTxTitle, setConfirmedTxTitle] = useState<string | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

  const parsedAmount = parseFloat(purchaseAmount);
  const validAmount = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;

  // Run pure deterministic simulation
  const simulation = useMemo(() => {
    return simulatePurchaseImpact({
      purchase: {
        title: purchaseTitle.trim() || 'Hypothetical Purchase',
        amount: validAmount,
        category: purchaseCategory,
        day: currentDay,
      },
      currentSummary,
      transactions,
      commitments,
      savingsGoals,
    });
  }, [
    purchaseTitle,
    validAmount,
    purchaseCategory,
    currentDay,
    currentSummary,
    transactions,
    commitments,
    savingsGoals,
  ]);

  const handleQuickScenario = (amount: number) => {
    setConfirmationError(null);
    setConfirmedTxTitle(null);
    setPurchaseAmount(amount.toString());
    if (!purchaseTitle.trim()) {
      setPurchaseTitle(
        amount === 100
          ? 'Chai & Snacks'
          : amount === 500
          ? 'Weekend Dinner'
          : amount === 1000
          ? 'Party Outing'
          : 'Shopping Splurge'
      );
    }
  };

  const handleResetPreview = () => {
    setPurchaseTitle('');
    setPurchaseAmount('');
    setPurchaseCategory('Shopping');
    setPurchaseNote('');
    setConfirmationError(null);
    setConfirmedTxTitle(null);
  };

  const handleConfirmPurchase = () => {
    if (isSubmitting) return;
    setConfirmationError(null);

    // 1. Validate inputs
    if (!purchaseTitle.trim()) {
      setConfirmationError('Please provide a name or description for the purchase.');
      return;
    }
    if (validAmount <= 0) {
      setConfirmationError('Please enter an amount greater than ₹0.');
      return;
    }

    // 2. Stale preview check against the latest live store state
    const latestSummary = getSummary();
    if (validAmount > latestSummary.availableBalance) {
      setConfirmationError(
        `Affordability check failed: this purchase (${formatINR(
          validAmount
        )}) exceeds your current safe balance of ${formatINR(
          latestSummary.availableBalance
        )}.`
      );
      return;
    }

    // 3. Atomically record transaction exactly once
    setIsSubmitting(true);
    const success = addTransaction({
      title: purchaseTitle.trim(),
      amount: validAmount,
      type: 'expense',
      category: purchaseCategory,
      day: currentDay,
      date: `Day ${currentDay}`,
      note: purchaseNote.trim() || undefined,
      createdAt: Date.now(),
    });

    if (success) {
      setConfirmedTxTitle(purchaseTitle.trim());
      handleResetPreview();
    } else {
      setConfirmationError('Transaction could not be recorded. Check inputs.');
    }
    setIsSubmitting(false);
  };



  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151C18] border border-[#29352D] rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123D2D] border border-[#29352D] text-[#C8F169] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            FutureCast Decision Simulator
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F5F0]">
            See how today's choices affect your financial future.
          </h2>
          <p className="text-xs md:text-sm text-[#A0ADA3]">
            Simulate hypothetical purchases without touching your real balance. Projections are deterministic estimates based on your ₹10k budget and Day {currentDay} burn rate.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Badge variant="accent" className="text-xs px-3 py-1.5">
            Cycle Day {currentDay} of 30
          </Badge>
        </div>
      </div>

      {/* Confirmed Purchase Success Banner */}
      {confirmedTxTitle && (
        <div className="p-4 rounded-2xl bg-[#132A1C] border border-[#29352D] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#8FE388]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-[#F2F5F0]">
                Purchase Recorded Successfully!
              </p>
              <p className="text-[#A0ADA3]">
                "{confirmedTxTitle}" has been committed to your active ledger and dashboard balances.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab?.('transactions')}
              className="px-3 py-1.5 rounded-lg bg-[#1B241E] border border-[#29352D] text-[#C8F169] font-semibold hover:bg-[#222E26] transition-colors"
            >
              View in Ledger
            </button>
            <button
              onClick={() => setConfirmedTxTitle(null)}
              aria-label="Dismiss confirmation message"
              className="p-1.5 text-[#A0ADA3] hover:text-[#F2F5F0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Simulation Grid: Form + Affordability Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Purchase Input Form & Quick Scenarios */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-[#151C18] border-[#29352D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#29352D] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F2F5F0]">
                  What are you planning to buy?
                </h3>
                <p className="text-[11px] text-[#6F7C72]">
                  Live preview updates instantly without modifying your ledger
                </p>
              </div>

              {(purchaseAmount || purchaseTitle) && (
                <button
                  type="button"
                  onClick={handleResetPreview}
                  className="flex items-center gap-1 text-xs text-[#A0ADA3] hover:text-[#F08080] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Discard Preview
                </button>
              )}
            </div>

            {/* Error Message */}
            {confirmationError && (
              <div className="p-3 rounded-xl bg-[#331818] border border-[#4D2424] text-xs text-[#F08080] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{confirmationError}</span>
              </div>
            )}

            {/* Quick Purchase Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-[#A0ADA3] uppercase tracking-wider block mb-2">
                Quick Test Scenarios
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUICK_SCENARIOS.map((scen) => (
                  <button
                    key={scen.amount}
                    type="button"
                    onClick={() => handleQuickScenario(scen.amount)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      validAmount === scen.amount
                        ? 'bg-[#123D2D] border-[#C8F169]/40 text-[#C8F169] shadow-xs'
                        : 'bg-[#1B241E] border-[#29352D] text-[#A0ADA3] hover:text-[#F2F5F0] hover:border-[#3B4B40]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#F2F5F0]">
                      {formatINR(scen.amount)}
                    </span>
                    <span className="text-[10px] text-[#6F7C72] block truncate">
                      {scen.label.split(' ')[1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="fc-title" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                  Purchase Name / Item *
                </label>
                <input
                  id="fc-title"
                  type="text"
                  maxLength={80}
                  placeholder="e.g. New Noise Cancelling Headphones, Team Dinner"
                  value={purchaseTitle}
                  onChange={(e) => {
                    setPurchaseTitle(e.target.value);
                    setConfirmationError(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] placeholder-[#6F7C72] focus:outline-none focus:border-[#C8F169]/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fc-amount" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                    Amount (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A0ADA3]">
                      ₹
                    </span>
                    <input
                      id="fc-amount"
                      type="number"
                      min="1"
                      step="any"
                      placeholder="0"
                      value={purchaseAmount}
                      onChange={(e) => {
                        setPurchaseAmount(e.target.value);
                        setConfirmationError(null);
                      }}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fc-category" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                    Category
                  </label>
                  <select
                    id="fc-category"
                    value={purchaseCategory}
                    onChange={(e) =>
                      setPurchaseCategory(e.target.value as ExpenseCategory)
                    }
                    className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="fc-note" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                  Optional Note
                </label>
                <input
                  id="fc-note"
                  type="text"
                  maxLength={200}
                  placeholder="e.g. 50% discount during flash sale"
                  value={purchaseNote}
                  onChange={(e) => setPurchaseNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] placeholder-[#6F7C72] focus:outline-none focus:border-[#C8F169]/50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#29352D] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#6F7C72]">
                {validAmount > 0
                  ? `Simulating impact of ${formatINR(validAmount)} on Day ${currentDay}`
                  : 'Enter an amount to simulate'}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetPreview}
                  disabled={!purchaseAmount && !purchaseTitle}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant={simulation.isAffordable ? 'accent' : 'danger'}
                  size="sm"
                  onClick={handleConfirmPurchase}
                  disabled={
                    validAmount <= 0 ||
                    !purchaseTitle.trim() ||
                    !simulation.isAffordable ||
                    isSubmitting
                  }
                >
                  <Check className="w-4 h-4" />
                  {simulation.isAffordable
                    ? 'Confirm & Record Purchase'
                    : 'Cannot Confirm (Over Budget)'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Risk & Affordability Assessment ("Can you afford it?") */}
        <div className="lg:col-span-5">
          <Card className="bg-[#151C18] border-[#29352D] p-5 h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#29352D] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F2F5F0]">
                      Can you afford it?
                    </h3>
                    <p className="text-[11px] text-[#6F7C72]">
                      Deterministic risk evaluation
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    simulation.affordabilityStatus === 'Comfortable'
                      ? 'positive'
                      : simulation.affordabilityStatus === 'Caution'
                      ? 'warning'
                      : 'negative'
                  }
                >
                  {simulation.affordabilityStatus.toUpperCase()}
                </Badge>
              </div>

              {/* Assessment Explanation Card */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  simulation.affordabilityStatus === 'Comfortable'
                    ? 'bg-[#132A1C]/60 border-[#29352D]'
                    : simulation.affordabilityStatus === 'Caution'
                    ? 'bg-[#2D2412]/60 border-[#44381C]'
                    : 'bg-[#331818]/70 border-[#4D2424]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {simulation.affordabilityStatus === 'Comfortable' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#8FE388]" />
                  ) : (
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        simulation.affordabilityStatus === 'Caution'
                          ? 'text-[#F2C66D]'
                          : 'text-[#F08080]'
                      }`}
                    />
                  )}
                  <span className="text-xs font-bold text-[#F2F5F0]">
                    {simulation.affordabilityStatus === 'Comfortable'
                      ? 'Safe to Proceed'
                      : simulation.affordabilityStatus === 'Caution'
                      ? 'Caution Advised'
                      : 'High Financial Strain'}
                  </span>
                </div>
                <p className="text-xs text-[#A0ADA3] leading-relaxed">
                  {simulation.explanation}
                </p>
              </div>
            </div>

            {/* Quick Metrics at a Glance */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#29352D] text-xs">
              <div className="p-2.5 rounded-xl bg-[#1B241E] border border-[#29352D]/80">
                <span className="text-[10px] text-[#6F7C72] uppercase block font-semibold">
                  New Safe Daily Allowance
                </span>
                <span className="text-base font-bold text-[#C8F169] mt-0.5 block">
                  {formatINR(simulation.simulatedSummary.dailyAllowance)}
                  <span className="text-[10px] text-[#6F7C72] font-normal"> / day</span>
                </span>
                <span className="text-[10px] text-[#F08080]">
                  {simulation.diff.dailyAllowanceDiff !== 0 && (
                    <span>
                      {simulation.diff.dailyAllowanceDiff < 0 ? '-' : '+'}
                      {formatINR(Math.abs(simulation.diff.dailyAllowanceDiff))}/day drop
                    </span>
                  )}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1B241E] border border-[#29352D]/80">
                <span className="text-[10px] text-[#6F7C72] uppercase block font-semibold">
                  Day 30 Projected Balance
                </span>
                <span
                  className={`text-base font-bold mt-0.5 block ${
                    simulation.simulatedSummary.projectedMonthEnd >= 0
                      ? 'text-[#8FE388]'
                      : 'text-[#F08080]'
                  }`}
                >
                  {formatINR(simulation.simulatedSummary.projectedMonthEnd)}
                </span>
                <span className="text-[10px] text-[#6F7C72]">
                  {simulation.simulatedSummary.projectedMonthEnd >= 0
                    ? 'Positive runway'
                    : 'Deficit expected'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Before-and-After Comparison Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F2F5F0]">
            Before-and-After Financial Comparison
          </h3>
          <span className="text-xs text-[#6F7C72]">
            Detailed metrics breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column A: BEFORE Purchase */}
          <Card className="bg-[#151C18] border-[#29352D] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#29352D] pb-2.5">
              <span className="text-xs font-bold text-[#A0ADA3] uppercase tracking-wider">
                Current Position (Before)
              </span>
              <Badge variant="neutral">Active Ledger</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E]/60 border border-[#29352D]/60">
                <span className="text-[#A0ADA3]">Current Ledger Balance:</span>
                <span className="font-bold text-[#F2F5F0]">
                  {formatINR(simulation.currentSummary.currentBalance)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E]/60 border border-[#29352D]/60">
                <span className="text-[#A0ADA3]">Available Safe Spend:</span>
                <span className="font-bold text-[#C8F169]">
                  {formatINR(simulation.currentSummary.availableBalance)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E]/60 border border-[#29352D]/60">
                <span className="text-[#A0ADA3]">Daily Safe Allowance:</span>
                <span className="font-bold text-[#F2F5F0]">
                  {formatINR(simulation.currentSummary.dailyAllowance)} / day
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E]/60 border border-[#29352D]/60">
                <span className="text-[#A0ADA3]">Projected Day 30 Balance:</span>
                <span
                  className={`font-bold ${
                    simulation.currentSummary.projectedMonthEnd >= 0
                      ? 'text-[#8FE388]'
                      : 'text-[#F08080]'
                  }`}
                >
                  {formatINR(simulation.currentSummary.projectedMonthEnd)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E]/60 border border-[#29352D]/60">
                <span className="text-[#A0ADA3]">Financial Health Index:</span>
                <span className="font-bold text-[#C8F169]">
                  {simulation.currentSummary.healthScore} / 100
                </span>
              </div>
            </div>
          </Card>

          {/* Column B: AFTER Purchase */}
          <Card className="bg-[#151C18] border-[#29352D] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#29352D] pb-2.5">
              <span className="text-xs font-bold text-[#C8F169] uppercase tracking-wider">
                Hypothetical Position (After)
              </span>
              <Badge variant="accent">Simulated Preview</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E] border border-[#29352D]">
                <span className="text-[#A0ADA3]">Simulated Ledger Balance:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#F2F5F0]">
                    {formatINR(simulation.simulatedSummary.currentBalance)}
                  </span>
                  {validAmount > 0 && (
                    <span className="text-[10px] text-[#F08080] font-semibold">
                      (-{formatINR(validAmount)})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E] border border-[#29352D]">
                <span className="text-[#A0ADA3]">Simulated Safe Spend:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      simulation.simulatedSummary.availableBalance >= 0
                        ? 'text-[#C8F169]'
                        : 'text-[#F08080]'
                    }`}
                  >
                    {formatINR(simulation.simulatedSummary.availableBalance)}
                  </span>
                  {validAmount > 0 && (
                    <span className="text-[10px] text-[#F08080] font-semibold">
                      (-{formatINR(validAmount)})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E] border border-[#29352D]">
                <span className="text-[#A0ADA3]">Revised Daily Allowance:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#F2F5F0]">
                    {formatINR(simulation.simulatedSummary.dailyAllowance)} / day
                  </span>
                  {simulation.diff.dailyAllowanceDiff !== 0 && (
                    <span className="text-[10px] text-[#F08080] font-semibold">
                      ({simulation.diff.dailyAllowanceDiff < 0 ? '-' : '+'}
                      {formatINR(Math.abs(simulation.diff.dailyAllowanceDiff))})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E] border border-[#29352D]">
                <span className="text-[#A0ADA3]">Revised Day 30 Projection:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      simulation.simulatedSummary.projectedMonthEnd >= 0
                        ? 'text-[#8FE388]'
                        : 'text-[#F08080]'
                    }`}
                  >
                    {formatINR(simulation.simulatedSummary.projectedMonthEnd)}
                  </span>
                  {simulation.diff.projectedMonthEndDiff !== 0 && (
                    <span
                      className={`text-[10px] font-semibold ${
                        simulation.diff.projectedMonthEndDiff < 0
                          ? 'text-[#F08080]'
                          : 'text-[#8FE388]'
                      }`}
                    >
                      ({simulation.diff.projectedMonthEndDiff < 0 ? '-' : '+'}
                      {formatINR(Math.abs(simulation.diff.projectedMonthEndDiff))})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1B241E] border border-[#29352D]">
                <span className="text-[#A0ADA3]">Simulated Health Index:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#F2F5F0]">
                    {simulation.simulatedSummary.healthScore} / 100
                  </span>
                  {simulation.diff.healthScoreDiff !== 0 && (
                    <span
                      className={`text-[10px] font-semibold ${
                        simulation.diff.healthScoreDiff < 0
                          ? 'text-[#F08080]'
                          : 'text-[#8FE388]'
                      }`}
                    >
                      ({simulation.diff.healthScoreDiff < 0 ? '' : '+'}
                      {simulation.diff.healthScoreDiff} pts)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Financial Impact Visualization Chart */}
      <Card className="bg-[#151C18] border-[#29352D] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F2F5F0]">
                Balance Trajectory Through Day 30
              </h3>
              <p className="text-[11px] text-[#6F7C72]">
                Contrasting current projected runway vs simulated post-purchase trajectory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#C8F169] rounded-full" />
              <span className="text-[#A0ADA3] text-[11px]">Baseline Runway</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#F2C66D]" />
              <span className="text-[#F2C66D] text-[11px]">Simulated Runway</span>
            </div>
          </div>
        </div>

        <div
          className="w-full h-64"
          role="img"
          aria-label={`Trajectory comparison chart: Current projected month-end balance is ${formatINR(simulation.currentSummary.projectedMonthEnd)}, simulated post-purchase balance is ${formatINR(simulation.simulatedSummary.projectedMonthEnd)}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={simulation.simulatedTrendPoints}
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
              <Tooltip content={<CustomChartTooltip showSimulated={validAmount > 0} />} />

              {/* Baseline trend */}
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#C8F169"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              {/* Simulated trend (with purchase) */}
              <Line
                type="monotone"
                dataKey="simulated"
                stroke="#F2C66D"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
