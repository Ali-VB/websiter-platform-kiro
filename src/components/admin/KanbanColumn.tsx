import React from 'react';
import { motion } from 'framer-motion';

interface KanbanColumnProps {
    id: string;
    title: string;
    count: number;
    color: string;
    headerColor: string;
    isDragging: boolean;
    children: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    title,
    count,
    color,
    headerColor,
    isDragging,
    children
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`
        bg-white rounded-lg border-2 shadow-sm h-full flex flex-col
        ${color}
        ${isDragging ? 'shadow-lg' : ''}
        transition-shadow duration-200
      `}
        >
            {/* Column Header */}
            <div className={`
        px-4 py-3 rounded-t-lg border-b border-gray-200
        ${headerColor}
      `}>
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <span className="bg-white bg-opacity-80 text-xs font-medium px-2 py-1 rounded-full">
                        {count}
                    </span>
                </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 flex flex-col min-h-0">
                {children}
            </div>
        </motion.div>
    );
};