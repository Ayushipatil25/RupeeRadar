import React from 'react';
import { LayoutDashboard, Sparkles, Receipt, PiggyBank, CalendarCheck2 } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onTabChange }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'futurecast', label: 'FutureCast', icon: Sparkles },
    { id: 'transactions', label: 'Spends', icon: Receipt },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'commitments', label: 'Bills', icon: CalendarCheck2 },
  ];

  return (
    <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-[#101613] border-t border-[#29352D] z-30 px-2 py-1.5 flex items-center justify-around shadow-2xl backdrop-blur-md">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-medium transition-all ${
              isActive
                ? 'text-[#C8F169] font-bold'
                : 'text-[#A0ADA3] hover:text-[#F2F5F0]'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#123D2D] text-[#C8F169] border border-[#C8F169]/30 shadow-xs'
                  : 'bg-transparent text-[#6F7C72]'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
