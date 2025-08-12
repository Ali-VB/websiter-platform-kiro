import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, cardHover } from '../../../utils/motion';
import { Button } from '../../common/Button';
import type { OnboardingData } from '../OnboardingFlow';

interface FeatureOption {
    id: string;
    title: string;
    description: string;
    price: number;
    icon: string;
    category: 'design' | 'communication' | 'functionality' | 'growth';
    popular?: boolean;
}

const FEATURES: FeatureOption[] = [
    // Design & Branding
    {
        id: 'custom-design',
        title: 'Custom UI Design',
        description: 'Tailored brand visuals',
        price: 1200,
        icon: '🎨',
        category: 'design',
        popular: true,
    },
    {
        id: 'live-chat',
        title: 'Live Chat',
        description: 'Real-time customer support',
        price: 200,
        icon: '💬',
        category: 'communication',
        popular: true,
    },
    {
        id: 'advanced-seo',
        title: 'Advanced SEO',
        description: 'Speed, structure, meta tags',
        price: 500,
        icon: '🔍',
        category: 'growth',
        popular: true,
    },
    {
        id: 'mailchimp',
        title: 'Email Marketing',
        description: 'Mailchimp integration',
        price: 250,
        icon: '📧',
        category: 'communication',
    },
    {
        id: 'multi-language',
        title: 'Multi-language',
        description: 'Add French or more',
        price: 600,
        icon: '🌐',
        category: 'functionality',
    },
    {
        id: 'blog-section',
        title: 'Blog Section',
        description: 'With categories & search',
        price: 400,
        icon: '📝',
        category: 'functionality',
    },
    {
        id: 'payment-gateway',
        title: 'Payment Gateway',
        description: 'PayPal/Stripe integration',
        price: 400,
        icon: '💳',
        category: 'functionality',
    },
    {
        id: 'analytics-setup',
        title: 'Analytics Setup',
        description: 'Google Analytics + Meta',
        price: 200,
        icon: '📊',
        category: 'growth',
    },
    {
        id: 'speed-optimization',
        title: 'Speed Optimization',
        description: 'CDN, compression, lazy load',
        price: 300,
        icon: '⚡',
        category: 'growth',
    },
    {
        id: 'member-login',
        title: 'Member Login',
        description: 'Gated access areas',
        price: 600,
        icon: '🔐',
        category: 'functionality',
    },
    {
        id: 'custom-forms',
        title: 'Custom Forms',
        description: 'Advanced lead capture',
        price: 200,
        icon: '📋',
        category: 'communication',
    },
    {
        id: 'social-media',
        title: 'Social Integration',
        description: 'Connect social accounts',
        price: 150,
        icon: '📱',
        category: 'communication',
    },
];

export interface FeaturesStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack?: () => void;
    onSkip?: () => void;
    isLoading: boolean;
}

