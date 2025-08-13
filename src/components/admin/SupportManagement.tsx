import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Modal } from '../common';
import { TicketService } from '../../services/supabase/tickets';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import type { Database } from '../../types/database';
import toast from 'react-hot-toast';

type TicketRow = Database['public']['Tables']['support_tickets']['Row'];

export const SupportManagement: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
    const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
    const [responseMessage, setResponseMessage] = useState('');
    const [sendingResponse, setSendingResponse] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const allTickets = await TicketService.getAllTickets();
            setTickets(allTickets);
        } catch (error) {
            console.error('Error loading tickets:', error);
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (ticketId: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
        try {
            await TicketService.updateTicketStatus(ticketId, newStatus);
            toast.success(`Ticket status updated to ${newStatus}`);
            loadTickets();

            // Update selected ticket if it's the one being updated
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating ticket status:', error);
            toast.error('Failed to update ticket status');
        }
    };

    const handleSendResponse = async () => {
        if (!selectedTicket || !user || !responseMessage.trim()) return;

        try {
            setSendingResponse(true);
            const newResponse = await TicketService.addTicketResponse({
                ticketId: selectedTicket.id,
                message: responseMessage.trim(),
                isAdminResponse: true,
            }, user.id);

            toast.success('Response sent successfully');
            setResponseMessage('');

            // Update the selected ticket with the new response
            const updatedTicket = {
                ...selectedTicket,
                ticket_responses: [
                    ...((selectedTicket as any).ticket_responses || []),
                    newResponse
                ]
            };
            setSelectedTicket(updatedTicket as any);

            // Reload all tickets to update the list
            loadTickets();
        } catch (error) {
            console.error('Error sending response:', error);
            toast.error('Failed to send response');
        } finally {
            setSendingResponse(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'all') return true;
        return ticket.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        🔴 Open
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        🟡 In Progress
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        🟢 Resolved
                    </span>
                );
            case 'closed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        ⚫ Closed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        ❓ Unknown
                    </span>
                );
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                        🚨 Urgent
                    </span>
                );
            case 'high':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
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
                        <h2 className="text-2xl font-bold text-gray-900">
                            🎧 Support Ticket Management
                        </h2>
                        <p className="text-gray-600">
                            Manage and respond to client support tickets
                        </p>
                    </div>
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
                            { key: 'closed', label: 'Closed', count: tickets.filter(t => t.status === 'closed').length },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Support Tickets
                    </h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">⏳</div>
                            <div className="text-gray-600">Loading tickets...</div>
                        </div>
                    ) : filteredTickets.length > 0 ? (
                        <div className="space-y-4">
                            {filteredTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">
                                                {getCategoryIcon(ticket.category)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {ticket.subject}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {ticket.description.length > 100
                                                        ? `${ticket.description.substring(0, 100)}...`
                                                        : ticket.description}
                                                </p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusBadge(ticket.status)}
                                                    {getPriorityBadge(ticket.priority)}
                                                    <span className="text-xs text-gray-500">
                                                        {ticket.category}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Client: {(ticket as any).users?.name || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => handleStatusUpdate(ticket.id, e.target.value as any)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                            >
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600">
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
                            <div className="text-gray-600">
                                No {filter === 'all' ? '' : filter} tickets found
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Ticket Details Modal */}
            <Modal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                size="lg"
            >
                {selectedTicket && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Ticket Details
                            </h2>
                            <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    {selectedTicket.subject}
                                </h3>
                                <p className="text-gray-600 mb-3">
                                    {selectedTicket.description}
                                </p>
                                <div className="flex items-center gap-2 mb-4">
                                    {getStatusBadge(selectedTicket.status)}
                                    {getPriorityBadge(selectedTicket.priority)}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600">
                                    <div>Client: {(selectedTicket as any).users?.name || 'Unknown'}</div>
                                    <div>Email: {(selectedTicket as any).users?.email || 'Unknown'}</div>
                                    <div>Category: {selectedTicket.category}</div>
                                    <div>Created: {new Date(selectedTicket.created_at).toLocaleString()}</div>
                                    <div>Last Updated: {new Date(selectedTicket.updated_at).toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Conversation Thread */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                    💬 Conversation
                                </h4>
                                <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                                    {/* Original Ticket */}
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {((selectedTicket as any).users?.name || 'Client')[0].toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-blue-50 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-blue-900">
                                                        {(selectedTicket as any).users?.name || 'Client'}
                                                    </span>
                                                    <span className="text-xs text-blue-600">
                                                        {new Date(selectedTicket.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-blue-800 text-sm">
                                                    {selectedTicket.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Responses */}
                                    {(selectedTicket as any).ticket_responses &&
                                        (selectedTicket as any).ticket_responses
                                            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                            .map((response: any) => (
                                                <div key={response.id} className={`flex gap-3 ${response.is_admin_response ? 'flex-row-reverse' : ''}`}>
                                                    <div className="flex-shrink-0">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${response.is_admin_response
                                                            ? 'bg-green-100'
                                                            : 'bg-blue-100'
                                                            }`}>
                                                            <span className={`text-sm font-medium ${response.is_admin_response
                                                                ? 'text-green-600'
                                                                : 'text-blue-600'
                                                                }`}>
                                                                {response.is_admin_response
                                                                    ? '🛠️'
                                                                    : (response.users?.name || 'Client')[0].toUpperCase()
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`rounded-lg p-3 ${response.is_admin_response
                                                            ? 'bg-green-50'
                                                            : 'bg-gray-50'
                                                            }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className={`font-medium ${response.is_admin_response
                                                                    ? 'text-green-900'
                                                                    : 'text-gray-900'
                                                                    }`}>
                                                                    {response.is_admin_response
                                                                        ? 'Support Team'
                                                                        : (response.users?.name || 'Client')
                                                                    }
                                                                </span>
                                                                <span className={`text-xs ${response.is_admin_response
                                                                    ? 'text-green-600'
                                                                    : 'text-gray-600'
                                                                    }`}>
                                                                    {new Date(response.created_at).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm ${response.is_admin_response
                                                                ? 'text-green-800'
                                                                : 'text-gray-800'
                                                                }`}>
                                                                {response.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                    {/* No responses message */}
                                    {!(selectedTicket as any).ticket_responses || (selectedTicket as any).ticket_responses.length === 0 && (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            No responses yet. Be the first to respond!
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attachments Section */}
                            {(selectedTicket as any).ticket_attachments && (selectedTicket as any).ticket_attachments.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">
                                        📎 Attachments
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(selectedTicket as any).ticket_attachments.map((attachment: any) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="text-lg">
                                                    {attachment.file_type.startsWith('image/') ? '🖼️' :
                                                        attachment.file_type === 'application/pdf' ? '📄' : '📝'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {attachment.file_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(attachment.file_url, '_blank')}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    📥
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Update */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Update Status
                                </label>
                                <select
                                    value={selectedTicket.status}
                                    onChange={(e) => handleStatusUpdate(selectedTicket.id, e.target.value as any)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            {/* Response Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Send Response to Client
                                </label>
                                <textarea
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    placeholder="Type your response to the client..."
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedTicket(null)}
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={handleSendResponse}
                                    disabled={!responseMessage.trim() || sendingResponse}
                                    loading={sendingResponse}
                                    className="flex-1"
                                >
                                    Send Response
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
};