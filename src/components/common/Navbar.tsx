import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../auth';

import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
    className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const { user, signOut } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debug: Log user state changes
    useEffect(() => {
        console.log('Navbar user state:', user);
    }, [user]);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu and dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const navbar = document.getElementById('navbar');
            if (navbar && !navbar.contains(event.target as Node)) {
                setIsOpen(false);
            }

            // Close user dropdown when clicking outside
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };

        if (isOpen || showUserDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, showUserDropdown]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navItems = [
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
    ];

    const handleNavClick = (href: string) => {
        setIsOpen(false);

        if (href.startsWith('#')) {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };



    const handleLogin = () => {
        setIsOpen(false);
        setShowAuthModal(true);
    };



    const handleSignOut = async () => {
        setIsOpen(false);
        try {
            await signOut();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <motion.nav
            id="navbar"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
                : 'bg-white/80 backdrop-blur-sm'
                } ${className}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-18">
                    {/* Logo */}
                    <motion.a
                        href="/"
                        className="cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="text-4xl font-bold text-gray-900 font-cabin">
                            websiter<span className="text-blue-600">.click</span>
                        </span>
                    </motion.a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center bg-gray-50 rounded-full px-1 py-0.2 border border-gray-200">
                        {navItems.map((item) => (
                            <motion.a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavClick(item.href);
                                }}
                                className="text-gray-500 hover:text-gray-700 font-cabin font-normal text-sm transition-all duration-200 cursor-pointer px-4 py-2 hover:bg-white hover:shadow-sm"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {item.label}
                            </motion.a>
                        ))}
                    </div>

                    {/* Desktop CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>


                                <div className="relative" ref={dropdownRef}>
                                    <motion.button
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {user.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-gray-600 font-cabin font-normal text-sm">
                                            {user.name}
                                        </span>
                                        <ChevronDownIcon
                                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </motion.button>

                                    {/* User Dropdown */}
                                    <AnimatePresence>
                                        {showUserDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[55]"
                                            >
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setShowUserDropdown(false);
                                                        window.location.href = '/dashboard';
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    {user.role === 'admin' ? '⚙️ Admin Panel' : '📊 Dashboard'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowUserDropdown(false);
                                                        handleSignOut();
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                                >
                                                    🚪 Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <Button
                                onClick={handleLogin}
                                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-cabin font-normal text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Sign In
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        className="md:hidden p-2 hover:bg-secondary-100 transition-colors duration-200"
                        onClick={() => setIsOpen(!isOpen)}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Toggle menu"
                        aria-expanded={isOpen}
                    >
                        <div className="w-6 h-6 flex flex-col justify-center items-center">
                            <motion.span
                                className={`block h-0.5 w-6 bg-secondary-600 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''
                                    }`}
                            />
                            <motion.span
                                className={`block h-0.5 w-6 bg-secondary-600 mt-1 transition-all duration-300 ${isOpen ? 'opacity-0' : ''
                                    }`}
                            />
                            <motion.span
                                className={`block h-0.5 w-6 bg-secondary-600 mt-1 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''
                                    }`}
                            />
                        </div>
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-md z-40"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="container mx-auto px-4 py-8">
                            <div className="flex flex-col space-y-6">
                                {/* Mobile Navigation Links */}
                                {navItems.map((item, index) => (
                                    <motion.a
                                        key={item.label}
                                        href={item.href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick(item.href);
                                        }}
                                        className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 py-3 px-4 hover:bg-gray-50 cursor-pointer"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {item.label}
                                    </motion.a>
                                ))}

                                {/* Mobile CTA Button */}
                                <motion.div
                                    className="flex flex-col pt-6 border-t border-gray-200"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {user ? (
                                        <>
                                            <div className="flex items-center space-x-3 py-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-medium text-sm">
                                                        {user.name?.charAt(0) || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-medium">{user.name}</p>
                                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        window.location.href = '/dashboard';
                                                    }}
                                                    className="w-full justify-center py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
                                                >
                                                    {user.role === 'admin' ? '⚙️ Admin Panel' : '📊 Dashboard'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleSignOut}
                                                    className="w-full justify-center py-3 text-red-600 border-red-300 hover:bg-red-50"
                                                >
                                                    🚪 Sign Out
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={handleLogin}
                                            className="w-full justify-center py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                                        >
                                            Sign In
                                        </Button>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialView="login"
            />
        </motion.nav>
    );
};