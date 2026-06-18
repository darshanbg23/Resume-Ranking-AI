import React from 'react';
import { Tune } from '@mui/icons-material';

interface FilterOption {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface FilterPanelProps {
  filters: FilterOption[];
  onFilterChange?: (filterId: string, value: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Tune className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
      </div>

      {filters.map((filter) => (
        <div key={filter.id} className="space-y-2">
          <button
            onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#111111] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">{filter.label}</span>
            <span className={`transition-transform ${activeFilter === filter.id ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {activeFilter === filter.id && (
            <div className="space-y-2 pl-4">
              {filter.options.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        onFilterChange?.(filter.id, option.value);
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterPanel;
