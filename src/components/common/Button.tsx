import React from 'react';
import { motion } from 'framer-motion';
import { buttonPress } from '../../utils/motion';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    children: React.ReactNode;
}

const variantClasses = {
    primary: 'bg-neutral-900 text-neutral-0 hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 shadow-minimal hover:shadow-soft transition-all duration-200',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 shadow-minimal hover:shadow-soft transition-all duration-200',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-all duration-200',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-all duration-200',
    danger: 'bg-error-600 text-neutral-0 hover:bg-error-700 focus:ring-2 focus:ring-error-500 focus:ring-offset-2 shadow-minimal hover:shadow-soft transition-all duration-200',
};

const sizeClasses = {
    sm: 'px-4 py-2 text-sm font-sans',
    md: 'px-6 py-3 text-sm font-sans',
    lg: 'px-8 py-4 text-base font-sans',
    xl: 'px-10 py-5 text-lg font-sans',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    const widthClass = fullWidth ? 'w-full' : '';

    const combinedClasses = [
        baseClasses,
        variantClass,
        sizeClass,
        widthClass,
        className,
    ].filter(Boolean).join(' ');

    // Filter out conflicting props that conflict with Framer Motion
    const buttonProps = Object.fromEntries(
        Object.entries(props).filter(([key]) =>
            !['onAnimationStart', 'onAnimationEnd', 'onDrag', 'onDragStart', 'onDragEnd'].includes(key)
        )
    ) as Omit<typeof props, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'>;

    return (
        <motion.button
            className={combinedClasses}
            disabled={disabled || loading}
            variants={buttonPress}
            initial="initial"
            whileTap="tap"
            {...buttonProps}
        >
            <div className="flex items-center justify-center gap-2">
                {loading ? (
                    <LoadingSpinner size="sm" />
                ) : (
                    leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
                )}

                <span className={loading ? 'opacity-70' : ''}>
                    {children}
                </span>

                {!loading && rightIcon && (
                    <span className="flex-shrink-0">{rightIcon}</span>
                )}
            </div>
        </motion.button>
    );
};