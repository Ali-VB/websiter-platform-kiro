import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop, modalContent as modalContentVariants } from '../../utils/motion';
import { Button } from './Button';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    footer?: React.ReactNode;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    footer,
}) => {
    const sizeClass = sizeClasses[size];

    useEffect(() => {
        if (!closeOnEscape) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 pt-20" style={{ zIndex: 9999 }}>
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        variants={modalBackdrop}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        onClick={handleBackdropClick}
                    />

                    <motion.div
                        className={`relative bg-white rounded-2xl shadow-soft-xl max-h-[calc(100vh-6rem)] overflow-hidden ${sizeClass} w-full mx-4`}
                        variants={modalContentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                                {title && (
                                    <h2 className="text-xl font-semibold text-secondary-900">
                                        {title}
                                    </h2>
                                )}
                                {showCloseButton && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                        className="!p-2 ml-auto"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
                            {children}
                        </div>

                        {footer && (
                            <div className="p-6 border-t border-secondary-100 bg-secondary-50">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};