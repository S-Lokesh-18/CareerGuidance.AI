import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  footer,
  hover = false,
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 text-sm">
          {footer}
        </div>
      )}
    </div>
  );
}
