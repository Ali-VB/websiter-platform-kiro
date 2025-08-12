import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import { Card } from '../common';

export const Features: React.FC = () => {
    const features = [
        {
            icon: '🏢',
            title: 'Company & Portfolio Sites',
            description: 'Professional business websites with custom design and branding',
            price: 'Starting at $299',
            features: ['Custom Design', 'Mobile Responsive', 'Contact Forms', 'SEO Optimized']
        },
        {
            icon: '🛒',
            title: 'E-commerce Solutions',
            description: 'Full WooCommerce stores with payment integration and inventory management',
            price: 'Starting at $599',
            features: ['WooCommerce Setup', 'Payment Integration', 'Inventory Management', 'Order Tracking']
        },
        {
            icon: '📝',
            title: 'Blogs & Magazines',
            description: 'Content-rich websites with easy publishing and management systems',
            price: 'Starting at $399',
            features: ['Content Management', 'Author Profiles', 'Categories & Tags', 'Social Sharing']
        },
        {
            icon: '📄',
            title: 'Landing Pages',
            description: 'High-converting single-page sites for campaigns and lead generation',
            price: 'Starting at $199',
            features: ['Lead Capture', 'Analytics Integration', 'A/B Testing Ready', 'Fast Loading']
        },
        {
            icon: '👤',
            title: 'Personal Resume Sites',
            description: 'Professional online presence for career advancement and networking',
            price: 'Starting at $149',
            features: ['Portfolio Showcase', 'Downloadable Resume', 'Contact Integration', 'Social Links']
        },
        {
            icon: '📞',
            title: 'Contact & Mini Sites',
            description: 'Simple yet effective websites for local businesses and services',
            price: 'Starting at $99',
            features: ['Contact Forms', 'Location Maps', 'Service Listings', 'Quick Setup']
        }
    ];

    return (
        <section id="features" className="py-20 bg-white">
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
                        <span className="gradient-text">WordPress Sites</span> for Every Need
                    </motion.h2>
                    <motion.p
                        className="text-xl text-secondary-600 max-w-3xl mx-auto"
                        variants={fadeInUp}
                    >
                        Choose from our professionally designed WordPress site types. Each comes with
                        transparent pricing and no hidden fees.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {features.map((feature, index) => (
                        <motion.div key={index} variants={fadeInUp}>
                            <Card
                                hover
                                className="h-full p-8 text-center group cursor-pointer"
                            >
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-secondary-900">
                                    {feature.title}
                                </h3>
                                <p className="text-secondary-600 mb-4 leading-relaxed">
                                    {feature.description}
                                </p>
                                <div className="text-lg font-bold text-primary-600 mb-4">
                                    {feature.price}
                                </div>
                                <ul className="text-sm text-secondary-500 space-y-2">
                                    {feature.features.map((item, idx) => (
                                        <li key={idx} className="flex items-center justify-center gap-2">
                                            <span className="text-success-500">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};