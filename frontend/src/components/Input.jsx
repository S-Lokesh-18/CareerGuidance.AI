import React from 'react';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full px-3.5 py-2.5 bg-white text-slate-900 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
