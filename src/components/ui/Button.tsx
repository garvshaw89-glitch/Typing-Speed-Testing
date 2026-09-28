import React, { useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  isSuccess?: boolean;
  successText?: string;
  isError?: boolean;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  isSuccess = false,
  successText,
  isError = false,
  errorText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [isPressing, setIsPressing] = useState(false);

  // Luxury Precision variant styling
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#6C8CFF] hover:bg-[#5A7BFF] active:bg-[#4E6FEB] text-white shadow-[0_10px_25px_rgba(108,140,255,0.25)] hover:shadow-[0_12px_30px_rgba(108,140,255,0.35)] border border-indigo-300/30 focus-visible:ring-[#6C8CFF]',
    secondary:
      'bg-[#15181D] hover:bg-[#1C2027] active:bg-[#13161A] text-[#F5F5F0] border border-white/[0.08] hover:border-white/[0.16] shadow-sm focus-visible:ring-white/40',
    accent:
      'bg-gradient-to-r from-[#6C8CFF] to-[#8A6CFF] hover:from-[#5E7FFF] hover:to-[#7E5EFF] text-white shadow-[0_10px_25px_rgba(138,108,255,0.25)] border border-indigo-200/20 focus-visible:ring-[#8A6CFF]',
    outline:
      'bg-transparent hover:bg-white/[0.04] text-[#F5F5F0] border border-white/[0.14] hover:border-white/[0.28] focus-visible:ring-white/40',
    ghost:
      'bg-transparent hover:bg-white/[0.05] text-[#A5A7AC] hover:text-[#F5F5F0] border border-transparent focus-visible:ring-white/40',
    danger:
      'bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/60 shadow-sm focus-visible:ring-rose-500',
  };

  // Size styling with touch-target ergonomics
  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'text-[11px] py-1.5 px-3 rounded-lg gap-1.5 font-medium min-h-[36px]',
    sm: 'text-xs py-2 px-3.5 rounded-xl gap-2 font-medium tracking-wide min-h-[42px] sm:min-h-[38px]',
    md: 'text-xs sm:text-sm py-2.5 px-5 rounded-xl gap-2 font-semibold tracking-wide min-h-[44px]',
    lg: 'text-sm sm:text-base py-3 px-6 rounded-2xl gap-2.5 font-semibold tracking-wide min-h-[48px]',
    xl: 'text-sm sm:text-base py-3.5 sm:py-4 px-7 sm:px-9 rounded-2xl gap-3 font-bold tracking-wider uppercase font-mono min-h-[52px]',
  };

  const isDisabled = disabled || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      {...props}
      disabled={isDisabled}
      onClick={handleClick}
      onMouseDown={() => setIsPressing(true)}
      onMouseUp={() => setIsPressing(false)}
      onMouseLeave={() => setIsPressing(false)}
      className={`
        relative inline-flex items-center justify-center whitespace-nowrap select-none
        transition-all duration-200 ease-out cursor-pointer
        focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-[#050505]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isPressing && !isDisabled ? 'scale-[0.98]' : 'hover:scale-[1.008]'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${isSuccess ? '!bg-emerald-600 !text-white !border-emerald-500' : ''}
        ${isError ? '!bg-rose-600 !text-white !border-rose-500' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-1.5" />
          <span>{loadingText || children}</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="w-4 h-4 shrink-0 mr-1.5 text-emerald-100" />
          <span>{successText || 'Completed'}</span>
        </>
      ) : isError ? (
        <>
          <AlertCircle className="w-4 h-4 shrink-0 mr-1.5 text-rose-100" />
          <span>{errorText || 'Error'}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-1">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
