import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
//import { useWebsiteRequests } from '../../hooks/useWebsiteRequests';
import { useProjects } from '../../hooks/useProjects';
import { Button } from '../common';

type DashboardView = 'overview' | 'projects' | 'payments' | 'support' | 'settings';

interface DashboardSidebarProps {
    activeView: DashboardView;
    onViewChange: (view: DashboardView) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    activeView,
    onViewChange,
    isCollapsed,
    onToggleCollapse,
}) => {
    const { user, signOut } = useAuth();
    //const { requests } = useWebsiteRequests();
    const { projects } = useProjects();

    const navigationItems = [
        {
            id: 'overview' as const,
            label: 'Overview',
            icon: '📊',
            description: 'Dashboard summary',
            badge: null,
        },
        {
            id: 'projects' as const,
            label: 'Projects',
            icon: '🚀',
            description: 'Active projects',
            badge: projects.filter(p => p.status !== 'completed').length || null,
        },
        {
            id: 'payments' as const,
            label: 'Payments',
            icon: '💳',
            description: 'Billing & invoices',
            badge: null,
        },
        {
            id: 'support' as const,
            label: 'Support',
            icon: '🎧',
            description: 'Get help',
            badge: null,
        },
        {
            id: 'settings' as const,
            label: 'Settings',
            icon: '⚙️',
            description: 'Account settings',
            badge: null,
        },
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <motion.div
            className={`fixed left-0 top-0 h-full bg-gradient-card border-r border-neutral-200 shadow-elegant z-40 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
                }`}
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 bg-gradient-subtle">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <div className="w-10 h-10 bg-gradient-dark rounded-xl flex items-center justify-center shadow-soft animate-float">
                                <span className="text-neutral-0 font-display font-bold text-lg">W</span>
                            </div>
                            <div>
                                <div className="font-display font-semibold text-neutral-900 tracking-tight text-lg">Websiter</div>
                                <div className="text-sm text-neutral-600 font-sans">Dashboard</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 rounded-xl hover:bg-neutral-100 hover:scale-110 transition-all duration-300 group"
                    >
                        <span className="text-neutral-600 text-lg group-hover:text-neutral-800 transition-colors">
                            {isCollapsed ? '→' : '←'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6">
                <nav className="space-y-2 px-4">
                    {navigationItems.map((item, index) => (
                        <motion.button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-300 group hover:scale-[1.02] ${activeView === item.id
                                ? 'bg-gradient-dark text-neutral-0 shadow-floating'
                                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 hover:shadow-soft'
                                }`}
                        >
                            <span className={`text-2xl flex-shrink-0 transition-all duration-300 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-105'
                                }`}>{item.icon}</span>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="font-display font-semibold text-sm mb-1">{item.label}</div>
                                    <div className="text-xs opacity-75 truncate font-sans">{item.description}</div>
                                </div>
                            )}
                            {!isCollapsed && item.badge && (
                                <span className="bg-accent-500 text-neutral-0 text-xs rounded-full px-2.5 py-1 min-w-[24px] text-center font-medium shadow-soft animate-pulse-subtle">
                                    {item.badge}
                                </span>
                            )}
                        </motion.button>
                    ))}
                </nav>
            </div>

            {/* Stats Section */}
            {!isCollapsed && (
                <div className="px-4 py-4 border-t border-neutral-200">
                    <motion.div
                        className="bg-gradient-accent rounded-xl p-4 shadow-soft hover:shadow-elegant transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        <div className="text-sm font-display font-semibold text-neutral-800 mb-3">
                            Quick Stats
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="text-center bg-neutral-0/50 rounded-lg p-2 hover:bg-neutral-0/70 transition-colors">
                                <div className="font-bold text-xl text-success-600 mb-1">{projects.length}</div>
                                <div className="text-neutral-600 font-sans">Total Projects</div>
                            </div>
                            <div className="text-center bg-neutral-0/50 rounded-lg p-2 hover:bg-neutral-0/70 transition-colors">
                                <div className="font-bold text-xl text-accent-600 mb-1">{projects.filter(p => p.status === 'in_progress').length}</div>
                                <div className="text-neutral-600 font-sans">Active</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* User Section */}
            <div className="p-4 border-t border-neutral-200 bg-gradient-subtle">
                {!isCollapsed ? (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                    >
                        <div className="flex items-center gap-3 p-3 bg-neutral-0/50 rounded-xl hover:bg-neutral-0/70 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-soft animate-float">
                                <span className="text-white font-display font-bold text-lg">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-display font-semibold text-sm text-neutral-900 truncate">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-xs text-neutral-600 truncate font-sans">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="flex-1 text-xs hover:scale-105 transition-transform"
                            >
                                🏠 Home
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSignOut}
                                className="flex-1 text-xs text-error-600 hover:text-error-700 hover:bg-error-50 hover:scale-105 transition-all"
                            >
                                🚪 Exit
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full p-3 rounded-xl hover:bg-neutral-100 hover:scale-110 transition-all duration-300 group"
                            title="Home"
                        >
                            <span className="text-neutral-600 text-xl group-hover:text-neutral-800">🏠</span>
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full p-3 rounded-xl hover:bg-error-50 hover:scale-110 transition-all duration-300 group"
                            title="Sign Out"
                        >
                            <span className="text-error-600 text-xl group-hover:text-error-700">🚪</span>
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};