import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { updateProjectStatus } from '../../services/supabase/projects';
import toast from 'react-hot-toast';
import type { Project } from '../../types';

interface ProjectEditModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
    project,
    isOpen,
    onClose,
    onUpdate
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'new' as 'new' | 'submitted' | 'waiting_for_confirmation' | 'confirmed' | 'in_progress' | 'in_design' | 'review' | 'final_delivery' | 'completed',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: ''
    });

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title,
                description: project.description,
                status: project.status,
                priority: project.priority,
                dueDate: project.dueDate ? project.dueDate.toISOString().split('T')[0] : ''
            });
        }
    }, [project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;

        setIsLoading(true);
        try {
            // For now, we'll only update the status since that's the main thing admins need to change
            // In a full implementation, you'd want to update all fields
            await updateProjectStatus(project.id, formData.status);

            toast.success('Project updated successfully!');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error('Failed to update project');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

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

    if (!project) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Edit Project
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Update project details and status
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Project Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Title
                        </label>
                        <Input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Enter project title"
                            disabled // For now, disable editing title
                            className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Project title is auto-generated and cannot be edited
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter project description"
                            rows={3}
                            disabled // For now, disable editing description
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 text-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Description is auto-generated and cannot be edited
                        </p>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Status
                        </label>
                        <div className="space-y-2">
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="new">New Order</option>
                                <option value="in_design">In Design</option>
                                <option value="review">Review</option>
                                <option value="final_delivery">Final Delivery</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Current status:</span>
                                <Badge color={getStatusColor(formData.status)} size="sm">
                                    {getStatusLabel(formData.status)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled // For now, disable editing priority
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Priority editing will be available in future updates
                        </p>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date (Optional)
                        </label>
                        <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => handleInputChange('dueDate', e.target.value)}
                            disabled // For now, disable editing due date
                            className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Due date editing will be available in future updates
                        </p>
                    </div>

                    {/* Client Info (Read-only) */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Client:</span> {project.clientName}
                            </div>
                            <div>
                                <span className="font-medium">Website Type:</span> {project.websiteType}
                            </div>
                            <div>
                                <span className="font-medium">Features:</span> {project.features?.length || 0} selected
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Update Project'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};