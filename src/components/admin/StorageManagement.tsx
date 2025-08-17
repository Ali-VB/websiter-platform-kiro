import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../common';
import { SupabaseProjectAssetsService } from '../../services/supabase/projectAssets';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import {
    TrashIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    FolderIcon,
    DocumentTextIcon,
    PhotoIcon,
    PaintBrushIcon,
    SwatchIcon,
} from '@heroicons/react/24/outline';

interface StorageStats {
    totalAssets: number;
    totalSize: number;
    byCategory: Record<string, { count: number; size: number }>;
    byProject: Record<string, { count: number; size: number }>;
    oldestAsset: string | null;
    newestAsset: string | null;
}

interface StorageManagementProps {
    projects: any[];
}

export const StorageManagement: React.FC<StorageManagementProps> = ({ projects }) => {
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [daysOld, setDaysOld] = useState<number>(60);
    const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
    const [operationLoading, setOperationLoading] = useState(false);

    useEffect(() => {
        loadStorageStats();
    }, []);

    const loadStorageStats = async () => {
        setLoading(true);
        try {
            const storageStats = await SupabaseProjectAssetsService.getStorageStats();
            setStats(storageStats);
        } catch (error) {
            console.error('Failed to load storage stats:', error);
        }
        setLoading(false);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getProjectTitle = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return project?.title || `Project ${projectId.slice(0, 8)}`;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'logo':
                return <SwatchIcon className="w-4 h-4" />;
            case 'images':
                return <PhotoIcon className="w-4 h-4" />;
            case 'content':
                return <DocumentTextIcon className="w-4 h-4" />;
            case 'brand':
                return <PaintBrushIcon className="w-4 h-4" />;
            default:
                return <DocumentTextIcon className="w-4 h-4" />;
        }
    };

    const handleDeleteAllAssets = async () => {
        setOperationLoading(true);
        try {
            const result = await SupabaseProjectAssetsService.deleteAllAssets();
            if (result.success) {
                alert(`Successfully deleted ${result.deletedCount} assets and cleared all storage!`);
                await loadStorageStats();
            } else {
                alert(`Failed to delete assets: ${result.error}`);
            }
        } catch (error) {
            alert('Failed to delete assets. Please try again.');
        }
        setOperationLoading(false);
        setShowConfirmDialog(null);
    };

    const handleDeleteProjectAssets = async () => {
        if (!selectedProject) return;

        setOperationLoading(true);
        try {
            const success = await SupabaseProjectAssetsService.deleteProjectAssets(selectedProject);
            if (success) {
                alert(`Successfully deleted all assets for project: ${getProjectTitle(selectedProject)}`);
                await loadStorageStats();
                setSelectedProject('');
            } else {
                alert('Failed to delete project assets. Please try again.');
            }
        } catch (error) {
            alert('Failed to delete project assets. Please try again.');
        }
        setOperationLoading(false);
        setShowConfirmDialog(null);
    };

    const handleDeleteOldAssets = async () => {
        setOperationLoading(true);
        try {
            const result = await SupabaseProjectAssetsService.deleteOldAssets(daysOld);
            if (result.success) {
                alert(`Successfully deleted ${result.deletedCount} assets older than ${daysOld} days!`);
                await loadStorageStats();
            } else {
                alert(`Failed to delete old assets: ${result.error}`);
            }
        } catch (error) {
            alert('Failed to delete old assets. Please try again.');
        }
        setOperationLoading(false);
        setShowConfirmDialog(null);
    };

    const ConfirmDialog = ({ type, onConfirm, onCancel }: {
        type: string;
        onConfirm: () => void;
        onCancel: () => void;
    }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                    <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                </div>

                <div className="mb-6">
                    {type === 'all' && (
                        <div>
                            <p className="text-gray-700 mb-2">
                                <strong>⚠️ DANGER:</strong> This will permanently delete ALL assets from storage!
                            </p>
                            <p className="text-sm text-gray-600">
                                • All client-uploaded files will be removed<br />
                                • This action cannot be undone<br />
                                • Total assets to delete: <strong>{stats?.totalAssets || 0}</strong><br />
                                • Total size to free: <strong>{formatFileSize(stats?.totalSize || 0)}</strong>
                            </p>
                        </div>
                    )}

                    {type === 'project' && (
                        <div>
                            <p className="text-gray-700 mb-2">
                                Delete all assets for project: <strong>{getProjectTitle(selectedProject)}</strong>
                            </p>
                            <p className="text-sm text-gray-600">
                                This will permanently remove all files uploaded for this project.
                            </p>
                        </div>
                    )}

                    {type === 'old' && (
                        <div>
                            <p className="text-gray-700 mb-2">
                                Delete all assets older than <strong>{daysOld} days</strong>
                            </p>
                            <p className="text-sm text-gray-600">
                                This will help clean up old files and free storage space.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="primary"
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        disabled={operationLoading}
                    >
                        {operationLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </Card>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading storage statistics...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
        >
            {/* Storage Overview */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Storage Management</h2>
                            <p className="text-gray-600">Monitor and cleanup Supabase storage usage</p>
                        </div>
                        <Button onClick={loadStorageStats} variant="outline" size="sm">
                            Refresh Stats
                        </Button>
                    </div>

                    {/* Storage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats?.totalAssets || 0}</div>
                            <div className="text-sm text-blue-700">Total Assets</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{formatFileSize(stats?.totalSize || 0)}</div>
                            <div className="text-sm text-green-700">Storage Used</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{Object.keys(stats?.byProject || {}).length}</div>
                            <div className="text-sm text-purple-700">Projects with Assets</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{Object.keys(stats?.byCategory || {}).length}</div>
                            <div className="text-sm text-orange-700">Asset Categories</div>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    {stats && Object.keys(stats.byCategory).length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage by Category</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {Object.entries(stats.byCategory).map(([category, data]) => (
                                    <div key={category} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        {getCategoryIcon(category)}
                                        <div>
                                            <div className="font-medium text-gray-900 capitalize">{category}</div>
                                            <div className="text-sm text-gray-600">
                                                {data.count} files • {formatFileSize(data.size)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Cleanup Actions */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Storage Cleanup Actions</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Delete by Project */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FolderIcon className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-gray-900">Delete by Project</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Remove all assets for a specific project
                            </p>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
                            >
                                <option value="">Select a project...</option>
                                {Object.keys(stats?.byProject || {}).map(projectId => (
                                    <option key={projectId} value={projectId}>
                                        {getProjectTitle(projectId)} ({stats?.byProject[projectId].count} files)
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={() => setShowConfirmDialog('project')}
                                disabled={!selectedProject}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Delete Project Assets
                            </Button>
                        </div>

                        {/* Delete Old Assets */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ClockIcon className="w-5 h-5 text-orange-600" />
                                <h4 className="font-semibold text-gray-900">Delete Old Assets</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Remove assets older than specified days
                            </p>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Days old:</label>
                                <input
                                    type="number"
                                    value={daysOld}
                                    onChange={(e) => setDaysOld(parseInt(e.target.value) || 60)}
                                    min="1"
                                    max="365"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <Button
                                onClick={() => setShowConfirmDialog('old')}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <ClockIcon className="w-4 h-4 mr-2" />
                                Delete Old Assets
                            </Button>
                        </div>

                        {/* Delete All Assets */}
                        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                            <div className="flex items-center gap-2 mb-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                <h4 className="font-semibold text-red-900">Danger Zone</h4>
                            </div>
                            <p className="text-sm text-red-700 mb-4">
                                <strong>⚠️ WARNING:</strong> This will permanently delete ALL assets and completely clear your storage!
                            </p>
                            <Button
                                onClick={() => setShowConfirmDialog('all')}
                                variant="primary"
                                size="sm"
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Delete All Assets
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <ConfirmDialog
                    type={showConfirmDialog}
                    onConfirm={() => {
                        if (showConfirmDialog === 'all') handleDeleteAllAssets();
                        else if (showConfirmDialog === 'project') handleDeleteProjectAssets();
                        else if (showConfirmDialog === 'old') handleDeleteOldAssets();
                    }}
                    onCancel={() => setShowConfirmDialog(null)}
                />
            )}
        </motion.div>
    );
};