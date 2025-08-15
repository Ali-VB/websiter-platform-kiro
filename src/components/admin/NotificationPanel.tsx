import React, { useState } from 'react';
import { NotificationService } from '../../services/supabase/notificationService';
import type { CustomUser } from '../../services/supabase/userSync';

export const NotificationPanel: React.FC = () => {
    const [users, setUsers] = useState<CustomUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [usersLoaded, setUsersLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

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

            alert(`Notification created successfully! ${formData.is_global ? 'Sent to all users' : 'Sent to selected user'}`);
        } catch (error) {
            console.error('Failed to create notification:', error);
            alert('Failed to create notification');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Create Notification</h2>

            {/* Debug info */}
            <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                <strong>Debug:</strong> Loading: {loading ? 'true' : 'false'}, UsersLoaded: {usersLoaded ? 'true' : 'false'}, Users count: {users.length}
                {loadError && <div className="text-red-600 mt-1"><strong>Error:</strong> {loadError}</div>}
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
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        Reload Users
                    </button>
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