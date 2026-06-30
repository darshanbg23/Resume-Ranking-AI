import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Tune } from '@mui/icons-material';
export const FilterPanel = ({ filters, onFilterChange }) => {
    const [activeFilter, setActiveFilter] = React.useState(null);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Tune, { className: "w-5 h-5 text-gray-600 dark:text-zinc-400" }), _jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" })] }), filters.map((filter) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("button", { onClick: () => setActiveFilter(activeFilter === filter.id ? null : filter.id), className: "w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#111111] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a1a1a] transition-colors", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: filter.label }), _jsx("span", { className: `transition-transform ${activeFilter === filter.id ? 'rotate-180' : ''}`, children: "\u25BC" })] }), activeFilter === filter.id && (_jsx("div", { className: "space-y-2 pl-4", children: filter.options.map((option) => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", onChange: (e) => {
                                        if (e.target.checked) {
                                            onFilterChange?.(filter.id, option.value);
                                        }
                                    }, className: "w-4 h-4 rounded border-gray-300" }), _jsx("span", { className: "text-sm text-gray-700 dark:text-zinc-300", children: option.label })] }, option.value))) }))] }, filter.id)))] }));
};
export default FilterPanel;
