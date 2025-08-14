import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAllProjects } from '../../hooks/useProjects';
import { SupabaseProjectAssetsService } from '../../services/supabase/projectAssets';
import { Button } from '../common';

type AdminView = 'kanban' | 'projects' | 'clients' | 'support' | 'payments' | 'assets' | 'storage' | 'settings' | 'debug' | 'database';

interface AdminSidebarProps {
    activeView: AdminView;
    onViewChange: (view: AdminView) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeView,
    onViewChange,
    isCollapsed,
    onToggleCollapse,
}) => {
    const { user, signOut } = useAuth();
    const { projects } = useAllProjects();
    // const { requests } = useWebsiteRequests();

    // Get unique client count
    const uniqueClients = new Set(projects.map(p => p.clientId || p.clientEmail)).size;

    // Get total assets count - we'll use a state for this since it's async
    const [totalAssets, setTotalAssets] = React.useState(0);

    React.useEffect(() => {
        const loadAssetCount = async () => {
            try {
                const assets = await SupabaseProjectAssetsService.getAllAssets();
                setTotalAssets(assets.length);
            } catch (error) {
                console.error('Failed to load asset count:', error);
            }
        };
        loadAssetCount();
    }, []);

    const navigationItems = [
        {
            id: 'kanban' as const,
            label: 'Kanban Board',
            icon: '📋',
            description: 'Project management',
            badge: null,
        },
        {
            id: 'projects' as const,
            label: 'Project Management',
            icon: '🚀',
            description: 'Manage all projects & quotes',
            badge: projects.filter(p => p.status !== 'completed').length || null,
        },
        {
            id: 'clients' as const,
            label: 'Clients',
            icon: '👥',
            description: 'Client management',
            badge: uniqueClients || null,
        },
        {
            id: 'support' as const,
            label: 'Support Tickets',
            icon: '🎧',
            description: 'Manage support tickets',
            badge: null, // TODO: Add open tickets count
        },
        {
            id: 'payments' as const,
            label: 'Payments',
            icon: '💳',
            description: 'Payment management',
            badge: null, // TODO: Add pending payments count
        },
        {
            id: 'assets' as const,
            label: 'Project Assets',
            icon: '📁',
            description: 'Client uploaded files',
            badge: totalAssets || null,
        },
        {
            id: 'storage' as const,
            label: 'Storage Management',
            icon: '🗄️',
            description: 'Cleanup & optimize storage',
            badge: null,
        },
        {
            id: 'settings' as const,
            label: 'Settings',
            icon: '⚙️',
            description: 'Admin settings',
            badge: null,
        },
        {
            id: 'database' as const,
            label: 'Database Overview',
            icon: '📊',
            description: 'Database statistics',
            badge: null,
        },
        {
            id: 'debug' as const,
            label: 'Debug',
            icon: '🔍',
            description: 'Debug tools',
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
            className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
                }`}
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Admin Panel</div>
                                <div className="text-xs text-gray-600">Project Management</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={onToggleCollapse}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-gray-600">
                            {isCollapsed ? '→' : '←'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${activeView === item.id
                                ? 'bg-blue-100 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{item.label}</div>
                                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                                </div>
                            )}
                            {!isCollapsed && item.badge && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>



            {/* User Section */}
            <div className="p-4 border-t border-gray-200">
                {!isCollapsed ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {user?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 truncate">
                                    {user?.name || 'Admin'}
                                </div>
                                <div className="text-xs text-gray-600 truncate">
                                    {user?.email}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">
                                    Administrator
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="flex-1 text-xs"
                            >
                                Home
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSignOut}
                                className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Home"
                        >
                            <span className="text-gray-600">🏠</span>
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Sign Out"
                        >
                            <span className="text-red-600">🚪</span>
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};