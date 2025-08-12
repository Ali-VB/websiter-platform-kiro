import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import type { Project } from '../../../types';
import { supabase } from '../../../lib/supabase';
import {
    UserIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    BuildingOfficeIcon,

    EnvelopeIcon,
    EyeIcon,
    CogIcon
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
    project: Project;
    onClick: (action: 'view' | 'manage') => void;
    className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, className = '' }) => {
    const [client, setClient] = useState<{ name: string; email: string } | null>(null);
    const [hasError, setHasError] = useState(false);

    // Safety check for project data
    if (!project) {
        return (
            <Card className="p-4 border-red-200 bg-red-50">
                <p className="text-red-600 text-sm">Error: Project data is missing</p>
            </Card>
        );
    }

    useEffect(() => {
        const fetchClient = async () => {
            if (project.clientId) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('name, email')
                        .eq('id', project.clientId)
                        .single();

                    if (error) {
                        // If no user found, use fallback data from project
                        console.warn('Client not found in users table, using project data:', error);
                        setClient({
                            name: project.clientName || 'Unknown Client',
                            email: project.clientEmail || 'No email'
                        });
                    } else {
                        setClient(data);
                    }
                } catch (err) {
                    console.error('Error fetching client:', err);
                    setHasError(true);
                    // Use fallback data from project
                    setClient({
                        name: project.clientName || 'Unknown Client',
                        email: project.clientEmail || 'No email'
                    });
                }
            }
        };
        fetchClient();
    }, [project.clientId, project.clientName, project.clientEmail]);
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_design':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'review':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'final_delivery':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'submitted':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'waiting_for_confirmation':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new':
                return 'New Project';
            case 'in_design':
                return 'In Design';
            case 'review':
                return 'Review';
            case 'final_delivery':
                return 'Final Delivery';
            case 'completed':
                return 'Completed';
            case 'submitted':
                return 'Needs Confirmation';
            case 'waiting_for_confirmation':
                return 'Awaiting Confirmation';
            default:
                return status.replace('_', ' ');
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getTimeSinceCreated = () => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const needsConfirmation = project.status === 'new'; // Will be 'submitted' after migration
    const borderColor = needsConfirmation ? 'border-l-yellow-500' : 'border-l-blue-500';

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Error boundary for rendering
    if (hasError) {
        return (
            <Card className="p-4 border-yellow-200 bg-yellow-50">
                <p className="text-yellow-600 text-sm">⚠️ Error loading project card</p>
                <p className="text-xs text-gray-500 mt-1">Project: {project?.title || 'Unknown'}</p>
            </Card>
        );
    }

    try {
        return (
            <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={className}
            >
                <Card
                    className={`p-6 hover:shadow-lg transition-shadow border-l-4 ${borderColor}`}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${needsConfirmation ? 'bg-yellow-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                                <UserIcon className={`w-5 h-5 ${needsConfirmation ? 'text-yellow-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {client?.name || project.clientName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {project.title}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(project.status)}>
                                {getStatusLabel(project.status)}
                            </Badge>
                            <Badge className={getPriorityColor(project.priority)}>
                                {project.priority} priority
                            </Badge>
                        </div>
                    </div>

                    {/* Client Contact Info */}
                    <div className="mb-4 space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <EnvelopeIcon className="w-4 h-4" />
                            <span>{client?.email || project.clientEmail || 'No email'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            <span>{project.websiteType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Website</span>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Project Value</span>
                            </div>
                            <span className="font-semibold text-lg text-gray-900">
                                {formatCurrency(project.price)}
                            </span>
                        </div>

                        {/* Task count removed - using simple approach */}

                        {needsConfirmation && (
                            <div className="flex items-center space-x-2">
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1">
                                    📋 Needs Quote
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    {project.dueDate && (
                        <div className="mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Due Date</span>
                            </div>
                            <div className="text-sm text-gray-900">
                                {project.dueDate.toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    {/* Features Summary */}
                    {project.features && project.features.length > 0 && (
                        <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-2">Features ({project.features.length}):</div>
                            <div className="flex flex-wrap gap-1">
                                {project.features
                                    .slice(0, 3)
                                    .map((feature: any, index: number) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1"
                                        >
                                            {feature.name || feature}
                                        </span>
                                    ))}
                                {project.features.length > 3 && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1">
                                        +{project.features.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-900 line-clamp-2">
                            {project.description}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                (onClick as any)('view');
                            }}
                            className="flex items-center space-x-2 flex-1"
                        >
                            <EyeIcon className="w-4 h-4" />
                            <span>View</span>
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                (onClick as any)('manage');
                            }}
                            className="flex items-center space-x-2 flex-1"
                        >
                            <CogIcon className="w-4 h-4" />
                            <span>Manage</span>
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4" />
                            <span>Created {getTimeSinceCreated()}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            {project.urgencyLevel === 'overdue' && (
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm text-gray-500">
                                {formatDate(project.updatedAt)}
                            </span>
                        </div>
                    </div>

                    {/* Hover Indicator */}
                    <div className={`absolute inset-0 ${needsConfirmation ? 'bg-yellow-50' : 'bg-blue-50'} opacity-0 hover:opacity-10 transition-opacity pointer-events-none`} />
                </Card>
            </motion.div>
        );
    } catch (error) {
        console.error('Error rendering ProjectCard:', error);
        return (
            <Card className="p-4 border-red-200 bg-red-50">
                <p className="text-red-600 text-sm">❌ Error rendering project card</p>
                <p className="text-xs text-gray-500 mt-1">Project: {project?.title || 'Unknown'}</p>
            </Card>
        );
    }
};