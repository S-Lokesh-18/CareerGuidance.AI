import React from 'react';
import Spinner from './Spinner';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow focus:ring-indigo-500 active:bg-indigo-800',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm focus:ring-slate-700 active:bg-black',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-indigo-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-indigo-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 active:bg-rose-800',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 active:bg-emerald-800',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading && <Spinner size="sm" color="currentColor" />}
      {children}
    </button>
  );
}
