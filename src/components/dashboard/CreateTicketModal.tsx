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