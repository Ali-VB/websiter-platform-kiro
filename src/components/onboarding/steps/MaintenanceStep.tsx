import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../../utils/motion';
import { Button } from '../../common/Button';
import type { OnboardingData } from '../OnboardingFlow';
import {
    AlertTriangle,
    Check,
    X
} from 'lucide-react';

interface MaintenancePlan {
    id: string;
    name: string;
    monthlyPrice: number;
    features: string[];
    warning?: string;
    popular?: boolean;
}

const MAINTENANCE_PLANS: MaintenancePlan[] = [
    {
        id: 'diy',
        name: 'DIY',
        monthlyPrice: 0,
        features: ['No support', 'Manual updates'],
        warning: 'Risk: Security vulnerabilities, broken plugins',
    },
    {
        id: 'basic',
        name: 'Peace of Mind',
        monthlyPrice: 75,
        features: [
            'Security & updates',
            '3 content changes/month',
            'Issue fixes',
            'Email support'
        ],
    },
    {
        id: 'standard',
        name: 'Growth Partner',
        monthlyPrice: 175,
        features: [
            'Everything above +',
            '10 content changes/month',
            'Performance reports',
            'SEO monitoring'
        ],
        popular: true,
    },
    {
        id: 'premium',
        name: 'Success Accelerator',
        monthlyPrice: 300,
        features: [
            'Everything above +',
            'Unlimited changes',
            'Strategy calls',
            'Priority support (2hr)'
        ],
    },
];

export interface MaintenanceStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack?: () => void;
    onSkip?: () => void;
    isLoading: boolean;
}

export const MaintenanceStep: React.FC<MaintenanceStepProps> = ({
    data,
    onNext,
    isLoading,
}) => {
    const [selectedPlan, setSelectedPlan] = useState<string>(data.maintenance?.plan || '');
    const [showContinue, setShowContinue] = useState(false);

    useEffect(() => {
        if (selectedPlan) {
            const timer = setTimeout(() => setShowContinue(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShowContinue(false);
        }
    }, [selectedPlan]);

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleContinue = () => {
        const plan = MAINTENANCE_PLANS.find(p => p.id === selectedPlan);
        if (plan) {
            onNext({
                maintenance: {
                    plan: plan.id,
                    monthlyPrice: plan.monthlyPrice,
                },
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Question */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="text-3xl font-bold text-secondary-900 mb-3">
                    Maintenance & Support
                </h2>
                <p className="text-secondary-600 text-lg">
                    Keep your website secure and up-to-date
                </p>
            </motion.div>

            {/* Maintenance Plans */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {MAINTENANCE_PLANS.map((plan) => (
                    <motion.div
                        key={plan.id}
                        variants={fadeInUp}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.button
                            className={`
                relative w-full p-4 rounded-xl border-2 text-left transition-all duration-300 h-full
                ${selectedPlan === plan.id
                                    ? 'border-primary-500 bg-primary-50 shadow-soft-lg'
                                    : 'border-secondary-200 bg-white hover:border-primary-300 hover:bg-primary-25'
                                }
                ${plan.warning ? 'border-warning-300 bg-warning-25' : ''}
              `}
                            onClick={() => handlePlanSelect(plan.id)}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <motion.div
                                    className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                                >
                                    Popular
                                </motion.div>
                            )}

                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                                        {plan.name}
                                    </h3>
                                    <div className="text-xl font-bold text-primary-600">
                                        {plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice}/mo`}
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                <motion.div
                                    className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedPlan === plan.id
                                            ? 'border-primary-500 bg-primary-500'
                                            : 'border-secondary-300'
                                        }
                  `}
                                    initial={false}
                                    animate={{
                                        scale: selectedPlan === plan.id ? 1.1 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                >
                                    {selectedPlan === plan.id && (
                                        <motion.div
                                            className="w-2 h-2 bg-white rounded-full"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        />
                                    )}
                                </motion.div>
                            </div>

                            {/* Warning */}
                            {plan.warning && (
                                <div className="mb-3 p-2 bg-warning-100 border border-warning-300 rounded-lg">
                                    <div className="flex items-start gap-1">
                                        <AlertTriangle className="w-4 h-4 text-warning-600" />
                                        <p className="text-xs text-warning-800">{plan.warning}</p>
                                    </div>
                                </div>
                            )}

                            {/* Features */}
                            <div className="space-y-1">
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-1">
                                        {plan.warning ? <X className="w-4 h-4 text-red-500" /> : <Check className="w-4 h-4 text-green-500" />}
                                        <span className="text-xs text-secondary-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Additional Info */}
                            {plan.id !== 'diy' && (
                                <div className="mt-3 pt-3 border-t border-secondary-200">
                                    <p className="text-xs text-secondary-500">
                                        Upgrade anytime
                                    </p>
                                </div>
                            )}
                        </motion.button>
                    </motion.div>
                ))}
            </motion.div>

            {/* Info Note */}
            <motion.div
                className="text-center bg-secondary-50 rounded-xl p-4 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h4 className="font-semibold text-secondary-800 mb-2">Why Choose Maintenance?</h4>
                <p className="text-sm text-secondary-600 leading-relaxed">
                    WordPress sites need regular updates for security and performance. Without maintenance,
                    your site could become vulnerable or break due to plugin conflicts.
                </p>
            </motion.div>

            {/* Continue Button */}
            <motion.div
                className="flex justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: showContinue ? 1 : 0,
                    y: showContinue ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
            >
                {showContinue && (
                    <Button
                        size="lg"
                        onClick={handleContinue}
                        loading={isLoading}
                        disabled={!selectedPlan}
                        className="px-12 py-3 text-lg font-medium"
                    >
                        Continue to Summary
                    </Button>
                )}
            </motion.div>
        </div>
    );
};