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

  // Variant styling
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 border border-blue-500/30 focus-visible:ring-blue-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:active:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 focus-visible:ring-slate-400',
    accent:
      'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-white shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 border border-amber-400/40 focus-visible:ring-amber-500',
    outline:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus-visible:ring-slate-400',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent focus-visible:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md shadow-rose-600/25 border border-rose-500/30 focus-visible:ring-rose-500',
  };

  // Size styling
  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'text-[11px] py-1.5 px-2.5 rounded-lg gap-1.5 font-semibold',
    sm: 'text-xs py-2 px-3.5 rounded-xl gap-1.5 font-bold',
    md: 'text-sm py-2.5 px-4.5 rounded-xl gap-2 font-bold',
    lg: 'text-base py-3 px-6 rounded-2xl gap-2.5 font-extrabold',
    xl: 'text-lg py-4 px-8 rounded-2xl gap-3 font-black tracking-tight',
  };

  const isDisabled = disabled || isLoading;

  // Handle click with double-click / debounce protection
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
        transition-all duration-150 ease-out cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isPressing && !isDisabled ? 'scale-[0.98]' : 'hover:scale-[1.01]'}
        ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}
        ${isSuccess ? '!bg-emerald-600 !text-white !border-emerald-500 !shadow-emerald-600/30' : ''}
        ${isError ? '!bg-rose-600 !text-white !border-rose-500 !shadow-rose-600/30' : ''}
        ${className}
      `}
    >
      {/* Loading state indicator */}
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || 'Loading...'}</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="w-4 h-4 stroke-[3] shrink-0 text-white" />
          <span>{successText || 'Success'}</span>
        </>
      ) : isError ? (
        <>
          <AlertCircle className="w-4 h-4 stroke-[2.5] shrink-0 text-white" />
          <span>{errorText || 'Error'}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
