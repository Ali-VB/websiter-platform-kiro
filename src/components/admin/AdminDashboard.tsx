import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAllProjects } from '../../hooks/useProjects';
import { transformProjectForAdmin } from '../../services/supabase/projects';
import { AdminSidebar } from './AdminSidebar';
import { KanbanBoard } from './KanbanBoard';
import { SupportManagement } from './SupportManagement';
import { DebugDashboard } from './DebugDashboard';
import { DatabaseOverview } from './DatabaseOverview';
import { SimpleDatabaseOverview } from './SimpleDatabaseOverview';
import { StandaloneDatabaseOverview } from './StandaloneDatabaseOverview';
import { AdminSettings } from './AdminSettings';
import { PaymentManagement } from './PaymentManagement';
import { ProjectFilters } from './ProjectFilters';
import { ProjectStats } from './ProjectStats';
import { ProjectManagementList } from './ProjectManagement';
import { ClientList } from './ClientManagement';
import { ProjectAssets } from './ProjectAssets';
import { StorageManagement } from './StorageManagement';
import { UserSyncService } from '../../services/supabase/userSync';

import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import {
    FunnelIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { fadeInUp } from '../../utils/motion';

type AdminView = 'kanban' | 'projects' | 'clients' | 'support' | 'payments' | 'assets' | 'storage' | 'settings' | 'debug' | 'database';

interface AdminDashboardProps {
    className?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = '' }) => {
    const { user } = useAuth();
    const { projects: rawProjects, loading, error } = useAllProjects();
    const [activeView, setActiveView] = useState<AdminView>('kanban');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // SIMPLIFIED: Transform database projects using our simple transformation
    const projects = rawProjects.map(transformProjectForAdmin);

    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        status: 'all',
        websiteType: 'all',
        client: 'all',
        priority: 'all',
        dateRange: 'all'
    });

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-sync users on admin dashboard load
    useEffect(() => {
        const performAutoSync = async () => {
            try {
                console.log('🔄 Starting automatic user sync...');
                const result = await UserSyncService.syncAuthUsersToCustomTable();

                if (result.synced > 0) {
                    console.log(`✅ Auto-sync completed: ${result.synced} users synced`);
                }

                if (result.errors.length > 0) {
                    console.warn('⚠️ Auto-sync had errors:', result.errors);
                }
            } catch (error) {
                console.error('❌ Auto-sync failed:', error);
            }
        };

        // Run sync immediately when admin dashboard loads
        performAutoSync();

        // Set up periodic sync every 5 minutes
        const syncInterval = setInterval(performAutoSync, 5 * 60 * 1000);

        // Cleanup interval on unmount
        return () => clearInterval(syncInterval);
    }, []);

    const refreshProjects = () => {
        // The hook handles real-time updates automatically
        window.location.reload();
    };

    // Check if user is admin
    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600 mt-4">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={refreshProjects} variant="primary">
                        Try Again
                    </Button>
                </Card>
            </div>
        );
    }

    const filteredProjects = projects.filter(project => {
        if (filters.status !== 'all' && project.status !== filters.status) return false;
        if (filters.websiteType !== 'all' && project.websiteType !== filters.websiteType) return false;
        if (filters.client !== 'all' && project.clientId !== filters.client) return false;
        if (filters.priority !== 'all' && project.priority !== filters.priority) return false;
        return true;
    });

    const renderContent = () => {
        switch (activeView) {
            case 'kanban':
                return (
                    <div>
                        {/* Filters Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white border border-gray-200 rounded-lg mb-6"
                                >
                                    <ProjectFilters
                                        filters={filters}
                                        onFiltersChange={setFilters}
                                        projects={projects}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <KanbanBoard
                            projects={filteredProjects}
                            onProjectUpdate={refreshProjects}
                        />
                    </div>
                );
            case 'projects':
                return (
                    <ProjectManagementList />
                );
            case 'clients':
                return <ClientList />;
            case 'support':
                return <SupportManagement />;
            case 'payments':
                return <PaymentManagement />;
            case 'assets':
                return <ProjectAssets projects={projects} />;
            case 'storage':
                return <StorageManagement projects={projects} />;
            case 'settings':
                return <AdminSettings />;
            case 'debug':
                return <DebugDashboard />;
            case 'database':
                return <StandaloneDatabaseOverview key="standalone-db-overview" />;
            default:
                return (
                    <div>
                        <KanbanBoard
                            projects={filteredProjects}
                            onProjectUpdate={refreshProjects}
                        />
                    </div>
                );
        }
    };

    const getViewTitle = () => {
        switch (activeView) {
            case 'kanban':
                return '📋 Kanban Board';
            case 'projects':
                return '🚀 Project Management';
            case 'clients':
                return '👥 Client Management';
            case 'support':
                return '🎧 Support Tickets';
            case 'payments':
                return '💳 Payment Management';
            case 'assets':
                return '📁 Project Assets';
            case 'storage':
                return '🗄️ Storage Management';
            case 'settings':
                return '⚙️ Admin Settings';
            case 'debug':
                return '🔍 Debug Tools';
            case 'database':
                return '📊 Database Overview';
            default:
                return '📋 Kanban Board';
        }
    };

    const getViewDescription = () => {
        switch (activeView) {
            case 'kanban':
                return 'Manage projects with drag-and-drop workflow';
            case 'projects':
                return 'Manage all projects, quotes, and client requests in one place';
            case 'clients':
                return 'Manage client accounts and information';
            case 'support':
                return 'Manage and respond to client support tickets';
            case 'payments':
                return 'Monitor payments and process final payments';
            case 'assets':
                return 'View and manage all client-uploaded project assets';
            case 'storage':
                return 'Monitor storage usage and cleanup assets to optimize space';
            case 'settings':
                return 'Configure admin panel settings';
            case 'debug':
                return 'Debug tools and database inspection';
            case 'database':
                return 'Complete database overview with relationships and statistics';
            default:
                return 'Manage projects with drag-and-drop workflow';
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            {/* Sidebar */}
            <AdminSidebar
                activeView={activeView}
                onViewChange={setActiveView}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {getViewTitle()}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {getViewDescription()}
                            </p>
                        </div>

                        {activeView === 'kanban' && (
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center space-x-2"
                                >
                                    <FunnelIcon className="w-4 h-4" />
                                    <span>Filters</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <motion.div
                        key={activeView}
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {!sidebarCollapsed && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
        </div>
    );
};