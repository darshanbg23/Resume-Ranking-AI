import React from 'react';
import { SearchOff, InboxRounded, ErrorOutline, CloudOff } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'search' | 'error' | 'offline';
  compact?: boolean;
}

const variantIcons = {
  default: InboxRounded,
  search: SearchOff,
  error: ErrorOutline,
  offline: CloudOff,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = 'default',
  compact = false,
}) => {
  const DefaultIcon = variantIcons[variant];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'} animate-fadeIn`}>
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#111111] flex items-center justify-center mb-4">
        {icon || <DefaultIcon className="text-gray-400 dark:text-slate-500" style={{ fontSize: 32 }} />}
      </div>
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${compact ? 'text-base' : 'text-lg'}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-4 ${compact ? 'text-xs' : 'text-sm'}`}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
