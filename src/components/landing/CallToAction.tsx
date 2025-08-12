import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, pulseVariants } from '../../utils/motion';
import { Button } from '../common';

export interface CallToActionProps {
    onStartProject: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onStartProject }) => {
    const handleStartProject = () => {
        onStartProject();
    };

    const handleViewPricing = () => {
        // Scroll to pricing section
        const pricingSection = document.getElementById('pricing');
        pricingSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
                <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full"></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 border border-white rounded-full"></div>
                <div className="absolute bottom-32 right-1/3 w-24 h-24 border border-white rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    className="text-center max-w-4xl mx-auto"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                        variants={fadeInUp}
                    >
                        Ready to Get Your
                        <br />
                        <span className="text-accent-200">WordPress Site?</span>
                    </motion.h2>

                    <motion.p
                        className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed"
                        variants={fadeInUp}
                    >
                        Join hundreds of satisfied clients who got professional WordPress sites
                        without the hassle of meetings and endless revisions.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
                        variants={fadeInUp}
                    >
                        <motion.div
                            variants={pulseVariants}
                            animate="animate"
                        >
                            <Button
                                size="xl"
                                onClick={handleStartProject}
                                className="bg-white text-primary-600 hover:bg-secondary-50 text-lg px-12 py-6 shadow-soft-xl hover:shadow-glow-lg border-0"
                            >
                                Start Your Project Now
                            </Button>
                        </motion.div>

                        <Button
                            variant="outline"
                            size="xl"
                            onClick={handleViewPricing}
                            className="border-white text-white hover:bg-white hover:text-primary-600 text-lg px-12 py-6"
                        >
                            View Pricing
                        </Button>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp}>
                            <div className="text-3xl mb-2">⚡</div>
                            <div className="font-semibold mb-1">Fast Turnaround</div>
                            <div className="text-sm opacity-80">5-7 business days delivery</div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <div className="text-3xl mb-2">💎</div>
                            <div className="font-semibold mb-1">Professional Quality</div>
                            <div className="text-sm opacity-80">Custom WordPress development</div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <div className="text-3xl mb-2">🔒</div>
                            <div className="font-semibold mb-1">Secure & Reliable</div>
                            <div className="text-sm opacity-80">SSL, backups, and maintenance</div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="mt-12 text-center"
                        variants={fadeInUp}
                    >
                        <p className="text-sm opacity-75">
                            No contracts • No meetings • No hidden fees • 100% satisfaction guarantee
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};