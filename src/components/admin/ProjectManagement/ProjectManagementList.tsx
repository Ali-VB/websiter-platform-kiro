import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectCard } from './ProjectCard';
import { ProjectFilters } from './ProjectFilters';
import { ProjectMetrics } from './ProjectMetrics';
import { ProjectViewModal } from './ProjectViewModal';
import { ProjectManageModal } from './ProjectManageModal';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { useAllProjects } from '../../../hooks/useProjects';
import { transformProjectForAdmin, ProjectService } from '../../../services/supabase/projects';
// Removed useWebsiteRequests - using only projects now
import type { Project } from '../../../types';
import {
    FunnelIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ProjectFiltersType {
    status: string;
    client: string;
    projectType: string;
    dateRange: string;
    urgency: string;
    adminAssigned: string;
}

interface ProjectManagementListProps {
    className?: string;
}

export const ProjectManagementList: React.FC<ProjectManagementListProps> = ({ className = '' }) => {
    const { projects: rawProjects, loading: projectsLoading, error: projectsError } = useAllProjects();

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalType, setModalType] = useState<'view' | 'manage' | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showMetrics, setShowMetrics] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    const [filters, setFilters] = useState<ProjectFiltersType>({
        status: 'all',
        client: 'all',
        projectType: 'all',
        dateRange: 'all',
        urgency: 'all',
        adminAssigned: 'all'
    });

    const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'total_amount' | 'urgency'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const loading = projectsLoading;
    const error = projectsError;

    // SIMPLIFIED: Transform projects using our simple transformation
    const allProjects: Project[] = React.useMemo(() => {
        return rawProjects.map(transformProjectForAdmin);
    }, [rawProjects]);

    // Filter and search projects
    const filteredProjects = allProjects.filter(project => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!project.clientName.toLowerCase().includes(query) &&
                !project.clientEmail.toLowerCase().includes(query) &&
                !project.title.toLowerCase().includes(query) &&
                !project.description.toLowerCase().includes(query)) {
                return false;
            }
        }

        // Status filter
        if (filters.status !== 'all' && project.status !== filters.status) return false;

        // Client filter
        if (filters.client !== 'all' && project.clientId !== filters.client) return false;

        // Project type filter
        if (filters.projectType !== 'all' && project.websiteType !== filters.projectType) return false;

        // Urgency filter
        if (filters.urgency !== 'all' && project.urgencyLevel !== filters.urgency) return false;

        return true;
    });

    // Sort projects
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'created_at':
                aValue = a.createdAt;
                bValue = b.createdAt;
                break;
            case 'updated_at':
                aValue = a.updatedAt;
                bValue = b.updatedAt;
                break;
            case 'total_amount':
                aValue = a.price || 0;
                bValue = b.price || 0;
                break;
            case 'urgency':
                aValue = a.urgencyLevel === 'urgent' ? 2 : a.urgencyLevel === 'overdue' ? 3 : 1;
                bValue = b.urgencyLevel === 'urgent' ? 2 : b.urgencyLevel === 'overdue' ? 3 : 1;
                break;
            default:
                aValue = a.createdAt;
                bValue = b.createdAt;
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleProjectSelect = (project: Project, action: 'view' | 'manage') => {
        setSelectedProject(project);
        setModalType(action);
    };

    const handleProjectUpdate = async () => {
        // Data should update automatically via real-time subscription
        console.log('✅ Project updated - real-time subscription will handle refresh');

        // Optional: Add a small delay to ensure the update is processed
        setTimeout(() => {
            console.log('🔄 Project data should be refreshed by now');
        }, 500);
    };

    const handleSort = (field: typeof sortBy) => {
        if (field === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const getUrgencyCount = (level: 'normal' | 'urgent' | 'overdue') => {
        return sortedProjects.filter(project => project.urgencyLevel === level).length;
    };

    if (loading && sortedProjects.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600 mt-4">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
                    <p className="text-gray-600">
                        {sortedProjects.length} total projects • {getUrgencyCount('overdue')} overdue • {getUrgencyCount('urgent')} urgent
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMetrics(!showMetrics)}
                        className="flex items-center space-x-2"
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        <span>Metrics</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2"
                    >
                        <FunnelIcon className="w-4 h-4" />
                        <span>Filters</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleProjectUpdate}
                        className="flex items-center space-x-2"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search projects by client name, email, or project details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Metrics Panel */}
            <AnimatePresence>
                {showMetrics && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ProjectMetrics projects={sortedProjects} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ProjectFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            projects={sortedProjects}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sort Controls */}
            <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">Sort by:</span>
                <button
                    onClick={() => handleSort('created_at')}
                    className={`px-3 py-1 transition-colors ${sortBy === 'created_at'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Date Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                    onClick={() => handleSort('updated_at')}
                    className={`px-3 py-1 transition-colors ${sortBy === 'updated_at'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Last Updated {sortBy === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                    onClick={() => handleSort('total_amount')}
                    className={`px-3 py-1 transition-colors ${sortBy === 'total_amount'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Amount {sortBy === 'total_amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                    onClick={() => handleSort('urgency')}
                    className={`px-3 py-1 transition-colors ${sortBy === 'urgency'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Urgency {sortBy === 'urgency' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
            </div>

            {/* Error State */}
            {error && (
                <Card className="p-6 border-red-200 bg-red-50">
                    <div className="flex items-center space-x-3">
                        <div className="text-red-600">⚠️</div>
                        <div>
                            <h3 className="font-medium text-red-800">Error Loading Projects</h3>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleProjectUpdate}
                            className="ml-auto"
                        >
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {/* Projects Grid */}
            {sortedProjects.length === 0 && !loading ? (
                <Card className="p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600">
                        {searchQuery || Object.values(filters).some(f => f !== 'all')
                            ? 'Try adjusting your search or filters'
                            : 'New projects will appear here when clients submit requests'}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={(action) => handleProjectSelect(project, action)}
                        />
                    ))}
                </div>
            )}

            {/* Loading Overlay */}
            {loading && sortedProjects.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white p-6 flex items-center space-x-3">
                        <LoadingSpinner size="sm" />
                        <span>Updating projects...</span>
                    </div>
                </div>
            )}

            {/* Project Modals */}
            {selectedProject && modalType === 'view' && (
                <ProjectViewModal
                    project={selectedProject}
                    onClose={() => {
                        setSelectedProject(null);
                        setModalType(null);
                    }}
                    onConfirm={() => {
                        setModalType('manage');
                    }}
                    onUpdate={handleProjectUpdate}
                />
            )}

            {selectedProject && modalType === 'manage' && (
                <ProjectManageModal
                    project={selectedProject}
                    onClose={() => {
                        setSelectedProject(null);
                        setModalType(null);
                    }}
                    onUpdate={handleProjectUpdate}
                />
            )}
        </div>
    );
};