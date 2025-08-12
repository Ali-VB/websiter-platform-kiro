import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, floatingVariants } from '../../utils/motion';
import { Button } from '../common';

export interface HeroProps {
    onStartProject: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartProject }) => {
    const handleGetStarted = () => {
        onStartProject();
    };

    const handleLearnMore = () => {
        // Scroll to features section
        const featuresSection = document.getElementById('features');
        featuresSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />

            {/* Floating background elements */}
            <motion.div
                className="absolute top-20 left-10 w-32 h-32 bg-primary-200/30 rounded-full blur-xl"
                variants={floatingVariants}
                animate="animate"
            />
            <motion.div
                className="absolute bottom-20 right-10 w-40 h-40 bg-accent-200/30 rounded-full blur-xl"
                variants={floatingVariants}
                animate="animate"
                style={{ animationDelay: '1s' }}
            />

            <div className="relative z-10 container mx-auto px-4 py-20">
                <motion.div
                    className="text-center max-w-5xl mx-auto"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Main headline */}
                    <motion.h1
                        className="text-5xl md:text-7xl font-cabin font-bold mb-6 leading-tight"
                        variants={fadeInUp}
                    >
                        <span className="gradient-text">You are here because
                        </span>
                        <br />
                        <span className="text-secondary-800">you need a website.</span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        className="text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                        variants={fadeInUp}
                    >
                        Professional websites without the meetings. Simple ordering, transparent pricing, fast delivery.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                        variants={fadeInUp}
                    >
                        <Button
                            size="xl"
                            onClick={handleGetStarted}
                            className="text-lg px-10 py-5 shadow-glow hover:shadow-glow-lg"
                        >
                            Start Your Project
                        </Button>
                        <Button
                            variant="outline"
                            size="xl"
                            onClick={handleLearnMore}
                            className="text-lg px-10 py-5"
                        >
                            See How It Works
                        </Button>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-8 text-secondary-500"
                        variants={fadeInUp}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <span className="font-medium">Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💎</span>
                            <span className="font-medium">Professional Quality</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🔒</span>
                            <span className="font-medium">Secure Payment</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
            >
                <motion.div
                    className="w-6 h-10 border-2 border-secondary-300 rounded-full flex justify-center"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <motion.div
                        className="w-1 h-3 bg-secondary-400 rounded-full mt-2"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};