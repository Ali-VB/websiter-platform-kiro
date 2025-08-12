import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import { Button, Card } from '../common';
import type { OnboardingData } from './OnboardingFlow';

interface ProjectCreatedProps {
    data: OnboardingData;
    onGoToDashboard: () => void;
}

export const ProjectCreated: React.FC<ProjectCreatedProps> = ({
    data,
    onGoToDashboard,
}) => {
    const [showModal, setShowModal] = useState(true);

    const DashboardGuideModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        🎉 Project Created Successfully!
                    </h2>
                    <p className="text-gray-600">
                        Welcome to your project dashboard! Here's how to make the most of it.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-3">📋 Your Dashboard Features:</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-xs">📁</span>
                                </div>
                                <div>
                                    <strong className="text-blue-900">Project Assets Upload</strong>
                                    <p className="text-blue-700">Upload your logo, images, content, and brand materials to help us get started</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-xs">📊</span>
                                </div>
                                <div>
                                    <strong className="text-blue-900">Progress Tracking</strong>
                                    <p className="text-blue-700">See real-time updates on your project's progress through each phase</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-xs">💬</span>
                                </div>
                                <div>
                                    <strong className="text-blue-900">Direct Communication</strong>
                                    <p className="text-blue-700">Create support tickets and communicate directly with our team</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-xs">💳</span>
                                </div>
                                <div>
                                    <strong className="text-blue-900">Payment & Invoices</strong>
                                    <p className="text-blue-700">View invoices and manage payments for your project</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 mb-3">🚀 Next Steps:</h3>
                        <div className="space-y-2 text-sm text-green-800">
                            <p>1. <strong>Upload your assets</strong> - The more materials you provide, the faster we can start</p>
                            <p>2. <strong>Check your project progress</strong> - We'll update your dashboard as we work</p>
                            <p>3. <strong>Stay in touch</strong> - Use the support section for any questions</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">💡 Pro Tip:</h3>
                        <p className="text-sm text-yellow-800">
                            The sooner you upload your project assets (logo, images, content), the faster we can begin working on your website!
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <Button
                        onClick={() => setShowModal(false)}
                        variant="outline"
                        className="flex-1"
                    >
                        I'll explore later
                    </Button>
                    <Button
                        onClick={() => {
                            setShowModal(false);
                            onGoToDashboard();
                        }}
                        variant="primary"
                        className="flex-1"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </motion.div>
        </div>
    );

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
                        🎉 Project Created Successfully!
                    </h1>
                    <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
                        Your website project is ready to begin! Access your dashboard to upload assets, track progress, and communicate with our team.
                    </p>
                </motion.div>

                {/* Project Summary */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <Card className="p-6 max-w-md mx-auto">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Project Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Project Type:</span>
                                <span className="font-medium text-secondary-900">
                                    {data.websitePurpose?.type || 'Custom Website'}
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

                {/* Action Button */}
                <motion.div variants={fadeInUp}>
                    <Button
                        onClick={onGoToDashboard}
                        size="lg"
                        className="px-8 py-4 text-lg shadow-glow hover:shadow-glow-lg"
                    >
                        Access Your Dashboard
                    </Button>
                </motion.div>
            </motion.div>

            {/* Dashboard Guide Modal */}
            {showModal && <DashboardGuideModal />}
        </div>
    );
};