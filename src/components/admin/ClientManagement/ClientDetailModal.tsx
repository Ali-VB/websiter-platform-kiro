import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { ProjectService } from '../../../services/supabase/projects';
import { ClientNotesService, type ClientNote } from '../../../services/supabase/clientNotes';
import { useClientNotes } from '../../../hooks/useClientNotes';
import type { Project } from '../../../types';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    projects: Project[];
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalValue: number;
    lastActivity: Date;
    joinedDate: Date;
}



interface ClientDetailModalProps {
    client: Client;
    onClose: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
    client,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'notes'>('overview');
    const [newNoteText, setNewNoteText] = useState('');
    const [loading, setLoading] = useState(false);

    // Use the client notes hook
    const {
        notes: clientNotes,
        loading: notesLoading,
        addNote: addClientNote,
        toggleNote: toggleClientNote,
        deleteNote: deleteClientNote,
        stats: notesStats
    } = useClientNotes(client.id, client.email);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_design':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'review':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const addNote = async () => {
        if (newNoteText.trim() && !loading) {
            try {
                setLoading(true);
                await addClientNote(newNoteText.trim());
                setNewNoteText('');
            } catch (error) {
                console.error('Failed to add note:', error);
                alert('Failed to add note. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleNote = async (noteId: string) => {
        try {
            await toggleClientNote(noteId);
        } catch (error) {
            console.error('Failed to toggle note:', error);
            alert('Failed to update note. Please try again.');
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            await deleteClientNote(noteId);
        } catch (error) {
            console.error('Failed to delete note:', error);
            alert('Failed to delete note. Please try again.');
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Client Information */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <UserIcon className="w-5 h-5" />
                    <span>Client Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <p className="text-gray-900">{client.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="flex items-center space-x-2">
                                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">{client.email}</p>
                            </div>
                        </div>
                        {client.phone && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <div className="flex items-center space-x-2">
                                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                                    <p className="text-gray-900">{client.phone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        {client.company && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <div className="flex items-center space-x-2">
                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                                    <p className="text-gray-900">{client.company}</p>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client Since</label>
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">{formatDate(client.joinedDate)}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Activity</label>
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">{formatDate(client.lastActivity)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Client Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-semibold">{client.totalProjects}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Total Projects</p>
                    <p className="text-xs text-gray-600">All time</p>
                </Card>
                <Card className="p-4 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600 font-semibold">{client.activeProjects}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Active Projects</p>
                    <p className="text-xs text-gray-600">In progress</p>
                </Card>
                <Card className="p-4 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-600 font-semibold">{client.completedProjects}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Completed</p>
                    <p className="text-xs text-gray-600">Finished</p>
                </Card>
                <Card className="p-4 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(client.totalValue)}</p>
                    <p className="text-xs text-gray-600">Total value</p>
                </Card>
            </div>

            {/* Recent Projects */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                <div className="space-y-3">
                    {client.projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{project.title}</p>
                                <p className="text-sm text-gray-600">{formatDate(project.createdAt)}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Badge className={getStatusColor(project.status)}>
                                    {getStatusLabel(project.status)}
                                </Badge>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(project.price || 0)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {client.projects.length === 0 && (
                        <p className="text-gray-600 text-center py-4">No projects yet</p>
                    )}
                </div>
            </Card>
        </div>
    );

    const renderProjects = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Projects</h3>
                <Badge className="bg-blue-100 text-blue-800">
                    {client.projects.length} projects
                </Badge>
            </div>

            <div className="space-y-4">
                {client.projects.map((project) => (
                    <Card key={project.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>Created: {formatDate(project.createdAt)}</span>
                                    <span>Updated: {formatDate(project.updatedAt)}</span>
                                    {project.dueDate && (
                                        <span>Due: {formatDate(project.dueDate)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className={getStatusColor(project.status)}>
                                    {getStatusLabel(project.status)}
                                </Badge>
                                <p className="text-lg font-semibold text-gray-900 mt-2">
                                    {formatCurrency(project.price || 0)}
                                </p>
                            </div>
                        </div>

                        {project.websiteType && (
                            <div className="flex items-center space-x-4 text-sm">
                                <span className="text-gray-600">Type:</span>
                                <span className="text-gray-900 capitalize">{project.websiteType}</span>
                                <span className="text-gray-600">Priority:</span>
                                <Badge className={
                                    project.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                }>
                                    {project.priority}
                                </Badge>
                            </div>
                        )}
                    </Card>
                ))}

                {client.projects.length === 0 && (
                    <Card className="p-12 text-center">
                        <p className="text-gray-600">No projects found for this client</p>
                    </Card>
                )}
            </div>
        </div>
    );

    const renderNotes = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Client Notes & Tasks</h3>
                <Badge className="bg-blue-100 text-blue-800">
                    {notesStats.completed}/{notesStats.total} completed
                </Badge>
            </div>

            {/* Add New Note */}
            <Card className="p-4">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addNote();
                            }
                        }}
                        placeholder="Add a note or task for this client..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                        type="button"
                        onClick={addNote}
                        disabled={!newNoteText.trim() || loading}
                        loading={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </Button>
                </div>
            </Card>

            {/* Notes List */}
            {notesLoading ? (
                <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            ) : (
                <div className="space-y-3">
                    {clientNotes.map((note) => (
                        <Card key={note.id} className={`p-4 ${note.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                            <div className="flex items-start space-x-3">
                                <button
                                    onClick={() => toggleNote(note.id)}
                                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${note.completed
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300 hover:border-green-500'
                                        }`}
                                >
                                    {note.completed && <CheckIcon className="w-3 h-3" />}
                                </button>
                                <div className="flex-1">
                                    <p className={`text-sm ${note.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                                        {note.text}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                        <span>Created: {formatDateTime(note.createdAt)}</span>
                                        {note.completedAt && (
                                            <span>Completed: {formatDateTime(note.completedAt)}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    ))}

                    {clientNotes.length === 0 && (
                        <Card className="p-8 text-center">
                            <PencilIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No notes or tasks yet</p>
                            <p className="text-sm text-gray-500">Add notes to track your interactions with this client</p>
                        </Card>
                    )}
                </div>
            )}

            {/* Progress Summary */}
            {notesStats.total > 0 && (
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">
                            {notesStats.completed} of {notesStats.total} completed
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${notesStats.completionRate}%` }}
                        />
                    </div>
                </Card>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`Client: ${client.name}`}
            size="xl"
        >
            <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: UserIcon },
                            { id: 'projects', label: 'Projects', icon: BuildingOfficeIcon },
                            { id: 'notes', label: 'Notes & Tasks', icon: PencilIcon }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="max-h-96 overflow-y-auto">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'projects' && renderProjects()}
                    {activeTab === 'notes' && renderNotes()}
                </div>
            </div>
        </Modal>
    );
};