import React from 'react';
import { motion } from 'framer-motion';
import { Button, Card } from '../common';
import { ProjectStatusBadge } from './ProjectStatusBadge';
// useProjectTasks removed - using simple approach
import { fadeInUp, staggerContainer } from '../../utils/motion';
import type { Database } from '../../types/database';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface ProjectDetailsProps {
    project: ProjectRow;
    onClose: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
    project,
    onClose,
}) => {
    // tasks removed - using simple approach

    const getProjectProgress = (project: ProjectRow) => {
        switch (project.status) {
            case 'new': return 25;
            case 'in_progress': return 65;
            case 'completed': return 100;
            default: return 0;
        }
    };

    const getTaskStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return '✅';
            case 'in_progress': return '⚡';
            case 'todo': return '⏳';
            default: return '❓';
        }
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="p-6 max-h-[80vh] overflow-y-auto"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                            {project.title}
                        </h2>
                        <p className="text-secondary-600 mb-3">
                            {project.description}
                        </p>
                        <ProjectStatusBadge status={project.status} />
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-secondary-500">
                        ✕
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-secondary-600 mb-2">
                        <span>Overall Progress</span>
                        <span>{getProjectProgress(project)}%</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-3">
                        <div
                            className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${getProjectProgress(project)}%` }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Project Info */}
            <motion.div variants={fadeInUp} className="mb-6">
                <Card className="p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Project Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-secondary-600">Priority</div>
                            <div className={`font-medium ${project.priority === 'high' ? 'text-error-600' :
                                project.priority === 'medium' ? 'text-warning-600' :
                                    'text-success-600'
                                }`}>
                                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-secondary-600">Created</div>
                            <div className="font-medium text-secondary-900">
                                {new Date(project.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        {project.due_date && (
                            <div>
                                <div className="text-sm text-secondary-600">Due Date</div>
                                <div className="font-medium text-secondary-900">
                                    {new Date(project.due_date).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="text-sm text-secondary-600">Last Updated</div>
                            <div className="font-medium text-secondary-900">
                                {new Date(project.updated_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Project Timeline */}
            <motion.div variants={fadeInUp} className="mb-6">
                <Card className="p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Project Timeline</h3>
                    <div className="space-y-3">
                        {(() => {
                            const getPhaseStatus = (phaseKey: string) => {
                                const statusOrder = ['new', 'submitted', 'waiting_for_confirmation', 'confirmed', 'in_progress', 'in_design', 'review', 'final_delivery', 'completed'];
                                const currentIndex = statusOrder.indexOf(project.status);
                                const phaseIndex = statusOrder.indexOf(phaseKey);

                                if (currentIndex >= phaseIndex) return 'completed';
                                if (currentIndex === phaseIndex - 1) return 'in_progress';
                                return 'todo';
                            };

                            return [
                                {
                                    status: 'completed',
                                    title: 'Project Submission',
                                    date: project.created_at,
                                    description: 'Your website requirements have been received and are being reviewed by our team.'
                                },
                                {
                                    status: getPhaseStatus('waiting_for_confirmation'),
                                    title: 'Project Confirmation',
                                    date: ['waiting_for_confirmation', 'confirmed', 'in_progress', 'in_design', 'review', 'final_delivery', 'completed'].includes(project.status) ? project.updated_at : null,
                                    description: 'Your project has been approved and confirmed! Work will begin shortly.'
                                },
                                {
                                    status: getPhaseStatus('confirmed'),
                                    title: 'Payment',
                                    date: ['confirmed', 'in_progress', 'in_design', 'review', 'final_delivery', 'completed'].includes(project.status) ? project.updated_at : null,
                                    description: 'Complete your payment to begin the design and development process.'
                                },
                                {
                                    status: getPhaseStatus('in_design'),
                                    title: 'Design & Development',
                                    date: ['in_design', 'review', 'final_delivery', 'completed'].includes(project.status) ? project.updated_at : null,
                                    description: 'Our team creates your website based on your specifications.'
                                },
                                {
                                    status: getPhaseStatus('review'),
                                    title: 'Review & Feedback',
                                    date: ['review', 'final_delivery', 'completed'].includes(project.status) ? project.updated_at : null,
                                    description: 'Preview your website and request any changes or revisions.'
                                },
                                {
                                    status: getPhaseStatus('completed'),
                                    title: 'Website Launch',
                                    date: project.status === 'completed' ? project.updated_at : null,
                                    description: 'Your completed website is delivered and goes live.'
                                },
                            ];
                        })().map((phase, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${phase.status === 'completed' ? 'bg-success-100 text-success-600' :
                                    phase.status === 'in_progress' ? 'bg-warning-100 text-warning-600' :
                                        'bg-secondary-100 text-secondary-600'
                                    }`}>
                                    {getTaskStatusIcon(phase.status)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-secondary-900">{phase.title}</div>
                                    <div className="text-sm text-secondary-600">{phase.description}</div>
                                    {phase.date && (
                                        <div className="text-xs text-secondary-500 mt-1">
                                            {new Date(phase.date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Tasks removed - using simple approach */}

            {/* Actions */}
            <motion.div variants={fadeInUp}>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Close
                    </Button>
                    {project.status !== 'completed' && (
                        <Button className="flex-1">
                            Contact Team
                        </Button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};