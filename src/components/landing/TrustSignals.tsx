import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, scaleIn } from '../../utils/motion';
import { Card } from '../common';

export const TrustSignals: React.FC = () => {
    const testimonials = [
        {
            name: 'Sarah Johnson',
            company: 'Local Bakery Owner',
            text: 'Got my bakery website in just 5 days! The ordering process was so simple, and the result exceeded my expectations.',
            rating: 5,
            avatar: '👩‍💼'
        },
        {
            name: 'Mike Chen',
            company: 'Freelance Consultant',
            text: 'Perfect for my consulting business. No meetings, no hassle, just a professional WordPress site that works.',
            rating: 5,
            avatar: '👨‍💻'
        },
        {
            name: 'Lisa Rodriguez',
            company: 'E-commerce Store',
            text: 'The WooCommerce setup was flawless. Payment integration worked perfectly from day one.',
            rating: 5,
            avatar: '👩‍🚀'
        }
    ];

    const stats = [
        { number: '500+', label: 'WordPress Sites Delivered' },
        { number: '98%', label: 'Client Satisfaction' },
        { number: '5 Days', label: 'Average Delivery Time' },
        { number: '24/7', label: 'Support Available' }
    ];

    const guarantees = [
        {
            icon: '🔒',
            title: 'Secure Payment',
            description: 'SSL encrypted payments with Stripe, PayPal, and Interac e-Transfer'
        },
        {
            icon: '⚡',
            title: 'Fast Delivery',
            description: 'Most WordPress sites delivered within 5-7 business days'
        },
        {
            icon: '🛡️',
            title: 'Quality Guarantee',
            description: 'Free revisions until you\'re 100% satisfied with your site'
        },
        {
            icon: '📞',
            title: 'Ongoing Support',
            description: 'Maintenance plans available for updates, backups, and security'
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
            <div className="container mx-auto px-4">
                {/* Stats */}
                <motion.div
                    className="mb-20"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-center mb-12"
                        variants={fadeInUp}
                    >
                        Trusted by <span className="gradient-text">Businesses</span> Everywhere
                    </motion.h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="text-center"
                                variants={scaleIn}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-secondary-600 font-medium">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    className="mb-20"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <motion.h3
                        className="text-2xl font-semibold text-center mb-12"
                        variants={fadeInUp}
                    >
                        What Our Clients Say
                    </motion.h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card className="p-6 h-full">
                                    <div className="flex items-center mb-4">
                                        <span className="text-3xl mr-3">{testimonial.avatar}</span>
                                        <div>
                                            <div className="font-semibold text-secondary-900">
                                                {testimonial.name}
                                            </div>
                                            <div className="text-sm text-secondary-500">
                                                {testimonial.company}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex mb-3">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className="text-warning-400">⭐</span>
                                        ))}
                                    </div>

                                    <p className="text-secondary-600 italic">
                                        "{testimonial.text}"
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Guarantees */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <motion.h3
                        className="text-2xl font-semibold text-center mb-12"
                        variants={fadeInUp}
                    >
                        Our Guarantees
                    </motion.h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {guarantees.map((guarantee, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card className="p-6 text-center h-full hover:shadow-soft-lg transition-shadow duration-300">
                                    <div className="text-4xl mb-4">{guarantee.icon}</div>
                                    <h4 className="font-semibold text-secondary-900 mb-3">
                                        {guarantee.title}
                                    </h4>
                                    <p className="text-sm text-secondary-600 leading-relaxed">
                                        {guarantee.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};