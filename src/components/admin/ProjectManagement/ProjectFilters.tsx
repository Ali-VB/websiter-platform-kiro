import React from 'react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import type { Project } from '../../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ProjectFiltersType {
    status: string;
    client: string;
    projectType: string;
    dateRange: string;
    urgency: string;
    adminAssigned: string;
}

interface ProjectFiltersProps {
    filters: ProjectFiltersType;
    onFiltersChange: (filters: ProjectFiltersType) => void;
    projects: Project[];
    className?: string;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
    filters,
    onFiltersChange,
    projects,
    className = ''
}) => {
    const handleFilterChange = (key: keyof ProjectFiltersType, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const clearAllFilters = () => {
        onFiltersChange({
            status: 'all',
            client: 'all',
            projectType: 'all',
            dateRange: 'all',
            urgency: 'all',
            adminAssigned: 'all'
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

    // Get unique values for filter options
    const getUniqueClients = () => {
        const clients = projects
            .reduce((acc: any[], project: Project) => {
                if (!acc.find((c: any) => c.id === project.clientId)) {
                    acc.push({
                        id: project.clientId,
                        name: project.clientName
                    });
                }
                return acc;
            }, []);
        return clients;
    };

    const getUniqueProjectTypes = () => {
        const types = projects
            .map(project => project.websiteType)
            .filter(Boolean)
            .reduce((acc: string[], type: string) => {
                if (!acc.includes(type)) {
                    acc.push(type);
                }
                return acc;
            }, []);
        return types;
    };

    const statusOptions = [
        { value: 'all', label: 'All Statuses', count: projects.length },
        { value: 'new', label: 'New Projects', count: projects.filter(p => p.status === 'new').length },
        { value: 'submitted', label: 'Needs Quote', count: projects.filter(p => p.status === 'submitted').length },
        { value: 'waiting_for_confirmation', label: 'Awaiting Confirmation', count: projects.filter(p => p.status === 'waiting_for_confirmation').length },
        { value: 'in_design', label: 'In Design', count: projects.filter(p => p.status === 'in_design').length },
        { value: 'review', label: 'Review', count: projects.filter(p => p.status === 'review').length },
        { value: 'final_delivery', label: 'Final Delivery', count: projects.filter(p => p.status === 'final_delivery').length },
        { value: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length }
    ];

    const priorityOptions = [
        { value: 'all', label: 'All Priorities', count: projects.length },
        { value: 'low', label: 'Low Priority', count: projects.filter(p => p.priority === 'low').length },
        { value: 'medium', label: 'Medium Priority', count: projects.filter(p => p.priority === 'medium').length },
        { value: 'high', label: 'High Priority', count: projects.filter(p => p.priority === 'high').length }
    ];

    const dateRangeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' }
    ];

    return (
        <Card className={`p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filter Projects</h3>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="flex items-center space-x-2"
                    >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Clear All</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({option.count})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                    </label>
                    <select
                        value={filters.urgency}
                        onChange={(e) => handleFilterChange('urgency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({option.count})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Client Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client
                    </label>
                    <select
                        value={filters.client}
                        onChange={(e) => handleFilterChange('client', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="all">All Clients</option>
                        {getUniqueClients().map((client: any) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Project Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Type
                    </label>
                    <select
                        value={filters.projectType}
                        onChange={(e) => handleFilterChange('projectType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="all">All Types</option>
                        {getUniqueProjectTypes().map((type: string) => (
                            <option key={type} value={type}>
                                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Range Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                    </label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        {dateRangeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Admin Assigned Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned Admin
                    </label>
                    <select
                        value={filters.adminAssigned}
                        onChange={(e) => handleFilterChange('adminAssigned', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="all">All Admins</option>
                        <option value="unassigned">Unassigned</option>
                        <option value="me">Assigned to Me</option>
                    </select>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-600">Active filters:</span>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(filters).map(([key, value]) => {
                                if (value === 'all') return null;

                                let displayValue = value;
                                if (key === 'client') {
                                    const client = getUniqueClients().find((c: any) => c.id === value);
                                    displayValue = client?.name || value;
                                } else if (key === 'projectType') {
                                    displayValue = value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                                } else if (key === 'status') {
                                    displayValue = value.replace('_', ' ');
                                }

                                return (
                                    <span
                                        key={key}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800"
                                    >
                                        {key}: {displayValue}
                                        <button
                                            onClick={() => handleFilterChange(key as keyof ProjectFiltersType, 'all')}
                                            className="ml-1 hover:text-blue-600"
                                        >
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Showing {projects.length} projects
                        {hasActiveFilters && ' (filtered)'}
                    </span>
                    <div className="flex items-center space-x-4">
                        <span>🟢 Low: {projects.filter(p => p.priority === 'low').length}</span>
                        <span>🟡 Medium: {projects.filter(p => p.priority === 'medium').length}</span>
                        <span>🔴 High: {projects.filter(p => p.priority === 'high').length}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};