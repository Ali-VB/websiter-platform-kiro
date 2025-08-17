import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../common';
import { PaymentForm } from '../payment/PaymentForm';
import { updateProjectStatusBasedOnPayments } from '../../utils/paymentHelpers';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import type { Database } from '../../types/database';
import toast from 'react-hot-toast';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface PaymentModalProps {
    project: ProjectRow | null;
    onClose: () => void;
    isOpen: boolean;
    paymentAmount?: number;
    paymentType?: 'initial' | 'final' | 'maintenance';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    project,
    onClose,
    isOpen,
    paymentAmount = 0,
    paymentType = 'final',
}) => {
    const [paymentCompleted, setPaymentCompleted] = useState(false);

    // Debug logging
    console.log('PaymentModal props:', {
        project: project?.title,
        isOpen,
        paymentAmount,
        paymentType
    });

    const handlePaymentSuccess = async (result: any) => {
        try {
            console.log('Payment successful:', result);
            console.log('Payment type:', paymentType);
            console.log('Project:', project);

            // Update project status based on payment type
            const newStatus = paymentType === 'initial' ? 'in_progress' : 'completed';
            console.log('Updating project status to:', newStatus);

            // Update project status based on actual payments
            if (project) {
                try {
                    // Wait a moment for payment to be recorded, then update status
                    setTimeout(async () => {
                        try {
                            await updateProjectStatusBasedOnPayments(project.id);
                            console.log('Project status updated based on payments');
                        } catch (error) {
                            console.error('Error updating project status:', error);
                        }
                    }, 1000);
                } catch (statusError) {
                    console.error('Error updating project status:', statusError);
                }
            }

            toast.success(`Payment successful! Your project status has been updated to ${newStatus === 'in_progress' ? 'In Progress' : 'Completed'}.`);
            setPaymentCompleted(true);

            // Close modal after a short delay
            setTimeout(() => {
                onClose();
                setPaymentCompleted(false);
                // Refresh the page to show updated progress
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error handling payment success:', error);
            toast.error('Payment was successful but there was an error updating your project. Please contact support.');
        }
    };

    const handlePaymentError = (error: any) => {
        console.error('Payment error:', error);
        toast.error('Payment failed. Please try again or contact support.');
    };

    if (!project) {
        return null;
    }

    // Prepare project data for payment
    const projectData = {
        id: project.id,
        clientId: project.client_id,
        totalAmount: paymentAmount,
        paymentOption: paymentType === 'initial' ? 'split' : 'full', // Use split for initial, full for final
        title: project.title,
        description: project.description,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="p-6"
            >
                {/* Header */}
                <motion.div variants={fadeInUp} className="mb-6">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-secondary-900">
                            💳 Make Payment
                        </h2>
                    </div>

                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <div className="font-medium text-primary-900">
                            Payment for: {project.title}
                        </div>
                        <div className="text-sm text-primary-700">
                            {project.description}
                        </div>
                        <div className="text-sm text-primary-600 mt-2">
                            Payment Type: {paymentType === 'initial' ? 'Initial Payment' :
                                paymentType === 'final' ? 'Final Payment' :
                                    'Maintenance Payment'}
                        </div>
                    </div>
                </motion.div>

                {paymentCompleted ? (
                    <motion.div variants={fadeInUp} className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-3xl">✅</div>
                        </div>
                        <h3 className="text-xl font-bold text-green-600 mb-2">
                            Payment Successful!
                        </h3>
                        <p className="text-secondary-600">
                            Your payment has been processed successfully. Your project status will be updated shortly.
                        </p>
                    </motion.div>
                ) : (
                    <PaymentForm
                        projectData={projectData}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                    />
                )}
            </motion.div>
        </Modal>
    );
};