import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { updateProjectStatus, ProjectService } from '../../../services/supabase/projects';
import { InvoiceModal } from '../InvoiceModal';
import type { Project } from '../../../types';
import {
    UserIcon,
    PencilIcon,
    CogIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface ProjectManageModalProps {
    project: Project;
    onClose: () => void;
    onUpdate: () => void;
}

export const ProjectManageModal: React.FC<ProjectManageModalProps> = ({
    project,
    onClose,
    onUpdate
}) => {
    // Safety check
    if (!project) {
        console.error('ProjectManageModal: No project provided');
        onClose();
        return null;
    }


    const [loading, setLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState(project.adminNotes || '');
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [urgencyLevel, setUrgencyLevel] = useState(project.priority);

    // Time estimation state
    const [estimatedHours, setEstimatedHours] = useState(project.estimatedHours || 0);
    const [estimatedDays, setEstimatedDays] = useState(project.estimatedDays || 0);
    const [hoursNeeded, setHoursNeeded] = useState(project.hoursNeeded || 0);
    const [targetCompletionDate, setTargetCompletionDate] = useState(
        project.targetCompletionDate ? new Date(project.targetCompletionDate).toISOString().split('T')[0] : ''
    );

    // Todo list state
    const [todoItems, setTodoItems] = useState<Array<{ id: string, text: string, completed: boolean }>>([
        // Initialize with existing todos or empty array
        ...(project.adminTodos || [])
    ]);
    const [newTodoText, setNewTodoText] = useState('');

    const isQuote = project.isQuote;

    const handleStatusUpdate = async (newStatus: string, e?: React.MouseEvent) => {
        e?.preventDefault();
        try {
            setLoading(true);

            // Validate status transition
            if (newStatus === 'completed' && project.status === 'new') {
                console.warn('Cannot complete a project that hasn\'t been started');
                return;
            }

            // Map old statuses to our simplified statuses
            let mappedStatus = newStatus;
            if (newStatus === 'confirmed') {
                mappedStatus = 'in_progress';
            } else if (newStatus === 'in_design' || newStatus === 'review') {
                mappedStatus = 'in_progress';
            }

            // Update project status using our simplified approach
            await updateProjectStatus(project.id, mappedStatus as any);
            console.log('✅ Project status updated to:', mappedStatus);

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
            setUrgencyLevel(newUrgency as any);
            // TODO: Update urgency in database
            console.log('Updated urgency to:', newUrgency);
            onUpdate();
        } catch (error) {
            console.error('Failed to update urgency:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeEstimationUpdate = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        console.log('🚀 handleTimeEstimationUpdate called!');

        try {
            setLoading(true);

            console.log('🔍 Debug info:', {
                projectId: project.id,
                estimatedHours,
                estimatedDays,
                hoursNeeded,
                targetCompletionDate
            });

            // Update project with time estimation data
            await ProjectService.updateTimeEstimation(project.id, {
                estimatedHours,
                estimatedDays,
                hoursNeeded,
                targetCompletionDate: targetCompletionDate || undefined
            });

            console.log('✅ Time estimation saved successfully');
            onUpdate();
        } catch (error) {
            console.error('❌ Failed to update time estimation:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            alert(`Failed to save time estimation: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const addTodoItem = (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (newTodoText.trim()) {
            const newTodo = {
                id: Date.now().toString(),
                text: newTodoText.trim(),
                completed: false
            };
            setTodoItems([...todoItems, newTodo]);
            setNewTodoText('');
        }
    };

    const toggleTodoItem = (id: string) => {
        setTodoItems(todoItems.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const deleteTodoItem = (id: string) => {
        setTodoItems(todoItems.filter(item => item.id !== id));
    };

    const saveTodoList = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        console.log('🚀 saveTodoList called!');

        try {
            setLoading(true);

            console.log('🔍 Debug todo save:', {
                projectId: project.id,
                todoItems: todoItems,
                todoCount: todoItems.length
            });

            // Save todo list to database
            await ProjectService.updateTodoList(project.id, todoItems);

            console.log('✅ Todo list saved successfully');
            onUpdate();
        } catch (error) {
            console.error('❌ Failed to save todo list:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            alert(`Failed to save todo list: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
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

    return (
        <>
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Project Management"
                size="lg"
            >
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
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
                        </div>
                    </div>

                    {/* Invoice Management - Moved to top */}
                    {!isQuote && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <DocumentTextIcon className="w-5 h-5" />
                                <span>Invoice Management</span>
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 p-4">
                                    <p className="text-sm text-blue-800 mb-3">
                                        Generate professional invoices for this project with detailed breakdown and payment terms.
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={() => setShowInvoiceModal(true)}
                                        disabled={loading}
                                        className="flex items-center space-x-2 w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <DocumentTextIcon className="w-4 h-4" />
                                        <span>Generate Invoice PDF</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Status Management */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <CogIcon className="w-5 h-5" />
                            <span>Status Management</span>
                        </h3>
                        <div className="space-y-4">
                            {/* Current Status Display */}
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Current Status:</p>
                                <Badge className={getStatusColor(project.status)}>
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>

                            {/* Status management buttons with proper disable logic */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={(e) => handleStatusUpdate('in_progress', e)}
                                        disabled={loading || project.status === 'in_progress' || project.status === 'completed'}
                                        className={project.status === 'in_progress' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                                    >
                                        {project.status === 'in_progress' ? '✅ Started' : 'Start Project'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={(e) => handleStatusUpdate('completed', e)}
                                        disabled={loading || project.status === 'completed' || project.status === 'new'}
                                        className={project.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                                    >
                                        {project.status === 'completed' ? '✅ Completed' : 'Mark Complete'}
                                    </Button>
                                </div>

                                {/* Status Help Text */}
                                <div className="text-xs text-gray-500 space-y-1">
                                    {project.status === 'new' && (
                                        <p>• Click "Start Project" to begin working on this project</p>
                                    )}
                                    {project.status === 'in_progress' && (
                                        <p>• Project is in progress. Click "Mark Complete" when finished</p>
                                    )}
                                    {project.status === 'completed' && (
                                        <p>• ✅ Project has been completed successfully</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Time Estimation */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Time Estimation & Planning</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Hours Estimated
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="1000"
                                        value={estimatedHours}
                                        onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., 40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hours Needed Daily
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        value={hoursNeeded}
                                        onChange={(e) => setHoursNeeded(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., 4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Completion Date
                                    </label>
                                    <input
                                        type="date"
                                        value={targetCompletionDate}
                                        onChange={(e) => setTargetCompletionDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Calculated Duration */}
                            {estimatedHours > 0 && hoursNeeded > 0 && (
                                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                    <div className="text-sm text-gray-700">
                                        <p className="font-medium">Calculated Duration:</p>
                                        <p>≈ {Math.ceil(estimatedHours / hoursNeeded)} working days</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Based on {hoursNeeded} hours per day
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Time Summary */}
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">
                                            Project Timeline Summary
                                        </p>
                                        <div className="text-xs text-blue-700 space-y-1 mt-1">
                                            <p>• Total Hours: {estimatedHours}h</p>
                                            <p>• Daily Hours: {hoursNeeded}h/day</p>
                                            {targetCompletionDate && (
                                                <p>• Target Date: {new Date(targetCompletionDate).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleTimeEstimationUpdate}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {loading ? 'Saving...' : 'Save Timeline'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>





                    {/* Project Todo List */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span>Project Todo List</span>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {todoItems.filter(item => item.completed).length}/{todoItems.length}
                            </Badge>
                        </h3>

                        <div className="space-y-4">
                            {/* Add New Todo */}
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newTodoText}
                                    onChange={(e) => setNewTodoText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTodoItem();
                                        }
                                    }}
                                    placeholder="Add a new task..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={loading}
                                />
                                <Button
                                    type="button"
                                    onClick={addTodoItem}
                                    disabled={!newTodoText.trim() || loading}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Add
                                </Button>
                            </div>

                            {/* Todo Items */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {todoItems.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500">
                                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-sm">No tasks added yet</p>
                                        <p className="text-xs text-gray-400">Add tasks to track project progress</p>
                                    </div>
                                ) : (
                                    todoItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${item.completed
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => toggleTodoItem(item.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span
                                                className={`flex-1 text-sm ${item.completed
                                                    ? 'text-green-700 line-through'
                                                    : 'text-gray-900'
                                                    }`}
                                            >
                                                {item.text}
                                            </span>
                                            <button
                                                onClick={() => deleteTodoItem(item.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                disabled={loading}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Progress Summary */}
                            {todoItems.length > 0 && (
                                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm text-gray-600">
                                            {todoItems.filter(item => item.completed).length} of {todoItems.length} completed
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${todoItems.length > 0 ? (todoItems.filter(item => item.completed).length / todoItems.length) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            {todoItems.length > 0 && (
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={saveTodoList}
                                        disabled={loading}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {loading ? 'Saving...' : 'Save Todo List'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* General Admin Notes */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <PencilIcon className="w-5 h-5" />
                            <span>General Notes</span>
                        </h3>
                        <div className="space-y-3">
                            {isEditingNotes ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Add general notes about this project..."
                                    />
                                    <div className="flex space-x-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={async () => {
                                                try {
                                                    setLoading(true);

                                                    // Save notes to database
                                                    await ProjectService.updateAdminNotes(project.id, adminNotes);

                                                    console.log('✅ Notes saved successfully');
                                                    setIsEditingNotes(false);
                                                    onUpdate();
                                                } catch (error) {
                                                    console.error('Failed to save notes:', error);
                                                    alert('Failed to save notes. Please try again.');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Notes'}
                                        </Button>
                                        <Button
                                            type="button"
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
                                    <div className="text-gray-700 mb-3 min-h-[40px] p-3 bg-gray-50 border rounded-md">
                                        {adminNotes || (
                                            <span className="text-gray-400 italic">No general notes added yet.</span>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
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

                    {/* Debug Section - Remove after fixing */}
                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">🔍 Debug Tools</h4>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                    try {
                                        await ProjectService.testDatabaseConnection(project.id);
                                        alert('Database connection test passed!');
                                    } catch (error) {
                                        console.error('Database test failed:', error);
                                        alert(`Database test failed: ${error.message}`);
                                    }
                                }}
                                className="text-yellow-700 border-yellow-300"
                            >
                                Test DB Connection
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    console.log('🔍 Current project data:', {
                                        id: project.id,
                                        title: project.title,
                                        estimatedHours: project.estimatedHours,
                                        adminTodos: project.adminTodos,
                                        adminNotes: project.adminNotes
                                    });
                                }}
                                className="text-yellow-700 border-yellow-300"
                            >
                                Log Project Data
                            </Button>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        {loading && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <LoadingSpinner size="sm" />
                                <span>Updating...</span>
                            </div>
                        )}
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