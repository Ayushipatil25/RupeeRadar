import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F0E] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#123D2D] text-[#F2F5F0] hover:bg-[#1B523D] border border-[#29352D] focus:ring-[#C8F169]/40 active:scale-[0.99]',
    secondary:
      'bg-[#1B241E] text-[#F2F5F0] border border-[#29352D] hover:bg-[#222E26] focus:ring-[#29352D] active:scale-[0.99]',
    accent:
      'bg-[#C8F169] text-[#0B0F0E] font-semibold hover:bg-[#B0D954] focus:ring-[#C8F169] active:scale-[0.99] shadow-sm',
    outline:
      'border border-[#29352D] text-[#A0ADA3] hover:text-[#F2F5F0] hover:bg-[#1B241E] hover:border-[#3B4B40] focus:ring-[#29352D]',
    ghost: 'text-[#A0ADA3] hover:text-[#F2F5F0] hover:bg-white/5 focus:ring-white/10',
    danger:
      'bg-[#381B1B] text-[#F08080] border border-[#4D2424] hover:bg-[#4D2424] focus:ring-[#F08080]/30 active:scale-[0.99]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
