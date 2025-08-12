import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../utils/motion';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import type { OnboardingData } from '../OnboardingFlow';

export interface DomainHostingStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack?: () => void;
    onSkip?: () => void;
    isLoading: boolean;
}

export const DomainHostingStep: React.FC<DomainHostingStepProps> = ({
    data: _data,
    onNext,
    isLoading,
}) => {
    const [domainChoice, setDomainChoice] = useState<'existing' | 'new' | ''>('');
    const [existingDomain, setExistingDomain] = useState('');
    const [hostingChoice, setHostingChoice] = useState<'existing' | 'recommended' | 'budget' | ''>('');
    const [existingProvider, setExistingProvider] = useState('');
    const [showContinue, setShowContinue] = useState(false);

    useEffect(() => {
        // Show continue button when required choices are made
        const domainReady = domainChoice === 'new' || (domainChoice === 'existing' && existingDomain.trim());
        const hostingReady = hostingChoice === 'recommended' || hostingChoice === 'budget' ||
            (hostingChoice === 'existing' && existingProvider.trim());

        if (domainReady && hostingReady) {
            const timer = setTimeout(() => setShowContinue(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShowContinue(false);
        }
    }, [domainChoice, existingDomain, hostingChoice, existingProvider]);

    const handleContinue = () => {
        const domainData = {
            hasExisting: domainChoice === 'existing',
            domainName: domainChoice === 'existing' ? existingDomain : undefined,
            needsNew: domainChoice === 'new',
        };

        const hostingData = {
            hasExisting: hostingChoice === 'existing',
            provider: hostingChoice === 'existing' ? existingProvider : undefined,
            needsHosting: hostingChoice !== 'existing',
            selectedPlan: hostingChoice === 'recommended' ? 'recommended' : hostingChoice === 'budget' ? 'budget' : undefined,
            monthlyPrice: hostingChoice === 'recommended' ? 25 : hostingChoice === 'budget' ? 8 : 0,
        };

        onNext({
            domain: domainData,
            hosting: hostingData,
        });
    };

    return (
        <div className="space-y-6">
            {/* Question */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="text-3xl font-bold text-secondary-900 mb-3">
                    Domain & Hosting Setup
                </h2>
                <p className="text-secondary-600 text-lg">
                    Let's get your website online
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Domain Setup */}
                <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-semibold text-secondary-800 mb-4">Domain Setup</h3>

                    <div className="space-y-3">
                        <button
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${domainChoice === 'existing'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-secondary-200 bg-white hover:border-primary-300'
                                }`}
                            onClick={() => setDomainChoice('existing')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">✅</div>
                                <div>
                                    <div className="font-semibold text-secondary-900">I already have a domain</div>
                                    <div className="text-sm text-secondary-600">Enter your existing domain name</div>
                                </div>
                            </div>
                        </button>

                        {domainChoice === 'existing' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="ml-4"
                            >
                                <Input
                                    type="text"
                                    value={existingDomain}
                                    onChange={(e) => setExistingDomain(e.target.value)}
                                    placeholder="yourdomain.com"
                                    className="mt-2"
                                />
                            </motion.div>
                        )}

                        <button
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${domainChoice === 'new'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-secondary-200 bg-white hover:border-primary-300'
                                }`}
                            onClick={() => setDomainChoice('new')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🆕</div>
                                <div>
                                    <div className="font-semibold text-secondary-900">I need a new domain</div>
                                    <div className="text-sm text-secondary-600">We'll help you find one (CAD $20–30/year)</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Hosting Setup */}
                <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-semibold text-secondary-800 mb-4">Hosting Setup</h3>

                    <div className="space-y-3">
                        <button
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${hostingChoice === 'existing'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-secondary-200 bg-white hover:border-primary-300'
                                }`}
                            onClick={() => setHostingChoice('existing')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🏠</div>
                                <div>
                                    <div className="font-semibold text-secondary-900">I have hosting</div>
                                    <div className="text-sm text-secondary-600">Enter your hosting provider</div>
                                </div>
                            </div>
                        </button>

                        {hostingChoice === 'existing' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="ml-4"
                            >
                                <Input
                                    type="text"
                                    value={existingProvider}
                                    onChange={(e) => setExistingProvider(e.target.value)}
                                    placeholder="e.g., GoDaddy, Bluehost, SiteGround"
                                    className="mt-2"
                                />
                            </motion.div>
                        )}

                        <button
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${hostingChoice === 'recommended'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-secondary-200 bg-white hover:border-primary-300'
                                }`}
                            onClick={() => setHostingChoice('recommended')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">🚀</div>
                                    <div>
                                        <div className="font-semibold text-secondary-900">Recommended Hosting</div>
                                        <div className="text-sm text-secondary-600">SSL, backups, CDN, 99.9% uptime</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary-600">$25/mo</div>
                                    <div className="text-xs text-success-600 font-medium">Best Value</div>
                                </div>
                            </div>
                        </button>

                        <button
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${hostingChoice === 'budget'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-secondary-200 bg-white hover:border-primary-300'
                                }`}
                            onClick={() => setHostingChoice('budget')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">💰</div>
                                    <div>
                                        <div className="font-semibold text-secondary-900">Budget Hosting</div>
                                        <div className="text-sm text-secondary-600">Basic shared hosting</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary-600">$8/mo</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Continue Button */}
            <motion.div
                className="flex justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: showContinue ? 1 : 0,
                    y: showContinue ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
            >
                {showContinue && (
                    <Button
                        size="lg"
                        onClick={handleContinue}
                        loading={isLoading}
                        className="px-12 py-3 text-lg font-medium"
                    >
                        Continue to Maintenance
                    </Button>
                )}
            </motion.div>
        </div>
    );
};