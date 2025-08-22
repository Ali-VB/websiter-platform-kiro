import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Modal } from '../common';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketService } from '../../services/supabase/tickets';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import type { Database } from '../../types/database';
import toast from 'react-hot-toast';

type TicketRow = Database['public']['Tables']['support_tickets']['Row'];

export const SupportTickets: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [responseMessage, setResponseMessage] = useState('');
    const [sendingResponse, setSendingResponse] = useState(false);

    // Load tickets on component mount
    useEffect(() => {
        if (user) {
            loadTickets();
        }
    }, [user]);

    const loadTickets = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const clientTickets = await TicketService.getClientTickets(user.id);
            setTickets(clientTickets);
        } catch (error) {
            console.error('Error loading tickets:', error);
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleTicketCreated = () => {
        setShowCreateModal(false);
        loadTickets(); // Refresh tickets list
        toast.success('Support ticket created successfully!');
    };

    const handleSendResponse = async () => {
        if (!selectedTicket || !user || !responseMessage.trim()) return;

        try {
            setSendingResponse(true);
            await TicketService.addTicketResponse({
                ticketId: selectedTicket.id,
                message: responseMessage.trim(),
                isAdminResponse: false,
            }, user.id);

            toast.success('Response sent successfully!');
            setResponseMessage('');
            loadTickets();

            // Update selected ticket to show new response
            const updatedTickets = await TicketService.getClientTickets(user.id);
            const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
            }
        } catch (error) {
            console.error('Error sending response:', error);
            toast.error('Failed to send response. Please try again.');
        } finally {
            setSendingResponse(false);
        }
    };

    const canClientRespond = (ticket: any) => {
        // Client can respond if:
        // 1. Ticket is not closed or resolved
        // 2. Last response was from admin (or no responses yet)
        if (ticket.status === 'closed' || ticket.status === 'resolved') {
            return false;
        }

        const responses = ticket.ticket_responses || [];
        if (responses.length === 0) {
            return true; // No responses yet, client can respond
        }

        // Check if last response was from admin
        const lastResponse = responses.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        return lastResponse.is_admin_response;
    };

    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'all') return true;
        return ticket.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800 border border-error-200">
                        🔴 Open
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
                        🟡 In Progress
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200">
                        🟢 Resolved
                    </span>
                );
            case 'closed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 border border-secondary-200">
                        ⚫ Closed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 border border-secondary-200">
                        ❓ Unknown
                    </span>
                );
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-error-100 text-error-800">
                        🚨 Urgent
                    </span>
                );
            case 'high':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-warning-100 text-warning-800">
                        🔥 High
                    </span>
                );
            case 'medium':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        📋 Medium
                    </span>
                );
            case 'low':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        📝 Low
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {priority}
                    </span>
                );
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Technical Issue': return '🔧';
            case 'Design Change': return '🎨';
            case 'Content Update': return '📝';
            case 'General Question': return '❓';
            default: return '📋';
        }
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-secondary-900">
                            🎧 Support Center
                        </h2>
                        <p className="text-secondary-600">
                            Get help with your projects and account
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary-600 hover:bg-primary-700"
                    >
                        Create Ticket
                    </Button>
                </div>
            </motion.div>


            {/* Filter Tabs */}
            <motion.div variants={fadeInUp}>
                <Card className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {[ 
                            { key: 'all', label: 'All Tickets', count: tickets.length },
                            { key: 'open', label: 'Open', count: tickets.filter(t => t.status === 'open').length },
                            { key: 'in_progress', label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length },
                            { key: 'resolved', label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-secondary-600 hover:bg-secondary-100'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Tickets List */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        Your Support Tickets
                    </h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">⏳</div>
                            <div className="text-secondary-600">Loading tickets...</div>
                        </div>
                    ) : filteredTickets.length > 0 ? (
                        <div className="space-y-4">
                            {filteredTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="border border-secondary-200 rounded-xl p-4 hover:shadow-soft transition-shadow cursor-pointer"
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">
                                                {getCategoryIcon(ticket.category)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-secondary-900 mb-1">
                                                    {ticket.subject}
                                                </h4>
                                                <p className="text-sm text-secondary-600 mb-2">
                                                    {ticket.description}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(ticket.status)}
                                                    {getPriorityBadge(ticket.priority)}
                                                    <span className="text-xs text-secondary-500">
                                                        {ticket.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-secondary-600">
                                        <div>
                                            Created: {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                        <div>
                                            Updated: {new Date(ticket.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">🎫</div>
                            <div className="text-secondary-600">
                                No {filter === 'all' ? '' : filter} tickets found
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Help Resources */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        📚 Help Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="text-center p-4 border border-secondary-200 rounded-lg hover:shadow-soft transition-shadow cursor-pointer">
                            <div className="text-3xl mb-2">📖</div>
                            <div className="font-medium text-secondary-900">Knowledge Base</div>
                            <div className="text-sm text-secondary-600">Common questions and guides</div>
                        </div>
                        <div className="text-center p-4 border border-secondary-200 rounded-lg hover:shadow-soft transition-shadow cursor-pointer">
                            <div className="text-3xl mb-2">🎥</div>
                            <div className="font-medium text-secondary-900">Video Tutorials</div>
                            <div className="text-sm text-secondary-600">Step-by-step video guides</div>
                        </div>
                        <div className="text-center p-4 border border-secondary-200 rounded-lg hover:shadow-soft transition-shadow cursor-pointer">
                            <div className="text-3xl mb-2">💬</div>
                            <div className="font-medium text-secondary-900">Live Chat</div>
                            <div className="text-sm text-secondary-600">Chat with our support team</div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Create Ticket Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                size="lg"
            >
                <CreateTicketModal
                    onClose={() => setShowCreateModal(false)}
                    onTicketCreated={handleTicketCreated}
                />
            </Modal>

            {/* Ticket Details Modal */}
            <Modal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                size="2xl"
            >
                {selectedTicket && (
                    <div className="p-6 max-h-[75vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-secondary-900">
                                Ticket Details
                            </h2>
                            <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Ticket Info */}
                            <div>
                                <h3 className="font-semibold text-secondary-900 mb-2">
                                    {selectedTicket.subject}
                                </h3>
                                <p className="text-secondary-600 mb-3">
                                    {selectedTicket.description}
                                </p>
                                <div className="flex items-center gap-2 mb-4">
                                    {getStatusBadge(selectedTicket.status)}
                                    {getPriorityBadge(selectedTicket.priority)}
                                </div>
                            </div>

                            <div className="bg-secondary-50 rounded-lg p-4">
                                <div className="text-sm text-secondary-600">
                                    <div>Category: {selectedTicket.category}</div>
                                    <div>Created: {new Date(selectedTicket.created_at).toLocaleString()}</div>
                                    <div>Last Updated: {new Date(selectedTicket.updated_at).toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Responses Section */}
                            {(selectedTicket as any).ticket_responses && (selectedTicket as any).ticket_responses.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-secondary-900 mb-3">
                                        💬 Conversation
                                    </h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {(selectedTicket as any).ticket_responses
                                            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                            .map((response: any) => (
                                                <div
                                                    key={response.id}
                                                    className={`p-3 rounded-lg ${response.is_admin_response
                                                        ? 'bg-primary-50 border-l-4 border-primary-500 ml-4'
                                                        : 'bg-secondary-100 border-l-4 border-secondary-400 mr-4'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-secondary-900">
                                                                {response.is_admin_response ? '🛠️ Support Team' : '👤 You'}
                                                            </span>
                                                            {response.is_admin_response && (
                                                                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-secondary-500">
                                                            {new Date(response.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-secondary-700 text-sm whitespace-pre-wrap">
                                                        {response.message}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* No responses message */}
                            {!(selectedTicket as any).ticket_responses || (selectedTicket as any).ticket_responses.length === 0 && (
                                <div className="text-center py-6 bg-secondary-50 rounded-lg">
                                    <div className="text-3xl mb-2">💬</div>
                                    <div className="text-secondary-600">
                                        No responses yet. Our support team will respond soon!
                                    </div>
                                </div>
                            )}

                            {/* Attachments Section */}
                            {(selectedTicket as any).ticket_attachments && (selectedTicket as any).ticket_attachments.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-secondary-900 mb-3">
                                        📎 Attachments
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(selectedTicket as any).ticket_attachments.map((attachment: any) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg border hover:bg-secondary-100 transition-colors"
                                            >
                                                <div className="text-lg">
                                                    {attachment.file_type.startsWith('image/') ? '🖼️' :
                                                        attachment.file_type === 'application/pdf' ? '📄' : '📝'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-secondary-900 truncate">
                                                        {attachment.file_name}
                                                    </div>
                                                    <div className="text-xs text-secondary-500">
                                                        {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(attachment.file_url, '_blank')}
                                                    className="text-primary-600 hover:text-primary-700"
                                                >
                                                    📥
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Client Response Section */}
                            {canClientRespond(selectedTicket) && (
                                <div className="border-t border-secondary-200 pt-4">
                                    <h4 className="font-semibold text-secondary-900 mb-3">
                                        💬 Add Your Response
                                    </h4>
                                    <div className="space-y-3">
                                        <textarea
                                            value={responseMessage}
                                            onChange={(e) => setResponseMessage(e.target.value)}
                                            placeholder="Type your response here..."
                                            rows={4}
                                            disabled={sendingResponse}
                                            className="w-full border border-secondary-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        <div className="flex justify-between items-center">
                                            <div className="text-xs text-secondary-500">
                                                {responseMessage.length}/1000 characters
                                            </div>
                                            <Button
                                                onClick={handleSendResponse}
                                                disabled={!responseMessage.trim() || sendingResponse || responseMessage.length > 1000}
                                                loading={sendingResponse}
                                                className="bg-primary-600 hover:bg-primary-700"
                                            >
                                                Send Response
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Response Status Messages */}
                            {selectedTicket.status === 'resolved' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-green-600 text-lg">✅</div>
                                        <div>
                                            <div className="font-medium text-green-900">Ticket Resolved</div>
                                            <div className="text-sm text-green-700">
                                                This ticket has been marked as resolved. If you need further assistance, please create a new ticket.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedTicket.status === 'closed' && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-gray-600 text-lg">🔒</div>
                                        <div>
                                            <div className="font-medium text-gray-900">Ticket Closed</div>
                                            <div className="text-sm text-gray-700">
                                                This ticket has been closed. If you need further assistance, please create a new ticket.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!canClientRespond(selectedTicket) && selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-blue-600 text-lg">⏳</div>
                                        <div>
                                            <div className="font-medium text-blue-900">
                                                {((selectedTicket as any).ticket_responses || []).length >= 8
                                                    ? 'Conversation Limit Reached'
                                                    : 'Waiting for Support Team'
                                                }
                                            </div>
                                            <div className="text-sm text-blue-700">
                                                {((selectedTicket as any).ticket_responses || []).length >= 8
                                                    ? 'This conversation has reached the maximum number of exchanges. Please create a new ticket for additional assistance.'
                                                    : 'Our support team will respond to your message soon. You\'ll be able to reply once they respond.'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setSelectedTicket(null)} className="flex-1">
                                    Close
                                </Button>
                                {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && (
                                    <Button
                                        className="flex-1 bg-primary-600 hover:bg-primary-700"
                                        onClick={() => {
                                            setSelectedTicket(null);
                                            setShowCreateModal(true);
                                        }}
                                    >
                                        Create New Ticket
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
};