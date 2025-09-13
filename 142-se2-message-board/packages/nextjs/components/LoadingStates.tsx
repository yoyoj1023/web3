// packages/nextjs/components/LoadingStates.tsx
import React from 'react';

export const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        <div className="flex space-x-2 mb-3">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>

        <div className="border-t pt-3">
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
    </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex justify-center items-center p-8">
            <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}>
            </div>
        </div>
    );
};

export const EmptyState: React.FC<{
    icon?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}> = ({ icon = '📭', title, description, action }) => (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        {action && (
            <button
                onClick={action.onClick}
                className="text-blue-600 hover:text-blue-800 underline"
            >
                {action.label}
            </button>
        )}
    </div>
);