import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const PageHeader = ({ title, description, action }) => {
    return (_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: title }), description && (_jsx("p", { className: "mt-2 text-gray-600 dark:text-zinc-400", children: description }))] }), action && _jsx("div", { className: "flex-shrink-0", children: action })] }));
};
export default PageHeader;
