import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../utils/motion';
import { Button, Card } from '../../common';
import { SignUpForm, LoginForm } from '../../auth';
import { useAuth } from '../../../hooks/useAuth';
import type { OnboardingData } from '../OnboardingFlow';
import {
    CheckCircle,
    PartyPopper
} from 'lucide-react';

interface AuthStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack?: () => void;
    isLoading?: boolean;
}

export const AuthStep: React.FC<AuthStepProps> = ({
    data,
    onNext,
    onBack,
    isLoading = false,
}) => {
    const { user } = useAuth();
    const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

    // If user is already authenticated, proceed automatically
    React.useEffect(() => {
        if (user) {
            onNext({
                contactInfo: {
                    name: user.name,
                    email: user.email,
                },
                isExistingUser: true, // Mark as existing user
            });
        }
    }, [user, onNext]);

    const handleAuthSuccess = (isNewUser: boolean = false) => {
        // Pass user type information
        onNext({
            contactInfo: {
                name: user?.name || '',
                email: user?.email || '',
            },
            isExistingUser: !isNewUser, // If it's a new user, then not existing
        });
    };

    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-success-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                        Welcome back, {user.name}!
                    </h2>
                    <p className="text-secondary-600">
                        Proceeding with your website project...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4 flex items-center justify-center">
                        Almost There! <PartyPopper className="w-8 h-8 ml-2" />
                    </h1>
                    <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                        Create your account to save your project details and access your dashboard
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Project Summary */}
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                                Your Project Summary
                            </h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Website Type:</span>
                                    <span className="font-medium text-secondary-900">
                                        {data.websitePurpose?.type || 'Not selected'}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Base Price:</span>
                                    <span className="font-medium text-secondary-900">
                                        ${data.websitePurpose?.basePrice || 0}
                                    </span>
                                </div>

                                {data.additionalFeatures && data.additionalFeatures.length > 0 && (
                                    <div>
                                        <span className="text-secondary-600">Additional Features:</span>
                                        <ul className="mt-2 space-y-1">
                                            {data.additionalFeatures.map((feature, index) => (
                                                <li key={index} className="flex justify-between text-xs">
                                                    <span>{feature.name}</span>
                                                    <span>${feature.price}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total:</span>
                                        <span className="text-primary-600">
                                            ${data.totalPrice || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Auth Form */}
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-6">
                            <div className="mb-6">
                                <div className="flex rounded-lg bg-secondary-100 p-1">
                                    <button
                                        onClick={() => setAuthMode('signup')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMode === 'signup'
                                            ? 'bg-white text-secondary-900 shadow-sm'
                                            : 'text-secondary-600 hover:text-secondary-900'
                                            }`}
                                    >
                                        Create Account
                                    </button>
                                    <button
                                        onClick={() => setAuthMode('login')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMode === 'login'
                                            ? 'bg-white text-secondary-900 shadow-sm'
                                            : 'text-secondary-600 hover:text-secondary-900'
                                            }`}
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </div>

                            {authMode === 'signup' ? (
                                <SignUpForm
                                    onSuccess={() => handleAuthSuccess(true)} // New user
                                    onSwitchToLogin={() => setAuthMode('login')}
                                />
                            ) : (
                                <LoginForm
                                    onSuccess={() => handleAuthSuccess(false)} // Existing user
                                    onSwitchToSignUp={() => setAuthMode('signup')}
                                />
                            )}
                        </Card>
                    </motion.div>
                </div>

                {/* Navigation */}
                <motion.div
                    className="flex justify-between items-center mt-8"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.6 }}
                >
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        disabled={isLoading}
                        className="text-secondary-600"
                    >
                        ← Back
                    </Button>

                    <p className="text-sm text-secondary-500 text-center">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </motion.div>
            </div>
        </div>
    );
};