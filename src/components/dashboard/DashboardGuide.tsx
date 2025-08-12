import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../common';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import {
    CheckCircleIcon,
    ClockIcon,
    CreditCardIcon,
    DocumentTextIcon,
    EyeIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline';

interface DashboardGuideProps {
    userName?: string;
    onNavigateToSection?: (section: string) => void;
    currentProjectStatus?: string;
}

interface ProjectStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    section: string;
    status: 'completed' | 'current' | 'upcoming';
    estimatedTime?: string;
}

export const DashboardGuide: React.FC<DashboardGuideProps> = ({
    userName = 'there',
    onNavigateToSection,
    currentProjectStatus = 'submitted',
}) => {
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    // Dynamic project steps based on current status
    const getStepStatus = (stepId: string): ProjectStep['status'] => {
        const statusOrder = ['new', 'submitted', 'waiting_for_confirmation', 'confirmed', 'in_progress', 'in_design', 'review', 'final_delivery', 'completed'];
        const currentIndex = statusOrder.indexOf(currentProjectStatus);

        switch (stepId) {
            case 'submission':
                return currentIndex >= 1 ? 'completed' : 'current';
            case 'waiting-confirmation':
                return currentIndex >= 3 ? 'completed' : (currentIndex === 2) ? 'current' : 'upcoming';
            case 'payment':
                return currentIndex >= 4 ? 'completed' : (currentIndex === 3) ? 'current' : 'upcoming';
            case 'design':
                return currentIndex >= 6 ? 'completed' : (currentIndex >= 4 && currentIndex <= 5) ? 'current' : 'upcoming';
            case 'feedback':
                return currentIndex >= 7 ? 'completed' : (currentIndex === 6) ? 'current' : 'upcoming';
            case 'launch':
                return currentIndex === 8 ? 'completed' : 'upcoming';
            default:
                return 'upcoming';
        }
    };

    const projectSteps: ProjectStep[] = [
        {
            id: 'submission',
            title: 'Project Submission',
            description: 'Your website requirements have been received and are being reviewed by our team.',
            icon: <DocumentTextIcon className="w-6 h-6" />,
            section: 'Projects',
            status: getStepStatus('submission'),
            estimatedTime: 'Immediate',
        },
        {
            id: 'waiting-confirmation',
            title: 'Project Confirmation',
            description: 'Your project has been approved and confirmed! Work will begin shortly.',
            icon: <ClockIcon className="w-6 h-6" />,
            section: 'Projects',
            status: getStepStatus('waiting-confirmation'),
            estimatedTime: '24-48 hours',
        },
        {
            id: 'payment',
            title: 'Payment',
            description: 'Complete your payment to begin the design and development process.',
            icon: <CreditCardIcon className="w-6 h-6" />,
            section: 'Payments',
            status: getStepStatus('payment'),
            estimatedTime: '5 minutes',
        },
        {
            id: 'design',
            title: 'Design & Development',
            description: 'Our team creates your website based on your specifications.',
            icon: <ClockIcon className="w-6 h-6" />,
            section: 'Projects',
            status: getStepStatus('design'),
            estimatedTime: '3-7 business days',
        },
        {
            id: 'feedback',
            title: 'Review & Feedback',
            description: 'Preview your website and request any changes or revisions.',
            icon: <EyeIcon className="w-6 h-6" />,
            section: 'Projects',
            status: getStepStatus('feedback'),
            estimatedTime: '1-2 business days',
        },
        {
            id: 'launch',
            title: 'Website Launch',
            description: 'Your completed website is delivered and goes live.',
            icon: <RocketLaunchIcon className="w-6 h-6" />,
            section: 'Projects',
            status: getStepStatus('launch'),
            estimatedTime: '1 business day',
        },
    ];

    const getStatusColor = (status: ProjectStep['status']) => {
        switch (status) {
            case 'completed':
                return 'text-success-700 bg-success-50 border-success-200';
            case 'current':
                return 'text-accent-700 bg-accent-50 border-accent-200';
            case 'upcoming':
                return 'text-neutral-500 bg-neutral-50 border-neutral-200';
            default:
                return 'text-neutral-500 bg-neutral-50 border-neutral-200';
        }
    };



    const handleSectionNavigation = (section: string) => {
        console.log(`Attempting to navigate to ${section} section`);
        if (onNavigateToSection) {
            onNavigateToSection(section);
            console.log(`Navigation callback executed for ${section}`);
        } else {
            console.warn(`No navigation callback provided for ${section} section`);
        }
    };

    // Progress bar helper functions - 6 journey steps
    const progressSteps = ['submitted', 'waiting_for_confirmation', 'confirmed', 'in_progress', 'review', 'completed'];

    const getProgressPercentage = (status: string) => {
        // Map 9 status values to 6 journey steps
        const statusToStepIndex: Record<string, number> = {
            'new': 0,
            'submitted': 0,
            'waiting_for_confirmation': 1,
            'confirmed': 2,
            'in_progress': 3,
            'in_design': 3,
            'review': 4,
            'final_delivery': 4,
            'completed': 5
        };

        const stepIndex = statusToStepIndex[status];
        if (stepIndex === undefined) return 0;
        return ((stepIndex + 1) / progressSteps.length) * 100;
    };

    const getProgressMessage = (status: string) => {
        const messageMap: Record<string, string> = {
            'submitted': 'Your project request has been submitted and is being reviewed.',
            'waiting_for_confirmation': 'Our team is reviewing your requirements and preparing confirmation.',
            'confirmed': '🎉 Great news! Your project has been confirmed and approved. Work will begin soon!',
            'payment': 'Ready for payment to begin design and development.',
            'design': 'Your website is being designed and developed by our team.',
            'feedback': 'Review your website and provide feedback for final adjustments.',
            'launch': 'Congratulations! Your website is ready to launch.',
        };
        return messageMap[status] || 'Project in progress...';
    };

    const getCurrentStepIndex = (status: string) => {
        // Map 9 status values to 6 journey step indices
        const statusToStepIndex: Record<string, number> = {
            'new': 0,
            'submitted': 0,
            'waiting_for_confirmation': 1,
            'confirmed': 2,
            'in_progress': 3,
            'in_design': 3,
            'review': 4,
            'final_delivery': 4,
            'completed': 5
        };

        return statusToStepIndex[status] || 0;
    };

    const getStepLabel = (step: string) => {
        const labelMap: Record<string, string> = {
            'submitted': 'START',
            'waiting_for_confirmation': 'CONFIRMATION',
            'confirmed': 'PAYMENT',
            'in_progress': 'DESIGN AND DEVELOPMENT',
            'review': 'REVIEW',
            'completed': 'DELIVERY'
        };
        return labelMap[step] || step;
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
        >
            {/* Welcome Message */}
            <motion.div variants={fadeInUp}>
                <Card className="p-8 bg-neutral-0 border border-neutral-200 shadow-minimal">
                    <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👋</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-semibold text-neutral-900 tracking-tight">
                                Welcome {userName}
                            </h2>
                            <p className="text-neutral-600 font-sans mt-1">
                                Your website project journey and next steps
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Modern Progress Bar */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white border border-neutral-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900">
                                Project Progress
                            </h3>
                            <p className="text-sm text-neutral-600 mt-1">
                                {getProgressMessage(currentProjectStatus)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-neutral-900">
                                {Math.round(getProgressPercentage(currentProjectStatus))}%
                            </div>
                            <div className="text-xs text-neutral-500">Complete</div>
                        </div>
                    </div>

                    {/* Clean Progress Bar */}
                    <div className="relative mb-6">
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                            <motion.div
                                className="h-2 bg-blue-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgressPercentage(currentProjectStatus)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Minimal Step Indicators */}
                    <div className="flex justify-between">
                        {progressSteps.map((step, index) => {
                            const currentIndex = getCurrentStepIndex(currentProjectStatus);
                            const isCompleted = index < currentIndex;
                            const isCurrent = index === currentIndex;

                            return (
                                <div key={step} className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isCompleted
                                        ? 'bg-green-500'
                                        : isCurrent
                                            ? 'bg-blue-600 ring-2 ring-blue-200'
                                            : 'bg-neutral-300'
                                        }`} />
                                    <span className={`text-xs mt-2 font-medium transition-colors duration-500 ${isCompleted
                                        ? 'text-green-600'
                                        : isCurrent
                                            ? 'text-blue-600'
                                            : 'text-neutral-400'
                                        }`}>
                                        {getStepLabel(step)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </motion.div>

            {/* Enhanced Project Journey Steps */}
            <motion.div variants={fadeInUp}>
                <Card className="p-8 bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-display font-semibold text-slate-800 tracking-tight">
                                Project Journey
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">
                                Detailed breakdown of your website development process
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">
                                {projectSteps.filter(s => s.status === 'completed').length}/{projectSteps.length}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">Steps Complete</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {projectSteps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                                className={`border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${expandedStep === step.id ? 'shadow-xl scale-[1.02]' : 'hover:shadow-md'
                                    } ${getStatusColor(step.status)} backdrop-blur-sm`}
                            >
                                <div
                                    className="p-5 cursor-pointer"
                                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Enhanced Step Number & Status */}
                                        <div className="flex items-center space-x-4">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step.status === 'completed'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                                : step.status === 'current'
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg ring-4 ring-blue-200 ring-opacity-50'
                                                    : 'bg-white border-2 border-slate-300 text-slate-600 shadow-sm'
                                                }`}>
                                                {step.status === 'completed' ? (
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                ) : (
                                                    <span className="text-sm font-bold">{index + 1}</span>
                                                )}
                                            </div>
                                            <div className="w-6 h-6 text-current opacity-80">
                                                {step.icon}
                                            </div>
                                        </div>

                                        {/* Enhanced Step Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-current text-lg mb-1">
                                                        {step.title}
                                                    </h4>
                                                    <p className="text-sm opacity-80 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className="text-xs opacity-75 mb-2 font-medium">
                                                        ⏱️ {step.estimatedTime}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSectionNavigation(step.section);
                                                        }}
                                                        className="text-xs font-medium hover:scale-105 transition-transform"
                                                    >
                                                        Go to {step.section} →
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Expanded Content */}
                                {expandedStep === step.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="px-5 pb-5 border-t border-current border-opacity-20 mt-4"
                                    >
                                        <div className="pt-4">
                                            <div className="bg-white bg-opacity-70 rounded-xl p-4 shadow-inner backdrop-blur-sm">
                                                <h5 className="font-semibold text-current mb-3 flex items-center">
                                                    <span className="w-2 h-2 bg-current rounded-full mr-2 opacity-60"></span>
                                                    What happens in this step:
                                                </h5>
                                                <div className="text-sm opacity-80 space-y-2">
                                                    {step.id === 'submission' && (
                                                        <ul className="space-y-2">
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Our team reviews your project requirements</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>We prepare a detailed project plan</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>You'll receive a confirmation email</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                    {step.id === 'waiting-confirmation' && (
                                                        <ul className="space-y-2">
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Detailed project analysis and planning</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Quote preparation and timeline estimation</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Confirmation email with next steps</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                    {step.id === 'payment' && (
                                                        <ul className="space-y-2">
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Secure payment processing via Stripe</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Multiple payment options available</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Instant confirmation and receipt</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                    {step.id === 'design' && (
                                                        <ul className="space-y-2">
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Professional design creation</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Development and testing</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Regular progress updates</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                    {step.id === 'feedback' && (
                                                        <ul className="space-y-2">
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Preview your website draft</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Request changes or revisions</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Approve the final design</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                    {step.id === 'launch' && (
                                                        <ul className="space-y-2">
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Final website files delivered</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Domain and hosting setup</span>
                                                            </li>
                                                            <li className="flex items-start space-x-2">
                                                                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60"></span>
                                                                <span>Website goes live</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </motion.div>




        </motion.div>
    );
};