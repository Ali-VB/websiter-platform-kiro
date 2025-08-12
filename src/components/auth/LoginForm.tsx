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
    const { signIn, signInWithGoogle } = useAuth();
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

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            await signInWithGoogle();
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
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
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-secondary-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-secondary-500">Or continue with</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    fullWidth
                    onClick={handleGoogleSignIn}
                    loading={loading}
                    className="mt-4 text-base py-4"
                    leftIcon={
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                    }
                >
                    Google
                </Button>
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