import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProjectViewModal } from './ProjectViewModal';
import { ProjectEditModal } from './ProjectEditModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { InvoiceModal } from './InvoiceModal';
import {
    EyeIcon,
    CalendarIcon,
    UserIcon,
    CurrencyDollarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { fadeInUp } from '../../utils/motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Project } from '../../types';

interface ProjectListProps {
    projects: Project[];
    onProjectUpdate?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
    projects,
    onProjectUpdate
}) => {
    const [sortBy, setSortBy] = useState<'created' | 'updated' | 'status' | 'client'>('created');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'blue';
            case 'in_design':
                return 'yellow';
            case 'review':
                return 'purple';
            case 'final_delivery':
                return 'orange';
            case 'completed':
                return 'green';
            default:
                return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new':
                return 'New Order';
            case 'in_design':
                return 'In Design';
            case 'review':
                return 'Review';
            case 'final_delivery':
                return 'Final Delivery';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'red';
            case 'medium':
                return 'yellow';
            case 'low':
                return 'green';
            default:
                return 'gray';
        }
    };

    const sortedProjects = [...projects].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'created':
                aValue = a.createdAt;
                bValue = b.createdAt;
                break;
            case 'updated':
                aValue = a.updatedAt;
                bValue = b.updatedAt;
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'client':
                aValue = a.clientName;
                bValue = b.clientName;
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

    const handleViewProject = (project: Project) => {
        setSelectedProject(project);
        setIsViewModalOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project);
        setIsViewModalOpen(false);
        setIsEditModalOpen(true);
    };

    const handleDeleteProject = (project: Project) => {
        setSelectedProject(project);
        setIsViewModalOpen(false);
        setIsDeleteModalOpen(true);
    };

    const handleMakeInvoice = (project: Project) => {
        setSelectedProject(project);
        setIsViewModalOpen(false);
        setIsInvoiceModalOpen(true);
    };

    const handleConfirmDelete = async (project: Project) => {
        setIsDeleting(true);
        try {
            console.log('Deleting project:', project.id);

            // Delete the project from the database
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', project.id);

            if (error) {
                throw error;
            }

            toast.success(`Project "${project.title}" deleted successfully`);

            // Close modals and refresh
            handleCloseModals();
            if (onProjectUpdate) {
                onProjectUpdate();
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseModals = () => {
        setSelectedProject(null);
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsInvoiceModalOpen(false);
    };

    const handleProjectUpdate = () => {
        handleCloseModals();
        if (onProjectUpdate) {
            onProjectUpdate();
        }
    };

    if (projects.length === 0) {
        return (
            <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-600">Projects will appear here once clients submit website requests.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with sorting */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        All Projects ({projects.length})
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Manage all website projects in list view
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field as typeof sortBy);
                            setSortOrder(order as 'asc' | 'desc');
                        }}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="created-desc">Newest First</option>
                        <option value="created-asc">Oldest First</option>
                        <option value="updated-desc">Recently Updated</option>
                        <option value="status-asc">Status</option>
                        <option value="client-asc">Client Name</option>
                    </select>
                </div>
            </div>

            {/* Project List */}
            <div className="space-y-4">
                {sortedProjects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {project.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm overflow-hidden" style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {project.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            <Badge
                                                color={getStatusColor(project.status)}
                                                size="sm"
                                            >
                                                {getStatusLabel(project.status)}
                                            </Badge>
                                            <Badge
                                                color={getPriorityColor(project.priority)}
                                                size="sm"
                                                variant="outline"
                                            >
                                                {project.priority}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <UserIcon className="w-4 h-4 mr-2" />
                                            <span>{project.clientName}</span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600">
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            <span>{project.createdAt.toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600">
                                            <ClockIcon className="w-4 h-4 mr-2" />
                                            <span>{project.updatedAt.toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600">
                                            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                                            <span>${project.price}</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    {project.features && project.features.length > 0 && (
                                        <div className="mb-4">
                                            <span className="text-sm text-gray-600 mr-2">Features:</span>
                                            <div className="inline-flex flex-wrap gap-1">
                                                {project.features.slice(0, 3).map((feature: any, idx: number) => (
                                                    <Badge key={idx} color="gray" size="xs">
                                                        {feature.name}
                                                    </Badge>
                                                ))}
                                                {project.features.length > 3 && (
                                                    <Badge color="gray" size="xs">
                                                        +{project.features.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Progress indicators */}
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        {/* Tasks removed - using simple approach */}
                                        <span>Messages: {project.messageCount || 0}</span>
                                        {project.dueDate && (
                                            <span>Due: {project.dueDate.toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center ml-4">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleViewProject(project)}
                                        className="flex items-center space-x-2"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        <span>View Details</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modals */}
            <ProjectViewModal
                project={selectedProject}
                isOpen={isViewModalOpen}
                onClose={handleCloseModals}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onMakeInvoice={handleMakeInvoice}
            />

            <ProjectEditModal
                project={selectedProject}
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                onUpdate={handleProjectUpdate}
            />

            <DeleteConfirmationModal
                project={selectedProject}
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />

            <InvoiceModal
                project={selectedProject}
                isOpen={isInvoiceModalOpen}
                onClose={handleCloseModals}
            />
        </div>
    );
};