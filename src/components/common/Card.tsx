import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'muted';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#151C18] border-[#29352D]',
    elevated: 'bg-[#1B241E] border-[#29352D] shadow-sm',
    muted: 'bg-[#101613] border-[#29352D]/60',
  }[variant];

  return (
    <div
      className={`rounded-2xl border p-5 transition-all text-[#F2F5F0] ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
