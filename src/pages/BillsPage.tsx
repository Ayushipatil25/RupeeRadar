import React, { useState } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  RotateCcw,
  Calendar,
  Receipt,
  Repeat,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatINR, TOTAL_BUDGET_DAYS } from '../utils/financial';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Commitment, ExpenseCategory } from '../types';

export const BillsPage: React.FC = () => {
  const {
    commitments,
    currentDay,
    addCommitment,
    updateCommitment,
    deleteCommitment,
    toggleCommitmentPaid,
    getSummary,
  } = useFinanceStore();

  const summary = getSummary();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Commitment | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'bill' | 'subscription'>('bill');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Bills & Utilities');
  const [formDueDay, setFormDueDay] = useState(15);
  const [formRecurrence, setFormRecurrence] = useState<'monthly' | 'weekly' | 'one-time'>('monthly');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

  // Filter & tab inside bills
  const unpaidBills = commitments.filter((c) => !c.isPaid);
  const paidBills = commitments.filter((c) => c.isPaid);

  const totalUnpaidAmount = unpaidBills.reduce((sum, c) => sum + c.amount, 0);
  const totalPaidAmount = paidBills.reduce((sum, c) => sum + c.amount, 0);

  const openAddModal = () => {
    setEditingBill(null);
    setFormTitle('');
    setFormAmount('');
    setFormType('bill');
    setFormCategory('Bills & Utilities');
    setFormDueDay(Math.min(30, currentDay + 5));
    setFormRecurrence('monthly');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (bill: Commitment) => {
    setEditingBill(bill);
    setFormTitle(bill.title);
    setFormAmount(bill.amount.toString());
    setFormType(bill.type);
    setFormCategory(bill.category || 'Bills & Utilities');
    setFormDueDay(bill.dueDay);
    setFormRecurrence(bill.recurrence || 'monthly');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amount = parseFloat(formAmount);
    if (!formTitle.trim()) {
      setFormError('Please enter a bill or subscription name.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (formDueDay < 1 || formDueDay > TOTAL_BUDGET_DAYS) {
      setFormError(`Due day must be between Day 1 and Day ${TOTAL_BUDGET_DAYS}.`);
      return;
    }

    if (editingBill) {
      const success = updateCommitment(editingBill.id, {
        title: formTitle.trim(),
        amount,
        type: formType,
        category: formCategory,
        dueDay: formDueDay,
        recurrence: formRecurrence,
      });
      if (success) {
        setIsModalOpen(false);
      } else {
        setFormError('Failed to update commitment. Check your inputs.');
      }
    } else {
      const success = addCommitment({
        title: formTitle.trim(),
        amount,
        type: formType,
        category: formCategory,
        dueDay: formDueDay,
        isPaid: false,
        recurrence: formRecurrence,
        createdAt: Date.now(),
      });
      if (success) {
        setIsModalOpen(false);
      } else {
        setFormError('Failed to create commitment. Check your inputs.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2F5F0]">
            Bills & Subscriptions
          </h2>
          <p className="text-xs md:text-sm text-[#A0ADA3] mt-0.5">
            Stay ahead of fixed commitments and reserve funds before making impulse purchases.
          </p>
        </div>
        <Button variant="accent" onClick={openAddModal}>
          <PlusCircle className="w-4 h-4" />
          Add Bill / Subscription
        </Button>
      </div>

      {/* 2. Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Unpaid Commitments
            </span>
            <div className="text-2xl font-bold text-[#F2C66D] mt-1">
              {formatINR(totalUnpaidAmount)}
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              {unpaidBills.length} upcoming payment{unpaidBills.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2D2412] border border-[#44381C] flex items-center justify-center text-[#F2C66D]">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Paid in This Cycle
            </span>
            <div className="text-2xl font-bold text-[#8FE388] mt-1">
              {formatINR(totalPaidAmount)}
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              {paidBills.length} recorded payments
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#132A1C] border border-[#29352D] flex items-center justify-center text-[#8FE388]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#151C18] border-[#29352D] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#A0ADA3] uppercase tracking-wider block">
              Cycle Status
            </span>
            <div className="text-2xl font-bold text-[#C8F169] mt-1">
              Day {currentDay} of 30
            </div>
            <span className="text-[11px] text-[#6F7C72]">
              {summary.daysRemaining} days remaining
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. Unpaid Commitments Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F2F5F0] flex items-center gap-2">
            <span>Upcoming Unpaid Payments</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1B241E] border border-[#29352D] text-[#A0ADA3]">
              {unpaidBills.length}
            </span>
          </h3>
          <span className="text-xs text-[#6F7C72]">
            Reserved from available daily spend
          </span>
        </div>

        {unpaidBills.length === 0 ? (
          <Card className="p-8 text-center bg-[#151C18] border-[#29352D] text-[#6F7C72] space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-[#8FE388] opacity-80" />
            <h4 className="text-sm font-bold text-[#F2F5F0]">
              All bills are paid!
            </h4>
            <p className="text-xs text-[#A0ADA3] max-w-sm mx-auto">
              You have zero unpaid commitments pending for the remainder of this cycle.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {unpaidBills.map((bill) => {
              const isDueSoon = bill.dueDay <= currentDay + 3 && bill.dueDay >= currentDay;
              const isPastDue = bill.dueDay < currentDay;

              return (
                <Card
                  key={bill.id}
                  className="p-4 bg-[#151C18] border-[#29352D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#3B4B40] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                        isPastDue
                          ? 'bg-[#331818] border-[#4D2424] text-[#F08080]'
                          : isDueSoon
                          ? 'bg-[#2D2412] border-[#44381C] text-[#F2C66D]'
                          : 'bg-[#1B241E] border-[#29352D] text-[#A0ADA3]'
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F2F5F0]">
                          {bill.title}
                        </span>
                        <Badge variant="neutral" className="text-[10px]">
                          {bill.type === 'subscription' ? 'Subscription' : 'Bill'}
                        </Badge>
                        {bill.recurrence && (
                          <span className="text-[10px] text-[#6F7C72] flex items-center gap-1">
                            <Repeat className="w-2.5 h-2.5" />
                            {bill.recurrence}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span
                          className={`font-medium ${
                            isPastDue
                              ? 'text-[#F08080]'
                              : isDueSoon
                              ? 'text-[#F2C66D]'
                              : 'text-[#A0ADA3]'
                          }`}
                        >
                          Due Day {bill.dueDay}
                          {isPastDue
                            ? ` (${currentDay - bill.dueDay} days overdue)`
                            : isDueSoon
                            ? ` (Due in ${bill.dueDay - currentDay} days)`
                            : ''}
                        </span>
                        <span className="text-[#6F7C72]">·</span>
                        <span className="text-[#6F7C72]">{bill.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#29352D]">
                    <div className="text-right">
                      <span className="text-base font-bold text-[#F2F5F0] block">
                        {formatINR(bill.amount)}
                      </span>
                      <span className="text-[10px] text-[#F2C66D]">Unpaid</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => toggleCommitmentPaid(bill.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Paid
                      </Button>

                      <button
                        onClick={() => openEditModal(bill)}
                        className="p-2 rounded-lg text-[#6F7C72] hover:text-[#C8F169] hover:bg-[#1B241E] transition-colors"
                        aria-label={`Edit bill: ${bill.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingBillId(bill.id)}
                        className="p-2 rounded-lg text-[#6F7C72] hover:text-[#F08080] hover:bg-[#381B1B]/40 transition-colors"
                        aria-label={`Delete bill: ${bill.title}`}
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
      </div>

      {/* 4. Paid Commitments History */}
      {paidBills.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#29352D]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F2F5F0] flex items-center gap-2">
              <span>Paid Commitments</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1B241E] border border-[#29352D] text-[#8FE388]">
                {paidBills.length}
              </span>
            </h3>
            <span className="text-xs text-[#6F7C72]">
              Recorded as ledger expenses
            </span>
          </div>

          <div className="space-y-2">
            {paidBills.map((bill) => (
              <Card
                key={bill.id}
                className="p-3.5 bg-[#151C18]/60 border-[#29352D] flex items-center justify-between gap-3 text-xs opacity-90"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#132A1C] border border-[#29352D] flex items-center justify-center text-[#8FE388]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#F2F5F0]">{bill.title}</span>
                    <span className="text-[#6F7C72] ml-2">
                      (Due Day {bill.dueDay} · {bill.category})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#8FE388]">
                    {formatINR(bill.amount)}
                  </span>

                  <button
                    onClick={() => toggleCommitmentPaid(bill.id)}
                    className="flex items-center gap-1 text-[11px] text-[#A0ADA3] hover:text-[#F2C66D] px-2 py-1 rounded bg-[#1B241E] border border-[#29352D] transition-colors"
                    title="Undo payment"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Unpay</span>
                  </button>

                  <button
                    onClick={() => setDeletingBillId(bill.id)}
                    className="p-1 rounded text-[#6F7C72] hover:text-[#F08080]"
                    title="Delete bill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. Add / Edit Bill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBill ? 'Edit Bill / Subscription' : 'Add Bill / Subscription'}
        subtitle={
          editingBill
            ? 'Update the scheduled payment information.'
            : 'Register a recurring expense to ensure funds are held in reserve.'
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#331818] border border-[#4D2424] text-xs text-[#F08080]">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="bill-title" className="block text-xs font-medium text-[#A0ADA3] mb-1">
              Bill / Service Name *
            </label>
            <input
              id="bill-title"
              type="text"
              placeholder="e.g. Wi-Fi Share, Spotify Student, Electric Bill"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              maxLength={80}
              className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] placeholder-[#6F7C72] focus:outline-none focus:border-[#C8F169]/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bill-amount" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A0ADA3]">
                  ₹
                </span>
                <input
                  id="bill-amount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="450"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="bill-due-day" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                Due Simulation Day (1–30) *
              </label>
              <input
                id="bill-due-day"
                type="number"
                min="1"
                max={TOTAL_BUDGET_DAYS}
                value={formDueDay}
                onChange={(e) => setFormDueDay(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bill-type" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                Commitment Type
              </label>
              <select
                id="bill-type"
                value={formType}
                onChange={(e) => setFormType(e.target.value as typeof formType)}
                className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
              >
                <option value="bill">Utility / Bill</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>

            <div>
              <label htmlFor="bill-recurrence" className="block text-xs font-medium text-[#A0ADA3] mb-1">
                Recurrence
              </label>
              <select
                id="bill-recurrence"
                value={formRecurrence}
                onChange={(e) => setFormRecurrence(e.target.value as typeof formRecurrence)}
                className="w-full px-3.5 py-2.5 bg-[#1B241E] border border-[#29352D] rounded-xl text-xs text-[#F2F5F0] focus:outline-none focus:border-[#C8F169]/50"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

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
              {editingBill ? 'Update Bill' : 'Save Bill'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Delete Confirmation Dialog */}
      <Modal
        isOpen={deletingBillId !== null}
        onClose={() => setDeletingBillId(null)}
        title="Delete Commitment"
        subtitle="Are you sure you want to delete this bill or subscription?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#A0ADA3] leading-relaxed">
            If this commitment was already paid, deleting it will remove the linked payment transaction and recalculate your ledger balance cleanly.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29352D]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingBillId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (deletingBillId) {
                  deleteCommitment(deletingBillId);
                  setDeletingBillId(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
