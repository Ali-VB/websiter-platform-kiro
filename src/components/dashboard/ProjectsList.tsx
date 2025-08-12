import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../common';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import type { Database } from '../../types/database';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface ProjectsListProps {
    projects: ProjectRow[];
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
    projects,
}) => {

    const [filter, setFilter] = useState<'all' | 'completed' | 'maintenance'>('all');
    const filteredAndSortedProjects = projects
        .filter(project => {
            if (filter === 'completed') return project.status === 'completed';
            if (filter === 'maintenance') return project.status === 'completed'; // For now, maintenance = completed projects
            return true;
        })
        .sort((a, b) => {
            // Default sort by date (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });





    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
        >
            {/* Header with Filters and Sorting */}
            <motion.div variants={fadeInUp}>
                <Card className="p-8 bg-gradient-card shadow-elegant hover:shadow-floating transition-all duration-300">
                    <div className="mb-6">
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-display font-semibold text-neutral-900 tracking-tight mb-2">
                                My Projects
                            </h2>
                            <p className="text-neutral-600 font-sans">
                                {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-3">
                        {[
                            { key: 'all', label: 'All Projects', icon: '📁', count: projects.length },
                            { key: 'completed', label: 'Completed Projects', icon: '✅', count: projects.filter(p => p.status === 'completed').length },
                            { key: 'maintenance', label: 'Projects Need Maintenance', icon: '🔧', count: projects.filter(p => p.status === 'completed').length },
                        ].map((tab, index) => (
                            <motion.button
                                key={tab.key}
                                onClick={() => setFilter(tab.key as any)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className={`px-5 py-3 text-sm font-sans font-medium transition-all duration-300 hover:scale-105 ${filter === tab.key
                                    ? 'bg-gradient-dark text-neutral-0 shadow-floating'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 hover:shadow-soft'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label} ({tab.count})
                            </motion.button>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Projects Grid */}
            <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAndSortedProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                            <Card className="p-6 bg-gradient-card hover:shadow-floating hover:scale-[1.02] transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <p className="text-neutral-600 text-sm mb-4 font-sans">
                                            {project.description}
                                        </p>
                                        <ProjectStatusBadge status={project.status} />
                                    </div>
                                </div>

                                {/* Order Information */}
                                <div className="mb-4">
                                    {filter === 'maintenance' ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-900">Maintenance Info</span>
                                                <span className="text-xs text-blue-600">Est. Time</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-blue-700">Content Updates:</span>
                                                    <span className="text-blue-900 font-medium">1-2 days</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-blue-700">Security Updates:</span>
                                                    <span className="text-blue-900 font-medium">2-3 hours</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-blue-700">Performance Optimization:</span>
                                                    <span className="text-blue-900 font-medium">3-5 days</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">Order Information</span>
                                                <span className="text-xs text-gray-600">Project #{project.id.slice(0, 8)}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Order Date:</span>
                                                    <span className="text-gray-900 font-medium">{new Date(project.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Status:</span>
                                                    <span className="text-gray-900 font-medium capitalize">{project.status.replace('_', ' ')}</span>
                                                </div>
                                                {project.due_date && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Expected Completion:</span>
                                                        <span className="text-gray-900 font-medium">{new Date(project.due_date).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Project Features */}
                                <div className="mb-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-green-900">Project Features</span>
                                            <span className="text-xs text-green-600">Included</span>
                                        </div>
                                        <div className="space-y-2">
                                            {/* Mock features - in real app, these would come from project.features */}
                                            <div className="flex flex-wrap gap-1">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Responsive Design</span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">SEO Optimization</span>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Contact Form</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Social Media Integration</span>
                                                <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">Analytics Setup</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">SSL Certificate</span>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Performance Optimization</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {filter === 'maintenance' && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            onClick={() => {
                                                // TODO: Open maintenance request
                                                console.log('Request maintenance for:', project.title);
                                            }}
                                        >
                                            🔧 Request Maintenance
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>



            {/* Empty State */}
            {filteredAndSortedProjects.length === 0 && (
                <motion.div variants={fadeInUp}>
                    <Card className="p-12 text-center">
                        <div className="text-6xl mb-4">📁</div>
                        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                            No {filter === 'all' ? '' : filter === 'maintenance' ? 'projects needing maintenance' : filter} projects found
                        </h2>
                        <p className="text-secondary-600">
                            {filter === 'all'
                                ? "You don't have any projects yet. Submit a website request to get started!"
                                : filter === 'maintenance'
                                    ? "You don't have any completed projects that need maintenance at the moment."
                                    : `You don't have any ${filter} projects at the moment.`
                            }
                        </p>
                    </Card>
                </motion.div>
            )}

        </motion.div>
    );
};