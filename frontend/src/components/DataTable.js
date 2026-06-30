import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { UnfoldMore, KeyboardArrowUp, KeyboardArrowDown, Search } from '@mui/icons-material';
import EmptyState from './EmptyState';
export const DataTable = ({ columns, data, searchable = false, searchPlaceholder = 'Search...', pageSize = 10, onRowClick, emptyTitle = 'No data found', emptyDescription, actions, striped = true, }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const filtered = useMemo(() => {
        let result = [...data];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(row => columns.some(col => {
                const val = row[col.key];
                return val && String(val).toLowerCase().includes(lower);
            }));
        }
        if (sortKey) {
            result.sort((a, b) => {
                const av = a[sortKey], bv = b[sortKey];
                if (av == null)
                    return 1;
                if (bv == null)
                    return -1;
                const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
                return sortDir === 'desc' ? -cmp : cmp;
            });
        }
        return result;
    }, [data, searchTerm, sortKey, sortDir, columns]);
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortKey(key);
            setSortDir('asc');
        }
    };
    const SortIcon = ({ col }) => {
        if (sortKey !== col)
            return _jsx(UnfoldMore, { style: { fontSize: 16 }, className: "text-gray-400" });
        return sortDir === 'asc'
            ? _jsx(KeyboardArrowUp, { style: { fontSize: 16 }, className: "text-blue-600 dark:text-blue-400" })
            : _jsx(KeyboardArrowDown, { style: { fontSize: 16 }, className: "text-blue-600 dark:text-blue-400" });
    };
    return (_jsxs("div", { className: "card-base overflow-hidden", children: [(searchable || actions) && (_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-[#222222]", children: [searchable && (_jsxs("div", { className: "relative w-full sm:w-72", children: [_jsx(Search, { style: { fontSize: 18 }, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", value: searchTerm, onChange: e => { setSearchTerm(e.target.value); setCurrentPage(1); }, placeholder: searchPlaceholder, className: "input-base pl-9 py-2 text-sm" })] })), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] })), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsx("tr", { className: "bg-gray-50 dark:bg-[#111111]/50", children: columns.map(col => (_jsx("th", { className: `px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300' : ''}`, style: col.width ? { width: col.width } : undefined, onClick: () => col.sortable !== false && handleSort(col.key), children: _jsxs("div", { className: `inline-flex items-center gap-1 ${col.align === 'right' ? 'flex-row-reverse' : ''}`, children: [col.label, col.sortable !== false && _jsx(SortIcon, { col: col.key })] }) }, col.key))) }) }), _jsx("tbody", { children: paginated.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, children: _jsx(EmptyState, { title: emptyTitle, description: emptyDescription, variant: searchTerm ? 'search' : 'default', compact: true }) }) })) : (paginated.map((row, idx) => (_jsx("tr", { onClick: () => onRowClick?.(row), className: `border-b border-gray-100 dark:border-[#222222]/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${striped && idx % 2 === 1 ? 'bg-gray-50/50 dark:bg-[#111111]/30' : ''} hover:bg-blue-50/50 dark:hover:bg-[#111111]/50`, children: columns.map(col => (_jsx("td", { className: `px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`, children: col.render ? col.render(row[col.key], row) : row[col.key] ?? '—' }, col.key))) }, row.id ?? idx)))) })] }) }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#222222]", children: [_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: ["Showing ", (currentPage - 1) * pageSize + 1, "\u2013", Math.min(currentPage * pageSize, filtered.length), " of ", filtered.length] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1, className: "px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-[#111111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: "Previous" }), Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                let page;
                                if (totalPages <= 5) {
                                    page = i + 1;
                                }
                                else if (currentPage <= 3) {
                                    page = i + 1;
                                }
                                else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                }
                                else {
                                    page = currentPage - 2 + i;
                                }
                                return (_jsx("button", { onClick: () => setCurrentPage(page), className: `w-8 h-8 text-xs font-medium rounded-lg transition-colors ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-gray-100 dark:hover:bg-[#111111] text-gray-600 dark:text-zinc-400'}`, children: page }, page));
                            }), _jsx("button", { onClick: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, className: "px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-[#111111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: "Next" })] })] }))] }));
};
export default DataTable;
