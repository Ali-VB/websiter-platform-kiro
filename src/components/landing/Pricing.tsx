import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import { Card, Button } from '../common';

export const Pricing: React.FC = () => {
    const addOns = [
        { name: 'Contact or booking form', price: 100 },
        { name: 'Blog/articles section', price: 200 },
        { name: 'Payment integration (Stripe, PayPal, Interac)', price: 250 },
        { name: 'Live chat (e.g. Tidio)', price: 150 },
        { name: 'Multilingual (EN/FR/FA)', price: 300 },
        { name: 'User registration system', price: 200 },
        { name: 'Easy content editing (CMS setup)', price: 150 },
        { name: 'Social media links', price: 50 },
        { name: 'WhatsApp/Telegram integration', price: 100 },
        { name: 'Automated emails (confirmations, newsletters)', price: 200 }
    ];

    const hostingPlans = [
        { name: 'Shared hosting', price: 50, description: '≈ CA $4–5/mo' },
        { name: 'Managed WordPress', price: 120, description: '≈ CA $10/mo' },
        { name: 'Premium managed/VPS', price: 240, description: '≈ CA $20+/mo' }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-6"
                        variants={fadeInUp}
                    >
                        <span className="gradient-text">Transparent</span> Pricing
                    </motion.h2>
                    <motion.p
                        className="text-xl text-secondary-600 max-w-3xl mx-auto"
                        variants={fadeInUp}
                    >
                        No hidden fees, no surprises. Pick exactly what you need and see the cost upfront.
                    </motion.p>
                </motion.div>

                {/* WordPress Features */}
                <motion.div
                    className="mb-16"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <motion.h3
                        className="text-2xl font-semibold text-center mb-8"
                        variants={fadeInUp}
                    >
                        WordPress Features & Add-ons
                    </motion.h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {addOns.map((addon, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card
                                    hover
                                    className="p-4 text-center group cursor-pointer"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-secondary-700 group-hover:text-secondary-900 transition-colors">
                                            {addon.name}
                                        </span>
                                        <span className="font-bold text-primary-600">
                                            ${addon.price}
                                        </span>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Hosting Plans */}
                <motion.div
                    className="mb-16"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <motion.h3
                        className="text-2xl font-semibold text-center mb-8"
                        variants={fadeInUp}
                    >
                        Hosting Plans (Annual)
                    </motion.h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {hostingPlans.map((plan, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card
                                    hover
                                    className="p-6 text-center group cursor-pointer h-full"
                                >
                                    <h4 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                                        {plan.name}
                                    </h4>
                                    <div className="text-2xl font-bold text-primary-600 mb-2">
                                        ${plan.price}/year
                                    </div>
                                    <p className="text-sm text-secondary-500">
                                        {plan.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Domain Registration */}
                <motion.div
                    className="text-center"
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <Card className="inline-block p-6">
                        <h3 className="text-xl font-semibold mb-2">Domain Registration</h3>
                        <div className="text-2xl font-bold text-primary-600 mb-2">$15/year</div>
                        <p className="text-secondary-600">
                            Professional domain name for your WordPress site
                        </p>
                    </Card>
                </motion.div>

                {/* CTA */}
                <motion.div
                    className="text-center mt-12"
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <Button
                        size="xl"
                        className="text-lg px-10 py-5 shadow-glow hover:shadow-glow-lg"
                    >
                        Calculate Your Project Cost
                    </Button>
                    <p className="text-sm text-secondary-500 mt-4">
                        Get an instant quote with our pricing calculator
                    </p>
                </motion.div>
            </div>
        </section>
    );
};