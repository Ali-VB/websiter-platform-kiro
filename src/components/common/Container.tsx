import React from 'react';
import { motion } from 'framer-motion';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    animate?: boolean;
    id?: string;
}

export const Container: React.FC<ContainerProps> = ({
    children,
    className = '',
    size = 'lg',
    padding = 'md',
    animate = false,
    id,
}) => {
    const sizeClasses = {
        sm: 'max-w-2xl',
        md: 'max-w-4xl',
        lg: 'max-w-6xl',
        xl: 'max-w-7xl',
        full: 'max-w-full',
    };

    const paddingClasses = {
        none: '',
        sm: 'px-4 py-8',
        md: 'px-4 py-12 md:px-6',
        lg: 'px-4 py-16 md:px-6 lg:px-8',
        xl: 'px-4 py-20 md:px-6 lg:px-8',
    };

    const containerClasses = `
    mx-auto w-full
    ${sizeClasses[size]}
    ${paddingClasses[padding]}
    ${className}
  `.trim();

    if (animate) {
        return (
            <motion.div
                id={id}
                className={containerClasses}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div id={id} className={containerClasses}>
            {children}
        </div>
    );
};