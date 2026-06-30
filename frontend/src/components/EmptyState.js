import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SearchOff, InboxRounded, ErrorOutline, CloudOff } from '@mui/icons-material';
const variantIcons = {
    default: InboxRounded,
    search: SearchOff,
    error: ErrorOutline,
    offline: CloudOff,
};
export const EmptyState = ({ icon, title, description, action, variant = 'default', compact = false, }) => {
    const DefaultIcon = variantIcons[variant];
    return (_jsxs("div", { className: `flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'} animate-fadeIn`, children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#111111] flex items-center justify-center mb-4", children: icon || _jsx(DefaultIcon, { className: "text-gray-400 dark:text-slate-500", style: { fontSize: 32 } }) }), _jsx("h3", { className: `font-semibold text-gray-900 dark:text-white mb-2 ${compact ? 'text-base' : 'text-lg'}`, children: title }), description && (_jsx("p", { className: `text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-4 ${compact ? 'text-xs' : 'text-sm'}`, children: description })), action && _jsx("div", { className: "mt-2", children: action })] }));
};
export default EmptyState;
