import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, slideInLeft, slideInRight } from '../../utils/motion';

export const Process: React.FC = () => {
    const steps = [
        {
            number: '01',
            title: 'Choose Your Site Type',
            description: 'Select from company sites, e-commerce, blogs, landing pages, or personal portfolios.',
            icon: '🎯',
            side: 'left'
        },
        {
            number: '02',
            title: 'Pick Your Features',
            description: 'Add contact forms ($100), blog sections ($200), payment integration ($250), and more.',
            icon: '⚙️',
            side: 'right'
        },
        {
            number: '03',
            title: 'Domain & Hosting',
            description: 'Choose your domain name and hosting plan. We handle the technical setup for you.',
            icon: '🌐',
            side: 'left'
        },
        {
            number: '04',
            title: 'Design Preferences',
            description: 'Select from our template gallery or provide inspiration for your custom design.',
            icon: '🎨',
            side: 'right'
        },
        {
            number: '05',
            title: 'Brand & Content',
            description: 'Upload your logo, provide business details, and share your content with us.',
            icon: '📝',
            side: 'left'
        },
        {
            number: '06',
            title: 'Review & Pay',
            description: 'See your transparent pricing breakdown and complete payment via Stripe, PayPal, or Interac.',
            icon: '💳',
            side: 'right'
        },
        {
            number: '07',
            title: 'Track Progress',
            description: 'Monitor your project through our dashboard from design to final delivery.',
            icon: '📊',
            side: 'left'
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
                            className={`flex items-center mb-12 ${step.side === 'right' ? 'flex-row-reverse' : ''
                                }`}
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                        >
                            {/* Content */}
                            <motion.div
                                className={`flex-1 ${step.side === 'right' ? 'text-right pl-8' : 'text-left pr-8'
                                    }`}
                                variants={step.side === 'left' ? slideInLeft : slideInRight}
                            >
                                <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-shadow duration-300">
                                    <div className={`flex items-center gap-4 mb-4 ${step.side === 'right' ? 'justify-end' : 'justify-start'
                                        }`}>
                                        <div className="text-3xl">{step.icon}</div>
                                        <div className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                                            Step {step.number}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3 text-secondary-900">
                                        {step.title}
                                    </h3>
                                    <p className="text-secondary-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Timeline connector */}
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-glow"
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    {step.number}
                                </motion.div>
                                {index < steps.length - 1 && (
                                    <div className="w-1 h-16 bg-primary-200 mt-4" />
                                )}
                            </div>

                            {/* Spacer for alignment */}
                            <div className="flex-1" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};