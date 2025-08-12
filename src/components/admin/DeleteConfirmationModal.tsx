import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Project } from '../../types';

interface DeleteConfirmationModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (project: Project) => void;
    isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    project,
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false
}) => {
    if (!project) return null;

    const handleConfirm = () => {
        onConfirm(project);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Delete Project
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isDeleting}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2">Project to be deleted:</h4>
                            <div className="space-y-1 text-sm text-red-700">
                                <div><strong>Title:</strong> {project.title}</div>
                                <div><strong>Client:</strong> {project.clientName}</div>
                                <div><strong>Status:</strong> {project.status}</div>
                                <div><strong>Created:</strong> {project.createdAt.toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">This will permanently delete:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Project details and history</li>
                                        {/* Tasks removed - using simple approach */}
                                        <li>All messages and communications ({project.messageCount || 0} messages)</li>
                                        <li>Project files and attachments</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        loading={isDeleting}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};