import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import {
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AdminLoginProps {
    onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    const { adminSignIn } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log('Starting admin login process...');

            // Attempt admin sign in with timeout
            const loginPromise = adminSignIn(formData);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timeout - please try again')), 20000)
            );

            await Promise.race([loginPromise, timeoutPromise]);

            console.log('Admin login successful, calling onLoginSuccess...');

            // Small delay to ensure auth state is updated
            setTimeout(() => {
                onLoginSuccess();
            }, 100);

        } catch (error: any) {
            console.error('Admin login error:', error);

            // Handle specific error cases
            if (error.message?.includes('timeout')) {
                setError('Login timeout. Please check your connection and try again.');
            } else if (error.message?.includes('admin') || error.message?.includes('unauthorized')) {
                setError('Access denied. Admin credentials required.');
            } else if (error.message?.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please check your credentials.');
            } else {
                setError(error.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            System Management Portal
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Authorized personnel only
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
                        >
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-red-800 text-sm">{error}</span>
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="admin@websiter.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange('password')}
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Enter admin password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !formData.email || !formData.password}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Authenticating...
                                </div>
                            ) : (
                                'Access System'
                            )}
                        </Button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center text-xs text-gray-500">
                            <p className="mb-1">🔒 Secure connection established</p>
                            <p>All access attempts are logged and monitored</p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};