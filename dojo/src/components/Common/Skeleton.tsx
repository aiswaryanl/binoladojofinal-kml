import React from 'react';

interface SkeletonProps {
    className?: string; // Allow Tailwind classes for sizing/margin
    style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, style }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded-md ${className || ''}`}
            style={style}
        />
    );
};

export default Skeleton;
