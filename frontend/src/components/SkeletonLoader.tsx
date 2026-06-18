import React from 'react';

type Variant = 'card' | 'table-row' | 'stat' | 'profile' | 'text' | 'list-item';

interface SkeletonLoaderProps {
  variant?: Variant;
  count?: number;
  className?: string;
}

const SkeletonLine: React.FC<{ width?: string; height?: string; className?: string }> = ({
  width = '100%', height = '12px', className = '',
}) => (
  <div className={`skeleton ${className}`} style={{ width, height }} />
);

const CardSkeleton: React.FC = () => (
  <div className="card-base p-6 space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <SkeletonLine width="60%" height="16px" />
        <SkeletonLine width="40%" height="12px" />
      </div>
      <div className="skeleton w-10 h-10 rounded-lg" />
    </div>
    <SkeletonLine width="80%" />
    <SkeletonLine width="50%" />
  </div>
);

const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-[#222222]/50">
    <div className="skeleton w-8 h-8 rounded-full" />
    <SkeletonLine width="25%" height="14px" />
    <SkeletonLine width="20%" height="14px" />
    <SkeletonLine width="15%" height="14px" />
    <SkeletonLine width="10%" height="24px" className="rounded-full" />
  </div>
);

const StatSkeleton: React.FC = () => (
  <div className="card-base p-6 space-y-3">
    <SkeletonLine width="50%" height="12px" />
    <SkeletonLine width="40%" height="28px" />
    <SkeletonLine width="30%" height="10px" />
  </div>
);

const ProfileSkeleton: React.FC = () => (
  <div className="card-base p-6 flex items-center gap-4">
    <div className="skeleton w-16 h-16 rounded-full" />
    <div className="space-y-2 flex-1">
      <SkeletonLine width="50%" height="18px" />
      <SkeletonLine width="30%" height="12px" />
      <SkeletonLine width="70%" height="12px" />
    </div>
  </div>
);

const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 py-3">
    <div className="skeleton w-5 h-5 rounded" />
    <SkeletonLine width="70%" height="14px" />
  </div>
);

const variants: Record<Variant, React.FC> = {
  card: CardSkeleton,
  'table-row': TableRowSkeleton,
  stat: StatSkeleton,
  profile: ProfileSkeleton,
  text: () => <SkeletonLine />,
  'list-item': ListItemSkeleton,
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const Component = variants[variant];
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
