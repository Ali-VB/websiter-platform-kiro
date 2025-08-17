import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProjectViewModal } from './ProjectViewModal';
import type { Project } from '../../types';
import { updateProjectStatus } from '../../services/supabase/projects';
import {
    UserIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ChevronRightIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';

interface KanbanBoardProps {
    projects: Project[];
    onProjectUpdate: () => void;
}

// Database status values (must match database constraint exactly)
// Database status values (ONLY the ones that actually work in database)
const DB_STATUS_VALUES = {
    NEW: 'new',
    SUBMITTED: 'submitted',
    WAITING_FOR_CONFIRMATION: 'waiting_for_confirmation',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
} as const;

// Simplified Kanban workflow with smart database mapping
const KANBAN_COLUMNS = [
    {
        id: 'new_projects',
        title: 'New Projects',
        color: 'bg-blue-50 border-blue-200',
        headerColor: 'bg-blue-100 text-blue-800',
        // Maps to database statuses: 'new', 'submitted'
        dbStatuses: [DB_STATUS_VALUES.NEW, DB_STATUS_VALUES.SUBMITTED],
        nextAction: {
            status: DB_STATUS_VALUES.CONFIRMED,
            label: 'Confirm Project'
        }
    },
    {
        id: 'in_progress',
        title: 'In Progress',
        color: 'bg-yellow-50 border-yellow-200',
        headerColor: 'bg-yellow-100 text-yellow-800',
        // Maps to database statuses: 'waiting_for_confirmation', 'confirmed', 'in_progress', 'in_design'
        dbStatuses: [
            DB_STATUS_VALUES.WAITING_FOR_CONFIRMATION,
            DB_STATUS_VALUES.CONFIRMED,
            DB_STATUS_VALUES.IN_PROGRESS
        ],
        prevAction: {
            status: DB_STATUS_VALUES.NEW,
            label: 'Back to New'
        },
        nextAction: {
            status: DB_STATUS_VALUES.COMPLETED,
            label: 'Mark Complete'
        }
    },

    {
        id: 'completed',
        title: 'Completed',
        color: 'bg-green-50 border-green-200',
        headerColor: 'bg-green-100 text-green-800',
        // Maps to database status: 'completed'
        dbStatuses: [DB_STATUS_VALUES.COMPLETED],
        prevAction: {
            status: DB_STATUS_VALUES.IN_PROGRESS,
            label: 'Back to Progress'
        }
    }
];

// Helper function to map database status to Kanban column
const getKanbanColumnForStatus = (dbStatus: string): string => {
    for (const column of KANBAN_COLUMNS) {
        if ((column.dbStatuses as readonly string[]).includes(dbStatus)) {
            return column.id;
        }
    }
    return 'new_projects'; // Default fallback
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    projects,
    onProjectUpdate
}) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    // Group projects by Kanban column (not database status)
    const projectsByColumn = projects.reduce((acc, project) => {
        const dbStatus = project.status || 'new';
        const kanbanColumn = getKanbanColumnForStatus(dbStatus);

        if (!acc[kanbanColumn]) {
            acc[kanbanColumn] = [];
        }
        acc[kanbanColumn].push(project);
        return acc;
    }, {} as Record<string, Project[]>);

    // Update column counts
    const columnsWithCounts = KANBAN_COLUMNS.map(column => ({
        ...column,
        count: projectsByColumn[column.id]?.length || 0
    }));

    const handleStatusChange = async (projectId: string, newStatus: string) => {
        // Validate status value against database schema
        const validStatuses = Object.values(DB_STATUS_VALUES);
        if (!(validStatuses as string[]).includes(newStatus)) {
            console.error('❌ Invalid status value:', newStatus);
            console.error('Valid statuses are:', validStatuses);
            alert(`Invalid status value: ${newStatus}. Valid statuses are: ${validStatuses.join(', ')}`);
            return;
        }

        try {
            console.log('🔄 Updating project status:', {
                projectId,
                newStatus,
                currentStatus: projects.find(p => p.id === projectId)?.status
            });
            setLoading(projectId);
            await updateProjectStatus(projectId, newStatus as any);
            console.log('✅ Project status updated successfully');
            onProjectUpdate();
        } catch (error: any) {
            console.error('❌ Error updating project status:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                projectId,
                attemptedStatus: newStatus
            });

            // More helpful error message
            if (error.message?.includes('check constraint')) {
                alert(`Database constraint error: The status "${newStatus}" is not allowed. Please check the database schema.`);
            } else {
                alert(`Failed to update project status: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setLoading(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-CA', {
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'submitted':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'waiting_for_confirmation':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'confirmed':
                return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_design':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'review':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'final_delivery':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="h-full">
            <div className="flex space-x-6 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
                {columnsWithCounts.map((column) => (
                    <div key={column.id} className="flex-shrink-0 w-80">
                        {/* Column Header */}
                        <div className={`${column.color} border-2 rounded-t-lg p-4`}>
                            <div className={`${column.headerColor} rounded-lg px-3 py-2 flex items-center justify-between`}>
                                <h3 className="font-semibold">{column.title}</h3>
                                <Badge className="bg-white/20 text-current">
                                    {column.count}
                                </Badge>
                            </div>
                        </div>

                        {/* Column Content */}
                        <div className={`${column.color} border-x-2 border-b-2 rounded-b-lg min-h-[500px] p-4 space-y-3`}>
                            <AnimatePresence>
                                {(projectsByColumn[column.id] || []).map((project) => (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                            {/* Project Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <UserIcon className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 text-sm">
                                                            {project.clientName}
                                                        </h4>
                                                        <div className="flex flex-col space-y-1">
                                                            <Badge className={getStatusColor(project.status)} size="sm">
                                                                {project.status.replace('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedProject(project)}
                                                    className="p-1"
                                                >
                                                    👁️
                                                </Button>
                                            </div>

                                            {/* Project Title */}
                                            <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                                                {project.title}
                                            </h5>

                                            {/* Project Details */}
                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center justify-between text-xs text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <CurrencyDollarIcon className="w-3 h-3" />
                                                        <span>{formatCurrency(project.price || 0)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        <span>{formatDate(project.createdAt)}</span>
                                                    </div>
                                                </div>
                                                {project.websiteType && (
                                                    <div className="text-xs text-gray-600 capitalize">
                                                        {project.websiteType} website
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                {column.prevAction && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(project.id, column.prevAction!.status)}
                                                        disabled={loading === project.id}
                                                        className="flex-1 text-xs"
                                                    >
                                                        <ChevronLeftIcon className="w-3 h-3 mr-1" />
                                                        {column.prevAction.label}
                                                    </Button>
                                                )}
                                                {column.nextAction && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStatusChange(project.id, column.nextAction!.status)}
                                                        disabled={loading === project.id}
                                                        loading={loading === project.id}
                                                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {column.nextAction.label}
                                                        <ChevronRightIcon className="w-3 h-3 ml-1" />
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Empty State */}
                            {(projectsByColumn[column.id] || []).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <UserIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm">No projects in {column.title.toLowerCase()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>



            {/* Project View Modal */}
            {selectedProject && (
                <ProjectViewModal
                    isOpen={!!selectedProject}
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </div>
    );
};