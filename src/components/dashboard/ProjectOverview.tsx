import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../common';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ClientInvoiceModal } from './ClientInvoiceModal';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import type { Database } from '../../types/database';
import { SupabaseProjectAssetsService, type ProjectAsset } from '../../services/supabase/projectAssets';
import { useAuth } from '../../hooks/useAuth';
import {
    CloudArrowUpIcon,
    DocumentTextIcon,
    PhotoIcon,
    PaintBrushIcon,
    SwatchIcon,
    CheckCircleIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

// Removed WebsiteRequestRow - using only projects now
type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface ProjectOverviewProps {
    projects: ProjectRow[];
}

interface ProjectOverviewProps {
    projects: ProjectRow[];
    onNavigateToSupport?: () => void;
    onStartProject?: () => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
    projects,
    onNavigateToSupport,
    onStartProject,
}) => {
    const { user } = useAuth();
    const [activeProjectId, setActiveProjectId] = useState<string | null>(
        projects.length > 0 ? projects[0].id : null
    );
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, ProjectAsset[]>>({});
    const [dragActive, setDragActive] = useState<string | null>(null);

    const activeProject = projects.find(p => p.id === activeProjectId);

    // Load assets on component mount and when projects change
    useEffect(() => {
        const loadAssets = async () => {
            const assetsMap: Record<string, ProjectAsset[]> = {};
            for (const project of projects) {
                const assets = await SupabaseProjectAssetsService.getProjectAssets(project.id);
                assetsMap[project.id] = assets;
            }
            setUploadedFiles(assetsMap);
        };

        if (projects.length > 0) {
            loadAssets();
        }
    }, [projects]);

    const handleViewInvoice = (project: ProjectRow) => {
        setSelectedProject(project);
        setIsInvoiceModalOpen(true);
    };

    const handleCloseInvoiceModal = () => {
        setSelectedProject(null);
        setIsInvoiceModalOpen(false);
    };



    // File upload handling
    const handleFileUpload = useCallback(async (files: FileList, category: string, projectId: string) => {
        if (!user) return;

        const maxSize = 2 * 1024 * 1024; // 2MB
        const oversizedFiles: File[] = [];
        const validFiles: File[] = [];

        Array.from(files).forEach(file => {
            if (file.size > maxSize) {
                oversizedFiles.push(file);
            } else {
                validFiles.push(file);
            }
        });

        // Upload valid files
        for (const file of validFiles) {
            try {
                const asset = await SupabaseProjectAssetsService.uploadAsset(file, category, projectId, user.id);
                setUploadedFiles(prev => ({
                    ...prev,
                    [projectId]: [...(prev[projectId] || []), asset]
                }));
            } catch (error) {
                console.error('Failed to upload file:', file.name, error);
                alert(`Failed to upload ${file.name}. Please try again.`);
            }
        }

        if (oversizedFiles.length > 0) {
            alert(`${oversizedFiles.length} file(s) exceed 2MB limit. Please send large files to websiter.clickapp@gmail.com or contact us through creating ticket to find better solution.`);
        }
    }, [user]);

    const handleDrop = useCallback((e: React.DragEvent, category: string, projectId: string) => {
        e.preventDefault();
        setDragActive(null);

        if (e.dataTransfer.files) {
            handleFileUpload(e.dataTransfer.files, category, projectId);
        }
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e: React.DragEvent, category: string) => {
        e.preventDefault();
        setDragActive(category);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(null);
    }, []);

    const removeFile = async (projectId: string, assetId: string) => {
        const success = await SupabaseProjectAssetsService.deleteAsset(assetId);
        if (success) {
            setUploadedFiles(prev => ({
                ...prev,
                [projectId]: prev[projectId]?.filter(f => f.id !== assetId) || []
            }));
        } else {
            alert('Failed to delete file. Please try again.');
        }
    };



    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Asset Upload Component
    const AssetUploadSection = ({ category, title, icon: Icon, description, acceptedFormats, projectId }: {
        category: string;
        title: string;
        icon: any;
        description: string;
        acceptedFormats: string;
        projectId: string;
    }) => {
        const categoryFiles = uploadedFiles[projectId]?.filter(f => f.category === category) || [];
        const hasFiles = categoryFiles.length > 0;

        return (
            <Card className={`p-4 transition-all duration-300 ${hasFiles ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${hasFiles ? 'text-green-600' : 'text-primary-600'}`} />
                        <h3 className={`font-semibold ${hasFiles ? 'text-green-900' : 'text-secondary-900'}`}>{title}</h3>
                        {hasFiles && (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${hasFiles ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-500'}`}>
                        {categoryFiles.length} files
                    </span>
                </div>

                <p className={`text-sm mb-3 ${hasFiles ? 'text-green-700' : 'text-secondary-600'}`}>{description}</p>
                <p className={`text-xs mb-4 ${hasFiles ? 'text-green-600' : 'text-secondary-500'}`}>Accepted: {acceptedFormats}</p>

                {/* Upload Area */}
                <label className={`block border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragActive === category
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-300 hover:border-primary-400 hover:bg-primary-25'
                    }`}
                    onDrop={(e) => handleDrop(e, category, projectId)}
                    onDragOver={(e) => handleDragOver(e, category)}
                    onDragLeave={handleDragLeave}
                >
                    <CloudArrowUpIcon className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary-600 mb-2">
                        Drag & drop files here or <span className="text-primary-600 hover:text-primary-700 underline">click to select</span>
                    </p>
                    <p className="text-xs text-secondary-500">Max 2MB per file</p>
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        accept={acceptedFormats}
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files, category, projectId)}
                    />
                </label>

                {/* Uploaded Files */}
                {categoryFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-secondary-700">Uploaded Files:</h4>
                        {categoryFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-green-100 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="w-4 h-4 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-900">{file.name}</p>
                                        <p className="text-xs text-green-600">
                                            {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => removeFile(projectId, file.id)}
                                        className="p-1 hover:bg-red-50 hover:text-red-600 border-green-300"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        );
    };

    // Check for active projects (not completed)
    const activeProjects = projects.filter(p => p.status !== 'completed');
    const hasActiveProject = activeProjects.length > 0;

    if (projects.length === 0) {
        return (
            <motion.div variants={fadeInUp}>
                <Card className="p-12 text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                        Ready to Start Your First Project?
                    </h2>
                    <p className="text-secondary-600 mb-6">
                        You haven't created any projects yet. Let's get started!
                    </p>
                    <Button size="lg" onClick={() => onStartProject?.()}>
                        Start New Project
                    </Button>
                </Card>
            </motion.div>
        );
    }

    // If user has completed projects but no active ones, allow starting a new project
    if (!hasActiveProject) {
        return (
            <motion.div variants={fadeInUp}>
                <Card className="p-12 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                        Ready for Your Next Project?
                    </h2>
                    <p className="text-secondary-600 mb-6">
                        Your previous projects are completed. Start a new website project with us!
                    </p>
                    <Button size="lg" onClick={() => onStartProject?.()}>
                        Start New Project
                    </Button>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
        >
            {/* Project Tabs */}
            <motion.div variants={fadeInUp}>
                <Card className="p-0 overflow-hidden">
                    {/* Tab Headers */}
                    <div className="flex border-b border-secondary-200 bg-secondary-50">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => setActiveProjectId(project.id)}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeProjectId === project.id
                                    ? 'border-primary-500 text-primary-600 bg-white'
                                    : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{project.title}</span>
                                    <ProjectStatusBadge status={project.status} />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeProject && (
                        <div className="p-6">
                            {/* Project Header */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-secondary-900 mb-2">{activeProject.title}</h1>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">📁 File Upload Guidelines</h3>
                                    <div className="text-sm text-blue-800 space-y-1">
                                        <p>• <strong>Maximum file size:</strong> 2MB per file</p>
                                        <p>• <strong>For larger files:</strong> Send them directly to <strong>websiter.clickapp@gmail.com</strong> or contact us through creating ticket to find better solution</p>
                                    </div>
                                </div>
                            </div>

                            {/* Asset Section Header */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-secondary-900">📁 Project Assets</h2>
                                <p className="text-sm text-secondary-600 mt-1">
                                    Help us get started by uploading your project assets below
                                </p>
                            </div>

                            {/* Asset Upload Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <AssetUploadSection
                                    category="logo"
                                    title="Logo & Branding"
                                    icon={SwatchIcon}
                                    description="Upload your current logo, brand guidelines, or any branding materials"
                                    acceptedFormats=".png,.jpg,.jpeg,.svg,.pdf"
                                    projectId={activeProject.id}
                                />

                                <AssetUploadSection
                                    category="images"
                                    title="Images & Photos"
                                    icon={PhotoIcon}
                                    description="Product photos, team photos, or any images for your website"
                                    acceptedFormats=".png,.jpg,.jpeg,.webp"
                                    projectId={activeProject.id}
                                />

                                <AssetUploadSection
                                    category="content"
                                    title="Content & Text"
                                    icon={DocumentTextIcon}
                                    description="Website copy, about us text, product descriptions, or any written content"
                                    acceptedFormats=".txt,.doc,.docx,.pdf"
                                    projectId={activeProject.id}
                                />

                                <AssetUploadSection
                                    category="brand"
                                    title="Brand Assets"
                                    icon={PaintBrushIcon}
                                    description="Color palettes, fonts, style guides, or design references"
                                    acceptedFormats=".pdf,.png,.jpg,.jpeg"
                                    projectId={activeProject.id}
                                />
                            </div>

                            {/* Project Actions */}
                            <div className="flex items-center justify-between pt-6 border-t border-secondary-200">
                                <div className="text-sm text-secondary-600">
                                    Created: {new Date(activeProject.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleViewInvoice(activeProject)}
                                    >
                                        View Invoice
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => onNavigateToSupport?.()}
                                    >
                                        Create a Ticket
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>



            {/* Invoice Modal */}
            <ClientInvoiceModal
                project={selectedProject}
                isOpen={isInvoiceModalOpen}
                onClose={handleCloseInvoiceModal}
            />
        </motion.div>
    );
};