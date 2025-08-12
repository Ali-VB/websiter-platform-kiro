import React from 'react';
import { motion } from 'framer-motion';

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: 'Product',
            links: [
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Features', href: '#features' },
                { label: 'Templates', href: '#templates' },
            ],
        },
        {
            title: 'Support',
            links: [
                { label: 'Help Center', href: '#help' },
                { label: 'Contact Us', href: '#contact' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Status', href: '#status' },
            ],
        },
        {
            title: 'Company',
            links: [
                { label: 'About', href: '#about' },
                { label: 'Blog', href: '#blog' },
                { label: 'Careers', href: '#careers' },
                { label: 'Press', href: '#press' },
            ],
        },
        {
            title: 'Legal',
            links: [
                { label: 'Privacy Policy', href: '#privacy' },
                { label: 'Terms of Service', href: '#terms' },
                { label: 'Cookie Policy', href: '#cookies' },
                { label: 'GDPR', href: '#gdpr' },
            ],
        },
    ];

    const socialLinks = [
        {
            label: 'Twitter',
            href: '#twitter',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
            ),
        },
        {
            label: 'LinkedIn',
            href: '#linkedin',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
        {
            label: 'GitHub',
            href: '#github',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
            ),
        },
    ];

    const handleLinkClick = (href: string) => {
        if (href.startsWith('#')) {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className={`bg-secondary-900 text-white ${className}`}>
            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            className="flex items-center space-x-2 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">W</span>
                            </div>
                            <span className="text-xl font-bold">Websiter</span>
                        </motion.div>

                        <motion.p
                            className="text-secondary-300 mb-6 max-w-sm leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Professional WordPress websites without the meetings.
                            Simple ordering, transparent pricing, fast delivery.
                        </motion.p>

                        {/* Social Links */}
                        <motion.div
                            className="flex space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 p-2 rounded-lg hover:bg-secondary-800"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </motion.div>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section, sectionIndex) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * (sectionIndex + 1) }}
                        >
                            <h3 className="font-semibold text-white mb-4">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLinkClick(link.href);
                                            }}
                                            className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 cursor-pointer"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter Signup */}
                <motion.div
                    className="border-t border-secondary-800 pt-8 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="max-w-md">
                        <h3 className="font-semibold text-white mb-2">Stay Updated</h3>
                        <p className="text-secondary-300 mb-4">
                            Get the latest updates on new features and WordPress tips.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            />
                            <motion.button
                                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Subscribe
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    className="border-t border-secondary-800 pt-8 flex flex-col md:flex-row justify-between items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <p className="text-secondary-400 text-sm mb-4 md:mb-0">
                        © {currentYear} Websiter. All rights reserved.
                    </p>

                    <div className="flex items-center space-x-6 text-sm">
                        <a
                            href="#privacy"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick('#privacy');
                            }}
                            className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 cursor-pointer"
                        >
                            Privacy
                        </a>
                        <a
                            href="#terms"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick('#terms');
                            }}
                            className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 cursor-pointer"
                        >
                            Terms
                        </a>
                        <a
                            href="#cookies"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick('#cookies');
                            }}
                            className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 cursor-pointer"
                        >
                            Cookies
                        </a>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};