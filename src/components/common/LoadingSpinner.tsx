import React from 'react';
import { motion } from 'framer-motion';
import { spinnerVariants } from '../../utils/motion';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  white: 'text-white',
  current: 'text-current',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'current',
  className = '',
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];
  
  return (
    <motion.div
      className={`inline-block ${sizeClass} ${colorClass} ${className}`}
      variants={spinnerVariants}
      animate="animate"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="23.562"
          className="opacity-75"
        />
      </svg>
    </motion.div>
  );
};