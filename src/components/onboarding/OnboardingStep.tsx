import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../utils/motion';
import { Card } from '../common/Card';

export interface OnboardingStepProps {
    title: string;
    stepNumber: number;
    totalSteps: number;
    children: React.ReactNode;
    className?: string;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
    title,
    stepNumber,
    totalSteps: _totalSteps,
    children,
    className = '',
}) => {
    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className={`w-full ${className}`}
        >
            <Card
                variant="elevated"
                padding="xl"
                className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-soft-xl"
            >
                {/* Step Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4 text-lg font-semibold">
                        {stepNumber}
                    </div>
                    <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                        {title}
                    </h1>
                    <div className="w-16 h-1 bg-primary-500 rounded-full mx-auto"></div>
                </motion.div>

                {/* Step Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    {children}
                </motion.div>
            </Card>
        </motion.div>
    );
};