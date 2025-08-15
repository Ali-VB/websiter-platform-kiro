import React, { useState } from 'react';
import { NotificationService } from '../../services/supabase/notificationService';
import type { CustomUser } from '../../services/supabase/userSync';

export const NotificationPanel: React.FC = () => {
    const [users, setUsers] = useState<CustomUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [usersLoaded, setUsersLoaded] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'success' | 'warning' | 'error',
        recipient_id: '',
        is_global: false
    });

    const loadUsers = async () => {
        setLoading(true);
        try {
            const clientUsers = await NotificationService.getClientUsers();
            setUsers(clientUsers);
            setUsersLoaded(true);
        } catch (error) {
            console.error('Failed to load users:', error);
            alert('Failed to load users');
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.message) return;

        setLoading(true);
        try {
            if (formData.is_global) {
                await NotificationService.createGlobalNotification(formData);
            } else {
                await NotificationService.createUserNotification(formData);
            }

            // Reset form
            setFormData({
                title: '',
                message: '',
                type: 'info',
                recipient_id: '',
                is_global: false
            });

            alert('Notification created successfully!');
        } catch (error) {
            console.error('Failed to create notification:', error);
            alert('Failed to create notification');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Create Notification</h2>

            {!usersLoaded && (
                <button
                    onClick={loadUsers}
                    disabled={loading}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Loading Users...' : 'Load Users'}
                </button>
            )}

            {usersLoaded && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.is_global}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    is_global: e.target.checked,
                                    recipient_id: e.target.checked ? '' : prev.recipient_id
                                }))}
                                className="mr-2"
                            />
                            Send to all users (Global)
                        </label>
                    </div>

                    {!formData.is_global && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recipient
                            </label>
                            <select
                                value={formData.recipient_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, recipient_id: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required={!formData.is_global}
                            >
                                <option value="">Select a user</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Notification'}
                    </button>
                </form>
            )}
        </div>
    );
};