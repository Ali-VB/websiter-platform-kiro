import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

import { formatDistanceToNow } from 'date-fns';
import {
    CalendarIcon,
    UserIcon,
    CurrencyDollarIcon,
    ChatBubbleLeftIcon,
    EllipsisVerticalIcon,
    ExclamationTriangleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
    project: Project;
    isDragging: boolean;
    onUpdate: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    isDragging
}) => {
    const [showActions, setShowActions] = useState(false);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50';
            case 'low':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getWebsiteTypeIcon = (type: string) => {
        switch (type) {
            case 'portfolio':
                return '🎨';
            case 'ecommerce':
                return '🛒';
            case 'blog':
                return '📝';
            case 'business':
                return '🏢';
            default:
                return '🌐';
        }
    };

    const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();

    return (
        <div
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <Card
                className={`
            p-4 cursor-grab active:cursor-grabbing transition-all duration-200
            ${isDragging ? 'shadow-2xl bg-white' : 'hover:shadow-md'}
            ${isOverdue ? 'border-red-200 bg-red-50' : ''}
          `}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{getWebsiteTypeIcon(project.websiteType)}</span>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                {project.title}
                            </h4>
                            <p className="text-xs text-gray-500 capitalize">
                                {project.websiteType} Website
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        {/* Priority Badge */}
                        <span className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${getPriorityColor(project.priority)}
          `}>
                            {project.priority}
                        </span>

                        {/* Actions Menu */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showActions ? 1 : 0 }}
                            className="relative"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle actions menu
                                }}
                            >
                                <EllipsisVerticalIcon className="w-4 h-4" />
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="flex items-center space-x-2 mb-3">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{project.clientName}</span>
                </div>





                {/* Project Details */}
                <div className="space-y-2 mb-3">
                    {/* Quote Amount */}
                    {project.price > 0 && (
                        <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                                ${project.price}
                            </span>
                            <span className="text-xs text-gray-500">
                                (No Quote)
                            </span>
                        </div>
                    )}

                    {/* Due Date */}
                    {project.dueDate && (
                        <div className="flex items-center space-x-2">
                            {isOverdue ? (
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                            ) : (
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                {isOverdue ? 'Overdue' : `Due ${formatDistanceToNow(new Date(project.dueDate), { addSuffix: true })}`}
                            </span>
                        </div>
                    )}

                    {/* Time in Current Status */}
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                            Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>

                {/* Features Preview */}
                {project.features && project.features.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {project.features.slice(0, 3).map((feature, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                                >
                                    {feature.name}
                                </span>
                            ))}
                            {project.features.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    +{project.features.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Todo Progress */}
                {project.adminTodos && project.adminTodos.length > 0 && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span className="text-xs text-gray-500">Tasks</span>
                            </div>
                            <span className="text-xs text-gray-600">
                                {project.adminTodos.filter((todo: any) => todo.completed).length}/{project.adminTodos.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: `${project.adminTodos.length > 0 ? (project.adminTodos.filter((todo: any) => todo.completed).length / project.adminTodos.length) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Time Estimation Display */}
                {((project.estimatedHours ?? 0) > 0 || (project.estimatedDays ?? 0) > 0) && (
                    <div className="mb-3">
                        <div className="flex items-center space-x-2">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-gray-500">
                                Est: {project.estimatedHours ?? 0}h ({project.estimatedDays ?? 0}d)
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                        {/* Messages Count */}
                        <div className="flex items-center space-x-1">
                            <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{project.messageCount || 0}</span>
                        </div>

                        {/* Quick Todo Indicator */}
                        {project.adminTodos && project.adminTodos.length > 0 && (
                            <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${project.adminTodos.filter((todo: any) => todo.completed).length === project.adminTodos.length
                                        ? 'bg-green-500'
                                        : project.adminTodos.filter((todo: any) => todo.completed).length > 0
                                            ? 'bg-yellow-500'
                                            : 'bg-gray-400'
                                    }`} />
                                <span className="text-xs text-gray-500">
                                    {project.adminTodos.filter((todo: any) => todo.completed).length === project.adminTodos.length ? 'Done' : 'In Progress'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Status Badge */}
                    <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-blue-100 text-blue-800'}
                `}>
                        {project.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Overdue Warning */}
                {isOverdue && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700"
                    >
                        <div className="flex items-center space-x-1">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            <span>This project is overdue and needs attention</span>
                        </div>
                    </motion.div>
                )}
            </Card>
        </div>
    );
};