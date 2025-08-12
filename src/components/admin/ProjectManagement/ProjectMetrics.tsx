import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../common/Card';
import type { Project } from '../../../types';
import {
    ClockIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

interface ProjectMetricsProps {
    projects: Project[];
    className?: string;
}

export const ProjectMetrics: React.FC<ProjectMetricsProps> = ({ projects, className = '' }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    // Calculate metrics
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'submitted').length;
    const quotesNeeded = projects.filter(p => p.status === 'submitted').length;
    const highPriorityProjects = projects.filter(p => p.priority === 'high').length;

    const totalRevenue = projects
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.price || 0), 0);

    const averageProjectValue = totalProjects > 0
        ? projects.reduce((sum, p) => sum + (p.price || 0), 0) / totalProjects
        : 0;

    const completionRate = totalProjects > 0 ? completedProjects / totalProjects : 0;

    const uniqueClients = new Set(projects.map(p => p.clientId)).size;

    // Status distribution
    const statusCounts = {
        new: projects.filter(p => p.status === 'new').length,
        submitted: projects.filter(p => p.status === 'submitted').length,
        in_design: projects.filter(p => p.status === 'in_design').length,
        review: projects.filter(p => p.status === 'review').length,
        completed: projects.filter(p => p.status === 'completed').length
    };

    // Priority distribution
    const priorityCounts = {
        low: projects.filter(p => p.priority === 'low').length,
        medium: projects.filter(p => p.priority === 'medium').length,
        high: projects.filter(p => p.priority === 'high').length
    };

    return (
        <Card className={`p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Project Metrics</h3>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Projects */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-50 p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100">
                            <ChartBarIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Projects</p>
                            <p className="text-2xl font-bold text-blue-900">{totalProjects}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Active Projects */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-yellow-50 p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100">
                            <ClockIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Active Projects</p>
                            <p className="text-2xl font-bold text-yellow-900">{activeProjects}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Completion Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-50 p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 font-medium">Completion Rate</p>
                            <p className="text-2xl font-bold text-green-900">
                                {formatPercentage(completionRate)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Total Revenue */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-purple-50 p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100">
                            <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {formatCurrency(totalRevenue)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4">
                    <div className="flex items-center space-x-3">
                        <UserGroupIcon className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Unique Clients</p>
                            <p className="text-xl font-bold text-gray-900">{uniqueClients}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4">
                    <div className="flex items-center space-x-3">
                        <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Avg Project Value</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(averageProjectValue)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4">
                    <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">High Priority</p>
                            <p className="text-xl font-bold text-gray-900">{highPriorityProjects}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Project Status Distribution</h4>
                    <div className="space-y-3">
                        {Object.entries(statusCounts).map(([status, count]) => {
                            const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                            const statusLabels: Record<string, string> = {
                                new: 'New Projects',
                                submitted: 'Needs Quote',
                                in_design: 'In Design',
                                review: 'In Review',
                                completed: 'Completed'
                            };

                            const statusColors: Record<string, string> = {
                                new: 'bg-blue-500',
                                submitted: 'bg-yellow-500',
                                in_design: 'bg-orange-500',
                                review: 'bg-purple-500',
                                completed: 'bg-green-500'
                            };

                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 ${statusColors[status]}`} />
                                        <span className="text-sm text-gray-700">{statusLabels[status]}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Priority Distribution</h4>
                    <div className="space-y-3">
                        {Object.entries(priorityCounts).map(([priority, count]) => {
                            const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                            const priorityColors: Record<string, string> = {
                                low: 'bg-green-500',
                                medium: 'bg-yellow-500',
                                high: 'bg-red-500'
                            };

                            return (
                                <div key={priority} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 ${priorityColors[priority]}`} />
                                        <span className="text-sm text-gray-700 capitalize">{priority} Priority</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${quotesNeeded <= 3 ? 'bg-green-500' : quotesNeeded <= 6 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        <span className="text-gray-600">
                            Quotes Needed: {quotesNeeded <= 3 ? 'Low' : quotesNeeded <= 6 ? 'Medium' : 'High'} ({quotesNeeded})
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${completionRate >= 0.7 ? 'bg-green-500' : completionRate >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        <span className="text-gray-600">
                            Completion Rate: {completionRate >= 0.7 ? 'Excellent' : completionRate >= 0.5 ? 'Good' : 'Needs Improvement'}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${activeProjects <= 10 ? 'bg-green-500' : activeProjects <= 20 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        <span className="text-gray-600">
                            Workload: {activeProjects <= 10 ? 'Manageable' : activeProjects <= 20 ? 'Busy' : 'Overloaded'}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};