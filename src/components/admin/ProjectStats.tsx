import React from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../../types';
import { Card } from '../common/Card';
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ProjectStatsProps {
    projects: Project[];
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ projects }) => {
    // Calculate statistics
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const activeProjects = projects.filter(p => p.status !== 'completed').length;
    const overdueProjects = projects.filter(p =>
        p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'completed'
    ).length;

    const totalRevenue = projects
        .filter(p => p.price > 0)
        .reduce((sum, p) => sum + (p.price || 0), 0);

    const averageProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    // Status distribution
    const statusCounts = projects.reduce((acc, project) => {
        const status = project.status || 'new';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const stats = [
        {
            title: 'Total Projects',
            value: totalProjects,
            icon: ChartBarIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: null
        },
        {
            title: 'Active Projects',
            value: activeProjects,
            icon: ClockIcon,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            change: null
        },
        {
            title: 'Completed',
            value: completedProjects,
            icon: ArrowTrendingUpIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: `${completionRate.toFixed(1)}% completion rate`
        },
        {
            title: 'Overdue',
            value: overdueProjects,
            icon: ExclamationTriangleIcon,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            change: overdueProjects > 0 ? 'Needs attention' : 'All on track'
        },
        {
            title: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            icon: CurrencyDollarIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: `$${averageProjectValue.toLocaleString()} avg per project`
        },
        {
            title: 'Unique Clients',
            value: new Set(projects.map(p => p.clientId)).size,
            icon: UserGroupIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            change: null
        }
    ];

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="p-4">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                                    {stat.change && (
                                        <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h4>
                    <div className="space-y-3">
                        {Object.entries(statusCounts).map(([status, count]) => {
                            const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                            const statusLabels: Record<string, string> = {
                                new: 'New Orders',
                                in_design: 'In Design',
                                review: 'Review',
                                final_delivery: 'Final Delivery',
                                completed: 'Completed'
                            };

                            const statusColors: Record<string, string> = {
                                new: 'bg-blue-500',
                                in_design: 'bg-yellow-500',
                                review: 'bg-purple-500',
                                final_delivery: 'bg-orange-500',
                                completed: 'bg-green-500'
                            };

                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'}`} />
                                        <span className="text-sm text-gray-700">{statusLabels[status] || status}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                        {projects
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                            .slice(0, 5)
                            .map((project) => (
                                <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {project.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {project.clientName} • {project.websiteType}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            {new Date(project.updatedAt).toLocaleDateString()}
                                        </p>
                                        <span className={`
                      inline-block px-2 py-1 text-xs rounded-full
                      ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                project.status === 'review' ? 'bg-purple-100 text-purple-800' :
                                                    project.status === 'in_design' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'}
                    `}>
                                            {project.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};