import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp } from '../../utils/motion';
import { SignUpSuccess } from './SignUpSuccess';

interface SignUpFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({

    onSwitchToLogin,
}) => {
    const { signUp } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await signUp({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            setShowSuccess(true);
        } catch (err: any) {
            console.error('Sign up error:', err);

            // Provide user-friendly error messages
            let errorMessage = 'Failed to create account';

            if (err.message?.includes('row-level security')) {
                errorMessage = 'There was a setup issue. Please try again or contact support.';
            } else if (err.message?.includes('already registered')) {
                errorMessage = 'An account with this email already exists. Try signing in instead.';
            } else if (err.message?.includes('invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (err.message?.includes('weak password')) {
                errorMessage = 'Password is too weak. Please choose a stronger password.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
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

    if (showSuccess) {
        return (
            <SignUpSuccess
                email={formData.email}
                onBackToLogin={onSwitchToLogin}
            />
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
                    Create Account
                </h2>
                <p className="text-secondary-600">
                    Join us to start your website project
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
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                        Full Name
                    </label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        disabled={loading}
                    />
                </div>

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
                        placeholder="Create a password"
                        required
                        disabled={loading}
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                        Must be at least 6 characters long
                    </p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                        Confirm Password
                    </label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
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
                    Create Account
                </Button>
            </form>

            <div className="mt-6">


            </div>

            <div className="mt-8 text-center">
                <p className="text-secondary-600">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </motion.div>
    );
};