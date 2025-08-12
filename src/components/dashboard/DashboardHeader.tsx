import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common';
import type { AuthUser } from '../../services/supabase/auth';

interface DashboardHeaderProps {
    user: AuthUser;
    activeView: string;
    onViewChange: (view: 'overview' | 'projects' | 'payments' | 'support') => void;
    requestsCount: number;
    projectsCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    user,
    activeView,
    onViewChange,
    requestsCount,
    projectsCount,
}) => {
    const navItems = [
        {
            id: 'overview',
            label: 'Overview',
            icon: '📊',
            description: 'Dashboard overview',
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: '🚀',
            description: `${projectsCount} active projects`,
            count: projectsCount,
        },
        {
            id: 'payments',
            label: 'Payments',
            icon: '💳',
            description: 'Payment history',
        },
        {
            id: 'support',
            label: 'Support',
            icon: '🎧',
            description: 'Get help',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                            Welcome back, {user.name}! 👋
                        </h1>
                        <p className="text-secondary-600">
                            Track your website projects, manage payments, and get support all in one place.
                        </p>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary-600">{requestsCount}</div>
                            <div className="text-sm text-secondary-600">Requests</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-success-600">{projectsCount}</div>
                            <div className="text-sm text-secondary-600">Projects</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Navigation Tabs */}
            <Card className="p-2">
                <div className="flex flex-wrap gap-2">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.id}
                            onClick={() => onViewChange(item.id as any)}
                            className={`flex-1 min-w-[120px] p-4 rounded-xl transition-all duration-200 ${activeView === item.id
                                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-1">{item.icon}</div>
                                <div className="font-medium text-sm">{item.label}</div>
                                <div className="text-xs opacity-75 mt-1">
                                    {item.description}
                                </div>
                                {item.count !== undefined && (
                                    <div className="inline-flex items-center justify-center w-5 h-5 bg-primary-500 text-white text-xs rounded-full mt-1">
                                        {item.count}
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </Card>
        </div>
    );
};