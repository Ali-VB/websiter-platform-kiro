import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { stripePromise, isStripeConfigured } from '../../services/stripe/config';
import { StripePaymentService } from '../../services/stripe/payments';
import { StripePaymentElement } from './StripePaymentElement';
import { PayPalPayment } from './PayPalPayment';
import { InteracPayment } from './InteracPayment';
import { Card } from '../common/Card';
// import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { fadeInUp } from '../../utils/motion';
import toast from 'react-hot-toast';

export interface PaymentFormProps {
    projectData: {
        id: string;
        clientId: string;
        totalAmount: number;
        paymentOption: string;
        title: string;
        description: string;
    };
    onPaymentSuccess: (paymentResult: any) => void;
    onPaymentError: (error: any) => void;
}

type PaymentMethod = 'stripe' | 'paypal' | 'interac';

export const PaymentForm: React.FC<PaymentFormProps> = ({
    projectData,
    onPaymentSuccess,
    onPaymentError,
}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');
    const [clientSecret, setClientSecret] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState<string>('');

    // Check if Stripe is configured
    if (!isStripeConfigured) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Payment System Not Configured
                    </h3>
                    <p className="text-gray-600 mb-4">
                        The payment system is not properly configured. Please contact support to process your payment.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                        <h4 className="font-medium text-yellow-800 mb-2">For Developers:</h4>
                        <p className="text-sm text-yellow-700">
                            Please set <code className="bg-yellow-100 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> in your .env file
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    const paymentAmounts = StripePaymentService.calculatePaymentAmounts(
        projectData.totalAmount,
        projectData.paymentOption
    );

    useEffect(() => {
        if (selectedMethod === 'stripe') {
            createPaymentIntent();
        }
    }, [selectedMethod, projectData]);

    const createPaymentIntent = async () => {
        try {
            setLoading(true);

            // Determine payment type and amount based on the payment being made
            let paymentType: 'initial' | 'final' = 'initial';
            let amount = paymentAmounts.initialAmount;

            // If this is a full payment or the initial amount equals total (meaning no split), it's a final payment
            if (projectData.paymentOption === 'full' || paymentAmounts.finalAmount === 0) {
                paymentType = 'final';
                amount = paymentAmounts.initialAmount; // This already includes any discount
            }

            console.log('Creating payment intent:', {
                amount,
                paymentType,
                projectData: projectData.title,
                paymentOption: projectData.paymentOption
            });

            const response = await StripePaymentService.createPaymentIntent({
                amount,
                currency: 'cad',
                projectId: projectData.id,
                clientId: projectData.clientId,
                paymentType,
                metadata: {
                    projectTitle: projectData.title,
                    paymentOption: projectData.paymentOption,
                },
            });

            setClientSecret(response.clientSecret);
            setPaymentIntentId(response.paymentIntentId);
        } catch (error) {
            console.error('Error creating payment intent:', error);
            toast.error('Failed to initialize payment. Please try again.');
            onPaymentError(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (result: any) => {
        try {
            // Confirm payment on server
            await StripePaymentService.confirmPayment(paymentIntentId);

            toast.success('Payment successful! Your project has been initiated.');
            onPaymentSuccess(result);
        } catch (error) {
            console.error('Error confirming payment:', error);
            toast.error('Payment processing error. Please contact support.');
            onPaymentError(error);
        }
    };

    const handlePaymentError = (error: any) => {
        console.error('Payment error:', error);
        toast.error(error.message || 'Payment failed. Please try again.');
        onPaymentError(error);
    };

    const paymentMethods = [
        {
            id: 'stripe' as PaymentMethod,
            name: 'Credit Card',
            icon: '💳',
            description: 'Visa, Mastercard, American Express',
            popular: true,
        },
        {
            id: 'paypal' as PaymentMethod,
            name: 'PayPal',
            icon: '🅿️',
            description: 'Pay with your PayPal account',
            popular: false,
        },
        {
            id: 'interac' as PaymentMethod,
            name: 'Interac e-Transfer',
            icon: '🇨🇦',
            description: 'Canadian clients only',
            popular: false,
        },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Payment Summary */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <Card className="p-6 bg-gradient-to-br from-primary-25 to-secondary-25 border border-primary-200">
                    <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                        💰 Payment Summary
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-700">Project Total:</span>
                            <span className="font-medium text-secondary-900">
                                {StripePaymentService.formatAmount(paymentAmounts.totalAmount)}
                            </span>
                        </div>

                        {paymentAmounts.discount > 0 && (
                            <div className="flex justify-between items-center text-green-600">
                                <span>Discount (5% for full payment):</span>
                                <span className="font-medium">
                                    -{StripePaymentService.formatAmount(paymentAmounts.discount)}
                                </span>
                            </div>
                        )}

                        <hr className="border-secondary-200" />

                        <div className="flex justify-between items-center text-lg font-bold">
                            <span className="text-secondary-900">Amount Due Now:</span>
                            <span className="text-primary-600">
                                {StripePaymentService.formatAmount(paymentAmounts.initialAmount)}
                            </span>
                        </div>

                        {paymentAmounts.finalAmount > 0 && (
                            <div className="text-sm text-secondary-600">
                                Remaining {StripePaymentService.formatAmount(paymentAmounts.finalAmount)} due on completion
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        Choose Payment Method
                    </h3>

                    <div className="space-y-3">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedMethod === method.id
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-secondary-200 hover:border-primary-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{method.icon}</span>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-secondary-900">
                                                    {method.name}
                                                </span>
                                                {method.popular && (
                                                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                                                        Popular
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-secondary-600">
                                                {method.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 ${selectedMethod === method.id
                                        ? 'border-primary-500 bg-primary-500'
                                        : 'border-secondary-300'
                                        }`}>
                                        {selectedMethod === method.id && (
                                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Payment Form */}
            <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 }}
            >
                <Card className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner size="lg" />
                            <span className="ml-3 text-secondary-600">Initializing payment...</span>
                        </div>
                    ) : (
                        <>
                            {selectedMethod === 'stripe' && clientSecret && (
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret,
                                        appearance: {
                                            theme: 'stripe',
                                            variables: {
                                                colorPrimary: '#3B82F6',
                                                colorBackground: '#ffffff',
                                                colorText: '#1F2937',
                                                colorDanger: '#EF4444',
                                                fontFamily: 'Inter, system-ui, sans-serif',
                                                spacingUnit: '4px',
                                                borderRadius: '8px',
                                            },
                                        },
                                    }}
                                >
                                    <StripePaymentElement
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                        amount={paymentAmounts.initialAmount}
                                    />
                                </Elements>
                            )}

                            {selectedMethod === 'paypal' && (
                                <PayPalPayment
                                    amount={paymentAmounts.initialAmount}
                                    currency="CAD"
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                />
                            )}

                            {selectedMethod === 'interac' && (
                                <InteracPayment
                                    amount={paymentAmounts.initialAmount}
                                    projectData={projectData}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                />
                            )}
                        </>
                    )}
                </Card>
            </motion.div>

            {/* Security Notice */}
            <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
                className="text-center"
            >
                <div className="flex items-center justify-center space-x-2 text-sm text-secondary-500">
                    <span>🔒</span>
                    <span>Your payment information is secure and encrypted</span>
                </div>
                <div className="text-xs text-secondary-400 mt-1">
                    We never store your payment details on our servers
                </div>
            </motion.div>
        </div>
    );
};