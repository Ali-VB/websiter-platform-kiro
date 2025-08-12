import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useClientNotes } from '../../../hooks/useClientNotes';
import {
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

interface ClientNotesWidgetProps {
    clientId: string;
    clientEmail: string;
    clientName: string;
    className?: string;
    compact?: boolean;
}

export const ClientNotesWidget: React.FC<ClientNotesWidgetProps> = ({
    clientId,
    clientEmail,
    clientName,
    className = '',
    compact = false
}) => {
    const { notes, loading, error, addNote, toggleNote, deleteNote, stats } = useClientNotes(clientId, clientEmail);
    const [newNoteText, setNewNoteText] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleAddNote = async () => {
        if (newNoteText.trim() && !isAdding) {
            try {
                setIsAdding(true);
                await addNote(newNoteText.trim());
                setNewNoteText('');
            } catch (error) {
                console.error('Failed to add note:', error);
                alert('Failed to add note. Please try again.');
            } finally {
                setIsAdding(false);
            }
        }
    };

    const handleToggleNote = async (noteId: string) => {
        try {
            await toggleNote(noteId);
        } catch (error) {
            console.error('Failed to toggle note:', error);
            alert('Failed to update note. Please try again.');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteNote(noteId);
        } catch (error) {
            console.error('Failed to delete note:', error);
            alert('Failed to delete note. Please try again.');
        }
    };

    if (error) {
        return (
            <Card className={`p-4 border-red-200 bg-red-50 ${className}`}>
                <p className="text-red-600 text-sm">Failed to load notes: {error}</p>
            </Card>
        );
    }

    return (
        <Card className={`${className}`}>
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-gray-900 flex items-center space-x-2 ${compact ? 'text-sm' : 'text-lg'}`}>
                        <PencilIcon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                        <span>Notes & Tasks</span>
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {stats.completed}/{stats.total}
                    </Badge>
                </div>
                {!compact && (
                    <p className="text-sm text-gray-600 mt-1">
                        Track tasks and notes for {clientName}
                    </p>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Add New Note */}
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNote();
                            }
                        }}
                        placeholder="Add a note or task..."
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${compact ? 'text-sm' : ''}`}
                        disabled={isAdding}
                    />
                    <Button
                        type="button"
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim() || isAdding}
                        loading={isAdding}
                        size={compact ? 'sm' : 'md'}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </Button>
                </div>

                {/* Notes List */}
                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <LoadingSpinner size="sm" />
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${note.completed
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                <button
                                    onClick={() => handleToggleNote(note.id)}
                                    className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${note.completed
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 hover:border-green-500'
                                        }`}
                                >
                                    {note.completed && <CheckIcon className="w-2.5 h-2.5" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${note.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                                        {note.text}
                                    </p>
                                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                        <span>{formatDateTime(note.createdAt)}</span>
                                        {note.completedAt && (
                                            <span>✓ {formatDateTime(note.completedAt)}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {notes.length === 0 && (
                            <div className="text-center py-6">
                                <PencilIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 text-sm">No notes or tasks yet</p>
                                <p className="text-gray-500 text-xs">Add your first note above</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Summary */}
                {notes.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">Progress</span>
                            <span className="text-xs text-gray-600">
                                {Math.round(stats.completionRate)}% complete
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${stats.completionRate}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};