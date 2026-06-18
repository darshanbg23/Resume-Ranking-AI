import React from 'react';
import { CircularProgress } from '@mui/material';

export const LoadingSpinner: React.FC<{ size?: number; label?: string }> = ({ size = 40, label }) => (
  <div className="flex flex-col items-center justify-center gap-4">
    <CircularProgress size={size} color="inherit" />
    {label && <p className="text-gray-600 dark:text-zinc-400">{label}</p>}
  </div>
);

export const LoadingPage: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
    <LoadingSpinner size={60} label="Loading..." />
  </div>
);

export default LoadingSpinner;
