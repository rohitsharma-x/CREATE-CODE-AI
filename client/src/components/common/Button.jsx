import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-[#12D6C5]/30 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
  };

  const variants = {
    primary: 'bg-[#12D6C5] dark:bg-[#12D6C5] text-[#080F17] dark:text-[#080F17] hover:bg-[#0ec3b3] shadow-sm font-semibold',
    secondary: 'bg-[#EDF4F8] dark:bg-[#172636] text-[#0F172A] dark:text-[#F1F5F9] border border-[#D8E3EA] dark:border-[#263849] hover:bg-[#E2ECF2] dark:hover:bg-[#1d3044]',
    outline: 'border border-[#D8E3EA] dark:border-[#263849] text-[#0F172A] dark:text-[#F1F5F9] hover:border-[#089E9A] dark:hover:border-[#12D6C5] hover:text-[#089E9A] dark:hover:text-[#12D6C5]',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm font-semibold',
    ghost: 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-black/5 dark:hover:bg-white/5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

