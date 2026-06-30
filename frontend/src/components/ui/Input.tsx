import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  glowColor?: 'cyan' | 'purple';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, glowColor = 'cyan', ...props }, ref) => {
    const focusGlow = {
      cyan: 'focus:border-cyan-400 focus:ring-cyan-500/20 focus:ring-4',
      purple: 'focus:border-purple-400 focus:ring-purple-500/20 focus:ring-4',
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-all duration-200',
            focusGlow[glowColor],
            error ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/10' : '',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="text-xs text-rose-400 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
