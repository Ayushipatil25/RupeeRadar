import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'positive' | 'warning' | 'negative' | 'neutral' | 'accent';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    positive: 'bg-[#132A1C] text-[#8FE388] border-[#29352D]',
    warning: 'bg-[#2D2412] text-[#F2C66D] border-[#44381C]',
    negative: 'bg-[#331818] text-[#F08080] border-[#4D2424]',
    neutral: 'bg-[#1B241E] text-[#A0ADA3] border-[#29352D]',
    accent: 'bg-[#C8F169]/15 text-[#C8F169] border-[#C8F169]/30 font-semibold',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
