import React from 'react';
import { Description, FileDownload, Delete } from '@mui/icons-material';

interface ResumeCardProps {
  fileName: string;
  uploadedAt: string;
  matchScore?: number;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  fileName,
  uploadedAt,
  matchScore,
  onView,
  onDownload,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-[#111111] rounded-lg border border-gray-200 dark:border-[#222222] p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <Description className="text-red-600 dark:text-red-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{fileName}</h3>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Uploaded {new Date(uploadedAt).toLocaleDateString()}
          </p>
          {matchScore !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">Match Score</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{matchScore}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-[#222222]">
        {onView && (
          <button
            onClick={onView}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            View
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            title="Download"
          >
            <FileDownload className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            title="Delete"
          >
            <Delete className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeCard;
