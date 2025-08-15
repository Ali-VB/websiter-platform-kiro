import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { NotificationDropdown } from './NotificationDropdown';

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <BellIcon className="w-6 h-6" />
            </button>

            {isOpen && (
                <NotificationDropdown onClose={() => setIsOpen(false)} />
            )}
        </div>
    );
};