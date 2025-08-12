import React from 'react';
import { motion } from 'framer-motion';
import { progressBarVariants } from '../../utils/motion';

export interface ProgressBarProps {
    progress: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    showLabel?: boolean;
    label?: string;
    animated?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
};

const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    size = 'md',
    color = 'primary',
    showLabel = false,
    label,
    animated = true,
    className = '',
}) => {
    const sizeClass = sizeClasses[size];
    const colorClass = colorClasses[color];
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            {(showLabel || label) && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-secondary-700">
                        {label || 'Progress'}
                    </span>
                    {showLabel && (
                        <span className="text-sm text-secondary-500">
                            {Math.round(clampedProgress)}%
                        </span>
                    )}
                </div>
            )}

            <div className={`w-full bg-secondary-200 rounded-full overflow-hidden ${sizeClass}`}>
                <motion.div
                    className={`${sizeClass} ${colorClass} rounded-full origin-left`}
                    variants={animated ? progressBarVariants : undefined}
                    initial={animated ? "initial" : undefined}
                    animate={animated ? "animate" : undefined}
                    custom={clampedProgress}
                    style={!animated ? { width: `${clampedProgress}%` } : undefined}
                />
            </div>
        </div>
    );
};

// Progress Dots Component
export interface ProgressDotsProps {
    total: number;
    current: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    className?: string;
}

const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
};

export const ProgressDots: React.FC<ProgressDotsProps> = ({
    total,
    current,
    size = 'md',
    color = 'primary',
    className = '',
}) => {
    const dotSizeClass = dotSizeClasses[size];
    const colorClass = colorClasses[color];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {Array.from({ length: total }, (_, index) => (
                <motion.div
                    key={index}
                    className={`
            ${dotSizeClass} rounded-full transition-all duration-300
            ${index < current
                            ? colorClass
                            : 'bg-secondary-300'
                        }
          `}
                    initial={{ scale: 0.8 }}
                    animate={{
                        scale: index === current - 1 ? 1.2 : 1,
                        opacity: index < current ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />
            ))}
        </div>
    );
};