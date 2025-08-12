import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { updateProjectStatus } from '../../../services/supabase/projects';
import type { Project } from '../../../types';
import {
    XMarkIcon,
    UserIcon,
    CalendarIcon,
    DocumentTextIcon,
    CheckIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface ProjectViewModalProps {
    project: Project;
    onClose: () => void;
    onConfirm?: () => void;
    onUpdate?: () => void;
}

export const ProjectViewModal: React.FC<ProjectViewModalProps> = ({
    project,
    onClose,
    onConfirm,
    onUpdate
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'client' | 'confirm'>('details');
    const [loading, setLoading] = useState(false);

    const isQuote = project.isQuote;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };



    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'submitted':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'waiting_for_confirmation':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'in_design':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'review':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

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

    const handleConfirmProject = async () => {
        try {
            setLoading(true);

            // Debug: Log the project data
            console.log('🔍 Project data being confirmed:', {
                id: project.id,
                isQuote: project.isQuote,
                status: project.status,
                clientName: project.clientName,
                title: project.title
            });

            // Enhanced debugging
            console.log('🔍 Detailed status check:', {
                currentStatus: project.status,
                statusType: typeof project.status,
                isNew: project.status === 'new',
                isSubmitted: project.status === 'submitted',
                isWaitingConfirmation: project.status === 'waiting_for_confirmation',
                canConfirm: project.status === 'new' || project.status === 'submitted' || project.status === 'waiting_for_confirmation'
            });

            // Only proceed if this project needs confirmation
            if (project.status !== 'new' && project.status !== 'submitted' && project.status !== 'waiting_for_confirmation') {
                console.error('❌ Project status check failed:', {
                    status: project.status,
                    allowedStatuses: ['new', 'submitted', 'waiting_for_confirmation']
                });
                alert(`❌ This project has already been confirmed or is not ready for confirmation.\n\nCurrent status: ${project.status}\nAllowed statuses: new, submitted, waiting_for_confirmation`);
                return;
            }

            // Confirm project and update user dashboard progress
            console.log('🚀 Starting confirmation process for project ID:', project.id);
            console.log('🔄 Calling updateProjectStatus with:', { projectId: project.id, newStatus: 'confirmed' });

            await updateProjectStatus(project.id, 'confirmed');
            console.log('✅ Project status updated successfully in database!');
            console.log('📊 User dashboard will show progress update.');

            // Show success message
            alert(`✅ Project confirmed successfully!\n\n• Project status updated to "Confirmed"\n• Client dashboard will show updated progress\n• Client knows their project has been approved\n\nWork can now begin on their website!`);

            if (onUpdate) {
                onUpdate();
            }
            onClose();
        } catch (error) {
            console.error('Failed to confirm project:', error);
            alert(`❌ Failed to confirm project: ${(error as any)?.message || 'Unknown error'}\n\nPlease try again or contact support.`);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'details', label: 'Project Details', icon: DocumentTextIcon },
        { id: 'timeline', label: 'Timeline', icon: CalendarIcon },
        { id: 'client', label: 'Client Info', icon: UserIcon },
        { id: 'confirm', label: 'Confirmation', icon: CheckIcon }
    ];

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Project Details"
            size="xl"
        >
            <div className="flex flex-col h-full max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${isQuote ? 'bg-yellow-100' : 'bg-blue-100'} flex items-center justify-center`}>
                            <UserIcon className={`w-6 h-6 ${isQuote ? 'text-yellow-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {project.clientName}
                            </h2>
                            <p className="text-gray-600">
                                {project.title}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                            {project.priority} priority
                        </Badge>
                        {isQuote && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                📋 Quote Needed
                            </Badge>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Project Overview */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Project Type</label>
                                            <p className="mt-1 text-gray-900">
                                                {project.websiteType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Website
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Status</label>
                                            <p className="mt-1">
                                                <Badge className={getStatusColor(project.status)}>
                                                    {project.status.replace('_', ' ')}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Priority</label>
                                            <p className="mt-1">
                                                <Badge className={getPriorityColor(project.priority)}>
                                                    {project.priority} priority
                                                </Badge>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Project Value</label>
                                            <p className="mt-1 text-gray-900 font-semibold">
                                                ${project.price}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Description */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {project.description}
                                    </p>
                                </Card>

                                {/* Contact Information */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Name</label>
                                            <p className="mt-1 text-gray-900">{project.contactInfo?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Email</label>
                                            <p className="mt-1 text-gray-900">{project.contactInfo?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Company</label>
                                            <p className="mt-1 text-gray-900">{project.contactInfo?.company || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Phone</label>
                                            <p className="mt-1 text-gray-900">{project.contactInfo?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Website Purpose */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Purpose</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Type</label>
                                            <p className="mt-1 text-gray-900">{project.websitePurpose?.type || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Industry</label>
                                            <p className="mt-1 text-gray-900">{project.websitePurpose?.industry || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Description</label>
                                            <p className="mt-1 text-gray-900">{project.websitePurpose?.description || 'N/A'}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Additional Features */}
                                {project.features && project.features.length > 0 && (
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Features</h3>
                                        <div className="space-y-3">
                                            {project.features.map((feature: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{feature.name || feature}</p>
                                                        {feature.description && (
                                                            <p className="text-sm text-gray-600">{feature.description}</p>
                                                        )}
                                                    </div>
                                                    {feature.price && (
                                                        <span className="font-semibold text-green-600">+${feature.price}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {/* Website Inspiration */}
                                {project.websiteInspiration && project.websiteInspiration.length > 0 && (
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Inspiration</h3>
                                        <div className="space-y-4">
                                            {project.websiteInspiration.map((inspiration: any, index: number) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-medium text-gray-900">Website {index + 1}</h4>
                                                        {inspiration.url && (
                                                            <a
                                                                href={inspiration.url.startsWith('http') ? inspiration.url : `https://${inspiration.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                            >
                                                                Visit Site →
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700">URL: </span>
                                                            <span className="text-sm text-gray-900">{inspiration.url}</span>
                                                        </div>
                                                        {inspiration.description && (
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700">Description: </span>
                                                                <span className="text-sm text-gray-900">{inspiration.description}</span>
                                                            </div>
                                                        )}
                                                        {inspiration.whatYouLike && (
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700">What they like: </span>
                                                                <span className="text-sm text-gray-900">{inspiration.whatYouLike}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {/* Design Preferences */}
                                {project.designPreferences && Object.keys(project.designPreferences).length > 0 && (
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Preferences</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Style</label>
                                                <p className="mt-1 text-gray-900">{project.designPreferences?.style || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Colors</label>
                                                <p className="mt-1 text-gray-900">
                                                    {project.designPreferences?.colors?.join(', ') || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Payment Information */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Total Amount</label>
                                            <p className="mt-1 text-2xl font-bold text-green-600">${project.price}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Payment Option</label>
                                            <p className="mt-1 text-gray-900 capitalize">{project.paymentOption}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Features */}
                                {project.features && project.features.length > 0 && (
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Features ({project.features.length})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {project.features.map((feature: any, index: number) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <CheckIcon className="w-4 h-4 text-green-600" />
                                                    <span className="text-gray-700">
                                                        {feature.name || feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'timeline' && (
                            <motion.div
                                key="timeline"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-3 h-3 bg-blue-500"></div>
                                            <div>
                                                <p className="font-medium text-gray-900">Project Created</p>
                                                <p className="text-sm text-gray-600">{formatDate(project.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-3 h-3 bg-gray-300"></div>
                                            <div>
                                                <p className="font-medium text-gray-900">Last Updated</p>
                                                <p className="text-sm text-gray-600">{formatDate(project.updatedAt)}</p>
                                            </div>
                                        </div>
                                        {project.dueDate && (
                                            <div className="flex items-center space-x-4">
                                                <div className="w-3 h-3 bg-orange-500"></div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Due Date</p>
                                                    <p className="text-sm text-gray-600">{formatDate(project.dueDate)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'client' && (
                            <motion.div
                                key="client"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <UserIcon className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900">{project.clientName}</p>
                                                <p className="text-sm text-gray-600">Client Name</p>
                                            </div>
                                        </div>
                                        {project.clientEmail && (
                                            <div className="flex items-center space-x-3">
                                                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{project.clientEmail}</p>
                                                    <p className="text-sm text-gray-600">Email Address</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-3">
                                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {project.websiteType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Website
                                                </p>
                                                <p className="text-sm text-gray-600">Project Type</p>
                                            </div>
                                        </div>
                                        {project.features && project.features.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-medium text-gray-900 mb-2">Requested Features</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.features.map((feature: any, index: number) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs border border-blue-200">
                                                            {feature.name || feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'confirm' && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Confirmation</h3>
                                    <div className="space-y-4">
                                        {/* Status notification - changes based on project status */}
                                        {(project.status === 'new' || project.status === 'submitted' || project.status === 'waiting_for_confirmation') ? (
                                            // Project needs confirmation - Yellow notification
                                            <div className="bg-yellow-50 border border-yellow-200 p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                                                    <h4 className="font-medium text-yellow-800">Awaiting Confirmation</h4>
                                                </div>
                                                <p className="text-yellow-700 text-sm">
                                                    This project is awaiting confirmation. Once confirmed, the client will see "Confirmed" status in their dashboard and know that work will begin.
                                                </p>
                                            </div>
                                        ) : project.status === 'confirmed' ? (
                                            // Project is confirmed - Green notification
                                            <div className="bg-green-50 border border-green-200 p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <CheckIcon className="w-5 h-5 text-green-600" />
                                                    <h4 className="font-medium text-green-800">Project Confirmed</h4>
                                                </div>
                                                <p className="text-green-700 text-sm">
                                                    This project has been confirmed! The client can see "Confirmed" status in their dashboard and knows that work will begin.
                                                </p>
                                            </div>
                                        ) : project.status === 'in_progress' ? (
                                            // Project is in progress - Blue notification
                                            <div className="bg-blue-50 border border-blue-200 p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <ClockIcon className="w-5 h-5 text-blue-600" />
                                                    <h4 className="font-medium text-blue-800">Work In Progress</h4>
                                                </div>
                                                <p className="text-blue-700 text-sm">
                                                    This project is currently being worked on. The client can track progress in their dashboard.
                                                </p>
                                            </div>
                                        ) : project.status === 'completed' ? (
                                            // Project is completed - Purple notification
                                            <div className="bg-purple-50 border border-purple-200 p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <CheckIcon className="w-5 h-5 text-purple-600" />
                                                    <h4 className="font-medium text-purple-800">Project Completed</h4>
                                                </div>
                                                <p className="text-purple-700 text-sm">
                                                    This project has been completed and delivered to the client. Great work!
                                                </p>
                                            </div>
                                        ) : (
                                            // Other status - Gray notification
                                            <div className="bg-gray-50 border border-gray-200 p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <ClockIcon className="w-5 h-5 text-gray-600" />
                                                    <h4 className="font-medium text-gray-800">Project Status: {project.status}</h4>
                                                </div>
                                                <p className="text-gray-700 text-sm">
                                                    This project has status "{project.status}". Check with your team for next steps.
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Estimated Value</label>
                                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                                    ${project.price}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Features Count</label>
                                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                                    {project.features?.length || 0} features
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            {/* Show different content based on project status */}
                                            {(project.status === 'new' || project.status === 'submitted' || project.status === 'waiting_for_confirmation') ? (
                                                // Project needs confirmation
                                                <div className="bg-green-50 border border-green-200 p-4 mb-4">
                                                    <h4 className="font-medium text-green-800 mb-2">Ready to Confirm?</h4>
                                                    <p className="text-green-700 text-sm mb-3">
                                                        Confirming this project will:
                                                    </p>
                                                    <ul className="text-green-700 text-sm space-y-1 mb-4">
                                                        <li>• Update the project status to "Confirmed"</li>
                                                        <li>• Update the client's dashboard progress</li>
                                                        <li>• Show client that their project is approved</li>
                                                        <li>• Allow work to begin on their website</li>
                                                    </ul>
                                                    <Button
                                                        onClick={handleConfirmProject}
                                                        disabled={loading}
                                                        className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <LoadingSpinner size="sm" />
                                                                <span>Confirming Project...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckIcon className="w-4 h-4" />
                                                                <span>Confirm Project & Update Client</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : (
                                                // Project is already confirmed or in progress
                                                <div className="bg-blue-50 border border-blue-200 p-4 mb-4">
                                                    <h4 className="font-medium text-blue-800 mb-2">
                                                        {project.status === 'confirmed' ? '✅ Project Confirmed' :
                                                            project.status === 'in_progress' ? '🚀 Project In Progress' :
                                                                project.status === 'completed' ? '🎉 Project Completed' :
                                                                    '📋 Project Status'}
                                                    </h4>
                                                    <p className="text-blue-700 text-sm mb-3">
                                                        {project.status === 'confirmed' ? 'This project has been confirmed and the client has been notified. Work can now begin.' :
                                                            project.status === 'in_progress' ? 'This project is currently being worked on.' :
                                                                project.status === 'completed' ? 'This project has been completed and delivered to the client.' :
                                                                    `This project has status: ${project.status}`}
                                                    </p>
                                                    <Button
                                                        disabled={true}
                                                        className="w-full bg-gray-400 cursor-not-allowed flex items-center justify-center space-x-2"
                                                    >
                                                        <CheckIcon className="w-4 h-4" />
                                                        <span>
                                                            {project.status === 'confirmed' ? 'Already Confirmed' :
                                                                project.status === 'in_progress' ? 'In Progress' :
                                                                    project.status === 'completed' ? 'Completed' :
                                                                        'Cannot Confirm'}
                                                        </span>
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="text-center">
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Need to make changes first?
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    onClick={onConfirm}
                                                    disabled={!onConfirm || loading}
                                                    className="w-full"
                                                >
                                                    Go to Project Management
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Modal>
    );
};