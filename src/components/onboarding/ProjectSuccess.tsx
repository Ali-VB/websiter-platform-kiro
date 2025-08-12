import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import { Button, Card } from '../common';
import type { OnboardingData } from './OnboardingFlow';

interface ProjectSuccessProps {
    data: OnboardingData;
    onBackToHome: () => void;
}

export const ProjectSuccess: React.FC<ProjectSuccessProps> = ({
    data,
    onBackToHome,
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-4xl text-center"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {/* Success Icon */}
                <motion.div
                    className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-8"
                    variants={fadeInUp}
                >
                    <svg className="w-12 h-12 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>

                {/* Main Message */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                        🎉 Project Submitted Successfully!
                    </h1>
                    <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
                        Thank you for choosing Websiter! Your website project has been received and our team will start working on it right away.
                    </p>
                </motion.div>

                {/* What Happens Next */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <Card className="p-8 text-left max-w-2xl mx-auto">
                        <h2 className="text-2xl font-semibold text-secondary-900 mb-6 text-center">
                            📋 What Happens Next?
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-primary-600 font-semibold text-sm">1</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900 mb-1">Email Confirmation</h3>
                                    <p className="text-secondary-600 text-sm">
                                        You'll receive a confirmation email at <strong>{data.contactInfo?.email}</strong> within the next few minutes with your project details and timeline.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-primary-600 font-semibold text-sm">2</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900 mb-1">Dashboard Access</h3>
                                    <p className="text-secondary-600 text-sm">
                                        Use the link in your email to access your personal dashboard where you can track progress, view drafts, and communicate with our team.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-primary-600 font-semibold text-sm">3</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900 mb-1">Design & Development</h3>
                                    <p className="text-secondary-600 text-sm">
                                        Our team will start designing your website and you'll receive regular updates through your dashboard.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-success-600 font-semibold text-sm">✓</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900 mb-1">Website Delivery</h3>
                                    <p className="text-secondary-600 text-sm">
                                        Your completed website will be delivered according to the timeline discussed, with full training and support.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Project Summary */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <Card className="p-6 max-w-md mx-auto">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Project Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Project ID:</span>
                                <span className="font-mono text-secondary-900">
                                    #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Total Investment:</span>
                                <span className="font-semibold text-primary-600">
                                    ${data.totalPrice || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Contact Email:</span>
                                <span className="text-secondary-900">
                                    {data.contactInfo?.email}
                                </span>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Important Notes */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 max-w-2xl mx-auto">
                        <h3 className="font-semibold text-primary-800 mb-3">
                            📧 Important: Check Your Email
                        </h3>
                        <p className="text-primary-700 text-sm">
                            Please check your email (including spam folder) for important project information and dashboard access.
                            If you don't receive an email within 30 minutes, please contact our support team.
                        </p>
                    </div>
                </motion.div>

                {/* Action Button */}
                <motion.div variants={fadeInUp}>
                    <Button
                        onClick={onBackToHome}
                        size="lg"
                        className="px-8 py-4 text-lg shadow-glow hover:shadow-glow-lg"
                    >
                        Return to Homepage
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};