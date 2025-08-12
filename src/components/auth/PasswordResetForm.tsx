import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp } from '../../utils/motion';

interface PasswordResetFormProps {
    onSuccess?: () => void;
    onBack?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
    onSuccess,
    onBack,
}) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await resetPassword(email);
            setSent(true);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <motion.div
                className="w-full max-w-md mx-auto text-center"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
            >
                <div className="mb-8">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                        Check Your Email
                    </h2>
                    <div className="text-left space-y-3 bg-primary-50 p-4 rounded-xl mb-6">
                        <p className="text-secondary-700 font-medium">
                            📧 We've sent a password reset link to:
                        </p>
                        <p className="text-primary-700 font-semibold text-lg">
                            {email}
                        </p>
                        <div className="text-sm text-secondary-600 space-y-2 mt-4">
                            <p><strong>Next steps:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Check your email inbox (and spam folder)</li>
                                <li>Click the "Reset Password" link in the email</li>
                                <li>Create your new password</li>
                                <li>Return here to sign in</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-secondary-500">
                        Didn't receive the email? Check your spam folder or try again.
                    </p>

                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setSent(false)}
                        className="text-base py-4"
                    >
                        Try Again
                    </Button>

                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={onBack}
                        className="text-base py-4"
                    >
                        Back to Sign In
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="w-full max-w-md mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                    Reset Password
                </h2>
                <p className="text-secondary-600">
                    Enter your email address and we'll send you a link to reset your password
                </p>
            </div>

            {error && (
                <motion.div
                    className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                        Email Address
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                    />
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    className="text-base py-4"
                >
                    Send Reset Link
                </Button>
            </form>

            <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                    ← Back to Sign In
                </button>
            </div>
        </motion.div>
    );
};