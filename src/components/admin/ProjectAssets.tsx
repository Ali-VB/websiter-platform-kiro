import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../common';
import { SupabaseProjectAssetsService, type ProjectAsset } from '../../services/supabase/projectAssets';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import {
    DocumentTextIcon,
    PhotoIcon,
    PaintBrushIcon,
    SwatchIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    FolderIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

interface ProjectAssetsProps {
    projects: any[];
}

export const ProjectAssets: React.FC<ProjectAssetsProps> = ({ projects }) => {
    const [allAssets, setAllAssets] = useState<ProjectAsset[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllAssets();
    }, []);

    const loadAllAssets = async () => {
        setLoading(true);
        try {
            const assets = await SupabaseProjectAssetsService.getAllAssets();
            setAllAssets(assets);
        } catch (error) {
            console.error('Failed to load assets:', error);
        }
        setLoading(false);
    };

    const filteredAssets = allAssets.filter(asset => {
        const projectMatch = selectedProject === 'all' || asset.project_id === selectedProject;
        const categoryMatch = selectedCategory === 'all' || asset.category === selectedCategory;
        return projectMatch && categoryMatch;
    });

    const getProjectTitle = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return project?.title || `Project ${projectId.slice(0, 8)}`;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'logo':
                return <SwatchIcon className="w-5 h-5" />;
            case 'images':
                return <PhotoIcon className="w-5 h-5" />;
            case 'content':
                return <DocumentTextIcon className="w-5 h-5" />;
            case 'brand':
                return <PaintBrushIcon className="w-5 h-5" />;
            default:
                return <DocumentTextIcon className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'logo':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'images':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'content':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'brand':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const downloadAsset = async (asset: ProjectAsset) => {
        try {
            const blob = await SupabaseProjectAssetsService.downloadAsset(asset.file_path);
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = asset.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file');
        }
    };

    const previewAsset = (asset: ProjectAsset) => {
        const publicUrl = SupabaseProjectAssetsService.getAssetUrl(asset.file_path);
        if (asset.type.startsWith('image/')) {
            window.open(publicUrl, '_blank');
        } else {
            downloadAsset(asset);
        }
    };

    const getAssetStats = () => {
        const stats = {
            total: allAssets.length,
            byCategory: {
                logo: allAssets.filter(a => a.category === 'logo').length,
                images: allAssets.filter(a => a.category === 'images').length,
                content: allAssets.filter(a => a.category === 'content').length,
                brand: allAssets.filter(a => a.category === 'brand').length,
            },
            totalSize: allAssets.reduce((sum, asset) => sum + asset.size, 0),
        };
        return stats;
    };

    const stats = getAssetStats();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading assets...</p>
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
            {/* Header & Stats */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Project Assets</h2>
                            <p className="text-gray-600">Manage all client-uploaded assets</p>
                        </div>
                        <Button onClick={loadAllAssets} variant="outline" size="sm">
                            Refresh
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-blue-700">Total Assets</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.byCategory.logo}</div>
                            <div className="text-sm text-purple-700">Logo Files</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.byCategory.images}</div>
                            <div className="text-sm text-green-700">Images</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.byCategory.content}</div>
                            <div className="text-sm text-orange-700">Content Files</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-600">{formatFileSize(stats.totalSize)}</div>
                            <div className="text-sm text-gray-700">Total Size</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Projects</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="logo">Logo & Branding</option>
                                <option value="images">Images & Photos</option>
                                <option value="content">Content & Text</option>
                                <option value="brand">Brand Assets</option>
                            </select>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Assets Grid */}
            <motion.div variants={fadeInUp}>
                {filteredAssets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAssets.map((asset) => (
                            <Card key={asset.id} className="p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg border ${getCategoryColor(asset.category)}`}>
                                            {getCategoryIcon(asset.category)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">{asset.name}</h3>
                                            <p className="text-xs text-gray-500">{formatFileSize(asset.size)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Preview */}
                                {asset.type.startsWith('image/') && (
                                    <div className="mb-3">
                                        <img
                                            src={SupabaseProjectAssetsService.getAssetUrl(asset.file_path)}
                                            alt={asset.name}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}

                                {/* Asset Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <FolderIcon className="w-3 h-3" />
                                        <span>{getProjectTitle(asset.project_id)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <CalendarIcon className="w-3 h-3" />
                                        <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(asset.category)}`}>
                                            {asset.category.charAt(0).toUpperCase() + asset.category.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => previewAsset(asset)}
                                        className="flex-1"
                                    >
                                        <EyeIcon className="w-3 h-3 mr-1" />
                                        Preview
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => downloadAsset(asset)}
                                        className="flex-1"
                                    >
                                        <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
                        <p className="text-gray-600">
                            {selectedProject !== 'all' || selectedCategory !== 'all'
                                ? 'No assets match the selected filters.'
                                : 'No assets have been uploaded yet.'}
                        </p>
                    </Card>
                )}
            </motion.div>
        </motion.div>
    );
};