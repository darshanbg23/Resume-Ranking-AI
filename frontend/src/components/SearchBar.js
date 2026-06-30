import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Search } from '@mui/icons-material';
export const SearchBar = ({ placeholder = 'Search...', onSearch, value = '', }) => {
    const [searchValue, setSearchValue] = React.useState(value);
    const handleChange = (e) => {
        setSearchValue(e.target.value);
        onSearch?.(e.target.value);
    };
    return (_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" }), _jsx("input", { type: "text", placeholder: placeholder, value: searchValue, onChange: handleChange, className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }));
};
export default SearchBar;
