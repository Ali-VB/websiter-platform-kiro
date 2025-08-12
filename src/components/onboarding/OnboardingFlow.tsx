import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed unused imports
import { Button } from '../common/Button';
import { PurposeStep } from './steps/PurposeStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { InspirationStep } from './steps/InspirationStep';
import { DomainHostingStep } from './steps/DomainHostingStep';
import { MaintenanceStep } from './steps/MaintenanceStep';
import { AuthStep } from './steps/AuthStep';
import { ProjectSuccess } from './ProjectSuccess';
import { ProjectCreated } from './ProjectCreated';

export interface OnboardingData {
    websitePurpose?: {
        type: string;
        basePrice: number;
    };
    additionalFeatures?: {
        id: string;
        name: string;
        price: number;
    }[];
    domain?: {
        hasExisting: boolean;
        domainName?: string;
        needsNew?: boolean;
        suggestedDomains?: string[];
    };
    hosting?: {
        hasExisting: boolean;
        provider?: string;
        needsHosting?: boolean;
        selectedPlan?: string;
        monthlyPrice?: number;
    };
    maintenance?: {
        plan: string;
        monthlyPrice: number;
    };
    timeline?: {
        delivery: 'standard' | 'priority' | 'rush';
        rushFee?: number;
    };
    contactInfo?: {
        name: string;
        email: string;
        phone?: string;
        company?: string;
    };
    websiteInspiration?: {
        url: string;
        description: string;
        whatYouLike: string;
    }[];
    totalPrice?: number;
    paymentOption?: string;
    projectId?: string;
    requestId?: string;
    paymentResult?: any;
    isExistingUser?: boolean;
}

export interface OnboardingFlowProps {
    onComplete: (data: OnboardingData) => void;
    onCancel?: () => void;
    initialData?: Partial<OnboardingData>;
}

const STEPS = [
    { id: 'purpose', title: 'Website Purpose', component: PurposeStep },
    { id: 'features', title: 'Additional Features', component: FeaturesStep },
    { id: 'inspiration', title: 'Website Inspiration', component: InspirationStep },
    { id: 'domain-hosting', title: 'Domain & Hosting', component: DomainHostingStep },
    { id: 'maintenance', title: 'Maintenance & Support', component: MaintenanceStep },
    { id: 'auth', title: 'Create Account', component: AuthStep },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
    onComplete,
    onCancel,
    initialData = {},
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<OnboardingData>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);

    const handleNext = useCallback(async (stepData: Partial<OnboardingData>) => {
        setIsLoading(true);

        // Simulate processing time for smooth UX
        await new Promise(resolve => setTimeout(resolve, 300));

        const updatedData = { ...data, ...stepData };
        setData(updatedData);

        if (currentStep === STEPS.length - 1) {
            // Final step completed - show success page
            setIsExistingUser(updatedData.isExistingUser || false);
            setShowSuccess(true);
            onComplete(updatedData);
        } else {
            setDirection('forward');
            setCurrentStep(prev => prev + 1);
        }

        setIsLoading(false);
    }, [currentStep, data, onComplete]);

    const handleBack = useCallback(() => {
        if (currentStep > 0) {
            setDirection('backward');
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleSkip = useCallback(() => {
        setDirection('forward');
        setCurrentStep(prev => prev + 1);
    }, []);

    // Show success page after completion
    if (showSuccess) {
        if (isExistingUser) {
            // Existing user - show dashboard-focused success page
            return (
                <ProjectCreated
                    data={data}
                    onGoToDashboard={() => {
                        setShowSuccess(false);
                        // Navigate to dashboard
                        window.location.href = '/dashboard';
                    }}
                />
            );
        } else {
            // New user - show email confirmation success page
            return (
                <ProjectSuccess
                    data={data}
                    onBackToHome={() => {
                        setShowSuccess(false);
                        onCancel?.();
                    }}
                />
            );
        }
    }

    const currentStepConfig = STEPS[currentStep];
    const StepComponent = currentStepConfig.component;

    const slideVariants = {
        enter: (direction: 'forward' | 'backward') => ({
            x: direction === 'forward' ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: 'forward' | 'backward') => ({
            zIndex: 0,
            x: direction === 'forward' ? -300 : 300,
            opacity: 0,
        }),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col lg:flex-row">
            {/* Left Sidebar - Progress */}
            <div className="w-full lg:w-80 bg-white/80 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-secondary-200 p-4 lg:p-8 flex flex-col">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-full flex flex-col"
                >
                    {/* Logo/Brand */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-secondary-900">Websiter</h1>
                        <p className="text-sm text-secondary-600">Professional websites made simple</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex lg:flex-col lg:space-y-4 space-x-2 lg:space-x-0 overflow-x-auto lg:overflow-x-visible flex-1 pb-2 lg:pb-0">
                        {STEPS.map((step, index) => (
                            <motion.div
                                key={step.id}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 flex-shrink-0 lg:flex-shrink min-w-[200px] lg:min-w-0 ${index === currentStep
                                    ? 'bg-primary-100 border border-primary-300'
                                    : index < currentStep
                                        ? 'bg-success-50 border border-success-200'
                                        : 'bg-secondary-50 border border-secondary-200'
                                    }`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${index === currentStep
                                        ? 'bg-primary-500 text-white'
                                        : index < currentStep
                                            ? 'bg-success-500 text-white'
                                            : 'bg-secondary-300 text-secondary-600'
                                        }`}
                                >
                                    {index < currentStep ? '✓' : index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className={`font-medium text-sm ${index === currentStep ? 'text-primary-700' :
                                        index < currentStep ? 'text-success-700' : 'text-secondary-600'
                                        }`}>
                                        {step.title}
                                    </div>
                                    {index === currentStep && (
                                        <div className="text-xs text-primary-600 mt-1">Current step</div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="mt-8 pt-6 border-t border-secondary-200">
                        <Button
                            variant="ghost"
                            onClick={currentStep > 0 ? handleBack : onCancel}
                            disabled={isLoading}
                            className="w-full text-secondary-600 hover:text-secondary-800 justify-start"
                            size="sm"
                        >
                            {currentStep > 0 ? '← Back' : '← Exit'}
                        </Button>
                        <div className="text-xs text-secondary-500 mt-2 text-center">
                            Press Enter to continue
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                <div className="w-full max-w-4xl">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            className="w-full"
                        >
                            <StepComponent
                                data={data}
                                onNext={handleNext}
                                onBack={currentStep > 0 ? handleBack : undefined}
                                onSkip={currentStep < STEPS.length - 1 ? handleSkip : undefined}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};