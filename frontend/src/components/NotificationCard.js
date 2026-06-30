import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Notifications as NotificationsIcon, Close } from '@mui/icons-material';
const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
};
export const NotificationCard = ({ type = 'info', title, message, onClose, autoClose = true, }) => {
    React.useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => onClose?.(), 5000);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);
    return (_jsxs("div", { className: `rounded-lg border p-4 ${typeStyles[type]} flex items-start gap-3`, children: [_jsx(NotificationsIcon, { className: "w-5 h-5 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [title && _jsx("h4", { className: "font-semibold mb-1", children: title }), _jsx("p", { className: "text-sm", children: message })] }), onClose && (_jsx("button", { onClick: onClose, className: "flex-shrink-0 p-1 hover:opacity-70 transition-opacity", "aria-label": "Close", children: _jsx(Close, { className: "w-4 h-4" }) }))] }));
};
export default NotificationCard;
