import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface GenericDeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    itemName?: string;
    itemType?: string;
}

export const GenericDeleteConfirmationModal: React.FC<GenericDeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false,
    itemName,
    itemType = 'item'
}) => {

    const handleConfirm = () => {
        onConfirm();
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
                                Delete {itemType}
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
                            Are you sure you want to delete this {itemType}? This action cannot be undone.
                        </p>

                        {itemName &&
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-medium text-red-800 mb-2">{itemType} to be deleted:</h4>
                                <div className="space-y-1 text-sm text-red-700">
                                    <div><strong>Name:</strong> {itemName}</div>
                                </div>
                            </div>
                        }
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
                        {isDeleting ? 'Deleting...' : `Delete ${itemType}`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};