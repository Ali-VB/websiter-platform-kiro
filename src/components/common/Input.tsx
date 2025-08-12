import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp } from '../../utils/motion';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'filled' | 'outlined';
    fullWidth?: boolean;
}

const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
};

const variantClasses = {
    default: 'input',
    filled: 'bg-secondary-50 border-transparent focus:bg-white focus:border-primary-500',
    outlined: 'bg-transparent border-2 border-secondary-300 focus:border-primary-500',
};

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    fullWidth = true,
    className = '',
    disabled,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const id = useId();

    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];
    const widthClass = fullWidth ? 'w-full' : '';

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(!!e.target.value);
        props.onChange?.(e);
    };

    const isFloating = isFocused || hasValue;
    const hasError = !!error;

    return (
        <div className={`relative ${widthClass}`}>
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                        {leftIcon}
                    </div>
                )}

                <input
                    id={id}
                    className={`
            ${variantClass}
            ${sizeClass}
            ${widthClass}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${hasError ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
                    disabled={disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    {...props}
                />

                {label && (
                    <motion.label
                        htmlFor={id}
                        className={`
              absolute left-4 pointer-events-none transition-all duration-200 ease-out
              ${leftIcon ? 'left-10' : 'left-4'}
              ${isFloating
                                ? 'top-2 text-xs text-primary-600 font-medium'
                                : 'top-1/2 transform -translate-y-1/2 text-secondary-500'
                            }
              ${hasError && isFloating ? 'text-error-600' : ''}
              ${disabled ? 'text-secondary-400' : ''}
            `}
                        animate={{
                            y: isFloating ? -8 : 0,
                            scale: isFloating ? 0.85 : 1,
                        }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {label}
                    </motion.label>
                )}

                {rightIcon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {(error || helperText) && (
                    <motion.div
                        className="mt-2"
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {error && (
                            <p className="text-sm text-error-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        )}
                        {!error && helperText && (
                            <p className="text-sm text-secondary-500">{helperText}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};