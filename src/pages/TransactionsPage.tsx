import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Edit2,
  Wallet,
  Receipt,
  X,
  Calendar,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatINR, TOTAL_BUDGET_DAYS } from '../utils/financial';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Transaction, TransactionType, ExpenseCategory } from '../types';

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

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    currentDay,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary,
  } = useFinanceStore();

  const summary = getSummary();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Food & Dining');
  const [formDay, setFormDay] = useState(currentDay);
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingTx(null);
    setFormTitle('');
    setFormAmount('');
    setFormType('expense');
    setFormCategory('Food & Dining');
    setFormDay(currentDay);
    setFormNote('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormTitle(tx.title);
    setFormAmount(tx.amount.toString());
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormDay(tx.day);
    setFormNote(tx.note || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(formAmount);
    if (!formTitle.trim()) {
      setFormError('Please enter a description or merchant name.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (formDay < 1 || formDay > TOTAL_BUDGET_DAYS) {
      setFormError(`Day must be between Day 1 and Day ${TOTAL_BUDGET_DAYS}.`);
      return;
    }

    if (editingTx) {
      const success = updateTransaction(editingTx.id, {
        title: formTitle.trim(),
        amount: parsedAmount,
        type: formType,
        category: formCategory,
        day: formDay,
        date: `Day ${formDay}`,
        note: formNote.trim() || undefined,
      });
      if (success) {
        setIsModalOpen(false);
      } else {
        setFormError('Failed to update transaction. Check inputs.');
      }
    } else {
      const success = addTransaction({
        title: formTitle.trim(),
        amount: parsedAmount,
        type: formType,
        category: formCategory,
        day: formDay,
        date: `Day ${formDay}`,
        note: formNote.trim() || undefined,
        createdAt: Date.now(),
      });
      if (success) {
        setIsModalOpen(false);
      } else {
        setFormError('Failed to save transaction. Check inputs.');
      }
    }
  };

  // Filtered and Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesCategory =
          categoryFilter === 'all' || tx.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.day - a.day || (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === 'oldest') return a.day - b.day || (a.createdAt || 0) - (b.createdAt || 0);
        if (sortBy === 'amount-high') return b.amount - a.amount;
        if (sortBy === 'amount-low') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || typeFilter !== 'all' || categoryFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F5F0]">
            Transactions & Spending
          </h2>
          <p className="text-xs md:text-sm text-[#A0ADA3] mt-0.5">
            Track every rupee coming in and going out across your 30-day budget cycle.
          </p>
        </div>
        <Button variant="accent" onClick={openAddModal}>
          <PlusCircle className="w-4 h-4" />
          Add Transaction
        </Button>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Total Recorded Spend
            </span>
            <div className="text-2xl font-bold text-[#F08080] mt-1">
              -{formatINR(summary.totalExpenses)}
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              {transactions.filter((t) => t.type === 'expense').length} expense transactions
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#331818] border border-[#4D2424] flex items-center justify-center text-[#F08080]">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Total Additional Income
            </span>
            <div className="text-2xl font-bold text-[#8FE388] mt-1">
              +{formatINR(summary.totalIncome)}
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              {transactions.filter((t) => t.type === 'income').length} income records
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#132A1C] border border-[#29352D] flex items-center justify-center text-[#8FE388]">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Current Ledger Cash
            </span>
            <div className="text-2xl font-bold text-[#C8F169] mt-1">
              {formatINR(summary.currentBalance)}
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              Starting: {formatINR(summary.startingBudget)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
            <Wallet className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. Search & Filters Bar */}
      <Card className="p-4 bg-[#151C18] border-[#29352D] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7C72]" />
            <input
              type="text"
              placeholder="Search by description or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] placeholder-[#6F7C72] focus:outline-none focus:border-[#C8F169]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7C72] hover:text-[#F2F5F0]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#1B241E] border border-[#29352D] rounded-xl self-start md:self-auto">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  typeFilter === t
                    ? 'bg-[#123D2D] text-[#C8F169] border border-[#C8F169]/30 shadow-xs'
                    : 'text-[#A0ADA3] hover:text-[#F2F5F0]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
            >
              <option value="newest">Day (Newest)</option>
              <option value="oldest">Day (Oldest)</option>
              <option value="amount-high">Amount (High to Low)</option>
              <option value="amount-low">Amount (Low to High)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#29352D] text-xs">
            <span className="text-[#A0ADA3]">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <button
              onClick={clearFilters}
              className="text-[#C8F169] hover:underline font-medium text-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset filters
            </button>
          </div>
        )}
      </Card>

      {/* 4. Transactions List / Ledger Table */}
      <Card className="bg-[#151C18] border-[#29352D] p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-[#6F7C72] space-y-2">
            <Receipt className="w-10 h-10 mx-auto opacity-40 mb-2" />
            <h4 className="text-sm font-semibold text-[#F2F5F0]">
              No transactions match your criteria
            </h4>
            <p className="text-xs max-w-sm mx-auto text-[#A0ADA3]">
              {hasActiveFilters
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'No transactions recorded yet in this cycle. Log your first spend or gig earning!'}
            </p>
            {hasActiveFilters ? (
              <Button size="sm" variant="secondary" onClick={clearFilters} className="mt-2">
                Clear Filters
              </Button>
            ) : (
              <Button size="sm" variant="accent" onClick={openAddModal} className="mt-2">
                <PlusCircle className="w-3.5 h-3.5" />
                Add First Transaction
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#29352D] bg-[#1B241E]/60 text-[#A0ADA3]">
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Timeline</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#29352D]/60 text-[#F2F5F0]">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#1B241E]/40 transition-colors group"
                    >
                      {/* Description & Note */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-sm text-[#F2F5F0]">
                          {tx.title}
                        </div>
                        {tx.note && (
                          <div className="text-[11px] text-[#6F7C72] truncate max-w-xs">
                            {tx.note}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <Badge variant="neutral">{tx.category}</Badge>
                      </td>

                      {/* Timeline Day */}
                      <td className="py-3.5 px-4 text-[#A0ADA3]">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1B241E] border border-[#29352D]">
                          <Calendar className="w-3 h-3 text-[#6F7C72]" />
                          <span>Day {tx.day}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`text-sm font-bold ${
                            isIncome ? 'text-[#8FE388]' : 'text-[#F2F5F0]'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 rounded-lg text-[#6F7C72] hover:text-[#C8F169] hover:bg-[#1B241E] transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTxId(tx.id)}
                            className="p-1.5 rounded-lg text-[#6F7C72] hover:text-[#F08080] hover:bg-[#381B1B]/40 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Add / Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? 'Edit Transaction' : 'Record New Transaction'}
        subtitle={
          editingTx
            ? 'Update the recorded details for this transaction.'
            : 'Log an expense or extra income to keep your ledger accurate.'
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#331818] border border-[#4D2424] text-xs text-[#F08080]">
              {formError}
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-[#A0ADA3] mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#1B241E] border border-[#29352D] rounded-xl">
              <button
                type="button"
                onClick={() => setFormType('expense')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  formType === 'expense'
                    ? 'bg-[#331818] text-[#F08080] border border-[#4D2424]'
                    : 'text-[#A0ADA3] hover:text-[#F2F5F0]'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Expense Spend
              </button>
              <button
                type="button"
                onClick={() => setFormType('income')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  formType === 'income'
                    ? 'bg-[#132A1C] text-[#8FE388] border border-[#29352D]'
                    : 'text-[#A0ADA3] hover:text-[#F2F5F0]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Income Earning
              </button>
            </div>
          </div>

          {/* Description / Merchant */}
          <div>
            <label className="block text-xs font-medium text-[#A0ADA3] mb-1">
              Description or Merchant *
            </label>
            <input
              type="text"
              placeholder="e.g. Metro Card, Grocery Store, Freelance Gig"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] placeholder-[#6F7C72] focus:outline-none focus:border-[#C8F169]/50"
              required
            />
          </div>

          {/* Amount & Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A0ADA3] mb-1">
                Amount (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A0ADA3]">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] placeholder-[#6F7C72] focus:outline-none focus:border-[#C8F169]/50 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A0ADA3] mb-1">
                Simulation Day (1–30) *
              </label>
              <input
                type="number"
                min="1"
                max={TOTAL_BUDGET_DAYS}
                value={formDay}
                onChange={(e) => setFormDay(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-[#A0ADA3] mb-1">
              Category
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-medium text-[#A0ADA3] mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shared split with roommate"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] placeholder-[#6F7C72] focus:outline-none focus:border-[#C8F169]/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29352D]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm">
              {editingTx ? 'Save Changes' : 'Confirm Transaction'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Delete Confirmation Dialog */}
      <Modal
        isOpen={deletingTxId !== null}
        onClose={() => setDeletingTxId(null)}
        title="Delete Transaction"
        subtitle="Are you sure you want to delete this transaction from the ledger?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#A0ADA3] leading-relaxed">
            This will permanently remove this record. All balances, category breakdowns, and dashboard charts will update immediately.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29352D]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingTxId(null)}
            >
              Keep Transaction
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (deletingTxId) {
                  deleteTransaction(deletingTxId);
                  setDeletingTxId(null);
                }
              }}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
