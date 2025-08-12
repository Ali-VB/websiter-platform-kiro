import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { updateProjectStatus } from '../../../services/supabase/projects';
import { InvoiceModal } from '../InvoiceModal';
import type { Project } from '../../../types';
import {
    XMarkIcon,
    UserIcon,
    CalendarIcon,

    PencilIcon,
    CheckIcon,

    EnvelopeIcon,

    BuildingOfficeIcon,
    DocumentTextIcon,

    CogIcon
} from '@heroicons/react/24/outline';

interface ProjectDetailsProps {
    project: Project;
    onClose: () => void;
    onUpdate: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
    project,
    onClose,
    onUpdate
}) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'client' | 'manage'>('details');
    const [adminNotes, setAdminNotes] = useState('');
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [urgencyLevel, setUrgencyLevel] = useState(project.priority);

    const isQuote = project.isQuote;

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            setLoading(true);

            // Map old statuses to our simplified statuses
            let mappedStatus = newStatus;
            if (newStatus === 'confirmed') {
                mappedStatus = 'in_progress';
            } else if (newStatus === 'in_design' || newStatus === 'review') {
                mappedStatus = 'in_progress';
            }

            // Update project status using our simplified approach
            await updateProjectStatus(project.id, mappedStatus as any);
            console.log('✅ Project status updated and client notified!');

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update project status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUrgencyUpdate = async (newUrgency: string) => {
        try {
            setLoading(true);
            setUrgencyLevel(newUrgency as 'low' | 'medium' | 'high');
            // TODO: Update urgency in database
            console.log('Updated urgency to:', newUrgency);
            onUpdate();
        } catch (error) {
            console.error('Failed to update urgency:', error);
        } finally {
            setLoading(false);
        }
    };



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

    const tabs = [
        { id: 'details', label: 'Project Details', icon: DocumentTextIcon },
        { id: 'timeline', label: 'Timeline', icon: CalendarIcon },
        { id: 'client', label: 'Client Info', icon: UserIcon },
        { id: 'manage', label: 'Manage', icon: CogIcon }
    ];

    return (
        <>
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Project Management"
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
                                                        {project.websiteType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Website
                                                    </p>
                                                    <p className="text-sm text-gray-600">Project Type</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            {activeTab === 'manage' && (
                                <motion.div
                                    key="manage"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Status Management */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                                        <div className="space-y-4">
                                            {isQuote ? (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-gray-600">This project needs confirmation. Confirm to start project and notify client:</p>
                                                    <Button
                                                        onClick={() => handleStatusUpdate('confirmed')}
                                                        disabled={loading}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        {loading ? <LoadingSpinner size="sm" /> : <CheckIcon className="w-4 h-4" />}
                                                        <span>Confirm Project & Notify Client</span>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleStatusUpdate('in_design')}
                                                        disabled={loading}
                                                    >
                                                        Start Design
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleStatusUpdate('review')}
                                                        disabled={loading}
                                                    >
                                                        Send for Review
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleStatusUpdate('completed')}
                                                        disabled={loading}
                                                    >
                                                        Mark Complete
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowInvoiceModal(true)}
                                                    >
                                                        Generate Invoice
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Urgency Management */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Management</h3>
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-600">Current Priority:
                                                <Badge className={getPriorityColor(urgencyLevel)} size="sm">
                                                    {urgencyLevel}
                                                </Badge>
                                            </p>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUrgencyUpdate('low')}
                                                    className={urgencyLevel === 'low' ? 'bg-green-100' : ''}
                                                >
                                                    Low
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUrgencyUpdate('medium')}
                                                    className={urgencyLevel === 'medium' ? 'bg-yellow-100' : ''}
                                                >
                                                    Medium
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUrgencyUpdate('high')}
                                                    className={urgencyLevel === 'high' ? 'bg-red-100' : ''}
                                                >
                                                    High
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Admin Notes */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                                        <div className="space-y-3">
                                            {isEditingNotes ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={adminNotes}
                                                        onChange={(e) => setAdminNotes(e.target.value)}
                                                        rows={4}
                                                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Add notes about this project..."
                                                    />
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setIsEditingNotes(false);
                                                                console.log('Notes saved:', adminNotes);
                                                            }}
                                                        >
                                                            Save Notes
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setIsEditingNotes(false)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-gray-700 mb-3">
                                                        {adminNotes || 'No notes added yet.'}
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setIsEditingNotes(true)}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        <span>Edit Notes</span>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </Modal>

            {/* Invoice Modal */}
            {showInvoiceModal && (
                <InvoiceModal
                    project={project}
                    isOpen={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                />
            )}
        </>
    );
};