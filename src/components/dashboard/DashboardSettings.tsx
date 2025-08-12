import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp, staggerContainer } from '../../utils/motion';

export const DashboardSettings: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateProfile({
                name: formData.name,
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 max-w-4xl"
        >
            {/* Profile Settings */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                        👤 Profile Information
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                                    Full Name
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-secondary-50"
                                />
                                <p className="text-xs text-secondary-500 mt-1">
                                    Email cannot be changed. Contact support if needed.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                loading={loading}
                                className="px-6"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>

            {/* Account Information */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                        📋 Account Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm text-secondary-600 mb-1">Account Type</div>
                            <div className="font-medium text-secondary-900">
                                {user?.role === 'admin' ? 'Administrator' : 'Client'}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-secondary-600 mb-1">Member Since</div>
                            <div className="font-medium text-secondary-900">
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-secondary-600 mb-1">Onboarding Status</div>
                            <div className="font-medium text-secondary-900">
                                {user?.onboardingCompleted ? (
                                    <span className="text-success-600">✅ Completed</span>
                                ) : (
                                    <span className="text-warning-600">⏳ In Progress</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-secondary-600 mb-1">Account ID</div>
                            <div className="font-mono text-xs text-secondary-700 bg-secondary-50 px-2 py-1 rounded">
                                {user?.id?.slice(0, 8)}...
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Preferences */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                        ⚙️ Preferences
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                            <div>
                                <div className="font-medium text-secondary-900">Email Notifications</div>
                                <div className="text-sm text-secondary-600">Receive updates about your projects</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                            <div>
                                <div className="font-medium text-secondary-900">SMS Notifications</div>
                                <div className="text-sm text-secondary-600">Get text updates for urgent matters</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                        🔒 Security
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                            <div>
                                <div className="font-medium text-secondary-900">Password</div>
                                <div className="text-sm text-secondary-600">Last changed 30 days ago</div>
                            </div>
                            <Button variant="outline" size="sm">
                                Change Password
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                            <div>
                                <div className="font-medium text-secondary-900">Two-Factor Authentication</div>
                                <div className="text-sm text-secondary-600">Add an extra layer of security</div>
                            </div>
                            <Button variant="outline" size="sm">
                                Enable 2FA
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6 border-error-200">
                    <h2 className="text-xl font-semibold text-error-900 mb-4">
                        ⚠️ Danger Zone
                    </h2>

                    <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-error-900">Delete Account</div>
                                <div className="text-sm text-error-700">
                                    Permanently delete your account and all associated data
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-error-300 text-error-700 hover:bg-error-100"
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};