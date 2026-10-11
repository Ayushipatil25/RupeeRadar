import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Receipt,
  PiggyBank,
  CalendarCheck2,
  RotateCcw,
  ShieldCheck,
  User,
  Settings,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { currentDay, resetToDefault } = useFinanceStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'futurecast', label: 'FutureCast', icon: Sparkles, badge: 'Simulator' },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'commitments', label: 'Bills & Subscriptions', icon: CalendarCheck2 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#101613] text-[#F2F5F0] min-h-screen border-r border-[#29352D] p-5 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#29352D]">
        <div className="w-10 h-10 rounded-xl bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169] shadow-inner">
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#F2F5F0] flex items-center gap-1">
            Rupee<span className="text-[#C8F169]">Radar</span>
          </h1>
          <p className="text-[11px] text-[#A0ADA3]">30-Day Budget Simulator</p>
        </div>
      </div>

      {/* Cycle Indicator Badge */}
      <div className="my-5 p-3 rounded-xl bg-[#151C18] border border-[#29352D] flex items-center justify-between text-xs">
        <span className="text-[#A0ADA3]">30-Day Cycle</span>
        <span className="font-semibold text-[#C8F169] bg-[#C8F169]/10 px-2 py-0.5 rounded-md border border-[#C8F169]/20">
          Day {currentDay} of 30
        </span>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Main navigation" className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#123D2D] text-[#F2F5F0] border border-[#C8F169]/30 shadow-xs'
                  : 'text-[#A0ADA3] hover:text-[#F2F5F0] hover:bg-[#151C18]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#C8F169]' : 'text-[#6F7C72]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-[#C8F169] text-[#0B0F0E]'
                      : 'bg-[#1B241E] text-[#A0ADA3] border border-[#29352D]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile & Reset Section */}
      <div className="pt-4 border-t border-[#29352D] space-y-2">
        {/* User Profile placeholder */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#151C18] border border-[#29352D]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1B241E] border border-[#29352D] flex items-center justify-center text-[#C8F169] shrink-0 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-[#F2F5F0] truncate">Ayushi</p>
              <p className="text-[10px] text-[#6F7C72] truncate">₹10k Student Plan</p>
            </div>
          </div>
          <button
            title="Account Settings"
            aria-label="Account Settings"
            className="p-1.5 text-[#6F7C72] hover:text-[#A0ADA3] rounded-lg transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reset Action */}
        <button
          onClick={() => {
            if (window.confirm('Reset all demo data back to default initial state?')) {
              resetToDefault();
            }
          }}
          aria-label="Reset demo data to default"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#A0ADA3] hover:text-[#F08080] hover:bg-[#381B1B]/40 rounded-lg transition-colors border border-transparent hover:border-[#4D2424]"
          title="Reset sample data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
