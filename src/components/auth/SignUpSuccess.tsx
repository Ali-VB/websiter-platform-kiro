import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../utils/motion';
import { Button } from '../common';

interface SignUpSuccessProps {
    email: string;
    onBackToLogin?: () => void;
}

export const SignUpSuccess: React.FC<SignUpSuccessProps> = ({
    email,
    onBackToLogin,
}) => {
    return (
        <motion.div
            className="w-full max-w-md mx-auto text-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
        >
            <div className="mb-8">
                <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                    Account Created Successfully!
                </h2>

                <div className="text-left space-y-4 bg-primary-50 p-6 rounded-xl mb-6">
                    <div className="text-center mb-4">
                        <p className="text-secondary-700 font-medium">
                            📧 Confirmation email sent to:
                        </p>
                        <p className="text-primary-700 font-semibold text-lg mt-1">
                            {email}
                        </p>
                    </div>

                    <div className="text-sm text-secondary-700 space-y-3">
                        <div className="bg-white p-4 rounded-lg">
                            <p className="font-semibold text-secondary-800 mb-2">📋 Next Steps:</p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Check your email inbox (and spam folder)</li>
                                <li>Click the "Confirm Email" link in the email</li>
                                <li>You'll be automatically signed in</li>
                                <li>Start your website project!</li>
                            </ol>
                        </div>

                        <div className="bg-warning-50 border border-warning-200 p-3 rounded-lg">
                            <p className="text-warning-800 text-xs">
                                <strong>⚠️ Important:</strong> You must confirm your email before you can access your account and dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-secondary-500">
                    Didn't receive the email? Check your spam folder or contact support.
                </p>

                {onBackToLogin && (
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={onBackToLogin}
                        className="text-base py-4"
                    >
                        ← Back to Sign In
                    </Button>
                )}
            </div>
        </motion.div>
    );
};