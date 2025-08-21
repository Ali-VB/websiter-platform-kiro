import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, cardHover } from '../../../utils/motion';
import { Button } from '../../common/Button';
import type { OnboardingData } from '../OnboardingFlow';
import {
    Briefcase,
    Edit,
    ShoppingCart,
    Calendar,
    Zap,
    Image,
} from 'lucide-react';

interface WebsitePurpose {
    id: string;
    title: string;
    startingPrice: number;
    includes: string[];
    recommendedFor: string;
    icon: React.ReactNode;
    popular?: boolean;
    fastestDelivery?: boolean;
}

const WEBSITE_PURPOSES: WebsitePurpose[] = [
    {
        id: 'business',
        title: 'Introduce My Business',
        startingPrice: 650,
        includes: [
            'WordPress theme setup',
            '3 pages (Home, About, Contact)',
            'Contact form & Google Maps',
            'Mobile responsive design'
        ],
        recommendedFor: 'Local businesses, startups, freelancers',
        icon: <Briefcase className="w-8 h-8" />,
        popular: true,
    },
    {
        id: 'blog',
        title: 'Create a Personal Blog',
        startingPrice: 550,
        includes: [
            'Blog system with commenting',
            'Social sharing buttons',
            'Standard blog template'
        ],
        recommendedFor: 'Writers, content creators, students',
        icon: <Edit className="w-8 h-8" />,
        fastestDelivery: true,
    },
    {
        id: 'store',
        title: 'Launch an Online Store',
        startingPrice: 1200,
        includes: [
            'Product catalog & shopping cart',
            'Stripe/PayPal integration',
            'Inventory management'
        ],
        recommendedFor: 'Small ecommerce businesses',
        icon: <ShoppingCart className="w-8 h-8" />,
    },
    {
        id: 'booking',
        title: 'Appointment/Booking Website',
        startingPrice: 900,
        includes: [
            'Booking calendar & service listings',
            'Email confirmations',
            'Client dashboard & payment collection'
        ],
        recommendedFor: 'Salons, coaches, tutors',
        icon: <Calendar className="w-8 h-8" />,
    },
    {
        id: 'custom',
        title: 'Fully Custom Website',
        startingPrice: 2500,
        includes: [
            'Custom frontend/backend',
            'Built with modern stack',
            'Optimized for growth'
        ],
        recommendedFor: 'Complex projects, unique requirements',
        icon: <Zap className="w-8 h-8" />,
    },
    {
        id: 'portfolio',
        title: 'Portfolio/Creative Website',
        startingPrice: 750,
        includes: [
            'Gallery/portfolio system',
            'Project showcase pages',
            'Client testimonial section'
        ],
        recommendedFor: 'Photographers, designers, artists',
        icon: <Image className="w-8 h-8" />,
    },
];

export interface PurposeStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack?: () => void;
    onSkip?: () => void;
    isLoading: boolean;
}

export const PurposeStep: React.FC<PurposeStepProps> = ({
    data,
    onNext,
    isLoading,
}) => {
    const [selectedPurpose, setSelectedPurpose] = useState<string>(
        data.websitePurpose?.type || ''
    );
    const [showContinue, setShowContinue] = useState(false);

    useEffect(() => {
        if (selectedPurpose) {
            const timer = setTimeout(() => setShowContinue(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShowContinue(false);
        }
    }, [selectedPurpose]);

    const handlePurposeSelect = (purposeId: string) => {
        setSelectedPurpose(purposeId);
    };

    const handleContinue = () => {
        const purpose = WEBSITE_PURPOSES.find(p => p.id === selectedPurpose);
        if (purpose) {
            onNext({
                websitePurpose: {
                    type: purpose.id,
                    basePrice: purpose.startingPrice,
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
                    What's the Purpose of Your Website?
                </h2>
                <p className="text-secondary-600 text-lg">
                    Select one option to begin
                </p>
            </motion.div>

            {/* Purpose Options */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {WEBSITE_PURPOSES.map((purpose) => (
                    <motion.div
                        key={purpose.id}
                        variants={fadeInUp}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.button
                            className={`
                relative w-full p-4 rounded-xl border-2 text-left transition-all duration-300 h-full
                ${selectedPurpose === purpose.id
                                    ? 'border-primary-500 bg-primary-50 shadow-soft-lg'
                                    : 'border-secondary-200 bg-white hover:border-primary-300 hover:bg-primary-25'
                                }
              `}
                            onClick={() => handlePurposeSelect(purpose.id)}
                            variants={cardHover}
                        >
                            {/* Badges */}
                            <div className="absolute -top-2 -right-2 flex gap-1">
                                {purpose.popular && (
                                    <motion.div
                                        className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                                    >
                                        Popular
                                    </motion.div>
                                )}
                                {purpose.fastestDelivery && (
                                    <motion.div
                                        className="bg-success-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: 'spring', stiffness: 500 }}
                                    >
                                        Fast
                                    </motion.div>
                                )}
                            </div>

                            {/* Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="text-3xl flex-shrink-0">{purpose.icon}</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                                        {purpose.title}
                                    </h3>
                                    <div className="text-xl font-bold text-primary-600">
                                        CAD ${purpose.startingPrice}
                                    </div>
                                </div>
                            </div>

                            {/* Includes */}
                            <div className="mb-3">
                                <h4 className="font-medium text-secondary-800 mb-2 text-sm">Includes:</h4>
                                <ul className="text-xs text-secondary-600 space-y-1">
                                    {purpose.includes.map((item, index) => (
                                        <li key={index} className="flex items-start gap-1">
                                            <span className="text-primary-500 mt-0.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Recommended For */}
                            <div className="text-xs">
                                <span className="font-medium text-secondary-700">For: </span>
                                <span className="text-secondary-600">{purpose.recommendedFor}</span>
                            </div>

                            {/* Selection Indicator */}
                            <motion.div
                                className={`
                  absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedPurpose === purpose.id
                                        ? 'border-primary-500 bg-primary-500'
                                        : 'border-secondary-300'
                                    }
                `}
                                initial={false}
                                animate={{
                                    scale: selectedPurpose === purpose.id ? 1.1 : 1,
                                }}
                                transition={{ type: 'spring', stiffness: 500 }}
                            >
                                {selectedPurpose === purpose.id && (
                                    <motion.div
                                        className="w-2 h-2 bg-white rounded-full"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500 }}
                                    />
                                )}
                            </motion.div>
                        </motion.button>
                    </motion.div>
                ))}
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
                        disabled={!selectedPurpose}
                        className="px-12 py-3 text-lg font-medium"
                    >
                        Continue to Features
                    </Button>
                )}
            </motion.div>
        </div>
    );
};