import React from 'react';
import { motion } from 'framer-motion';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

const sizeClasses = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

const colorClasses = {
  primary: 'bg-primary-600',
  secondary: 'bg-secondary-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  error: 'bg-error-600',
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  size = 'md',
  color = 'primary',
  disabled = false,
  label,
  description,
  className = '',
}) => {
  const sizeConfig = sizeClasses[size];
  const colorClass = colorClasses[color];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
          ${sizeConfig.track}
          ${checked ? colorClass : 'bg-secondary-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.span
          className={`
            inline-block rounded-full bg-white shadow-soft transform transition-transform duration-200 ease-in-out
            ${sizeConfig.thumb}
          `}
          animate={{
            x: checked ? sizeConfig.translate.replace('translate-x-', '') : '0',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              className={`
                block text-sm font-medium text-secondary-900 cursor-pointer
                ${disabled ? 'opacity-50' : ''}
              `}
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`
              text-sm text-secondary-500 mt-1
              ${disabled ? 'opacity-50' : ''}
            `}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};