import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from 'react';
import { Close } from '@mui/icons-material';
const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};
export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md', showCloseButton = true, }) => {
    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape')
            onClose();
    }, [onClose]);
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn", onClick: onClose, "aria-hidden": "true" }), _jsxs("div", { className: `relative w-full ${sizeClasses[size]} bg-white dark:bg-[#111111] rounded-2xl shadow-2xl animate-scaleIn overflow-hidden`, children: [(title || showCloseButton) && (_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#222222]", children: [title && (_jsx("h2", { className: "text-lg font-bold text-gray-900 dark:text-white", children: title })), showCloseButton && (_jsx("button", { onClick: onClose, className: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors text-gray-500 dark:text-zinc-400", "aria-label": "Close modal", children: _jsx(Close, { style: { fontSize: 20 } }) }))] })), _jsx("div", { className: "px-6 py-4 max-h-[70vh] overflow-y-auto", children: children }), footer && (_jsx("div", { className: "px-6 py-4 border-t border-gray-200 dark:border-[#222222] flex items-center justify-end gap-3", children: footer }))] })] }));
};
export default Modal;