export const FeaturesStep: React.FC<FeaturesStepProps> = ({
    data,
    onNext,
    onSkip,
    isLoading,
}) => {
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
        data.additionalFeatures?.map((f: { id: string }) => f.id) || []
    );
    const [showContinue, setShowContinue] = useState(false);
    const [runningTotal, setRunningTotal] = useState(0);

    useEffect(() => {
        // Calculate running total
        const basePrice = data.websitePurpose?.basePrice || 0;
        const featuresTotal = selectedFeatures.reduce((total, featureId) => {
            const feature = FEATURES.find(f => f.id === featureId);
            return total + (feature?.price || 0);
        }, 0);
        setRunningTotal(basePrice + featuresTotal);

        // Progressive disclosure - show continue button after any interaction
        const timer = setTimeout(() => setShowContinue(true), 500);
        return () => clearTimeout(timer);
    }, [selectedFeatures, data.websitePurpose?.basePrice]);

    const handleFeatureToggle = (featureId: string) => {
        setSelectedFeatures(prev =>
            prev.includes(featureId)
                ? prev.filter(id => id !== featureId)
                : [...prev, featureId]
        );
    };

    const handleContinue = () => {
        const selectedFeatureObjects = selectedFeatures.map(id => {
            const feature = FEATURES.find(f => f.id === id);
            return {
                id,
                name: feature?.title || '',
                price: feature?.price || 0,
            };
        });

        onNext({
            additionalFeatures: selectedFeatureObjects,
            totalPrice: runningTotal,
        });
    };

    // Get smart suggestions based on website purpose
    const getSmartSuggestions = () => {
        const purpose = data.websitePurpose?.type;
        const suggestions: string[] = [];

        if (purpose === 'business') {
            suggestions.push('custom-design', 'live-chat', 'advanced-seo');
        } else if (purpose === 'store') {
            suggestions.push('custom-design', 'live-chat', 'advanced-seo', 'speed-optimization');
        } else if (purpose === 'booking') {
            suggestions.push('custom-design', 'live-chat', 'custom-forms');
        } else if (purpose === 'blog') {
            suggestions.push('advanced-seo', 'social-media', 'analytics-setup');
        }

        return suggestions;
    };

    const smartSuggestions = getSmartSuggestions();

    return (
        <div className="space-y-6">
            {/* Header with Running Total */}
            <div className="flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                        Add Extra Features
                    </h2>
                    <p className="text-secondary-600">
                        Enhance your website with additional features
                    </p>
                </motion.div>

                <motion.div
                    className="bg-primary-50 rounded-xl p-4 text-center border border-primary-200 min-w-[200px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="text-sm text-secondary-600 mb-1">Current Total</div>
                    <div className="text-2xl font-bold text-primary-600">
                        CAD ${runningTotal.toLocaleString()}
                    </div>
                    {selectedFeatures.length > 0 && (
                        <div className="text-xs text-secondary-500 mt-1">
                            +${(runningTotal - (data.websitePurpose?.basePrice || 0)).toLocaleString()} features
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Features Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {FEATURES.map((feature) => (
                    <motion.div
                        key={feature.id}
                        variants={fadeInUp}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.button
                            className={`
                relative w-full p-3 rounded-lg border-2 text-left transition-all duration-300 h-full
                ${selectedFeatures.includes(feature.id)
                                    ? 'border-primary-500 bg-primary-50 shadow-soft'
                                    : 'border-secondary-200 bg-white hover:border-primary-300 hover:bg-primary-25'
                                }
              `}
                            onClick={() => handleFeatureToggle(feature.id)}
                            variants={cardHover}
                        >
                            {/* Smart Suggestion Badge */}
                            {smartSuggestions.includes(feature.id) && (
                                <motion.div
                                    className="absolute -top-1 -right-1 bg-success-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                                >
                                    ★
                                </motion.div>
                            )}

                            {/* Popular Badge */}
                            {feature.popular && !smartSuggestions.includes(feature.id) && (
                                <motion.div
                                    className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                                >
                                    🔥
                                </motion.div>
                            )}

                            <div className="flex items-start gap-2">
                                {/* Icon */}
                                <div className="text-xl flex-shrink-0">{feature.icon}</div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="font-semibold text-sm text-secondary-900 leading-tight">
                                            {feature.title}
                                        </h4>
                                        <div className="text-sm font-bold text-primary-600 ml-1 flex-shrink-0">
                                            +${feature.price}
                                        </div>
                                    </div>
                                    <p className="text-xs text-secondary-600 leading-tight">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Selection Indicator */}
                                <motion.div
                                    className={`
                    w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                    ${selectedFeatures.includes(feature.id)
                                            ? 'border-primary-500 bg-primary-500'
                                            : 'border-secondary-300'
                                        }
                  `}
                                    initial={false}
                                    animate={{
                                        scale: selectedFeatures.includes(feature.id) ? 1.1 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                >
                                    {selectedFeatures.includes(feature.id) && (
                                        <motion.svg
                                            className="w-2.5 h-2.5 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </motion.svg>
                                    )}
                                </motion.div>
                            </div>
                        </motion.button>
                    </motion.div>
                ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                className="flex justify-center gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: showContinue ? 1 : 0,
                    y: showContinue ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
            >
                {showContinue && (
                    <>
                        {onSkip && selectedFeatures.length === 0 && (
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={onSkip}
                                disabled={isLoading}
                                className="text-secondary-600 hover:text-secondary-800"
                            >
                                Skip Features
                            </Button>
                        )}
                        <Button
                            size="lg"
                            onClick={handleContinue}
                            loading={isLoading}
                            className="px-12 py-3 text-lg font-medium"
                        >
                            Continue to Domain & Hosting
                            {selectedFeatures.length > 0 && (
                                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-sm">
                                    {selectedFeatures.length}
                                </span>
                            )}
                        </Button>
                    </>
                )}
            </motion.div>

            {/* Helper Text */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <p className="text-sm text-secondary-500">
                    {selectedFeatures.length === 0
                        ? "You can always add features later after launch"
                        : `${selectedFeatures.length} feature${selectedFeatures.length === 1 ? '' : 's'} selected • Total: CAD $${runningTotal.toLocaleString()}`
                    }
                </p>
            </motion.div>
        </div>
    );
};