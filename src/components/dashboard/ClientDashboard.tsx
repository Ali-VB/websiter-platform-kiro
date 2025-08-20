import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
// Removed useWebsiteRequests - using only projects now
import { useProjects } from '../../hooks/useProjects';
import { LoadingSpinner, Button } from '../common';
import { DashboardSidebar } from './DashboardSidebar';
import { ProjectOverview } from './ProjectOverview';
import { DashboardGuide } from './DashboardGuide';

import { SupportTickets } from './SupportTickets';
import { PaymentHistory } from './PaymentHistory';
import { DashboardSettings } from './DashboardSettings';
import { NotificationBell } from '../notifications/NotificationBell';
import { useTabVisibility } from '../../hooks/useTabVisibility';
import { fadeInUp } from '../../utils/motion';

type DashboardView = 'overview' | 'projects' | 'payments' | 'support' | 'settings';

interface ClientDashboardProps {
    onStartProject?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onStartProject }) => {
    const { user } = useAuth();
    const { projects, loading: projectsLoading } = useProjects();

    const [activeView, setActiveView] = useState<DashboardView>('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Ensure tab visibility events are dispatched
    useTabVisibility();

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





    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                        Access Denied
                    </h2>
                    <p className="text-secondary-600">
                        Please sign in to access your dashboard
                    </p>
                </div>
            </div>
        );
    }

    const loading = projectsLoading;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-secondary-600 mt-4">Loading your dashboard...</p>
                </div>
            </div>
        );
    }



    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                // Get active projects (not completed)
                const activeProjects = projects.filter(p => p.status !== 'completed');
                const allItems = projects.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                const currentProject = allItems[0];
                const hasActiveProject = activeProjects.length > 0;

                return (
                    <div className="space-y-8">
                        {currentProject ? (
                            <>
                                {/* Project Details Section - Moved to top */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900">Project Details</h3>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setActiveView('projects')}
                                            >
                                                Go to Projects →
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setActiveView('payments')}
                                            >
                                                Go to Payments →
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Enhanced Project Info Card */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-2xl font-bold text-gray-900 mb-2">{currentProject.title}</h4>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                                        {currentProject.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        ID: #{currentProject.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-4">{currentProject.description}</p>
                                            </div>
                                        </div>

                                        {/* Key Project Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white bg-opacity-70 rounded-lg p-4">
                                                <h5 className="font-semibold text-gray-900 mb-2">Project Type</h5>
                                                <p className="text-sm text-gray-700">
                                                    {(currentProject as any).website_type ?
                                                        (currentProject as any).website_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) + ' Website' :
                                                        'Custom Website'
                                                    }
                                                </p>
                                            </div>
                                            <div className="bg-white bg-opacity-70 rounded-lg p-4">
                                                <h5 className="font-semibold text-gray-900 mb-2">Started</h5>
                                                <p className="text-sm text-gray-700">
                                                    {new Date(currentProject.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="bg-white bg-opacity-70 rounded-lg p-4">
                                                <h5 className="font-semibold text-gray-900 mb-2">Features</h5>
                                                <p className="text-sm text-gray-700">
                                                    {(currentProject as any).features?.length > 0 ?
                                                        `${(currentProject as any).features.length} features selected` :
                                                        'Standard features included'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Journey Steps with integrated progress bar */}
                                <DashboardGuide
                                    userName={user?.name?.split(' ')[0] || 'there'}
                                    onNavigateToSection={(section) => {
                                        switch (section) {
                                            case 'Projects':
                                                setActiveView('projects');
                                                break;
                                            case 'Payments':
                                                setActiveView('payments');
                                                break;
                                            case 'Support':
                                                setActiveView('support');
                                                break;
                                            default:
                                                break;
                                        }
                                    }}
                                    currentProjectStatus={currentProject.status}
                                />



                                {/* 4. Need Help Section */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
                                    <p className="text-gray-600 mb-6">
                                        Have questions about your project? Our team is here to help you every step of the way.
                                    </p>
                                    <button
                                        onClick={() => setActiveView('support')}
                                        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                    >
                                        Create a Ticket
                                    </button>
                                </div>
                            </>
                        ) : !hasActiveProject ? (
                            <div className="text-center py-12">
                                <h2 className="text-2xl font-bold mb-4">No Active Projects</h2>
                                <p className="text-gray-600 mb-6">Start your website project with us!</p>
                                <button
                                    onClick={() => onStartProject?.()}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                                >
                                    Start New Project
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h2 className="text-2xl font-bold mb-4">Project Limit Reached</h2>
                                <p className="text-gray-600 mb-6">
                                    You can only have one active project at a time. Please complete your current project before starting a new one.
                                </p>
                                <button
                                    onClick={() => setActiveView('projects')}
                                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                                >
                                    View Current Project
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'projects':
                return <ProjectOverview projects={projects} onNavigateToSupport={() => setActiveView('support')} onStartProject={onStartProject} />;
            case 'payments':
                return <PaymentHistory projects={projects} />;
            case 'support':
                return <SupportTickets />;
            case 'settings':
                return <DashboardSettings />;
            default:
                return (
                    <div className="space-y-8">
                        <DashboardGuide
                            userName={user?.name?.split(' ')[0] || 'there'}
                            onNavigateToSection={(section) => {
                                switch (section) {
                                    case 'Projects':
                                        setActiveView('projects');
                                        break;
                                    case 'Payments':
                                        setActiveView('payments');
                                        break;
                                    case 'Support':
                                        setActiveView('support');
                                        break;
                                    default:
                                        break;
                                }
                            }}
                        />
                        <ProjectOverview projects={projects} />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Sidebar */}
            <DashboardSidebar
                activeView={activeView}
                onViewChange={setActiveView}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                {/* Top Bar */}
                <div className="bg-neutral-0 border-b border-neutral-200 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-display font-semibold text-neutral-900 tracking-tight">
                                {activeView === 'overview' && 'Dashboard'}
                                {activeView === 'projects' && 'Projects'}
                                {activeView === 'payments' && 'Payments'}
                                {activeView === 'support' && 'Support'}
                                {activeView === 'settings' && 'Settings'}
                            </h1>
                            <p className="text-neutral-600 text-sm mt-1 font-sans">
                                {activeView === 'overview' && 'Overview of your website projects'}
                                {activeView === 'projects' && 'Manage your website projects'}
                                {activeView === 'payments' && 'Payment history and billing'}
                                {activeView === 'support' && 'Help and support tickets'}
                                {activeView === 'settings' && 'Account preferences'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <NotificationBell />
                            <div className="text-sm text-neutral-500 font-sans">
                                {user.name}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <motion.div
                        key={activeView}
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {renderContent()}
                    </motion.div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {!sidebarCollapsed && (
                <div
                    className="fixed inset-0 bg-neutral-900 bg-opacity-40 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}




        </div>
    );
};