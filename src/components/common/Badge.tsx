import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary-500 text-white hover:bg-primary-600',
                secondary: 'border-transparent bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
                destructive: 'border-transparent bg-red-500 text-white hover:bg-red-600',
                outline: 'text-foreground border-current',
            },
            color: {
                gray: 'bg-gray-100 text-gray-800 border-gray-200',
                red: 'bg-red-100 text-red-800 border-red-200',
                yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                green: 'bg-green-100 text-green-800 border-green-200',
                blue: 'bg-blue-100 text-blue-800 border-blue-200',
                purple: 'bg-purple-100 text-purple-800 border-purple-200',
                orange: 'bg-orange-100 text-orange-800 border-orange-200',
            },
            size: {
                xs: 'px-2 py-0.5 text-xs',
                sm: 'px-2.5 py-0.5 text-xs',
                md: 'px-3 py-1 text-sm',
                lg: 'px-4 py-1.5 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'sm',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'orange';
}

function Badge({ className, variant, color, size, ...props }: BadgeProps) {
    const variantClass = color ? undefined : variant;
    const colorClass = color ? color : undefined;

    return (
        <div
            className={cn(
                badgeVariants({
                    variant: variantClass,
                    size,
                    color: colorClass
                }),
                className
            )}
            {...props}
        />
    );
}

export { Badge, badgeVariants };