import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '../common';
import { TicketService } from '../../services/supabase/tickets';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import toast from 'react-hot-toast';

interface CreateTicketModalProps {
    onClose: () => void;
    onTicketCreated?: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onClose, onTicketCreated }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: '',
        category: 'General Question',
        priority: 'medium',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const categories = [
        'Technical Issue',
        'Design Change',
        'Content Update',
        'General Question',
    ];

    const priorities = [
        { value: 'low', label: 'Low', icon: '📝' },
        { value: 'medium', label: 'Medium', icon: '📋' },
        { value: 'high', label: 'High', icon: '🔥' },
        { value: 'urgent', label: 'Urgent', icon: '🚨' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to create a ticket');
            return;
        }

        setLoading(true);

        try {
            await TicketService.createTicket({
                subject: formData.subject,
                category: formData.category as any,
                priority: formData.priority as any,
                description: formData.description,
                attachments: attachments.length > 0 ? attachments : undefined,
            }, user.id);

            toast.success('Support ticket created successfully! We\'ll get back to you soon.');
            onTicketCreated?.();
            onClose();
        } catch (error) {
            console.error('Failed to create ticket:', error);
            toast.error('Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // File upload handlers
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
        const validFiles: File[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        files.forEach(file => {
            if (file.size > maxSize) {
                toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                toast.error(`File "${file.name}" is not a supported format.`);
                return;
            }

            validFiles.push(file);
        });

        if (attachments.length + validFiles.length > 5) {
            toast.error('Maximum 5 files allowed per ticket.');
            return;
        }

        setAttachments(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="p-6 max-w-2xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-secondary-900">
                        🎫 Create Support Ticket
                    </h2>
                    <Button variant="ghost" onClick={onClose} className="text-secondary-500">
                        ✕
                    </Button>
                </div>
                <p className="text-secondary-600">
                    Describe your issue or question and we'll help you resolve it quickly.
                </p>
            </motion.div>

            {/* Form */}
            <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                        Subject *
                    </label>
                    <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of your issue"
                        required
                        disabled={loading}
                    />
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-2">
                        Category *
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="input"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Priority *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {priorities.map((priority) => (
                            <button
                                key={priority.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                                disabled={loading}
                                className={`p-3 border rounded-lg text-center transition-all ${formData.priority === priority.value
                                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                                    : 'border-secondary-200 hover:border-secondary-300 text-secondary-700'
                                    }`}
                            >
                                <div className="text-lg mb-1">{priority.icon}</div>
                                <div className="text-sm font-medium">{priority.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Please provide detailed information about your issue or question..."
                        required
                        disabled={loading}
                        rows={6}
                        className="input resize-none"
                    />
                    <div className="text-xs text-secondary-500 mt-1">
                        Include as much detail as possible to help us resolve your issue quickly.
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Attachments (Optional)
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragActive
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-secondary-300 hover:border-secondary-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <div className="text-3xl mb-2">📎</div>
                        <div className="text-sm text-secondary-600 mb-2">
                            Drag and drop files here, or click to browse
                        </div>
                        <div className="text-xs text-secondary-500">
                            Supported: Images, PDFs, Documents (Max 10MB each, 5 files max)
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            disabled={loading}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* File List */}
                    {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <div className="text-sm font-medium text-secondary-700">
                                Attached Files ({attachments.length}/5)
                            </div>
                            {attachments.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg">
                                            {file.type.startsWith('image/') ? '🖼️' :
                                                file.type === 'application/pdf' ? '📄' : '📝'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-secondary-900">
                                                {file.name}
                                            </div>
                                            <div className="text-xs text-secondary-500">
                                                {formatFileSize(file.size)}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        disabled={loading}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Response Time Notice */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="text-primary-600 text-lg">⏱️</div>
                        <div>
                            <div className="font-medium text-primary-900 mb-1">
                                Expected Response Time
                            </div>
                            <div className="text-sm text-primary-700">
                                <div>• <strong>Urgent:</strong> Within 2 hours</div>
                                <div>• <strong>High:</strong> Within 4 hours</div>
                                <div>• <strong>Medium:</strong> Within 24 hours</div>
                                <div>• <strong>Low:</strong> Within 48 hours</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        className="flex-1 bg-primary-600 hover:bg-primary-700"
                    >
                        Create Ticket
                    </Button>
                </div>
            </motion.form>
        </motion.div>
    );
};