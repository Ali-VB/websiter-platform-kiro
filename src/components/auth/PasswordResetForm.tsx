import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp } from '../../utils/motion';
import { useToast } from '../../hooks/use-toast';

interface PasswordResetFormProps {
    onSuccess?: () => void;
    onBack?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
    onSuccess,
    onBack,
}) => {
    const { resetPassword } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await resetPassword(email);
            toast({ title: 'Success', description: 'Password reset email sent. Check your inbox.', variant: 'success' });
            onSuccess?.(); // This will typically switch back to login view
        } catch (err: any) {
            console.error('Failed to send reset email:', err);
            toast({ title: 'Error', description: err.message || 'Failed to send reset email', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

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