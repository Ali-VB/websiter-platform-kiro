import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { PaymentForm } from '../../payment/PaymentForm';
import { PaymentSuccess } from '../../payment/PaymentSuccess';
import { staggerContainer, fadeInUp } from '../../../utils/motion';
// Removed supabase import - using ProjectService instead
import type { OnboardingData } from '../OnboardingFlow';
import toast from 'react-hot-toast';

export interface PaymentStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack?: () => void;
    isLoading: boolean;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
    data,
    onNext,
    onBack,
    isLoading: _isLoading,
}) => {
    const { user } = useAuth();
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const [projectId, setProjectId] = useState<string>('');

    const handlePaymentSuccess = async (result: any) => {
        try {
            console.log('Payment successful:', result);

            // Create project record directly (simplified approach)
            const { ProjectService } = await import('../../../services/supabase/projects');

            console.log('🔍 User authentication check:', {
                user: user,
                userId: user?.id,
                userIdType: typeof user?.id,
                userIdLength: user?.id?.length
            });

            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            console.log('🚀 About to create project with user ID:', user.id);
            const projectData = await ProjectService.createFromOnboardingData(data, user.id);

            console.log('✅ Project created successfully:', projectData);

            setProjectId(projectData.id);
            setPaymentResult(result);
            setPaymentCompleted(true);

            // Pass the project data to the next step
            onNext({
                ...data,
                projectId: projectData.id,
                paymentResult: result,
            });

        } catch (error) {
            console.error('Error handling payment success:', error);

            // Provide more specific error messages
            let errorMessage = 'There was an error saving your project. Please try again or contact support.';

            if (error instanceof Error) {
                if (error.message.includes('User not authenticated')) {
                    errorMessage = 'Please log in again to complete your project creation.';
                } else if (error.message.includes('Client ID is required')) {
                    errorMessage = 'Authentication error. Please refresh the page and try again.';
                }
            }

            toast.error(errorMessage);
        }
    };

    const handlePaymentError = (error: any) => {
        console.error('Payment error:', error);
        toast.error('Payment failed. Please try again or contact support.');
    };

    if (paymentCompleted) {
        return (
            <PaymentSuccess
                paymentResult={paymentResult}
                projectData={{ id: projectId, ...data }}
            />
        );
    }

    // Prepare project data for payment
    const projectData = {
        id: projectId || crypto.randomUUID(),
        clientId: user?.id || '',
        totalAmount: data.totalPrice || 0,
        paymentOption: data.paymentOption || 'full',
        title: `${data.websitePurpose?.type || 'Website'} for ${data.contactInfo?.name || 'Client'}`,
        description: `${data.websitePurpose?.type || 'Website'} project with ${data.additionalFeatures?.length || 0} additional features`,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="text-3xl font-bold text-secondary-900 mb-3">
                    Complete Your Payment
                </h2>
                <p className="text-secondary-600 text-lg">
                    Secure payment to start your website project
                </p>
            </motion.div>

            {/* Payment Form */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <PaymentForm
                    projectData={projectData}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                />
            </motion.div>

            {/* Back Button */}
            {onBack && (
                <motion.div
                    className="flex justify-center"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.3 }}
                >
                    <button
                        onClick={onBack}
                        className="text-secondary-600 hover:text-secondary-800 transition-colors duration-200"
                    >
                        ← Back to Summary
                    </button>
                </motion.div>
            )}
        </div>
    );
};