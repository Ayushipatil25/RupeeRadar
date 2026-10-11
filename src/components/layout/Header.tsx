import React from 'react';
import { ShieldCheck, RotateCcw, User } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Badge } from '../common/Badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { currentDay, resetToDefault } = useFinanceStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="bg-[#101613] border-b border-[#29352D] sticky top-0 z-20 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Greeting & Screen Info */}
      <div className="flex items-center gap-3">
        <div className="md:hidden w-8 h-8 rounded-lg bg-[#123D2D] border border-[#29352D] flex items-center justify-center text-[#C8F169]">
          <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-bold text-[#F2F5F0] leading-tight">
              {title}
            </h2>
            <span className="hidden sm:inline-block text-xs text-[#6F7C72]">·</span>
            <span className="hidden sm:inline-block text-xs text-[#A0ADA3]">
              {getGreeting()}, Ayush
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-[#A0ADA3] hidden sm:block mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Cycle status, Reset, Profile Avatar */}
      <div className="flex items-center gap-3">
        <Badge variant="accent" className="hidden sm:inline-flex">
          Day {currentDay} of 30
        </Badge>

        <button
          onClick={() => {
            if (window.confirm('Reset all demo data back to default initial state?')) {
              resetToDefault();
            }
          }}
          className="flex items-center gap-1.5 text-xs text-[#A0ADA3] hover:text-[#F08080] hover:border-[#4D2424] hover:bg-[#381B1B]/40 px-2.5 py-1.5 rounded-lg border border-[#29352D] bg-[#151C18] transition-colors"
          title="Reset demo data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Restrained Avatar */}
        <div className="w-8 h-8 rounded-lg bg-[#1B241E] border border-[#29352D] flex items-center justify-center text-[#C8F169] text-xs font-semibold">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
