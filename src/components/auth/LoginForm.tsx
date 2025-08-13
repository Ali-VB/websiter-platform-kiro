import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp } from '../../utils/motion';

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToSignUp?: () => void;
    onSwitchToReset?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    onSuccess,
    onSwitchToSignUp,
    onSwitchToReset,
}) => {
    const { signIn } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn(formData);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
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
                    Welcome Back
                </h2>
                <p className="text-secondary-600">
                    Sign in to continue your website project
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
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                        Password
                    </label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onSwitchToReset}
                        className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    className="text-base py-4"
                >
                    Sign In
                </Button>
            </form>

            <div className="mt-6">


            </div>

            <div className="mt-8 text-center">
                <p className="text-secondary-600">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToSignUp}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </motion.div>
    );
};