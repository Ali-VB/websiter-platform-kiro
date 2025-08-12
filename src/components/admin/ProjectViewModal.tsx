import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
    UserIcon,
    CalendarIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import type { Project } from '../../types';

interface ProjectViewModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    onMakeInvoice?: (project: Project) => void;
}

export const ProjectViewModal: React.FC<ProjectViewModalProps> = ({
    project,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onMakeInvoice
}) => {
    if (!project) return null;

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={true}>
            <div className="space-y-6 -m-6">
                {/* Header */}
                <div className="bg-white p-6 border-b border-gray-200 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Project Details
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            View complete project information
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6">
                    <div className="space-y-6">
                        {/* Project Overview */}
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {project.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <Badge color={getStatusColor(project.status)} size="sm">
                                        {getStatusLabel(project.status)}
                                    </Badge>
                                    <Badge color={getPriorityColor(project.priority)} size="sm" variant="outline">
                                        {project.priority}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Project Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Client Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <UserIcon className="w-5 h-5 mr-2" />
                                    Client Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <span className="ml-2 font-medium">{project.clientName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Website Type:</span>
                                        <span className="ml-2 font-medium capitalize">{project.websiteType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2" />
                                    Timeline
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Created:</span>
                                        <span className="ml-2 font-medium">{project.createdAt.toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span className="ml-2 font-medium">{project.updatedAt.toLocaleDateString()}</span>
                                    </div>
                                    {project.dueDate && (
                                        <div>
                                            <span className="text-gray-600">Due Date:</span>
                                            <span className="ml-2 font-medium">{project.dueDate.toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        {project.features && project.features.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                                    Selected Features ({project.features.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {project.features.map((feature: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-900 truncate mr-2">{feature.name}</span>
                                            {feature.price && (
                                                <span className="text-sm text-gray-600 flex-shrink-0">${feature.price}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Project Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">1</div>
                                <div className="text-sm text-blue-800">Project</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{project.messageCount || 0}</div>
                                <div className="text-sm text-green-800">Messages</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    ${project.price}
                                </div>
                                <div className="text-sm text-purple-800">Total Value</div>
                            </div>
                        </div>

                        {/* Tasks removed - using simple approach */}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t border-gray-200 sticky bottom-0 z-10">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>

                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => onDelete?.(project)}
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                                Delete Project
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => onMakeInvoice?.(project)}
                                className="text-green-600 hover:text-green-700 hover:border-green-300"
                            >
                                Make Invoice
                            </Button>

                            <Button
                                variant="primary"
                                onClick={() => onEdit?.(project)}
                            >
                                Edit Project
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};