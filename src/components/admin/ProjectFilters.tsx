import React from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../../types';
import { Button } from '../common/Button';

import { XMarkIcon } from '@heroicons/react/24/outline';

interface ProjectFiltersProps {
    filters: {
        status: string;
        websiteType: string;
        client: string;
        priority: string;
        dateRange: string;
    };
    onFiltersChange: (filters: any) => void;
    projects: Project[];
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
    filters,
    onFiltersChange,
    projects
}) => {
    // Get unique values for filter options
    const uniqueClients = Array.from(new Set(projects.map(p => p.clientName))).filter(Boolean);
    const uniqueWebsiteTypes = Array.from(new Set(projects.map(p => p.websiteType))).filter(Boolean);

    const handleFilterChange = (key: string, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            status: 'all',
            websiteType: 'all',
            client: 'all',
            priority: 'all',
            dateRange: 'all'
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filter Projects</h3>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="flex items-center space-x-2"
                    >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Clear Filters</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="new">New Orders</option>
                        <option value="in_design">In Design</option>
                        <option value="review">Review</option>
                        <option value="final_delivery">Final Delivery</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Website Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Type
                    </label>
                    <select
                        value={filters.websiteType}
                        onChange={(e) => handleFilterChange('websiteType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Types</option>
                        {uniqueWebsiteTypes.map(type => (
                            <option key={type} value={type} className="capitalize">
                                {type}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Clients</option>
                        {uniqueClients.map(client => (
                            <option key={client} value={client}>
                                {client}
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
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                    </select>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {Object.entries(filters).map(([key, value]) => {
                        if (value === 'all') return null;
                        return (
                            <span
                                key={key}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                                {key}: {value}
                                <button
                                    onClick={() => handleFilterChange(key, 'all')}
                                    className="ml-2 hover:text-blue-600"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};