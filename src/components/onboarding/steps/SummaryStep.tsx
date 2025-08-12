import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../../../utils/motion';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import type { OnboardingData } from '../OnboardingFlow';

export interface SummaryStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack?: () => void;
    onSkip?: () => void;
    isLoading: boolean;
}

const PURPOSE_LABELS: Record<string, string> = {
    business: '🏢 Business Introduction Website',
    blog: '📝 Personal Blog',
    store: '🛒 Online Store',
    booking: '📅 Appointment/Booking Website',
    custom: '⚡ Fully Custom Website (Coded)',
    portfolio: '🎨 Portfolio/Creative Website',
};

export const SummaryStep: React.FC<SummaryStepProps> = ({
    data,
    onNext,
    isLoading,
}) => {
    const [paymentOption, setPaymentOption] = useState<string>('');
    const [contactInfo, setContactInfo] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
    });
    const [showActions, setShowActions] = useState(false);

    useEffect(() => {
        // Show actions when contact info is filled
        if (contactInfo.name.trim() && contactInfo.email.trim()) {
            const timer = setTimeout(() => setShowActions(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShowActions(false);
        }
    }, [contactInfo]);

    const calculateTotals = () => {
        const basePrice = data.websitePurpose?.basePrice || 0;
        const featuresTotal = data.additionalFeatures?.reduce((sum: number, feature: { price: number }) => sum + feature.price, 0) || 0;
        const domainPrice = data.domain?.needsNew ? 25 : 0;
        const hostingPrice = data.hosting?.monthlyPrice ? data.hosting.monthlyPrice * 12 : 0; // Annual
        const maintenancePrice = data.maintenance?.monthlyPrice ? data.maintenance.monthlyPrice * 3 : 0; // 3 months

        const subtotal = basePrice + featuresTotal + domainPrice + hostingPrice + maintenancePrice;

        return {
            basePrice,
            featuresTotal,
            domainPrice,
            hostingPrice,
            maintenancePrice,
            subtotal,
        };
    };

    const totals = calculateTotals();

    const getPaymentOptions = () => {
        const fullPayDiscount = Math.round(totals.subtotal * 0.05);
        const fullPayTotal = totals.subtotal - fullPayDiscount;
        const halfNow = Math.round(totals.subtotal * 0.5);
        const monthlyPayment = Math.round(totals.subtotal / 3);

        return {
            fullPay: { total: fullPayTotal, discount: fullPayDiscount },
            halfNow: { now: halfNow, later: totals.subtotal - halfNow },
            monthly: { amount: monthlyPayment },
        };
    };

    const paymentOptions = getPaymentOptions();

    const handleSaveQuote = () => {
        // In a real app, this would save to backend
        const quoteData = {
            ...data,
            contactInfo,
            paymentOption,
            totalPrice: totals.subtotal,
            timestamp: new Date().toISOString(),
        };

        // TODO: Save quote to database and create project
        console.log('Quote data:', quoteData);
    };

    const handleSubmit = () => {
        if (!paymentOption) {
            alert('Please select a payment option');
            return;
        }

        const finalData = {
            ...data,
            contactInfo,
            paymentOption,
            totalPrice: totals.subtotal,
        };

        onNext(finalData);
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isFormValid = contactInfo.name.trim() && contactInfo.email.trim() && isValidEmail(contactInfo.email);

    return (
        <div className="space-y-8">
            {/* Question */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="text-3xl font-bold text-secondary-900 mb-3">
                    Summary & Payment Options
                </h2>
                <p className="text-secondary-600 text-lg">
                    Review your project details and choose how you'd like to proceed
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* Project Summary */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <Card
                        variant="elevated"
                        padding="lg"
                        className="bg-gradient-to-br from-primary-25 to-secondary-25 border border-primary-200"
                    >
                        <motion.div variants={fadeInUp}>
                            <h3 className="text-xl font-semibold text-secondary-800 mb-6">
                                📋 Your Website Project
                            </h3>

                            <div className="space-y-4">
                                {/* Purpose */}
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-secondary-600">Purpose:</span>
                                    <span className="text-secondary-900 text-right">
                                        {PURPOSE_LABELS[data.websitePurpose?.type || '']}
                                    </span>
                                </div>

                                {/* Features */}
                                {data.additionalFeatures && data.additionalFeatures.length > 0 && (
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium text-secondary-600">Features:</span>
                                        <div className="text-right">
                                            {data.additionalFeatures.map((feature: { name: string }, index: number) => (
                                                <div key={index} className="text-sm text-secondary-900">
                                                    {feature.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Domain */}
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-secondary-600">Domain:</span>
                                    <span className="text-secondary-900 text-right">
                                        {data.domain?.hasExisting ? `Existing: ${data.domain.domainName}` : 'New domain needed'}
                                    </span>
                                </div>

                                {/* Hosting */}
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-secondary-600">Hosting:</span>
                                    <span className="text-secondary-900 text-right">
                                        {data.hosting?.hasExisting
                                            ? `Existing: ${data.hosting.provider}`
                                            : data.hosting?.selectedPlan === 'recommended'
                                                ? 'Recommended ($25/month)'
                                                : 'Budget ($8/month)'
                                        }
                                    </span>
                                </div>

                                {/* Maintenance */}
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-secondary-600">Maintenance:</span>
                                    <span className="text-secondary-900 text-right">
                                        {data.maintenance?.plan === 'diy' ? 'DIY (Free)' :
                                            data.maintenance?.plan === 'basic' ? 'Peace of Mind ($75/month)' :
                                                data.maintenance?.plan === 'standard' ? 'Growth Partner ($175/month)' :
                                                    'Success Accelerator ($300/month)'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </Card>

                    {/* Pricing Breakdown */}
                    <motion.div variants={fadeInUp} className="mt-6">
                        <Card variant="elevated" padding="lg">
                            <h4 className="font-semibold text-secondary-800 mb-4">Investment Breakdown</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Website Foundation</span>
                                    <span>${totals.basePrice}</span>
                                </div>
                                {totals.featuresTotal > 0 && (
                                    <div className="flex justify-between">
                                        <span>Additional Features</span>
                                        <span>${totals.featuresTotal}</span>
                                    </div>
                                )}
                                {totals.domainPrice > 0 && (
                                    <div className="flex justify-between">
                                        <span>Domain (1 year)</span>
                                        <span>${totals.domainPrice}</span>
                                    </div>
                                )}
                                {totals.hostingPrice > 0 && (
                                    <div className="flex justify-between">
                                        <span>Hosting (1 year)</span>
                                        <span>${totals.hostingPrice}</span>
                                    </div>
                                )}
                                {totals.maintenancePrice > 0 && (
                                    <div className="flex justify-between">
                                        <span>Maintenance (3 months)</span>
                                        <span>${totals.maintenancePrice}</span>
                                    </div>
                                )}
                                <hr className="my-3" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Investment</span>
                                    <span>CAD ${totals.subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Contact & Payment */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-6"
                >
                    {/* Contact Information */}
                    <motion.div variants={fadeInUp}>
                        <Card variant="elevated" padding="lg">
                            <h4 className="font-semibold text-secondary-800 mb-4">Contact Information</h4>
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Your Name *"
                                    value={contactInfo.name}
                                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <Input
                                    type="email"
                                    placeholder="Email Address *"
                                    value={contactInfo.email}
                                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                                />
                                <Input
                                    type="tel"
                                    placeholder="Phone Number (optional)"
                                    value={contactInfo.phone}
                                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Company Name (optional)"
                                    value={contactInfo.company}
                                    onChange={(e) => setContactInfo(prev => ({ ...prev, company: e.target.value }))}
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Payment Options */}
                    <motion.div variants={fadeInUp}>
                        <Card variant="elevated" padding="lg">
                            <h4 className="font-semibold text-secondary-800 mb-4">💰 Payment Options</h4>
                            <div className="space-y-3">
                                <button
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${paymentOption === 'full' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'
                                        }`}
                                    onClick={() => setPaymentOption('full')}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">Pay in full (5% discount)</div>
                                            <div className="text-sm text-success-600">Save ${paymentOptions.fullPay.discount}</div>
                                        </div>
                                        <div className="font-bold">CAD ${paymentOptions.fullPay.total.toLocaleString()}</div>
                                    </div>
                                </button>

                                <button
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${paymentOption === 'split' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'
                                        }`}
                                    onClick={() => setPaymentOption('split')}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">50% now, 50% on completion</div>
                                            <div className="text-sm text-secondary-600">Most popular option</div>
                                        </div>
                                        <div className="font-bold">CAD ${paymentOptions.halfNow.now.toLocaleString()} now</div>
                                    </div>
                                </button>

                                <button
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${paymentOption === 'monthly' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'
                                        }`}
                                    onClick={() => setPaymentOption('monthly')}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">3 monthly payments</div>
                                            <div className="text-sm text-secondary-600">Spread the cost</div>
                                        </div>
                                        <div className="font-bold">CAD ${paymentOptions.monthly.amount.toLocaleString()}/month</div>
                                    </div>
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
                className="flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: showActions ? 1 : 0,
                    y: showActions ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
            >
                {showActions && (
                    <>
                        <div className="flex flex-col items-center gap-4">
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                loading={isLoading}
                                disabled={!isFormValid}
                                className="px-12 py-4 text-lg font-medium bg-gradient-to-r from-primary-600 to-primary-700"
                            >
                                🚀 Submit Project Request
                            </Button>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleSaveQuote}
                                    disabled={!isFormValid}
                                    className="px-6 py-3"
                                >
                                    💾 Save Quote & Decide Later
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="md"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid}
                                    className="px-6 py-3 text-secondary-600 hover:text-secondary-800"
                                >
                                    ❓ I Have Questions
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Helper Text */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <p className="text-sm text-secondary-500 mb-2">
                    🔒 Your information is secure and will never be shared with third parties
                </p>
                <p className="text-xs text-secondary-400">
                    Submit your request to get a detailed proposal within 24 hours, or save your quote to decide later
                </p>
            </motion.div>
        </div>
    );
};