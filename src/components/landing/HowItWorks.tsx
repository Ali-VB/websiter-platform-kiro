import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, slideInLeft, slideInRight } from '../../utils/motion';

export const HowItWorks: React.FC = () => {
    const steps = [
        {
            number: '01',
            title: 'Choose Your Site Type',
            description: 'Select from company sites, e-commerce, blogs, landing pages, or personal portfolios.',
            icon: '🎯',
            direction: 'left'
        },
        {
            number: '02',
            title: 'Pick Your Features',
            description: 'Add contact forms ($100), blog sections ($200), payment integration ($250), and more.',
            icon: '⚙️',
            direction: 'right'
        },
        {
            number: '03',
            title: 'Domain & Hosting',
            description: 'Choose your domain name and hosting plan. We handle the technical setup for you.',
            icon: '🌐',
            direction: 'left'
        },
        {
            number: '04',
            title: 'Design Preferences',
            description: 'Select from our template gallery or provide inspiration for your custom design.',
            icon: '🎨',
            direction: 'right'
        },
        {
            number: '05',
            title: 'Brand & Content',
            description: 'Upload your logo, provide business details, and share your content with us.',
            icon: '📝',
            direction: 'left'
        },
        {
            number: '06',
            title: 'Review & Pay',
            description: 'See transparent pricing, apply promo codes, and pay securely online.',
            icon: '💳',
            direction: 'right'
        },
        {
            number: '07',
            title: 'Track Progress',
            description: 'Monitor your project through our dashboard from design to final delivery.',
            icon: '📊',
            direction: 'left'
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
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
                        How It <span className="gradient-text">Works</span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-secondary-600 max-w-3xl mx-auto"
                        variants={fadeInUp}
                    >
                        Our streamlined 7-step process gets you a professional WordPress site
                        without any meetings or back-and-forth emails.
                    </motion.p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="relative mb-12 last:mb-0"
                            variants={step.direction === 'left' ? slideInLeft : slideInRight}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={`flex items-center gap-8 ${step.direction === 'right' ? 'flex-row-reverse' : ''
                                }`}>
                                {/* Step Number */}
                                <div className="flex-shrink-0 w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-soft">
                                    {step.number}
                                </div>

                                {/* Content */}
                                <div className={`flex-1 ${step.direction === 'right' ? 'text-right' : 'text-left'
                                    }`}>
                                    <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-300">
                                        <div className={`flex items-center gap-4 mb-3 ${step.direction === 'right' ? 'flex-row-reverse' : ''
                                            }`}>
                                            <span className="text-3xl">{step.icon}</span>
                                            <h3 className="text-xl font-semibold text-secondary-900">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-secondary-600 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-10 top-20 w-0.5 h-12 bg-gradient-to-b from-primary-300 to-primary-100 transform -translate-x-1/2" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};