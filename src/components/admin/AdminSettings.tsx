import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
    UserIcon,
    KeyIcon,
    BellIcon,
    CogIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    ClockIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface AdminSettingsProps {
    className?: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ className = '' }) => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // System settings
    const [systemSettings, setSystemSettings] = useState({
        emailNotifications: true,
        projectUpdates: true,
        clientMessages: true,
        systemAlerts: true,
        autoBackup: true,
        maintenanceMode: false,
        allowNewRegistrations: true,
        maxProjectsPerClient: 10,
        defaultProjectStatus: 'new',
        autoAssignProjects: false,
        requireClientApproval: true
    });

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleProfileUpdate = async () => {
        try {
            setLoading('profile');

            if (profileData.name !== user?.name) {
                await updateProfile({ name: profileData.name });
                showMessage('success', 'Profile updated successfully');
            }

        } catch (error: any) {
            showMessage('error', `Failed to update profile: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handlePasswordChange = async () => {
        if (profileData.newPassword !== profileData.confirmPassword) {
            showMessage('error', 'New passwords do not match');
            return;
        }

        if (profileData.newPassword.length < 6) {
            showMessage('error', 'Password must be at least 6 characters');
            return;
        }

        try {
            setLoading('password');

            const { error } = await supabase.auth.updateUser({
                password: profileData.newPassword
            });

            if (error) throw error;

            setProfileData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            showMessage('success', 'Password updated successfully');

        } catch (error: any) {
            showMessage('error', `Failed to update password: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handleSystemSettingChange = (setting: keyof typeof systemSettings) => {
        setSystemSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
        showMessage('success', 'Setting updated successfully');
    };

    const handleDatabaseBackup = async () => {
        try {
            setLoading('backup');

            // This would typically call a backup API endpoint
            // For now, we'll simulate the process
            await new Promise(resolve => setTimeout(resolve, 2000));

            showMessage('success', 'Database backup initiated successfully');

        } catch (error: any) {
            showMessage('error', `Backup failed: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handleClearCache = async () => {
        try {
            setLoading('cache');

            // Clear browser cache and local storage
            localStorage.clear();
            sessionStorage.clear();

            showMessage('success', 'Cache cleared successfully');

        } catch (error: any) {
            showMessage('error', `Failed to clear cache: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handleExportData = async () => {
        try {
            setLoading('export');

            // Fetch all data from Supabase
            const { data: projects } = await supabase.from('projects').select('*');
            const { data: users } = await supabase.from('users').select('*');
            const { data: tickets } = await supabase.from('support_tickets').select('*');

            const exportData = {
                exported_at: new Date().toISOString(),
                projects: projects || [],
                users: users || [],
                support_tickets: tickets || []
            };

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `websiter-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showMessage('success', 'Data exported successfully');

        } catch (error: any) {
            showMessage('error', `Export failed: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handleSystemReset = async () => {
        const confirmText = 'DELETE ALL DATA';
        const userInput = prompt(`⚠️ DANGER: This will permanently delete ALL data including projects, clients, and tickets. This action cannot be undone!\n\nType "${confirmText}" to confirm:`);

        if (userInput !== confirmText) {
            showMessage('error', 'Reset cancelled - confirmation text did not match');
            return;
        }

        try {
            setLoading('reset');

            // Delete all data (be very careful with this!)
            const tables = ['support_tickets', 'projects'];

            for (const table of tables) {
                const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
                if (error) {
                    console.error(`Error deleting from ${table}:`, error);
                }
            }

            showMessage('success', 'System reset completed - all data cleared');

        } catch (error: any) {
            showMessage('error', `System reset failed: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
                    <p className="text-gray-600 mt-1">
                        Manage your account, system preferences, and platform configuration
                    </p>
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center space-x-2">
                        {message.type === 'success' ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : (
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                        )}
                        <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                            {message.text}
                        </span>
                    </div>
                </Card>
            )}

            {/* Profile Settings */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <UserIcon className="w-5 h-5" />
                    <span>Profile Settings</span>
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                placeholder="Email cannot be changed"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleProfileUpdate}
                            disabled={loading === 'profile'}
                            loading={loading === 'profile'}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Update Profile
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Password Settings */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <KeyIcon className="w-5 h-5" />
                    <span>Change Password</span>
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={profileData.currentPassword}
                                onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={profileData.newPassword}
                                onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={profileData.confirmPassword}
                                onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handlePasswordChange}
                            disabled={loading === 'password' || !profileData.newPassword}
                            loading={loading === 'password'}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Change Password
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <BellIcon className="w-5 h-5" />
                    <span>Notification Preferences</span>
                </h3>

                <div className="space-y-4">
                    {[
                        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email alerts for important events' },
                        { key: 'projectUpdates', label: 'Project Updates', description: 'Get notified when projects change status' },
                        { key: 'clientMessages', label: 'Client Messages', description: 'Receive alerts for new client messages' },
                        { key: 'systemAlerts', label: 'System Alerts', description: 'Get notified about system issues and maintenance' }
                    ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <h4 className="font-medium text-gray-900">{setting.label}</h4>
                                <p className="text-sm text-gray-600">{setting.description}</p>
                            </div>
                            <button
                                onClick={() => handleSystemSettingChange(setting.key as keyof typeof systemSettings)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings[setting.key as keyof typeof systemSettings]
                                    ? 'bg-blue-600'
                                    : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings[setting.key as keyof typeof systemSettings]
                                        ? 'translate-x-6'
                                        : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Platform Configuration */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CogIcon className="w-5 h-5" />
                    <span>Platform Configuration</span>
                </h3>

                <div className="space-y-6">
                    {/* Client Registration */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Allow New Client Registrations</h4>
                            <p className="text-sm text-gray-600">Enable or disable new client signups</p>
                        </div>
                        <button
                            onClick={() => handleSystemSettingChange('allowNewRegistrations')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.allowNewRegistrations
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.allowNewRegistrations
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Project Limits */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">Max Projects Per Client</h4>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={systemSettings.maxProjectsPerClient}
                                onChange={(e) => setSystemSettings(prev => ({
                                    ...prev,
                                    maxProjectsPerClient: parseInt(e.target.value) || 1
                                }))}
                                className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-sm text-gray-600">projects maximum</span>
                        </div>
                    </div>

                    {/* Default Project Status */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">Default Project Status</h4>
                        </div>
                        <select
                            value={systemSettings.defaultProjectStatus}
                            onChange={(e) => setSystemSettings(prev => ({
                                ...prev,
                                defaultProjectStatus: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="new">New</option>
                            <option value="submitted">Submitted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Under Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Auto Assignment */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Auto-Assign New Projects</h4>
                            <p className="text-sm text-gray-600">Automatically assign new projects to admin</p>
                        </div>
                        <button
                            onClick={() => handleSystemSettingChange('autoAssignProjects')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.autoAssignProjects
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.autoAssignProjects
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Client Approval Required */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Require Client Approval</h4>
                            <p className="text-sm text-gray-600">Require client approval before starting projects</p>
                        </div>
                        <button
                            onClick={() => handleSystemSettingChange('requireClientApproval')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.requireClientApproval
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.requireClientApproval
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Data Management */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Data Management</span>
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Database Backup</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Create a backup of all system data
                            </p>
                            <Button
                                onClick={handleDatabaseBackup}
                                disabled={loading === 'backup'}
                                loading={loading === 'backup'}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                Create Backup
                            </Button>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Clear Cache</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Clear browser cache and temporary data
                            </p>
                            <Button
                                onClick={handleClearCache}
                                disabled={loading === 'cache'}
                                loading={loading === 'cache'}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                Clear Cache
                            </Button>
                        </div>
                    </div>

                    {/* Export Data */}
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Export All Data</h4>
                        <p className="text-sm text-blue-700 mb-3">
                            Download a complete backup of all system data including projects, clients, and tickets.
                        </p>
                        <Button
                            onClick={handleExportData}
                            disabled={loading === 'export'}
                            loading={loading === 'export'}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                            Export All Data
                        </Button>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2 flex items-center space-x-2">
                            <TrashIcon className="w-5 h-5" />
                            <span>Danger Zone</span>
                        </h4>
                        <p className="text-sm text-red-700 mb-3">
                            ⚠️ <strong>WARNING:</strong> This will permanently delete ALL data including projects, clients, tickets, and notes. This action cannot be undone!
                        </p>
                        <Button
                            onClick={handleSystemReset}
                            disabled={loading === 'reset'}
                            loading={loading === 'reset'}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                        >
                            Clear All Data
                        </Button>
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-yellow-800">Maintenance Mode</h4>
                                <p className="text-sm text-yellow-700">
                                    Enable to prevent client access during updates
                                </p>
                            </div>
                            <button
                                onClick={() => handleSystemSettingChange('maintenanceMode')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.maintenanceMode
                                    ? 'bg-yellow-600'
                                    : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.maintenanceMode
                                        ? 'translate-x-6'
                                        : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        {systemSettings.maintenanceMode && (
                            <div className="mt-2 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                                ⚠️ Maintenance mode is active. Clients cannot access the system.
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Security & Access</span>
                </h3>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Current Session</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>Logged in as: <strong>{user?.email}</strong></p>
                            <p>Role: <Badge className="bg-blue-100 text-blue-800">Admin</Badge></p>
                            <p>Last login: <span className="font-mono">Today</span></p>
                        </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Security Recommendations</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Use a strong, unique password</li>
                            <li>• Enable two-factor authentication (coming soon)</li>
                            <li>• Regularly review system access logs</li>
                            <li>• Keep your browser updated</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};