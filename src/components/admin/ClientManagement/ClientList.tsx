import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { ClientDetailModal } from './ClientDetailModal';
import { useAllProjects } from '../../../hooks/useProjects';
import { transformProjectForAdmin } from '../../../services/supabase/projects';
import type { Project } from '../../../types';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    EyeIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    projects: Project[];
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalValue: number;
    lastActivity: Date;
    joinedDate: Date;
}

interface ClientListProps {
    className?: string;
}

export const ClientList: React.FC<ClientListProps> = ({ className = '' }) => {
    const { projects: rawProjects, loading, error } = useAllProjects();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'projects' | 'value' | 'activity'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Transform projects and group by client
    const clients: Client[] = React.useMemo(() => {
        if (!rawProjects.length) return [];

        const projects = rawProjects.map(transformProjectForAdmin);
        const clientMap = new Map<string, Client>();

        projects.forEach(project => {
            const clientId = project.clientId || project.clientEmail;
            const clientName = project.clientName || 'Unknown Client';
            const clientEmail = project.clientEmail || 'No email';

            if (!clientMap.has(clientId)) {
                clientMap.set(clientId, {
                    id: clientId,
                    name: clientName,
                    email: clientEmail,
                    phone: project.contactInfo?.phone || '',
                    company: project.contactInfo?.company || '',
                    projects: [],
                    totalProjects: 0,
                    activeProjects: 0,
                    completedProjects: 0,
                    totalValue: 0,
                    lastActivity: project.updatedAt,
                    joinedDate: project.createdAt
                });
            }

            const client = clientMap.get(clientId)!;
            client.projects.push(project);
            client.totalProjects++;
            client.totalValue += project.price || 0;

            if (project.status === 'completed') {
                client.completedProjects++;
            } else if (['in_progress', 'in_design', 'review'].includes(project.status)) {
                client.activeProjects++;
            }

            // Update last activity if this project is newer
            if (project.updatedAt > client.lastActivity) {
                client.lastActivity = project.updatedAt;
            }

            // Update joined date if this project is older
            if (project.createdAt < client.joinedDate) {
                client.joinedDate = project.createdAt;
            }
        });

        return Array.from(clientMap.values());
    }, [rawProjects]);

    // Filter and sort clients
    const filteredClients = clients
        .filter(client => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                client.name.toLowerCase().includes(query) ||
                client.email.toLowerCase().includes(query) ||
                client.company?.toLowerCase().includes(query)
            );
        })
        .sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'projects':
                    aValue = a.totalProjects;
                    bValue = b.totalProjects;
                    break;
                case 'value':
                    aValue = a.totalValue;
                    bValue = b.totalValue;
                    break;
                case 'activity':
                    aValue = a.lastActivity.getTime();
                    bValue = b.lastActivity.getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const getClientStatusColor = (client: Client) => {
        if (client.activeProjects > 0) {
            return 'bg-green-100 text-green-800 border-green-200';
        } else if (client.completedProjects > 0) {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        } else {
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getClientStatus = (client: Client) => {
        if (client.activeProjects > 0) {
            return 'Active';
        } else if (client.completedProjects > 0) {
            return 'Past Client';
        } else {
            return 'New';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 border-red-200 bg-red-50">
                <div className="text-center">
                    <h3 className="font-medium text-red-800 mb-2">Error Loading Clients</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>


            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
                    <p className="text-gray-600 mt-1">
                        Manage {clients.length} clients and their projects
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients by name, email, or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="projects">Sort by Projects</option>
                            <option value="value">Sort by Value</option>
                            <option value="activity">Sort by Activity</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Client Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Clients</p>
                            <p className="text-xl font-semibold text-gray-900">{clients.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Clients</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {clients.filter(c => c.activeProjects > 0).length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Projects</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {clients.reduce((sum, c) => sum + c.totalProjects, 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 font-semibold">$</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Value</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {formatCurrency(clients.reduce((sum, c) => sum + c.totalValue, 0))}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Client List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <motion.div
                        key={client.id}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            {/* Client Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                                        <Badge className={getClientStatusColor(client)}>
                                            {getClientStatus(client)}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedClient(client)}
                                    className="p-2"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Client Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <EnvelopeIcon className="w-4 h-4" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                                {client.phone && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <PhoneIcon className="w-4 h-4" />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.company && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <BuildingOfficeIcon className="w-4 h-4" />
                                        <span className="truncate">{client.company}</span>
                                    </div>
                                )}
                            </div>

                            {/* Project Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900">{client.totalProjects}</p>
                                    <p className="text-xs text-gray-600">Total</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-green-600">{client.activeProjects}</p>
                                    <p className="text-xs text-gray-600">Active</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-blue-600">{client.completedProjects}</p>
                                    <p className="text-xs text-gray-600">Done</p>
                                </div>
                            </div>

                            {/* Value and Activity */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Value:</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(client.totalValue)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Activity:</span>
                                    <span className="text-gray-900">{formatDate(client.lastActivity)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Client Since:</span>
                                    <span className="text-gray-900">{formatDate(client.joinedDate)}</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <Card className="p-12 text-center">
                    <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                    <p className="text-gray-600">
                        {searchQuery ? 'Try adjusting your search criteria' : 'No clients have been added yet'}
                    </p>
                </Card>
            )}

            {/* Client Detail Modal */}
            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                />
            )}
        </div>
    );
};