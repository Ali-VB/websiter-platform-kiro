import React, { useState, useEffect } from 'react';
import { NotificationService } from '../../services/supabase/notificationService';
import type { CustomUser } from '../../services/supabase/userSync';

const USERS_STORAGE_KEY = 'notification-panel-users';

export const NotificationPanel: React.FC = () => {
    const [users, setUsers] = useState<CustomUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [usersLoaded, setUsersLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);

    // Load users from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(USERS_STORAGE_KEY);
            if (saved) {
                const parsedUsers = JSON.parse(saved);
                console.log('📦 Loading saved users from localStorage:', parsedUsers.length, 'users');
                setUsers(parsedUsers);
                setUsersLoaded(true);
            }
        } catch (error) {
            console.error('Failed to load saved users:', error);
        }
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'success' | 'warning' | 'error',
        recipient_id: '',
        is_global: false
    });

    const loadUsers = async () => {
        console.log('🔄 Starting to load users...');
        setLoading(true);
        try {
            console.log('📞 Calling NotificationService.getClientUsers()...');
            const clientUsers = await NotificationService.getClientUsers();
            console.log('✅ Users loaded successfully:', clientUsers.length, 'users');
            console.log('👥 User details:', clientUsers);

            setUsers(clientUsers);
            setUsersLoaded(true);

            // Save to localStorage for persistence
            try {
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(clientUsers));
                console.log('💾 Saved users to localStorage');
            } catch (error) {
                console.error('Failed to save users to localStorage:', error);
            }

            console.log('🎯 State updated: usersLoaded=true, users.length=', clientUsers.length);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to load users:', error);
            setLoadError(errorMessage);
            setUsersLoaded(false);
        }
        setLoading(false);
        console.log('🏁 Load users completed');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.message) return;

        console.log('📝 Creating notification:', formData);
        setLoading(true);
        setCreateSuccess(null);

        try {
            if (formData.is_global) {
                console.log('🌍 Creating global notification...');
                await NotificationService.createGlobalNotification(formData);
                setCreateSuccess(`✅ Global notification "${formData.title}" sent to all users!`);
            } else {
                console.log('👤 Creating user-specific notification...');
                await NotificationService.createUserNotification(formData);
                const selectedUser = users.find(u => u.id === formData.recipient_id);
                setCreateSuccess(`✅ Notification "${formData.title}" sent to ${selectedUser?.name || 'selected user'}!`);
            }

            // Reset form
            setFormData({
                title: '',
                message: '',
                type: 'info',
                recipient_id: '',
                is_global: false
            });

            console.log('✅ Notification created successfully');
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
            alert(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Create Notification</h2>

            {/* Success message */}
            {createSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800">{createSuccess}</p>
                    <button
                        onClick={() => setCreateSuccess(null)}
                        className="mt-2 text-sm text-green-600 hover:text-green-800"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Debug info */}
            <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                <strong>Debug:</strong> Loading: {loading ? 'true' : 'false'}, UsersLoaded: {usersLoaded ? 'true' : 'false'}, Users count: {users.length}
                {loadError && <div className="text-red-600 mt-1"><strong>Error:</strong> {loadError}</div>}
                <div className="mt-1">
                    <strong>LocalStorage:</strong> {localStorage.getItem(USERS_STORAGE_KEY) ? `${JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]').length} users saved` : 'No saved users'}
                </div>
            </div>

            {!usersLoaded ? (
                <div className="mb-4">
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Loading Users...' : 'Load Users'}
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                        Click to load client users from the database
                    </p>

                    {/* Manual test button */}
                    <button
                        onClick={async () => {
                            console.log('🧪 Manual test: calling getClientUsers directly...');
                            try {
                                const result = await NotificationService.getClientUsers();
                                console.log('🧪 Manual test result:', result);
                                alert(`Manual test: Found ${result.length} users`);
                            } catch (error) {
                                console.error('🧪 Manual test error:', error);
                                alert(`Manual test failed: ${error}`);
                            }
                        }}
                        className="mt-2 px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                        🧪 Test getClientUsers
                    </button>
                </div>
            ) : (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 font-medium">
                        ✅ Users Loaded: {users.length} client users available
                    </p>
                    <div className="mt-2 space-x-2">
                        <button
                            onClick={loadUsers}
                            disabled={loading}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            Reload Users
                        </button>
                        <button
                            onClick={() => {
                                setUsers([]);
                                setUsersLoaded(false);
                                localStorage.removeItem(USERS_STORAGE_KEY);
                                console.log('🗑️ Cleared users cache');
                            }}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Clear Cache
                        </button>
                    </div>
                </div>
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

                    <div className="space-y-2">
                        <button
                            type="submit"
                            disabled={loading || (!formData.is_global && !formData.recipient_id)}
                            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Notification'}
                        </button>

                        {/* Quick test buttons */}
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    title: 'Welcome Message',
                                    message: 'Welcome to our platform! We are excited to have you here.',
                                    type: 'info',
                                    recipient_id: '',
                                    is_global: true
                                })}
                                className="flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                            >
                                📝 Fill Welcome
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    title: 'System Update',
                                    message: 'System maintenance scheduled for tonight 2-4 AM EST.',
                                    type: 'warning',
                                    recipient_id: '',
                                    is_global: true
                                })}
                                className="flex-1 px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                            >
                                ⚠️ Fill Warning
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};