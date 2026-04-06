import React from 'react';
import Skeleton from './Skeleton';

const ChartSkeleton: React.FC = () => {
    return (
        <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4 flex flex-col">
            {/* Title Placeholder */}
            <div className="flex justify-center mb-4">
                <Skeleton className="h-6 w-48" />
            </div>

            {/* Legend / Subtitle Placeholder */}
            <div className="flex justify-center gap-4 mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Main Chart Area Placeholder */}
            <div className="flex-1 w-full">
                <Skeleton className="w-full h-full rounded-b-lg" />
            </div>
        </div>
    );
};

export default ChartSkeleton;
