import React from 'react';
import { motion } from 'framer-motion';
import { cardHover } from '../../utils/motion';

export interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    clickable?: boolean;
    className?: string;
    onClick?: () => void;
}

const variantClasses = {
    default: 'bg-neutral-0 rounded-soft p-6 shadow-minimal border border-neutral-200',
    elevated: 'bg-neutral-0 rounded-soft p-6 shadow-medium border border-neutral-200',
    outlined: 'bg-neutral-0 rounded-soft p-6 border border-neutral-300',
    glass: 'bg-neutral-0/80 backdrop-blur-sm rounded-soft p-6 shadow-minimal border border-neutral-200',
};

const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
};

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding,
    hover = false,
    clickable = false,
    className = '',
    onClick,
}) => {
    const variantClass = variantClasses[variant];
    const paddingClass = padding ? paddingClasses[padding] : '';
    const cursorClass = clickable || onClick ? 'cursor-pointer' : '';

    // Override padding if explicitly set
    const finalClasses = padding
        ? variantClass.replace(/p-\d+/, '') + ' ' + paddingClass
        : variantClass;

    const combinedClasses = [
        finalClasses,
        cursorClass,
        className,
    ].filter(Boolean).join(' ');

    const cardProps = {
        className: combinedClasses,
        onClick,
        ...(hover && {
            variants: cardHover,
            initial: "initial",
            whileHover: "hover",
        }),
    };

    return (
        <motion.div {...cardProps}>
            {children}
        </motion.div>
    );
};