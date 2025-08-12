import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleIn } from '../../utils/motion';

export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    disabled?: boolean;
    className?: string;
}

const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
};

const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-secondary-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-secondary-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-secondary-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-secondary-800',
};

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 500,
    disabled = false,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const showTooltip = () => {
        if (disabled) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const positionClass = positionClasses[position];
    const arrowClass = arrowClasses[position];

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={`absolute z-50 ${positionClass}`}
                        variants={scaleIn}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <div className="bg-secondary-800 text-white text-sm px-3 py-2 rounded-lg shadow-soft-lg max-w-xs whitespace-nowrap">
                            {content}
                        </div>

                        {/* Arrow */}
                        <div
                            className={`absolute w-0 h-0 border-4 ${arrowClass}`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};