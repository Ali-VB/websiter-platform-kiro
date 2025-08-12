import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { fadeInUp, staggerContainer } from '../../utils/motion';

interface PaymentSuccessProps {
    paymentResult?: any;
    projectData?: any;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
    paymentResult,
    projectData: _projectData,
}) => {
    // const navigate = useNavigate();

    useEffect(() => {
        // Auto-redirect to dashboard after 10 seconds
        const timer = setTimeout(() => {
            window.location.href = '/dashboard';
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    const handleGoToDashboard = () => {
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="max-w-2xl w-full"
            >
                <motion.div variants={fadeInUp}>
                    <Card className="p-8 text-center">
                        {/* Success Animation */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mb-6"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="text-4xl">✅</div>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <h1 className="text-3xl font-bold text-green-600 mb-4">
                                Payment Successful!
                            </h1>
                            <p className="text-lg text-secondary-700 mb-6">
                                Thank you for your payment. Your website project has been initiated and you'll receive a confirmation email shortly.
                            </p>
                        </motion.div>

                        {/* Payment Details */}
                        {paymentResult && (
                            <motion.div variants={fadeInUp}>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-green-800 mb-3">Payment Details</h3>
                                    <div className="space-y-2 text-sm text-green-700">
                                        <div className="flex justify-between">
                                            <span>Payment ID:</span>
                                            <span className="font-mono">{paymentResult.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Amount:</span>
                                            <span className="font-semibold">
                                                {paymentResult.amount ? `$${(paymentResult.amount / 100).toFixed(2)} CAD` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <span className="font-semibold capitalize">{paymentResult.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Next Steps */}
                        <motion.div variants={fadeInUp}>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-blue-800 mb-3">What happens next?</h3>
                                <div className="space-y-2 text-sm text-blue-700 text-left">
                                    <div className="flex items-start space-x-2">
                                        <span className="text-blue-500 mt-1">1.</span>
                                        <span>You'll receive a confirmation email with your project details</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className="text-blue-500 mt-1">2.</span>
                                        <span>Our team will review your requirements and start the design process</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className="text-blue-500 mt-1">3.</span>
                                        <span>You can track progress in your dashboard and receive updates</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className="text-blue-500 mt-1">4.</span>
                                        <span>We'll deliver your website within the agreed timeline</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div variants={fadeInUp} className="space-y-4">
                            <Button
                                onClick={handleGoToDashboard}
                                size="lg"
                                className="w-full bg-gradient-to-r from-primary-600 to-primary-700"
                            >
                                Go to Dashboard
                            </Button>

                            <div className="text-sm text-secondary-500">
                                You'll be automatically redirected to your dashboard in a few seconds
                            </div>
                        </motion.div>

                        {/* Support */}
                        <motion.div variants={fadeInUp} className="mt-8 pt-6 border-t border-secondary-200">
                            <div className="text-sm text-secondary-600">
                                <p className="mb-2">Need help or have questions?</p>
                                <div className="flex items-center justify-center space-x-4">
                                    <span>📧 support@websiter.com</span>
                                    <span>•</span>
                                    <span>💬 Live Chat</span>
                                </div>
                            </div>
                        </motion.div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};