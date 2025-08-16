import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationService } from '../../services/supabase/notificationService';

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load unread count on mount and when dropdown closes
    useEffect(() => {
        loadUnreadCount();
    }, []);

    const loadUnreadCount = async () => {
        try {
            const result = await NotificationService.getUserNotifications(1, 50); // Get more to count unread
            const unread = result.notifications.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Refresh count when opening
            loadUnreadCount();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Refresh count when closing (in case user marked notifications as read)
        loadUnreadCount();
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown onClose={handleClose} />
            )}
        </div>
    );
};