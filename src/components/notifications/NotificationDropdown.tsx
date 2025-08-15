import React, { useState, useEffect } from 'react';
import { NotificationService } from '../../services/supabase/notificationService';
import type { Notification } from '../../services/supabase/notificationService';

interface NotificationDropdownProps {
    onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const loadNotifications = async (pageNum: number = 1) => {
        setLoading(true);
        try {
            const result = await NotificationService.getUserNotifications(pageNum, 5);
            if (pageNum === 1) {
                setNotifications(result.notifications);
            } else {
                setNotifications(prev => [...prev, ...result.notifications]);
            }
            setHasMore(result.hasMore);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadNotifications(1);
    }, []);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading && page === 1 ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 text-sm">
                                            {notification.title}
                                        </h4>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hasMore && (
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => {
                                const nextPage = page + 1;
                                setPage(nextPage);
                                loadNotifications(nextPage);
                            }}
                            disabled={loading}
                            className="w-full text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};