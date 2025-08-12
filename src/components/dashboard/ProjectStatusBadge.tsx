import React from 'react';
import { motion } from 'framer-motion';

interface ProjectStatusBadgeProps {
    status: 'new' | 'submitted' | 'waiting_for_confirmation' | 'confirmed' | 'in_progress' | 'in_design' | 'review' | 'final_delivery' | 'completed';
    animated?: boolean;
    showNewBadge?: boolean;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
    status,
    animated = true,
    showNewBadge = false
}) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'new':
                return {
                    label: 'New',
                    className: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: '🆕',
                };
            case 'in_progress':
                return {
                    label: 'In Progress',
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: '⚡',
                };
            case 'completed':
                return {
                    label: 'Completed',
                    className: 'bg-green-100 text-green-800 border-green-200',
                    icon: '✅',
                };
            case 'submitted':
                return {
                    label: 'Submitted',
                    className: 'bg-purple-100 text-purple-800 border-purple-200',
                    icon: '📝',
                };
            case 'waiting_for_confirmation':
                return {
                    label: 'Waiting for Confirmation',
                    className: 'bg-orange-100 text-orange-800 border-orange-200',
                    icon: '⏳',
                };
            case 'confirmed':
                return {
                    label: 'Confirmed',
                    className: 'bg-green-100 text-green-800 border-green-200',
                    icon: '✅',
                };
            case 'in_design':
                return {
                    label: 'In Design',
                    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                    icon: '🎨',
                };
            case 'review':
                return {
                    label: 'Review',
                    className: 'bg-purple-100 text-purple-800 border-purple-200',
                    icon: '👀',
                };
            case 'final_delivery':
                return {
                    label: 'Final Delivery',
                    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    icon: '🚀',
                };
            default:
                return {
                    label: 'Unknown',
                    className: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: '❓',
                };
        }
    };

    const config = getStatusConfig(status);

    const badge = (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.className}`}>
            <span className="text-base">{config.icon}</span>
            {config.label}
            {showNewBadge && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold ml-1"
                >
                    NEW
                </motion.span>
            )}
        </span>
    );

    if (!animated) {
        return badge;
    }

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                duration: 0.3,
            }}
            whileHover={{ scale: 1.05 }}
        >
            {badge}
        </motion.div>
    );
};