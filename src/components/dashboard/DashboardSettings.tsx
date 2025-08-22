import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import { useToast } from '../../hooks/use-toast';

interface DashboardSettingsProps {
    onRequestDelete: () => void;
}

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({ onRequestDelete }) => {
    const { user, updatePassword } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        retypeNewPassword: '',
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordData.currentPassword) {
            toast({ title: 'Error', description: 'Please enter your current password.', variant: 'destructive' });
            return;
        }

        if (passwordData.newPassword !== passwordData.retypeNewPassword) {
            toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
            return;
        }
        setLoading(true);

        try {
            await updatePassword(passwordData.currentPassword, passwordData.newPassword);
            toast({ title: 'Success', description: 'Password updated successfully!' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                retypeNewPassword: '',
            });
        } catch (error: any) {
            console.error('Failed to update password:', error);
            toast({ title: 'Error', description: `Failed to update password: ${error.message}`, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData(prev => ({
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

                    <form className="space-y-4">
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
                                    disabled
                                    className="bg-secondary-50"
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
                            </div>
                        </div>
                    </form>
                </Card>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                        🔒 Security
                    </h2>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="currentPassword"
                                    className="block text-sm font-medium text-secondary-700 mb-2"
                                >
                                    Current Password
                                </label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    placeholder="Enter your current password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block text-sm font-medium text-secondary-700 mb-2"
                                >
                                    New Password
                                </label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="retypeNewPassword"
                                    className="block text-sm font-medium text-secondary-700 mb-2"
                                >
                                    Retype New Password
                                </label>
                                <Input
                                    id="retypeNewPassword"
                                    name="retypeNewPassword"
                                    type="password"
                                    placeholder="Retype your new password"
                                    value={passwordData.retypeNewPassword}
                                    onChange={handlePasswordInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                loading={loading}
                                className="px-6"
                            >
                                Change Password
                            </Button>
                        </div>
                    </form>
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
                                    To delete your account, please create a support ticket.
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-error-300 text-error-700 hover:bg-error-100"
                                onClick={onRequestDelete}
                            >
                                Go to Support
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default DashboardSettings;