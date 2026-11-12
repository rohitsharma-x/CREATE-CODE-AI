import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  const variantStyles = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    error: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    teal: 'bg-[#12D6C5]/15 text-[#089E9A] dark:text-[#12D6C5] border border-[#12D6C5]/25',
    neutral: 'bg-slate-100 dark:bg-[#172636] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#263849]',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.neutral} ${className}`}>
      {children}
    </span>
  );
};

